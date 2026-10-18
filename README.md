# 🎱 Virtual Bingo — Real-Time Full-Stack Web Application

A full-stack, real-time Virtual Bingo web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features & User Roles

### 1. Host / Admin View (`/admin`)
- **Interactive Tumbler Machine**: Visual cage spinner with 3D metallic wireframe and ball tumbling animations.
- **Manual "Draw Next Ball" Button**: Randomly picks an uncalled number (1–75), maps to B-I-N-G-O letters, persists to Neon Postgres, and broadcasts to all clients.
- **Master Board (1–75)**: High-contrast, color-coded visual matrix showing all called numbers and pulsing indicator for the latest ball drawn.
- **Real-Time Bingo Claims Alert Panel**: Displays instant notifications with alert chimes when a player claims "BINGO!", with timestamp, player ID, and an **"Inspect Card"** audit modal showing the player's actual marked numbers against called balls.
- **One-Click Claim Actions**: Verify & confirm, reject, or clear claims.
- **Auto-Draw Mode**: Configurable timer (5s, 7s, 10s, 15s) for automated ball calling.
- **Audio & Speech Caller**: Web Audio synthesis for tumbler clatter and drop chimes, plus built-in voice synthesizer calling out *"B-12"*, *"O-67"*.
- **"Reset Game"**: Wipes called numbers and active claims with confirmation protection.

### 2. Player View (`/` or `/player`)
- **Player Registration / Join Prompt**: Join with a nickname or auto-generated lucky ID.
- **Regulation 5x5 Bingo Card Generation**:
  - **B**: 1–15
  - **I**: 16–30
  - **N**: 31–45 (Center space is **★ FREE ★** and pre-daubed)
  - **G**: 46–60
  - **O**: 61–75
  - Persisted in Neon Postgres.
- **Interactive Tactile Daubing**:
  - Tap or click numbers to stamp ink marks on the card.
  - Dauber ink color picker (Ruby Red, Neon Blue, Emerald, Purple Ink, Hot Pink).
  - Tactile pop audio on daubing.
  - "Auto-Daub" helper button to quickly stamp all called numbers.
- **Live Sync & History**:
  - Top spotlight displaying the latest ball called in real time via Server-Sent Events (SSE).
  - Full call history drawer with all previously drawn balls.
- **Celebratory "BINGO!" Button**:
  - Prominent 3D pulsating button.
  - Multi-angle confetti explosion (`canvas-confetti`) and victory fanfare chime.
  - Submits the claim to Neon Postgres and immediately alerts the host screen.

---

## 🗄️ Data Persistence Architecture

Game state, player cards, daubs, and claims are saved by the server-side storage adapter. Select the backend with `ENVIRONMENT`:

- `DEFAULT` (also used when `ENVIRONMENT` is unset): Neon Postgres through Drizzle ORM. It stores game state, player data, and claims in the `bingo_game_state`, `bingo_players`, and `bingo_claims` tables.
- `DRIVE`: a JSON data file at `/data/virutalbingo/bingo.json`. Set `DRIVE_STORAGE_PATH` to override the directory when needed. The target directory must be writable and on persistent storage (for example, a mounted volume); the filesystem backend does not require a database connection.

The app uses the pooled `DATABASE_URL` for runtime queries in `DEFAULT` mode. Drizzle migrations use the direct `DATABASE_URL_UNPOOLED` connection. Neon CLI writes both to the ignored `.env.local` file; on Render, add `DATABASE_URL` as a secret environment variable when using `DEFAULT`. Apply schema migrations with `npm run db:migrate` and generate new migration files with `npm run db:generate`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9+ (tested on Node v24)
- npm 9+

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) for the Player View or [http://localhost:3000/admin](http://localhost:3000/admin) for the Host / Admin View.
