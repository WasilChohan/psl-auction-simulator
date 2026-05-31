# 🏏 PSL Auction - Setup & Run Guide

## 🎯 Features Implemented

### Core Auction System
- ✅ **Live Bidding** - Real-time player auctions with WebSocket updates
- ✅ **8 PSL Teams** - Authentic PSL team names and colors
- ✅ **900+ PSL Players** - All players with categories (Platinum, Diamond, Gold, Silver)
- ✅ **Virtual Budget** - Each team gets a configurable purse (150-250 Crore)
- ✅ **Squad Management** - Teams build squads with player limits (15-25)
- ✅ **Countdown Timer** - Configurable bid timer (10-20 seconds)
- ✅ **AI Opposition** - AI teams place automatic bids
- ✅ **Sold/Unsold Tracking** - Keep track of player auction status

### UI/UX
- ✅ **PSL-Themed Design** - Green, gold, and dark slate colors matching PSL branding
- ✅ **Beautiful Auction Board** - Live player display with bid updates
- ✅ **Team Dashboard** - View all teams, purses, and squad sizes
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Socket.io for instant bid notifications

### Backend
- ✅ **Express.js Server** - HTTP & WebSocket server
- ✅ **PostgreSQL Database** - Player and room data persistence
- ✅ **Prisma ORM** - Type-safe database queries
- ✅ **Socket.io** - Real-time bidding communication

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database running
- Docker (optional, for PostgreSQL)

### 1. Install Dependencies

```bash
# Root level (monorepo)
npm install

# Or install workspace-specific dependencies
npm install -w apps/server
npm install -w apps/web
```

### 2. Environment Setup

Create `.env.local` file in the root (or check `.env.example`):

```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/psl?schema=public"

# Server
SERVER_PORT=4000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start PostgreSQL

Using Docker:
```bash
docker-compose up -d
```

Or use your local PostgreSQL installation and update `DATABASE_URL`.

### 4. Setup Database

```bash
cd apps/server

# Run migrations
npx prisma migrate dev --name init

# Seed with 900+ PSL players
npm run seed
```

### 5. Run Development Servers

In the root directory:
```bash
npm run dev
```

This starts both:
- **Backend**: http://localhost:4000 (Express + Socket.io)
- **Frontend**: http://localhost:3000 (Next.js)

---

## 🎮 How to Play

### Create a Room
1. Go to http://localhost:3000
2. Enter room name, your name
3. Configure auction settings:
   - **Bid Timer**: 10-20 seconds
   - **Purse Per Team**: 150-250 Crore
   - **Squad Limit**: 15-25 players
4. Click "Create Auction Room"

### Claim Your Team
1. Select one of the 8 PSL teams
2. Click "Confirm Team"

### Start Auction
1. Click "START AUCTION"
2. Players come up one at a time
3. Place your first bid (must equal base price)
4. Raise bids against other teams
5. When timer expires, highest bidder wins the player
6. Continue until all players are auctioned or squads are full

### Winning Strategy
- **Budget Wisely** - Don't overspend early
- **Know Player Values** - Higher categories (Platinum) cost more
- **Counter Competitors** - Bid strategically against other teams
- **Build Balanced XI** - Mix batters, bowlers, all-rounders, wicketkeepers

---

## 📊 Player Categories

- **Platinum** (42 Crore base): International stars
- **Diamond** (22 Crore base): Established players
- **Gold** (11 Crore base): Mid-tier players
- **Silver** (6 Crore base): Emerging talent

---

## 🏗️ Project Structure

```
mock-psl-auction/
├── apps/
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.ts          # Express server
│   │   │   ├── socket.ts         # WebSocket handlers
│   │   │   ├── engine.ts         # Auction logic
│   │   │   ├── types.ts          # TypeScript types
│   │   │   ├── seed.ts           # Database seeding
│   │   │   └── players-data.json # PSL players list
│   │   └── prisma/
│   │       ├── schema.prisma     # Database schema
│   │       └── migrations/       # Database migrations
│   └── web/
│       └── src/
│           ├── app/
│           │   ├── page.tsx      # Home page
│           │   └── layout.tsx    # Root layout
│           ├── components/
│           │   ├── AuctionBoard.tsx      # Main auction UI
│           │   └── CreateRoomForm.tsx    # Room creation form
│           └── lib/
│               └── socket.ts     # Socket.io client
└── docker-compose.yml            # PostgreSQL setup
```

---

## 🔧 Key Technologies

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Express.js, TypeScript, Node.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL, Prisma ORM
- **DevTools**: tsx, TypeScript compiler

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env or server code
# Backend: SERVER_PORT=5000
# Frontend: next dev -p 3001
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Verify DATABASE_URL in .env
# Default: postgresql://postgres:postgres@localhost:5432/psl
```

### Socket.io Connection Issues
```bash
# Ensure CORS is enabled in server/src/index.ts
# Check browser console for connection errors
# Clear cookies/cache and reload
```

### Migrations Not Applied
```bash
cd apps/server
npx prisma migrate deploy
```

---

## 📝 Next Steps / Future Features

- [ ] Match performance tracking (integration with real PSL matches)
- [ ] Leaderboards by season
- [ ] Player stats & analytics
- [ ] Save auction history
- [ ] Custom player pools
- [ ] Auction highlights/replays
- [ ] Mobile app version
- [ ] Tournament mode (multiple auctions)

---

## 🎨 Customization

### Change PSL Teams
Edit `apps/web/src/components/AuctionBoard.tsx` and `apps/server/src/engine.ts`:
```typescript
const TEAM_NAMES = [
  "Your Team 1",
  "Your Team 2",
  // ... more teams
];
```

### Adjust Purse/Squad Limits
Modify defaults in `apps/web/src/components/CreateRoomForm.tsx`:
```typescript
const [pursePerTeam, setPursePerTeam] = useState<150 | 200 | 250>(200);
const [squadLimit, setSquadLimit] = useState<15 | 20 | 25>(20);
```

### Add More Players
1. Add players to `apps/server/src/players-data.json`
2. Re-run: `npm run seed`

---

## 📞 Support

For issues or questions:
1. Check console for errors (browser Dev Tools & server logs)
2. Verify database is running and seeded
3. Clear browser cache and restart servers
4. Check Socket.io connection in Network tab

---

**Built with ❤️ for PSL Fans** 🏏⭐

