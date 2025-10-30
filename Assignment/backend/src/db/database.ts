import Database from 'better-sqlite3';
import path from 'path';

export interface GameRound {
  id?: number;
  status: string; // CREATED | STARTED | REVEALED
  nonce: number;
  commitHex: string;
  serverSeed: string;
  clientSeed: string;
  combinedSeed: string;
  pegMapHash: string;
  rows: number;
  dropColumn: number;
  binIndex: number;
  payoutMultiplier: number;
  betCents: number;
  pathJson: string;
  createdAt?: string;
  revealedAt?: string;
}

class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../../plinko.db');
    this.db = new Database(dbPath);
    this.initDB();
  }

  private initDB() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL,
        nonce INTEGER NOT NULL,
        commitHex TEXT NOT NULL,
        serverSeed TEXT NOT NULL,
        clientSeed TEXT NOT NULL,
        combinedSeed TEXT NOT NULL,
        pegMapHash TEXT NOT NULL,
        rows INTEGER NOT NULL,
        dropColumn INTEGER NOT NULL,
        binIndex INTEGER NOT NULL,
        payoutMultiplier REAL NOT NULL,
        betCents INTEGER NOT NULL,
        pathJson TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        revealedAt DATETIME
      )
    `);
  }

  saveRound(round: GameRound): number {
    const stmt = this.db.prepare(`
      INSERT INTO game_rounds (
        status, nonce, commitHex, serverSeed, clientSeed, combinedSeed,
        pegMapHash, rows, dropColumn, binIndex, payoutMultiplier, betCents,
        pathJson, revealedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      round.status,
      round.nonce,
      round.commitHex,
      round.serverSeed,
      round.clientSeed,
      round.combinedSeed,
      round.pegMapHash,
      round.rows,
      round.dropColumn,
      round.binIndex,
      round.payoutMultiplier,
      round.betCents,
      round.pathJson,
      round.revealedAt || null
    );

    return result.lastInsertRowid as number;
  }

  getRound(id: number): GameRound | undefined {
    const stmt = this.db.prepare('SELECT * FROM game_rounds WHERE id = ?');
    return stmt.get(id) as GameRound | undefined;
  }

  getAllRounds(limit: number = 50): GameRound[] {
    const stmt = this.db.prepare(
      'SELECT * FROM game_rounds ORDER BY id DESC LIMIT ?'
    );
    return stmt.all(limit) as GameRound[];
  }

  close() {
    this.db.close();
  }
}

export const db = new DatabaseService();
