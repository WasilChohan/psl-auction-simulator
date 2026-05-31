import { AuctionRoomState } from "./types.js";

export const roomStates = new Map<string, AuctionRoomState>();

const TEAM_NAMES = [
  "Karachi Kings",
  "Lahore Qalandars",
  "Peshawar Zalmi",
  "Islamabad United",
  "Multan Sultans",
  "Quetta Gladiators",
  "Hyderabad Hawks",
  "Rawalpindi Warriors"
];

export function createInitialTeams(purse: number): AuctionRoomState["teams"] {
  return Array.from({ length: 8 }).map((_, i) => ({
    teamId: i + 1,
    name: TEAM_NAMES[i],
    ownerName: "",
    purseLeft: purse * 10000000, // Convert crores to base units
    squad: [],
    isBot: true
  }));
}

export function nextPlayer(state: AuctionRoomState) {
  const next = state.queue.shift() || null;
  state.currentPlayerId = next;

  state.highestBid = 0;
  state.highestBidTeamId = null;
  state.hasAnyBidOnCurrentPlayer = false;

  if (!next) {
    state.phase = "XI";
    state.timerEndsAt = null;
  }
}