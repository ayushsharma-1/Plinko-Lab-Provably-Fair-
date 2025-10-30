import './GameInfo.css';

interface Props {
  commitHex: string;
  nonce: number;
  result: any;
  payoutTable: Record<number, number>;
}

function GameInfo({ commitHex, nonce, result, payoutTable }: Props) {
  return (
    <div className="game-info">
      <div className="info-section">
        <h3>Provably Fair Info</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Commit Hash:</span>
            <span className="value mono">{commitHex.substring(0, 16)}...</span>
          </div>
          <div className="info-item">
            <span className="label">Nonce:</span>
            <span className="value">{nonce}</span>
          </div>
          {result && (
            <>
              <div className="info-item">
                <span className="label">Server Seed:</span>
                <span className="value mono">{result.serverSeed.substring(0, 16)}...</span>
              </div>
              <div className="info-item">
                <span className="label">Combined Seed:</span>
                <span className="value mono">{result.combinedSeed.substring(0, 16)}...</span>
              </div>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="info-section result-section">
          <h3>Result</h3>
          <div className="result-highlight">
            <div className="result-item-large">
              <span className="label">Final Bin:</span>
              <span className="value">{result.finalBin}</span>
            </div>
            <div className="result-item-large">
              <span className="label">Multiplier:</span>
              <span className="value">{result.payoutMultiplier}x</span>
            </div>
            <div className="result-item-large">
              <span className="label">Payout:</span>
              <span className="value">{result.payoutAmount}</span>
            </div>
          </div>
          <div className="path-display">
            <span className="label">Path:</span>
            <span className="value">{result.path.join(' → ')}</span>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>Payout Table</h3>
        <div className="payout-grid">
          {Object.entries(payoutTable).map(([bin, mult]) => (
            <div
              key={bin}
              className={`payout-item ${result?.finalBin === parseInt(bin) ? 'active' : ''}`}
            >
              <span className="bin">Bin {bin}</span>
              <span className="multiplier">{mult}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameInfo;
