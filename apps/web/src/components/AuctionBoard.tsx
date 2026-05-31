"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

const PSL_TEAMS = [
  "Karachi Kings", "Lahore Qalandars", "Peshawar Zalmi", "Islamabad United",
  "Multan Sultans", "Quetta Gladiators", "Hyderabad Kingsman", "RawalPindiz"
];

export default function AuctionBoard({
  roomId,
  user,
  teamId,
  initialState
}: {
  roomId: string;
  user: string;
  teamId: number;
  initialState: any;
}) {
  const [state, setState] = useState(initialState ?? null);
  const [remainMs, setRemainMs] = useState(0);
  const [bidError, setBidError] = useState("");
  const [showIncrementButtons, setShowIncrementButtons] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    socket.on("room:state", setState);
    socket.on("auction:tick", (d) => setRemainMs(d.remainMs));
    socket.on("bid:update", (d) => {
      setState((s: any) =>
        s
          ? {
              ...s,
              highestBid: d.highestBid,
              highestBidTeamId: d.highestBidTeamId,
              hasAnyBidOnCurrentPlayer: d.hasAnyBidOnCurrentPlayer
            }
          : s
      );
    });

    if (!initialState) {
      socket.emit("room:state:get", { roomId }, (res: any) => {
        if (res?.ok) setState(res.state);
      });
    }

    return () => {
      socket.off("room:state");
      socket.off("auction:tick");
      socket.off("bid:update");
    };
  }, [roomId, initialState]);

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-pslGold border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg">Loading auction...</p>
        </div>
      </div>
    );
  }

  const player = state.currentPlayer;
  const myTeam = state.teams?.find((t: any) => t.teamId === teamId);
  const remainSec = Math.ceil(remainMs / 1000);

  const handleStartAuction = () => {
    socket.emit("auction:start", { roomId });
  };

  const handlePlaceBid = (amount: number) => {
    if (!amount) {
      setBidError("Invalid bid amount");
      return;
    }

    socket.emit("bid:place", { roomId, amount }, (res: any) => {
      if (res?.ok) {
        setBidError("");
        setShowIncrementButtons(false);
      } else {
        setBidError(res?.error || "Bid failed");
      }
    });
  };

  const getQuickBidOptions = () => {
    if (!player) return [];
    
    if (!state.hasAnyBidOnCurrentPlayer) {
      // First bid - show only base initially
      if (!showIncrementButtons) {
        return [{ label: "Base", amount: player.basePrice, color: "bg-green-600 hover:bg-green-700" }];
      }
      // After base selected, show all options
      return [
        { label: "Base", amount: player.basePrice, color: "bg-green-600 hover:bg-green-700" },
        { label: "+25L", amount: player.basePrice + 2500000, color: "bg-blue-600 hover:bg-blue-700" },
        { label: "+50L", amount: player.basePrice + 5000000, color: "bg-purple-600 hover:bg-purple-700" }
      ];
    } else {
      // For subsequent bids - empty if highest bidder (they can't bid)
      if (state.highestBidTeamId === teamId) {
        return [];
      }
      return [
        { label: "+25L", amount: state.highestBid + 2500000, color: "bg-blue-600 hover:bg-blue-700" },
        { label: "+50L", amount: state.highestBid + 5000000, color: "bg-purple-600 hover:bg-purple-700" },
        { label: "+1Cr", amount: state.highestBid + 10000000, color: "bg-orange-600 hover:bg-orange-700" }
      ];
    }
  };

  const timerColor =
    remainSec <= 3 ? "text-red-500" : remainSec <= 5 ? "text-yellow-500" : "text-green-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-pslGold mb-2">PSL AUCTION</h1>
            <p className="text-sm text-gray-400">{user}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 mb-1">{myTeam?.name || "No Team"}</p>
            <p className="text-3xl font-bold text-pslGold">
              {((myTeam?.purseLeft ?? 0) / 10000000).toFixed(1)} Cr
            </p>
          </div>
        </div>

        {state.phase === "PRE" ? (
          <div className="space-y-8">
            <div className="text-center bg-gradient-to-r from-pslGold/10 to-transparent border border-pslGold/30 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-pslGold mb-6">Ready to Auction?</h2>
              <button
                onClick={handleStartAuction}
                className="bg-pslGold hover:bg-pslGold/90 text-black px-8 py-3 rounded-lg font-bold text-lg transition"
              >
                START AUCTION
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {state.teams?.map((t: any) => (
                <div
                  key={t.teamId}
                  className={`rounded-lg border-2 p-4 transition ${
                    t.teamId === teamId ? "border-pslGold bg-pslGold/10" : "border-white/20 bg-white/5"
                  }`}
                >
                  <h3 className="font-bold text-pslGold mb-3 text-lg">{t.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{t.isBot ? "🤖 Bot" : `👤 ${t.ownerName}`}</p>
                  <p className="text-2xl font-bold text-pslGold">
                    {((t.purseLeft ?? 0) / 10000000).toFixed(1)} Cr
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : state.phase === "XI" ? (
          <div className="text-center space-y-8">
            <div className="text-4xl font-bold text-pslGold">✨ Auction Complete! ✨</div>
            <p className="text-xl text-gray-400">Final squads formed</p>
          </div>
        ) : (
          <div className="space-y-8">
            {player ? (
              <>
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-pslGold rounded-xl p-8">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h2 className="text-4xl font-bold mb-3">{player.name}</h2>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-pslGold/20 text-pslGold px-3 py-1 rounded text-sm font-bold">
                          {player.category}
                        </span>
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm">
                          {player.role}
                        </span>
                        {player.country && (
                          <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded text-sm">
                            {player.country}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm mb-1">Base Price</p>
                      <p className="text-4xl font-bold text-pslGold">
                        {((player.basePrice ?? 0) / 10000000).toFixed(1)} Cr
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className={`text-6xl font-bold text-center ${timerColor} mb-4`}>{remainSec}s</p>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${timerColor.replace("text-", "bg-")}`}
                        style={{
                          width: `${Math.max(0, (remainSec / (state.settings?.bidTimerSec || 20)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1">Current Bid</p>
                      <p className="text-xl font-bold text-pslGold">
                        {state.hasAnyBidOnCurrentPlayer ? `${((state.highestBid ?? 0) / 10000000).toFixed(1)}` : "—"} Cr
                      </p>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1">Leader</p>
                      <p className="font-bold text-yellow-400 text-sm line-clamp-2">
                        {state.highestBidTeamId !== null && state.highestBidTeamId !== undefined
                          ? PSL_TEAMS[state.highestBidTeamId - 1] || "—"
                          : "—"}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1">Squad</p>
                      <p className="text-xl font-bold text-blue-400">
                        {myTeam?.squad.length || 0}/{state.settings?.squadLimit || 25}
                      </p>
                    </div>
                  </div>
                </div>

                {state.phase === "LIVE" && (
                  <>
                    {state.highestBidTeamId === teamId ? (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
                        <p className="text-yellow-300 font-semibold text-center">
                          ✓ You are the leading bidder! Wait for the next player.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-700/50 border border-white/20 rounded-xl p-6">
                        <h3 className="font-bold mb-4">
                          {state.hasAnyBidOnCurrentPlayer ? "Raise Bid" : "Opening Bid"}
                        </h3>
                        {bidError && <p className="text-red-400 text-sm mb-3">{bidError}</p>}
                        {getQuickBidOptions().length > 0 ? (
                          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(getQuickBidOptions().length, 3)}, 1fr)` }}>
                            {getQuickBidOptions().map((option) => (
                              <button
                                key={option.label}
                                onClick={() => {
                                  handlePlaceBid(option.amount);
                                  if (!state.hasAnyBidOnCurrentPlayer && option.label === "Base") {
                                    setShowIncrementButtons(true);
                                  }
                                }}
                                className={`${option.color} text-white px-4 py-3 rounded font-bold transition hover:brightness-110`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center">No bidding options available</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-12">No active player</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {state.teams?.map((t: any) => (
                <div
                  key={t.teamId}
                  className={`rounded-lg border-2 p-4 transition ${
                    t.teamId === teamId
                      ? "border-pslGold bg-pslGold/10"
                      : t.teamId === state.highestBidTeamId
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  <h4 className="font-bold text-pslGold mb-2">{t.name}</h4>
                  <p className="text-xs text-gray-400 mb-3">{t.isBot ? "🤖 Bot" : `👤 ${t.ownerName}`}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purse:</span>
                      <span className="font-bold text-pslGold">
                        {((t.purseLeft ?? 0) / 10000000).toFixed(1)} Cr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Squad:</span>
                      <span className="font-bold">{t.squad?.length || 0}/{state.settings?.squadLimit || 25}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
