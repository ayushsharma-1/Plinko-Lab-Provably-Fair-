import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import './PlinkoBoard.css';

interface Props {
  path?: number[];
  finalBin?: number;
  playing: boolean;
  muted: boolean;
}

const ROWS = 12;
const BINS = 13;

function PlinkoBoard({ path, finalBin, playing, muted }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // init audio
  useEffect(() => {
    if (!muted && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [muted]);

  // play tick sound
  const playTick = () => {
    if (muted || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  };

  // play landing sound
  const playLanding = () => {
    if (muted || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 400;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  };

  // trigger confetti
  const triggerConfetti = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // animate ball drop
  useEffect(() => {
    if (!path || !canvasRef.current || !playing) return;

    setAnimating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const pegRadius = 4;
    const ballRadius = 8;

    // calc positions
    const rowHeight = height / (ROWS + 2);
    const colWidth = width / (BINS + 1);

    let currentRow = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animSpeed = prefersReducedMotion ? 50 : 300;

    const animate = () => {
      // clear
      ctx.clearRect(0, 0, width, height);

      // draw pegs
      for (let r = 0; r < ROWS; r++) {
        for (let p = 0; p <= r; p++) {
          const x = width / 2 + (p - r / 2) * colWidth;
          const y = rowHeight * (r + 1);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // draw bins
      for (let b = 0; b < BINS; b++) {
        const x = colWidth * (b + 1);
        const y = height - rowHeight / 2;
        const isActive = finalBin !== undefined && b === finalBin && currentRow >= ROWS;

        ctx.fillStyle = isActive ? '#4ade80' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x - 15, y, 30, 40);

        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.toString(), x, y + 25);
      }

      // draw ball
      if (currentRow <= ROWS && path[currentRow] !== undefined) {
        const pos = path[currentRow];
        const x = width / 2 + (pos - currentRow / 2) * colWidth;
        const y = rowHeight * (currentRow + 1);

        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // next step
      if (currentRow < ROWS) {
        playTick();
        currentRow++;
        setTimeout(animate, animSpeed);
      } else {
        setAnimating(false);
        playLanding();
        triggerConfetti();
      }
    };

    animate();
  }, [path, playing]);

  return (
    <div className="plinko-board">
      <canvas
        ref={canvasRef}
        width={600}
        height={700}
        className="plinko-canvas"
      />
      {animating && <div className="animating-overlay">Dropping...</div>}
    </div>
  );
}

export default PlinkoBoard;
