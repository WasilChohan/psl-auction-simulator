"use client";
import { useState } from "react";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

export default function CreateRoomForm() {
  const router = useRouter();
  const [name, setName] = useState("PSL Auction Room");
  const [hostName, setHostName] = useState("Host");
  const [isPublic, setIsPublic] = useState(false);
  const [bidTimerSec, setBidTimerSec] = useState<10 | 15 | 20>(15);
  const [pursePerTeam, setPursePerTeam] = useState<150 | 200 | 250>(150);
  const [squadLimit, setSquadLimit] = useState<15 | 20 | 25>(15);
  const [loading, setLoading] = useState(false);

  const createRoom = () => {
    if (!hostName.trim()) return alert("Enter your name");
    setLoading(true);
    socket.emit(
      "room:create",
      { name, hostName, isPublic, bidTimerSec, pursePerTeam, squadLimit },
      (res: any) => {
        setLoading(false);
        if (!res.ok) return alert(res.error || "Create failed");
        const code = res.privateCode;
        router.push(`/room/${res.roomId}?user=${encodeURIComponent(hostName)}&code=${code}`);
      }
    );
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur border border-white/20 max-w-xl space-y-4">
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Room Name</label>
        <input
          className="w-full p-3 rounded-lg text-black bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter room name"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Your Name</label>
        <input
          className="w-full p-3 rounded-lg text-black bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <label className="flex gap-2 items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 rounded cursor-pointer"
        />
        <span className="text-sm text-gray-300">Make room public</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Bid Timer</label>
          <select
            className="text-black p-3 rounded-lg w-full bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
            value={bidTimerSec}
            onChange={(e) => setBidTimerSec(Number(e.target.value) as 10 | 15 | 20)}
          >
            <option value={10}>10 seconds</option>
            <option value={15}>15 seconds</option>
            <option value={20}>20 seconds</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Squad Limit</label>
          <select
            className="text-black p-3 rounded-lg w-full bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
            value={squadLimit}
            onChange={(e) => setSquadLimit(Number(e.target.value) as 15 | 20 | 25)}
          >
            <option value={15}>15 players</option>
            <option value={20}>20 players</option>
            <option value={25}>25 players</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Purse Per Team</label>
        <select
          className="text-black p-3 rounded-lg w-full bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
          value={pursePerTeam}
          onChange={(e) => setPursePerTeam(Number(e.target.value) as 150 | 200 | 250)}
        >
          <option value={150}>150 Crore</option>
          <option value={200}>200 Crore</option>
          <option value={250}>250 Crore</option>
        </select>
      </div>

      <button
        onClick={createRoom}
        disabled={loading}
        className="w-full bg-pslGold text-black px-4 py-3 rounded-lg font-bold text-lg hover:bg-pslGold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Auction Room"}
      </button>
    </div>
  );
}