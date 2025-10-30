import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/database';
import {
  generateServerSeed,
  createCommit,
  generateCombinedSeed,
  SeededRandom
} from './utils/crypto';
import {
  generatePegMap,
  simulateDrop,
  calculatePayout,
  PAYOUT_TABLE
} from './game/engine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pendingRounds = new Map<string, { serverSeed: string; nonce: number }>();

app.post('/api/game/init', (req: Request, res: Response) => {
  try {
    const serverSeed = generateServerSeed();
    const nonce = Date.now();
    const commitHex = createCommit(serverSeed, nonce);

    pendingRounds.set(commitHex, { serverSeed, nonce });

    res.json({
      commitHex,
      nonce,
      payoutTable: PAYOUT_TABLE
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to init game' });
  }
});

app.post('/api/game/play', (req: Request, res: Response) => {
  try {
    const { commitHex, clientSeed, dropColumn, betAmount } = req.body;

    if (!commitHex || !clientSeed || dropColumn === undefined || !betAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (dropColumn < 0 || dropColumn > 12) {
      return res.status(400).json({ error: 'Invalid drop column (must be 0-12)' });
    }

    if (betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    const pending = pendingRounds.get(commitHex);
    if (!pending) {
      return res.status(404).json({ error: 'Round not found or expired' });
    }

    const { serverSeed, nonce } = pending;
    const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);

    const rng = new SeededRandom(combinedSeed);

    const pegMap = generatePegMap(rng);

    const result = simulateDrop(pegMap, dropColumn, rng);

    const payoutMultiplier = PAYOUT_TABLE[result.finalBin];
    const payoutAmount = calculatePayout(result.finalBin, betAmount);
    const betCents = Math.round(betAmount * 100);

    const pathJson = JSON.stringify({
      path: result.path,
      decisions: result.decisions
    });

    const roundId = db.saveRound({
      status: 'REVEALED',
      nonce,
      commitHex,
      serverSeed,
      clientSeed,
      combinedSeed,
      pegMapHash: pegMap.hash,
      rows: 12,
      dropColumn,
      binIndex: result.finalBin,
      payoutMultiplier,
      betCents,
      pathJson,
      revealedAt: new Date().toISOString()
    });

    pendingRounds.delete(commitHex);

    res.json({
      roundId,
      serverSeed,
      clientSeed,
      nonce,
      combinedSeed,
      pegMapHash: pegMap.hash,
      path: result.path,
      decisions: result.decisions,
      finalBin: result.finalBin,
      binIndex: result.finalBin,
      payoutMultiplier,
      payoutAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Game failed' });
  }
});

app.post('/api/game/verify', (req: Request, res: Response) => {
  try {
    const { serverSeed, clientSeed, nonce, dropColumn, roundId } = req.body;

    if (!serverSeed || !clientSeed || nonce === undefined || dropColumn === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);
    const rng = new SeededRandom(combinedSeed);
    const pegMap = generatePegMap(rng);
    const result = simulateDrop(pegMap, dropColumn, rng);
    const commitHex = createCommit(serverSeed, nonce);

    let storedRound = null;
    let isValid = true;
    if (roundId) {
      storedRound = db.getRound(parseInt(roundId));
      if (storedRound) {
        isValid = 
          storedRound.binIndex === result.finalBin &&
          storedRound.commitHex === commitHex &&
          storedRound.combinedSeed === combinedSeed &&
          storedRound.pegMapHash === pegMap.hash;
      }
    }

    res.json({
      valid: isValid,
      commitHex,
      combinedSeed,
      pegMapHash: pegMap.hash,
      path: result.path,
      decisions: result.decisions,
      finalBin: result.finalBin,
      binIndex: result.finalBin,
      payoutMultiplier: PAYOUT_TABLE[result.finalBin],
      storedRound: storedRound ? {
        id: storedRound.id,
        binIndex: storedRound.binIndex,
        commitHex: storedRound.commitHex,
        combinedSeed: storedRound.combinedSeed,
        pegMapHash: storedRound.pegMapHash
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.get('/api/game/history', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const rounds = db.getAllRounds(limit);
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

app.get('/api/game/round/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const round = db.getRound(id);
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    res.json(round);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get round' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
