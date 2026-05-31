@"
# PSL Auction Simulator

A real-time multiplayer PSL cricket auction web application built with Next.js, Express.js, and Socket.io.

## Features
- ⚡ Real-time multiplayer bidding with WebSockets
- 🔑 Private rooms with 6-character codes
- 🌍 Public room lobby
- 🏏 136+ authentic PSL players
- 👥 8 PSL teams with AI bots
- 💜 PSL-themed UI (purple & gold colors)
- ⚙️ Customizable auction settings

## Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Express.js, Node.js, Socket.io
- **Database:** PostgreSQL, Prisma ORM
- **Infrastructure:** Docker, npm Workspaces

## Getting Started

### Prerequisites
- Node.js v16+
- PostgreSQL (or Docker)
- Git

### Installation
\`\`\`bash
git clone https://github.com/WasilChohan/psl-auction-simulator.git
cd psl-auction-simulator
npm install
npm run dev
\`\`\`

### Running the Application
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000

## How to Play
1. Create or join an auction room
2. Enter your 6-character room code to invite friends
3. Select your PSL team
4. Bid on players in real-time
5. Build your complete squad

## Project Structure
\`\`\`
psl-auction-simulator/
├── apps/
│   ├── server/          (Express backend)
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   └── web/             (Next.js frontend)
│       ├── src/
│       └── package.json
├── package.json         (Monorepo root)
└── docker-compose.yml
\`\`\`

## Author
[Wasil Chohan](https://github.com/WasilChohan)

## License
MIT
"@ | Out-File -FilePath README.md -Encoding UTF8
