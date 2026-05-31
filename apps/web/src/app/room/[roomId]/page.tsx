"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AuctionBoard from "../../../components/AuctionBoard";
import { socket } from "../../../lib/socket";

type Team = {
  teamId: number;
  name: string;
  ownerName: string;
  isClaimedByHuman: boolean;
};

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const sp = useSearchParams();
  const roomId = params.roomId;
  const user = sp.get("user") || "User";
  const roomCode = sp.get("code") || "";

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [claimedState, setClaimedState] = useState<any>(null); // NEW

  useEffect(() => {
    socket.emit("room:teams", { roomId }, (res: any) => {
      if (!res.ok) return alert(res.error || "Failed to load teams");
      setTeams(res.teams);
    });
  }, [roomId]);

  const claimTeam = () => {
    if (!selectedTeamId) return alert("Select a team");
    socket.emit("team:claim", { roomId, userName: user, teamId: selectedTeamId }, (res: any) => {
      if (!res.ok) return alert(res.error || "Claim failed");

      setClaimedState(res.state); // IMPORTANT
      setClaimed(true);
    });
  };

  if (!claimed) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-3xl mx-auto">
          {roomCode && (
            <div className="mb-6 bg-gradient-to-r from-pslPurple/30 to-pslGold/10 border-2 border-pslGold/50 rounded-xl p-6 text-center">
              <p className="text-gray-300 text-sm mb-2">Share this code to invite friends:</p>
              <div className="text-4xl font-bold text-pslGold tracking-widest font-mono">{roomCode}</div>
              <p className="text-gray-400 text-xs mt-3">They can enter this code on the home page to join</p>
            </div>
          )}

          <div className="rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-white/20 p-6">
            <h1 className="text-2xl font-bold text-pslGold mb-6">Select Your Team</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teams.map((t) => (
                <button
                  key={t.teamId}
                  disabled={t.isClaimedByHuman}
                  onClick={() => setSelectedTeamId(t.teamId)}
                  className={`p-4 text-left rounded border-2 transition ${
                    t.isClaimedByHuman
                      ? "opacity-50 cursor-not-allowed border-gray-400/30 bg-white/5"
                      : "border-pslGold/30 hover:border-pslGold/60 hover:bg-pslPurple/10"
                  } ${selectedTeamId === t.teamId ? "ring-2 ring-pslGold border-pslGold" : ""}`}
                >
                  <div className="font-semibold text-lg text-white">{t.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {t.isClaimedByHuman ? `Claimed by ${t.ownerName}` : "Available"}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={claimTeam}
              disabled={!selectedTeamId}
              className="mt-6 w-full bg-pslGold hover:bg-pslGold/90 text-black px-6 py-3 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Team
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <AuctionBoard
        roomId={roomId}
        user={user}
        teamId={selectedTeamId!}
        initialState={claimedState} // IMPORTANT
      />
    </main>
  );
}