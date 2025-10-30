import { SeededRandom, sha256 } from '../utils/crypto';

export interface Peg {
  leftBias: number;
}

export interface PegMap {
  pegs: Peg[][];
  hash: string;
}

export interface GameResult {
  pegMap: PegMap;
  path: number[]; // position at each row
  finalBin: number;
  decisions: ('L' | 'R')[];
}

const ROWS = 12;
const BINS = 13;

export function generatePegMap(rng: SeededRandom): PegMap {
  const pegs: Peg[][] = [];
  
  for (let r = 0; r < ROWS; r++) {
    const rowPegs: Peg[] = [];
    for (let p = 0; p <= r; p++) {
      const randVal = rng.next();
      const leftBias = parseFloat((0.5 + (randVal - 0.5) * 0.2).toFixed(6));
      rowPegs.push({ leftBias });
    }
    pegs.push(rowPegs);
  }

  const pegMapHash = sha256(JSON.stringify(pegs));
  return { pegs, hash: pegMapHash };
}

export function simulateDrop(
  pegMap: PegMap,
  dropColumn: number,
  rng: SeededRandom
): GameResult {
  let pos = 0;
  const path: number[] = [pos];
  const decisions: ('L' | 'R')[] = [];

  const adj = (dropColumn - Math.floor(ROWS / 2)) * 0.01;

  for (let r = 0; r < ROWS; r++) {
    const pegIndex = Math.min(pos, r);
    const peg = pegMap.pegs[r][pegIndex];
    
    const biasAdjusted = Math.max(0, Math.min(1, peg.leftBias + adj));
    
    const rnd = rng.next();
    if (rnd < biasAdjusted) {
      decisions.push('L');
    } else {
      decisions.push('R');
      pos += 1;
    }
    
    path.push(pos);
  }

  const finalBin = pos;

  return {
    pegMap,
    path,
    finalBin,
    decisions
  };
}

export const PAYOUT_TABLE: Record<number, number> = {
  0: 16,
  1: 9,
  2: 2,
  3: 1.4,
  4: 1.1,
  5: 1,
  6: 0.5,
  7: 1,
  8: 1.1,
  9: 1.4,
  10: 2,
  11: 9,
  12: 16
};

export function calculatePayout(bin: number, betAmount: number): number {
  const multiplier = PAYOUT_TABLE[bin] || 0;
  return betAmount * multiplier;
}
