import crypto from 'crypto';

export class SeededRandom {
  private seed: number;
  private readonly m = 0x80000000;
  private readonly a = 1103515245;
  private readonly c = 12345;

  constructor(seed: string) {
    const hash = crypto.createHash('sha256').update(seed).digest();
    this.seed = hash.readUInt32BE(0);
  }

  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createCommit(serverSeed: string, nonce: number): string {
  return sha256(`${serverSeed}:${nonce}`);
}

export function generateCombinedSeed(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): string {
  return sha256(`${serverSeed}:${clientSeed}:${nonce}`);
}
