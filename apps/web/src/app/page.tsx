import CreateRoomForm from "../components/CreateRoomForm";
import PublicRoomsList from "../components/PublicRoomsList";
import JoinByCodeForm from "../components/JoinByCodeForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-4 text-6xl">🏏</div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pslGold via-yellow-400 to-pslGold">
            PSL AUCTION SIMULATOR
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Build your dream XI for the Pakistani Super League. Bid like a team owner!
          </p>
          <div className="flex justify-center gap-4 text-sm mb-8">
            <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-2">
              <p className="text-gray-400">🤖 AI Teams</p>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-2">
              <p className="text-gray-400">⏱️ Live Bidding</p>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-2">
              <p className="text-gray-400">👥 Multiplayer</p>
            </div>
          </div>
        </div>

        {/* Create vs Join Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Create Room */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Create Auction</h2>
            <CreateRoomForm />
          </div>

          {/* Join by Code */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Join by Code</h2>
            <JoinByCodeForm />
          </div>

          {/* Join Public Room */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Public Rooms</h2>
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur border border-white/20 max-w-xl rounded-xl p-6">
              <PublicRoomsList />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-bold text-pslGold mb-2">Full Control</h3>
            <p className="text-gray-400 text-sm">
              Customize auction settings, purse limits, squad size, and bidding timer.
            </p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-pslGold mb-2">Real-time</h3>
            <p className="text-gray-400 text-sm">
              Live bidding updates with WebSockets. See bids instantly across all players.
            </p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-pslGold mb-2">PSL Players</h3>
            <p className="text-gray-400 text-sm">
              Auction over 900 real PSL players with authentic roles and categories.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Pure skill. No real money. Just fantasy auction fun! 🎉</p>
        </div>
      </div>
    </main>
  );
}
