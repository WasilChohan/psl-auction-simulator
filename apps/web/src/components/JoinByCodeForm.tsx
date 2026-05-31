"use client";
import { useState } from "react";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

export default function JoinByCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const joinByCode = () => {
    if (!code.trim()) return alert("Enter room code");
    if (!userName.trim()) return alert("Enter your name");

    setLoading(true);
    socket.emit("room:join-by-code", { code: code.toUpperCase() }, (res: any) => {
      setLoading(false);
      if (!res.ok) {
        return alert(res.error || "Failed to join room");
      }

      // Redirect to room lobby
      router.push(`/room/${res.roomId}?user=${encodeURIComponent(userName)}`);
    });
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur border border-white/20 max-w-xl space-y-4">
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Room Code</label>
        <input
          type="text"
          maxLength={6}
          placeholder="e.g., ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-lg text-black bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none font-mono text-center text-2xl tracking-widest font-bold"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Your Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-3 rounded-lg text-black bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
        />
      </div>

      <button
        onClick={joinByCode}
        disabled={loading}
        className="w-full bg-pslPurple hover:bg-pslPurple/90 text-white px-4 py-3 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Joining..." : "Join Room"}
      </button>
    </div>
  );
}
