# Plinko Lab - Requirements Checklist

## Functional Requirements

### A) Game UX
- [x] 12 rows, triangular peg layout, 13 bins
- [x] Controls: drop column (0-12), bet amount, Drop button
- [x] Smooth ball movement with peg collisions
- [x] Bin pulse + confetti on landing
- [x] Subtle peg tick sound
- [x] Celebratory SFX on landing
- [x] Mute toggle
- [x] Keyboard controls (left/right arrows, space to drop)
- [x] Reduced motion mode (prefers-reduced-motion)
- [x] Responsive (mobile and desktop)

### B) Provably-Fair Protocol
- [x] Server chooses random serverSeed and nonce per round
- [x] Server publishes commit: SHA256(serverSeed:nonce)
- [x] Client provides clientSeed when starting round
- [x] Server reveals serverSeed after round
- [x] Combined seed: SHA256(serverSeed:clientSeed:nonce)
- [x] All randomness from deterministic PRNG seeded by combinedSeed
- [x] Public verifier page at /verify
- [x] Verifier recomputes outcome from inputs
- [x] Verifier matches logged round

### C) Deterministic Engine
- [x] Rows (R) = 12
- [x] Ball makes Left/Right decision at each row
- [x] Position counter pos ∈ [0..R]
- [x] Final binIndex = pos (0..12)
- [x] Peg map: r+1 pegs per row, leftBias ∈ [0.4, 0.6]
- [x] leftBias formula: 0.5 + (rand() - 0.5) * 0.2, rounded to 6 decimals
- [x] pegMapHash = SHA256(JSON.stringify(pegMap))
- [x] Drop column influence: adj = (dropColumn - floor(R/2)) * 0.01
- [x] bias' = clamp(leftBias + adj, 0, 1)
- [x] Decision: if rand() < bias' then Left, else Right (pos += 1)
- [x] Same PRNG stream order: peg map first, then row decisions
- [x] Frontend animation follows deterministic path
- [x] Landing bin matches deterministic path

### D) Payouts
- [x] Symmetric paytable for bins 0..12
- [x] Display paytable in UI
- [x] Edges have higher multiplier (16x)
- [x] Record payoutMultiplier

### E) Verifier Page
- [x] Public page /verify
- [x] Form for serverSeed, clientSeed, nonce, dropColumn
- [x] Recompute commitHex, combinedSeed, pegMapHash, binIndex
- [x] Show ✅/❌ validation status
- [x] Optional: Load stored round by ID
- [x] Display replay path

## ✅ Non-Functional Requirements

### Performance
- [x] 60fps target on reasonable laptop
- [x] Canvas-based animations
- [x] Optimized rendering (no layout thrash)

### Quality
- [x] Unit tests for RNG/engine (test/engine.test.ts)
- [x] Deterministic tests verify reproducibility
- [x] TypeScript for type safety

### Security
- [x] No secrets in client code
- [x] Server-side input validation
- [x] Validate dropColumn range (0-12)
- [x] Validate betAmount > 0
- [x] Sanitize all inputs

### Developer Experience
- [x] dev script (npm run dev)
- [x] build script (npm run build)
- [x] start script (npm run start)
- [x] test script (npm run test)
- [x] Clear README with setup instructions

## ✅ API & Data Model

### Data Model (SQLite)
- [x] id (auto-increment)
- [x] status (CREATED | STARTED | REVEALED)
- [x] nonce
- [x] commitHex
- [x] serverSeed
- [x] clientSeed
- [x] combinedSeed
- [x] pegMapHash
- [x] rows (12)
- [x] dropColumn (0..12)
- [x] binIndex (0..12)
- [x] payoutMultiplier
- [x] betCents
- [x] pathJson (JSON with path and decisions)
- [x] createdAt
- [x] revealedAt

### API Endpoints
- [x] POST /api/game/init - Initialize game, return commit
- [x] POST /api/game/play - Play round, reveal serverSeed
- [x] POST /api/game/verify - Verify game outcome
- [x] GET /api/game/history - Get recent rounds
- [x] GET /api/game/round/:id - Get specific round

## ✅ Tech Stack

### Frontend
- [x] React 18
- [x] TypeScript
- [x] Vite build tool
- [x] Canvas API for animations
- [x] Web Audio API for sound
- [x] canvas-confetti for effects
- [x] React Router for navigation

### Backend
- [x] Node.js
- [x] Express
- [x] TypeScript
- [x] SQLite (better-sqlite3)
- [x] Native crypto module for SHA-256

### PRNG
- [x] Linear Congruential Generator (LCG)
- [x] Documented algorithm (a=1103515245, c=12345, m=2^31)
- [x] Deterministic and reproducible

## ✅ Additional Features

### UI Enhancements
- [x] Game history display (last 10 games)
- [x] useState for history tracking
- [x] Clean blue color scheme (no purple)
- [x] Simple, professional design

### Verification
- [x] Round ID lookup in verifier
- [x] Auto-fill form from stored round
- [x] Visual ✅/❌ validation feedback
- [x] Match display with stored round

## Notes

- All emojis and AI references removed from code
- PRNG algorithm fully documented
- History persists in useState during session
- Color scheme changed to blue gradient
- All assignment requirements met
