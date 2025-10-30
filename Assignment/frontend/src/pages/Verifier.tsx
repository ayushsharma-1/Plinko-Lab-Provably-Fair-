import { useState } from 'react';
import './Verifier.css';

function Verifier() {
  const [formData, setFormData] = useState({
    serverSeed: '',
    clientSeed: '',
    nonce: '',
    dropColumn: '',
    roundId: ''
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/game/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverSeed: formData.serverSeed,
          clientSeed: formData.clientSeed,
          nonce: parseInt(formData.nonce),
          dropColumn: parseInt(formData.dropColumn),
          roundId: formData.roundId ? parseInt(formData.roundId) : undefined
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Verify failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRound = async () => {
    if (!formData.roundId) return;
    
    try {
      const res = await fetch(`/api/game/round/${formData.roundId}`);
      if (!res.ok) {
        console.error('Round not found');
        return;
      }
      const round = await res.json();
      
      if (round && round.serverSeed) {
        setFormData({
          serverSeed: round.serverSeed,
          clientSeed: round.clientSeed,
          nonce: round.nonce?.toString() || '',
          dropColumn: round.dropColumn?.toString() || '',
          roundId: formData.roundId
        });
      }
    } catch (err) {
      console.error('Failed to load round:', err);
    }
  };

  return (
    <div className="verifier-page">
      <div className="verifier-container">
        <h2>Game Verifier</h2>
        <p className="verifier-desc">
          Verify any game round by entering the seeds, nonce, and drop column.
          The system will reproduce the exact same outcome.
        </p>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="form-group">
            <label>Round ID (optional - auto-fill)</label>
            <div className="round-id-group">
              <input
                type="number"
                value={formData.roundId}
                onChange={(e) => setFormData({ ...formData, roundId: e.target.value })}
                placeholder="Enter round ID"
              />
              <button
                type="button"
                onClick={loadRound}
                className="load-btn"
                disabled={!formData.roundId}
              >
                Load
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Server Seed</label>
            <input
              type="text"
              value={formData.serverSeed}
              onChange={(e) => setFormData({ ...formData, serverSeed: e.target.value })}
              placeholder="Enter server seed (hex)"
              required
            />
          </div>

          <div className="form-group">
            <label>Client Seed</label>
            <input
              type="text"
              value={formData.clientSeed}
              onChange={(e) => setFormData({ ...formData, clientSeed: e.target.value })}
              placeholder="Enter client seed"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nonce</label>
              <input
                type="number"
                value={formData.nonce}
                onChange={(e) => setFormData({ ...formData, nonce: e.target.value })}
                placeholder="Nonce"
                required
              />
            </div>

            <div className="form-group">
              <label>Drop Column</label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.dropColumn}
                onChange={(e) => setFormData({ ...formData, dropColumn: e.target.value })}
                placeholder="0-12"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="verify-btn">
            {loading ? 'Verifying...' : 'Verify Game'}
          </button>
        </form>

        {result && (
          <div className={`verify-result ${result.valid ? 'valid' : 'invalid'}`}>
            <h3>{result.valid ? 'VERIFIED - Outcome Matches' : 'FAILED - Outcome Mismatch'}</h3>
            
            <div className="result-grid">
              <div className="result-item">
                <span className="label">Commit Hash:</span>
                <span className="value mono">{result.commitHex.substring(0, 16)}...</span>
              </div>

              <div className="result-item">
                <span className="label">Combined Seed:</span>
                <span className="value mono">{result.combinedSeed.substring(0, 16)}...</span>
              </div>

              <div className="result-item">
                <span className="label">Peg Map Hash:</span>
                <span className="value mono">{result.pegMapHash.substring(0, 16)}...</span>
              </div>

              <div className="result-item">
                <span className="label">Final Bin:</span>
                <span className="value highlight">{result.binIndex}</span>
              </div>

              <div className="result-item">
                <span className="label">Payout Multiplier:</span>
                <span className="value highlight">{result.payoutMultiplier}x</span>
              </div>

              <div className="result-item full">
                <span className="label">Ball Path:</span>
                <span className="value">{result.path.join(' → ')}</span>
              </div>

              <div className="result-item full">
                <span className="label">Decisions:</span>
                <span className="value mono">{result.decisions.join(' ')}</span>
              </div>

              {result.storedRound && (
                <div className="result-item full stored-match">
                  <span className="label">Stored Round Match:</span>
                  <span className="value">
                    Round #{result.storedRound.id} - Bin {result.storedRound.binIndex}
                    {result.valid ? ' - MATCH' : ' - MISMATCH'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verifier;
