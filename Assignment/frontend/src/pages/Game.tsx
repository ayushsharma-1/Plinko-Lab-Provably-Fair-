import { useState, useEffect } from 'react';
import PlinkoBoard from '../components/PlinkoBoard';
import GameControls from '../components/GameControls';
import GameInfo from '../components/GameInfo';
import './Game.css';

interface GameState {
  commitHex: string;
  nonce: number;
  payoutTable: Record<number, number>;
  playing: boolean;
  result: any | null;
}

interface HistoryEntry {
  roundId: number;
  binIndex: number;
  payoutMultiplier: number;
  payoutAmount: number;
  timestamp: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  commitHex: string;
}

function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    initGame();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/game/history?limit=10');
      if (!res.ok) return;
      
      const data = await res.json();
      const historyEntries: HistoryEntry[] = data.map((round: any) => ({
        roundId: round.id || 0,
        binIndex: round.binIndex || 0,
        payoutMultiplier: round.payoutMultiplier || 0,
        payoutAmount: round.betCents && round.payoutMultiplier 
          ? (round.betCents / 100) * round.payoutMultiplier 
          : 0,
        timestamp: round.createdAt || '',
        serverSeed: round.serverSeed || '',
        clientSeed: round.clientSeed || '',
        nonce: round.nonce || 0,
        commitHex: round.commitHex || ''
      }));
      setHistory(historyEntries);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const initGame = async () => {
    try {
      const res = await fetch('/api/game/init', { method: 'POST' });
      const data = await res.json();
      setGameState({
        ...data,
        playing: false,
        result: null
      });
    } catch (err) {
      console.error('Init failed:', err);
    }
  };

  const handlePlay = async (clientSeed: string, dropColumn: number, betAmount: number) => {
    if (!gameState || loading) return;

    setLoading(true);
    setGameState(prev => prev ? { ...prev, playing: true, result: null } : null);

    try {
      const res = await fetch('/api/game/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitHex: gameState.commitHex,
          clientSeed,
          dropColumn,
          betAmount
        })
      });

      const result = await res.json();
      
      if (result.error) {
        console.error('Game error:', result.error);
        setLoading(false);
        setGameState(prev => prev ? { ...prev, playing: false } : null);
        return;
      }
      
      // wait for animation
      setTimeout(() => {
        setGameState(prev => prev ? { ...prev, result, playing: false } : null);
        setLoading(false);
        
        // add to history
        if (result.roundId) {
          setHistory(prev => [{
            roundId: result.roundId,
            binIndex: result.binIndex || result.finalBin,
            payoutMultiplier: result.payoutMultiplier || 0,
            payoutAmount: result.payoutAmount || 0,
            timestamp: new Date().toISOString(),
            serverSeed: result.serverSeed || '',
            clientSeed: result.clientSeed || clientSeed,
            nonce: result.nonce || 0,
            commitHex: gameState.commitHex
          }, ...prev.slice(0, 9)]);
        }
        
        // auto-init new round for next game
        initGame();
      }, 100);

    } catch (err) {
      console.error('Play failed:', err);
      setLoading(false);
      setGameState(prev => prev ? { ...prev, playing: false } : null);
    }
  };

  const handleNewRound = () => {
    setGameState(prev => prev ? { ...prev, result: null } : null);
    initGame();
  };

  return (
    <div className="game-page">
      <div className="game-container">
        <div className="game-header">
          <h2>Provably Fair Plinko</h2>
          <button 
            className="mute-btn"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? 'MUTE' : 'SOUND'}
          </button>
        </div>

        {gameState && (
          <>
            <GameInfo
              commitHex={gameState.commitHex}
              nonce={gameState.nonce}
              result={gameState.result}
              payoutTable={gameState.payoutTable}
            />

            <PlinkoBoard
              path={gameState.result?.path}
              finalBin={gameState.result?.finalBin}
              playing={gameState.playing}
              muted={muted}
            />

            <GameControls
              onPlay={handlePlay}
              disabled={loading || gameState.playing}
              onNewRound={handleNewRound}
              showNewRound={!!gameState.result}
            />

            {history.length > 0 && (
              <div className="history-section">
                <h3>Recent Games</h3>
                <div className="history-list">
                  {history.map((entry, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-main">
                        <span className="round-id">#{entry.roundId}</span>
                        <span className="bin">Bin {entry.binIndex}</span>
                        <span className="mult">{entry.payoutMultiplier}x</span>
                        <span className="payout">{entry.payoutAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="history-details">
                        <div className="detail-item">
                          <span className="detail-label">Server:</span>
                          <span className="detail-value">{entry.serverSeed.substring(0, 12)}...</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Client:</span>
                          <span className="detail-value">{entry.clientSeed}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Nonce:</span>
                          <span className="detail-value">{entry.nonce}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Commit:</span>
                          <span className="detail-value">{entry.commitHex.substring(0, 12)}...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Game;
