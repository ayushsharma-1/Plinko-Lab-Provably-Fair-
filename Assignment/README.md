# Plinko Lab - Provably Fair Plinko Game

**Assignment:** Daphnis Labs Full-Stack Developer Intern Take-Home

A fully functional, provably fair Plinko game with commit-reveal RNG protocol, deterministic outcome engine, and complete verification system.

---

## Features Implemented

### Core Requirements

- **12-row Plinko board** with triangular peg layout and 13 bins
- **Provably fair commit-reveal protocol** (SHA256-based)
- **Deterministic, seed-replayable engine** using seeded PRNG
- **Polished UI/UX** with smooth animations and sound effects
- **Full API + Database** for game rounds and verification
- **Public verifier page** for outcome validation

### UI/UX Features

- Smooth ball drop animations with peg collision visualization
- Confetti celebration effect on ball landing
- Subtle peg tick sounds and landing SFX
- Mute toggle for all audio
- Fully responsive (mobile + desktop)
- Keyboard controls (Arrow keys + Space)
- Reduced motion mode support (respects `prefers-reduced-motion`)
- ARIA labels for accessibility

### Provably Fair System

1. **Commit Phase:** Server generates `serverSeed` + `nonce`, publishes `SHA256(serverSeed:nonce)`
2. **Client Input:** Player provides `clientSeed` before drop
3. **Reveal Phase:** Server reveals `serverSeed` after game
4. **Verification:** Combined seed = `SHA256(serverSeed:clientSeed:nonce)` drives all randomness
5. **Deterministic Engine:** Seeded PRNG generates peg map and ball path - 100% reproducible

**PRNG Algorithm:** Linear Congruential Generator (LCG)
- Formula: `X(n+1) = (a * X(n) + c) mod m`
- Parameters: `a = 1103515245`, `c = 12345`, `m = 2^31`
- Seed initialization: First 4 bytes of SHA256(combinedSeed)
- Output normalization: `X / m` for values in [0, 1)

This ensures identical random sequences for identical seeds, enabling perfect verification.

### Game Mechanics

- **Peg Map:** Each peg has `leftBias ∈ [0.4, 0.6]` generated deterministically
- **Drop Column Influence:** Player's column choice adds small bias adjustment
- **Ball Path:** 12 binary decisions (Left/Right) using PRNG, resulting in final bin 0-12
- **Payouts:** Symmetric multipliers (edges = 16x, center = 0.5x)

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Canvas API (animations)
- Web Audio API (sound)
- canvas-confetti (celebrations)
- React Router (navigation)

### Backend
- Node.js + Express
- TypeScript
- Better-SQLite3 (database)
- Native crypto module (SHA256, PRNG)

---

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

```powershell
# clone or navigate to project folder
cd Assignment

# install root dependencies
npm install

# install frontend dependencies
cd frontend
npm install

# install backend dependencies
cd ../backend
npm install

# return to root
cd ..
```

### Running the Application

```powershell
# from root directory - runs both frontend and backend concurrently
npm run dev
```

**Or run separately:**

```powershell
# terminal 1 - backend (port 5000)
cd backend
npm run dev

# terminal 2 - frontend (port 3000)
cd frontend
npm run dev
```

### Access

- **Game:** http://localhost:3000
- **Verifier:** http://localhost:3000/verify
- **API:** http://localhost:5000/api

---

## API Endpoints

### `POST /api/game/init`
Initialize new game round
- **Response:** `{ commitHex, nonce, payoutTable }`

### `POST /api/game/play`
Play a game round
- **Body:** `{ commitHex, clientSeed, dropColumn, betAmount }`
- **Response:** Game result with revealed seeds, path, payout

### `POST /api/game/verify`
Verify game outcome
- **Body:** `{ serverSeed, clientSeed, nonce, dropColumn }`
- **Response:** Reproduced game result

### `GET /api/game/history?limit=50`
Get recent game rounds

### `GET /api/game/round/:id`
Get specific round by ID

---

## How to Play

1. **Set Client Seed:** Use random or custom seed (affects fairness)
2. **Choose Drop Column:** 0-12 (use slider or arrow keys)
3. **Set Bet Amount:** Any positive number
4. **Drop Ball:** Click button or press Space
5. **Watch Animation:** Ball bounces through pegs deterministically
6. **See Result:** Final bin, multiplier, and payout displayed

### Keyboard Controls
- `←` / `→` - Select drop column
- `Space` - Drop ball
- Works when controls area is focused

---

## Verification Process

1. Navigate to **/verify** page
2. Enter game parameters:
   - Server Seed (revealed after game)
   - Client Seed (your input)
   - Nonce (from game)
   - Drop Column (0-12)
3. Click "Verify Game"
4. System reproduces exact outcome using same seeds
5. Compare with original result

**Why it's fair:** Server commits to seed BEFORE you provide client seed. Server cannot change seed after seeing your input. All randomness is deterministic from combined seed.

---

## Project Structure

```
Assignment/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express API server
│   │   ├── db/
│   │   │   └── database.ts    # SQLite DB service
│   │   ├── game/
│   │   │   └── engine.ts      # Plinko game logic
│   │   └── utils/
│   │       └── crypto.ts      # RNG + hashing
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app + routing
│   │   ├── pages/
│   │   │   ├── Game.tsx       # Game page
│   │   │   └── Verifier.tsx   # Verification page
│   │   └── components/
│   │       ├── PlinkoBoard.tsx    # Canvas animation
│   │       ├── GameControls.tsx   # Input controls
│   │       └── GameInfo.tsx       # Info display
│   ├── package.json
│   └── vite.config.ts
└── package.json               # Root workspace
```

---

## Development Process

### Technical Approach

1. **Crypto Implementation** (crypto.ts)
   - Linear Congruential Generator for deterministic PRNG
   - SHA256 hashing using Node.js native crypto module
   - Seed-to-number conversion for reproducibility

2. **Canvas Animation** (PlinkoBoard.tsx)
   - Custom animation loop for ball movement
   - Web Audio API for procedural sound generation
   - Frame-independent timing for consistent physics

3. **State Management**
   - React useState hooks for game state and history tracking
   - Local state preservation across game rounds
   - History persists in component state for session

4. **Responsive Design**
   - CSS Grid and Flexbox for adaptive layouts
   - Media queries for mobile optimization
   - Reduced motion support via CSS and JS

5. **Backend Architecture**
   - Express REST API with TypeScript
   - SQLite for lightweight data persistence
   - Commit-reveal protocol implementation

---

## Performance Considerations

- **Deterministic engine** ensures exact reproducibility
- **SQLite** for lightweight, serverless DB
- **Canvas** for performant animations (60fps target)
- **Vite** for fast dev builds and HMR
- **Reduced motion** respects user preferences

---

## Assignment Checklist

- 12-row Plinko with 13 bins
- Drop column selection (0-12)
- Bet amount input
- Smooth ball animations
- Peg collision effects
- Bin pulse + confetti on landing
- Sound effects (tick + landing)
- Mute toggle
- Keyboard controls (arrows + space)
- Reduced motion support
- Responsive design
- Commit-reveal protocol
- SHA256 hashing
- Deterministic PRNG (seeded)
- Peg map generation
- Replayable outcomes
- Public verifier page
- API + Database
- Payout table
- Round logging

---

## Notes

- **No real money:** This is a demonstration project
- **Timebox:** Completed within 8-hour focused work window
- **Focus:** Engineering correctness, problem-solving, craftsmanship

---

## License

This project was created as a take-home assignment for Daphnis Labs.

**Date:** October 2025
