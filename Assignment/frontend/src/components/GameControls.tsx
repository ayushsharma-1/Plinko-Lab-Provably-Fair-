import { useState } from 'react';
import './GameControls.css';

interface Props {
  onPlay: (clientSeed: string, dropColumn: number, betAmount: number) => void;
  disabled: boolean;
  onNewRound: () => void;
  showNewRound: boolean;
}

function GameControls({ onPlay, disabled, onNewRound, showNewRound }: Props) {
  const [clientSeed, setClientSeed] = useState(Math.random().toString(36).substring(7));
  const [dropColumn, setDropColumn] = useState(6);
  const [betAmount, setBetAmount] = useState(100);

  const handleDrop = () => {
    onPlay(clientSeed, dropColumn, betAmount);
  };

  const handleKeyboard = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'ArrowLeft') {
      setDropColumn(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setDropColumn(prev => Math.min(12, prev + 1));
    } else if (e.key === ' ') {
      e.preventDefault();
      handleDrop();
    }
  };

  return (
    <div className="game-controls" onKeyDown={handleKeyboard} tabIndex={0}>
      <div className="control-group">
        <label htmlFor="clientSeed">Client Seed</label>
        <div className="seed-input-group">
          <input
            id="clientSeed"
            type="text"
            value={clientSeed}
            onChange={(e) => setClientSeed(e.target.value)}
            disabled={disabled}
            placeholder="Your random seed"
          />
          <button
            onClick={() => setClientSeed(Math.random().toString(36).substring(7))}
            disabled={disabled}
            className="randomize-btn"
            aria-label="Generate random seed"
          >
            RANDOM
          </button>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="dropColumn">
          Drop Column: {dropColumn}
          <span className="hint">Use ← → keys</span>
        </label>
        <input
          id="dropColumn"
          type="range"
          min="0"
          max="12"
          value={dropColumn}
          onChange={(e) => setDropColumn(parseInt(e.target.value))}
          disabled={disabled}
          className="slider"
        />
        <div className="column-markers">
          {[...Array(13)].map((_, i) => (
            <span key={i} className={i === dropColumn ? 'active' : ''}>
              {i}
            </span>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="betAmount">Bet Amount</label>
        <input
          id="betAmount"
          type="number"
          min="1"
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
          disabled={disabled}
        />
      </div>

      <div className="action-buttons">
        <button
          onClick={handleDrop}
          disabled={disabled}
          className="drop-btn"
        >
          {disabled ? 'Dropping...' : 'Drop Ball (Space)'}
        </button>

        {showNewRound && (
          <button
            onClick={onNewRound}
            className="new-round-btn"
          >
            New Round
          </button>
        )}
      </div>

      <p className="accessibility-hint">
        Keyboard: Use Arrow keys to select column, Space to drop
      </p>
    </div>
  );
}

export default GameControls;
