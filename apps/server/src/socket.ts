import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { roomStates, createInitialTeams, nextPlayer } from "./engine.js";

const prisma = new PrismaClient();

async function publicState(state: any) {
  const currentPlayer = state.currentPlayerId
    ? await prisma.player.findUnique({ where: { id: state.currentPlayerId } })
    : null;

  return {
    roomId: state.roomId,
    phase: state.phase,
    settings: state.settings,
    teams: state.teams,
    queue: state.queue,
    currentPlayerId: state.currentPlayerId,
    currentPlayer: currentPlayer
      ? {
          id: currentPlayer.id,
          name: currentPlayer.name,
          role: currentPlayer.role,
          basePrice: currentPlayer.basePrice,
          category: currentPlayer.category,
          country: currentPlayer.country
        }
      : null,
    highestBid: state.highestBid,
    highestBidTeamId: state.highestBidTeamId,
    hasAnyBidOnCurrentPlayer: state.hasAnyBidOnCurrentPlayer,
    timerEndsAt: state.timerEndsAt,
    soldCount: state.soldPlayers.size,
    unsoldCount: state.unsoldPlayers.length,
    totalPlayers: state.queue.length + state.soldPlayers.size + state.unsoldPlayers.length
  };
}

export function registerSocket(io: Server) {
  io.on("connection", (socket) => {
    // CREATE ROOM
    socket.on("room:create", async (payload, cb) => {
      const privateCode = Math.random().toString(36).slice(2, 8).toUpperCase();

      const room = await prisma.room.create({
        data: {
          name: payload.name,
          isPublic: payload.isPublic,
          privateCode,
          hostName: payload.hostName,
          bidTimerSec: payload.bidTimerSec,
          pursePerTeam: payload.pursePerTeam,
          squadLimit: payload.squadLimit
        }
      });

      const players = await prisma.player.findMany({ take: 100 });

      roomStates.set(room.id, {
        roomId: room.id,
        phase: "PRE",
        settings: {
          bidTimerSec: payload.bidTimerSec,
          pursePerTeam: payload.pursePerTeam,
          squadLimit: payload.squadLimit
        },
        teams: createInitialTeams(payload.pursePerTeam),
        queue: players.map((p) => p.id),
        currentPlayerId: null,
        highestBid: 0,
        highestBidTeamId: null,
        hasAnyBidOnCurrentPlayer: false,
        timerEndsAt: null,
        soldPlayers: new Map(),
        unsoldPlayers: []
      });

      cb({ ok: true, roomId: room.id, privateCode });
    });

    // TEAM SELECTION LIST
    socket.on("room:teams", ({ roomId }, cb) => {
      const state = roomStates.get(roomId);
      if (!state) return cb({ ok: false, error: "Room not found" });

      cb({
        ok: true,
        teams: state.teams.map((t) => ({
          teamId: t.teamId,
          name: t.name,
          ownerName: t.ownerName,
          isClaimedByHuman: !t.isBot
        }))
      });
    });

    // GET ROOM STATE (for refresh/fallback)
    socket.on("room:state:get", async ({ roomId }, cb) => {
      const state = roomStates.get(roomId);
      if (!state) return cb({ ok: false, error: "Room not found" });
      cb({ ok: true, state: await publicState(state) });
    });

    // CLAIM TEAM
    socket.on("team:claim", async ({ roomId, userName, teamId }, cb) => {
      const state = roomStates.get(roomId);
      if (!state) return cb({ ok: false, error: "Room not found" });

      const t = state.teams.find((x) => x.teamId === teamId);
      if (!t) return cb({ ok: false, error: "Invalid team" });
      if (!t.isBot && t.ownerName !== userName) return cb({ ok: false, error: "Team already claimed" });

      t.isBot = false;
      t.ownerName = userName;

      socket.join(roomId);
      socket.data = { roomId, userName, teamId };

      io.to(roomId).emit("room:state", await publicState(state));
      cb({ ok: true, state: await publicState(state) });
    });

    socket.on("auction:start", async ({ roomId }) => {
      const state = roomStates.get(roomId);
      if (!state) return;
      if (state.phase !== "PRE" && state.phase !== "PAUSED") return;

      if (!state.currentPlayerId) nextPlayer(state);

      state.phase = "LIVE";
      state.timerEndsAt = Date.now() + state.settings.bidTimerSec * 1000;

      if (state.interval) clearInterval(state.interval);
      state.interval = setInterval(async () => {
        if (state.phase !== "LIVE") return;
        const remain = Math.max(0, (state.timerEndsAt ?? 0) - Date.now());
        io.to(roomId).emit("auction:tick", { remainMs: remain });

        if (remain <= 0) {
          const player = await prisma.player.findUnique({ where: { id: state.currentPlayerId! } });
          
          if (state.highestBidTeamId && state.currentPlayerId && player) {
            const team = state.teams.find((t) => t.teamId === state.highestBidTeamId)!;
            team.purseLeft -= state.highestBid;
            team.squad.push({ 
              playerId: state.currentPlayerId, 
              boughtPrice: state.highestBid,
              playerName: player.name 
            });
            state.soldPlayers.set(state.currentPlayerId, { teamId: state.highestBidTeamId, price: state.highestBid });
            
            io.to(roomId).emit("auction:sold", { 
              playerId: state.currentPlayerId, 
              playerName: player.name,
              teamId: team.teamId, 
              teamName: team.name,
              price: state.highestBid 
            });
          } else if (state.currentPlayerId) {
            state.unsoldPlayers.push(state.currentPlayerId);
            io.to(roomId).emit("auction:unsold", { 
              playerId: state.currentPlayerId,
              playerName: player?.name || "Unknown"
            });
          }

          nextPlayer(state);

          // Check if auction is complete (all players sold/unsold)
          if (!state.currentPlayerId) {
            state.phase = "XI";
            clearInterval(state.interval);
            io.to(roomId).emit("auction:phase", { phase: "XI" });
            return;
          }

          state.timerEndsAt = Date.now() + state.settings.bidTimerSec * 1000;
          io.to(roomId).emit("room:state", await publicState(state));
        }
      }, 250);

      io.to(roomId).emit("room:state", await publicState(state));
    });

    // BID PLACE (base-price opening logic)
    socket.on("bid:place", async ({ roomId, amount }, cb) => {
      const state = roomStates.get(roomId);
      const { teamId } = socket.data || {};
      if (!state || !teamId) return cb({ ok: false, error: "Not in room" });
      if (state.phase !== "LIVE") return cb({ ok: false, error: "Auction not live" });
      if (!state.currentPlayerId) return cb({ ok: false, error: "No active player" });

      const team = state.teams.find((t) => t.teamId === teamId)!;
      if (team.squad.length >= state.settings.squadLimit) return cb({ ok: false, error: "Squad full" });
      if (team.purseLeft < amount) return cb({ ok: false, error: "Insufficient purse" });

      const player = await prisma.player.findUnique({ where: { id: state.currentPlayerId } });
      if (!player) return cb({ ok: false, error: "Player not found" });

      // First bid must be exactly basePrice
      if (!state.hasAnyBidOnCurrentPlayer) {
        if (Number(amount) !== Number(player.basePrice)) {
          return cb({ ok: false, error: `Opening bid must be exactly ${player.basePrice} Cr` });
        }
      } else {
        // regular bids
        if (amount <= state.highestBid) return cb({ ok: false, error: "Bid too low" });
      }

      state.highestBid = amount;
      state.highestBidTeamId = teamId;
      state.hasAnyBidOnCurrentPlayer = true;

      // reset full timer on valid bid
      state.timerEndsAt = Date.now() + state.settings.bidTimerSec * 1000;

      io.to(roomId).emit("bid:update", {
        highestBid: state.highestBid,
        highestBidTeamId: state.highestBidTeamId,
        hasAnyBidOnCurrentPlayer: state.hasAnyBidOnCurrentPlayer,
        timerEndsAt: state.timerEndsAt
      });
      io.to(roomId).emit("auction:tick", { remainMs: state.settings.bidTimerSec * 1000 });
      io.to(roomId).emit("room:state", await publicState(state));

      cb({ ok: true });
    });

    // LIST PUBLIC ROOMS
    socket.on("rooms:public", async (_, cb) => {
      try {
        // Get public rooms from database
        const publicRooms = await prisma.room.findMany({
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          take: 20
        });

        // Only show rooms that have active state in memory
        const enriched = publicRooms
          .filter((room) => roomStates.has(room.id)) // Only show rooms that are currently active
          .map((room) => {
            const state = roomStates.get(room.id);
            const playerCount = state ? state.teams.filter((t: any) => !t.isBot).length : 0;
            return {
              roomId: room.id,
              name: room.name,
              hostName: room.hostName,
              playerCount,
              createdAt: room.createdAt
            };
          });

        cb({ ok: true, rooms: enriched });
      } catch (err) {
        cb({ ok: false, error: "Failed to fetch rooms" });
      }
    });

    // JOIN PUBLIC ROOM
    socket.on("room:join", async ({ roomId, userName, teamId }, cb) => {
      const state = roomStates.get(roomId);
      if (!state) return cb({ ok: false, error: "Room not found" });
      
      if (state.phase !== "PRE") {
        return cb({ ok: false, error: "Auction has already started" });
      }

      const team = state.teams.find((t) => t.teamId === teamId);
      if (!team || !team.isBot) {
        return cb({ ok: false, error: "Team already claimed" });
      }

      team.ownerName = userName;
      team.isBot = false;

      const publicStateData = await publicState(state);
      cb({ ok: true, state: publicStateData });
      io.to(roomId).emit("room:state", publicStateData);
    });

    // JOIN ROOM BY PRIVATE CODE
    socket.on("room:join-by-code", async ({ code }, cb) => {
      try {
        const room = await prisma.room.findUnique({
          where: { privateCode: code.toUpperCase() }
        });

        if (!room) {
          return cb({ ok: false, error: "Invalid room code" });
        }

        const state = roomStates.get(room.id);
        if (!state) {
          return cb({ ok: false, error: "Room not found" });
        }

        if (state.phase !== "PRE") {
          return cb({ ok: false, error: "Auction has already started" });
        }

        cb({
          ok: true,
          roomId: room.id,
          roomName: room.name,
          teams: state.teams.map((t: any) => ({
            teamId: t.teamId,
            name: t.name,
            ownerName: t.ownerName,
            isClaimedByHuman: !t.isBot
          }))
        });
      } catch (err) {
        cb({ ok: false, error: "Failed to join room" });
      }
    });
  });
}