"use client";
import { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

interface PublicRoom {
  roomId: string;
  name: string;
  hostName: string;
  playerCount: number;
  createdAt: string;
}

export default function PublicRoomsList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    setLoading(true);
    socket.emit("rooms:public", {}, (res: any) => {
      setLoading(false);
      if (res?.ok) {
        setRooms(res.rooms);
      }
    });
  };

  const joinRoom = (roomId: string) => {
    if (!userName.trim()) {
      alert("Enter your name");
      return;
    }

    setJoinLoading(roomId);
    socket.emit(
      "room:join",
      { roomId, userName },
      (res: any) => {
        setJoinLoading(null);
        if (res?.ok) {
          // Redirect to room with team selection
          router.push(`/room/${roomId}?user=${encodeURIComponent(userName)}`);
        } else {
          alert(res?.error || "Failed to join room");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="flex-1 p-3 rounded-lg text-black bg-white/90 border border-white/20 focus:border-pslGold focus:outline-none"
        />
        <button
          onClick={loadRooms}
          disabled={loading}
          className="bg-pslPurple hover:bg-pslPurple/90 text-white px-6 py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/20 rounded-lg">
          <p className="text-gray-400">No public rooms available</p>
          <p className="text-gray-500 text-sm mt-2">Create a new room or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-gradient-to-br from-pslPurple/20 to-slate-800/50 border border-pslGold/30 rounded-lg p-5 hover:border-pslGold/60 transition"
            >
              <h3 className="text-lg font-bold text-pslGold mb-2">{room.name}</h3>
              <div className="space-y-2 mb-4 text-sm text-gray-300">
                <p>👤 Host: <span className="text-white">{room.hostName}</span></p>
                <p>👥 Players: <span className="text-white">{room.playerCount}/8</span></p>
              </div>
              <button
                onClick={() => joinRoom(room.roomId)}
                disabled={joinLoading === room.roomId || room.playerCount >= 8}
                className="w-full bg-pslGold hover:bg-pslGold/90 text-black px-4 py-2 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joinLoading === room.roomId ? "Joining..." : room.playerCount >= 8 ? "Room Full" : "Join"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
