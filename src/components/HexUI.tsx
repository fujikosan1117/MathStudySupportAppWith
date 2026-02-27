'use client';

import { useEffect, useState } from 'react';

export const C = {
  bg: '#000000',
  surface: '#111111',
  surfaceHover: '#1a1a1a',
  accent: '#ffffff',
  border: '#2a2a2a',
  borderHover: '#ffffff',
  dim: '#555555',
  dimLight: '#888888',
  success: '#4ade80',
  error: '#f87171',
  glow: 'rgba(255,255,255,0.08)',
} as const;

export function useWindowSize() {
  const [size, setSize] = useState({ width: 480, height: 800 });

  useEffect(() => {
    function update() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}

export function Hexagon({
  size,
  fill = 'none',
  stroke = C.border,
  strokeWidth = 1,
  opacity = 1,
}: {
  size: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const w = size;
  const h = size * 1.1547;
  const points = `${w / 2},0 ${w},${h / 4} ${w},${(h * 3) / 4} ${w / 2},${h} 0,${(h * 3) / 4} 0,${h / 4}`;
  return (
    <svg width={w} height={h} style={{ opacity, display: 'block' }}>
      <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function HexGridBackground() {
  const { width, height } = useWindowSize();
  const hexSize = 30;
  const hexH = hexSize * 1.1547;
  const cols = Math.ceil(width / (hexSize * 1.5)) + 2;
  const rows = Math.ceil(height / hexH) + 2;

  const hexagons: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * hexSize * 1.5;
      const y = row * hexH + (col % 2 === 1 ? hexH / 2 : 0);
      hexagons.push({ x, y });
    }
  }

  const w = hexSize;
  const h = hexH;

  return (
    <div className="hex-grid-bg">
      <svg width={width} height={height}>
        {hexagons.map((hex, i) => {
          const points = `${hex.x + w / 2},${hex.y} ${hex.x + w},${hex.y + h / 4} ${hex.x + w},${hex.y + (h * 3) / 4} ${hex.x + w / 2},${hex.y + h} ${hex.x},${hex.y + (h * 3) / 4} ${hex.x},${hex.y + h / 4}`;
          return (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke={C.border}
              strokeWidth={0.5}
              opacity={0.15}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function ScanLine() {
  return <div className="scan-line" />;
}

export function FloatingHex({
  size,
  top,
  left,
  delay,
}: {
  size: number;
  top: number;
  left: number;
  delay: number;
}) {
  return (
    <div
      className="floating-hex"
      style={{
        top,
        left,
        animationDelay: `${delay}ms`,
      }}
    >
      <Hexagon size={size} stroke={C.accent} strokeWidth={1.5} />
    </div>
  );
}

export function HexDivider() {
  return (
    <div className="hex-divider">
      <div className="hex-divider-line" />
      <Hexagon size={10} fill={C.border} opacity={0.5} />
      <div className="hex-divider-line" />
    </div>
  );
}

export function HexRowDecoration() {
  return (
    <div className="hex-row-decoration">
      {[12, 18, 12, 24, 12, 18, 12].map((size, i) => (
        <div key={i} style={{ opacity: 0.06 + (i === 3 ? 0.06 : 0) }}>
          <Hexagon size={size} stroke={C.accent} strokeWidth={i === 3 ? 1.5 : 0.5} />
        </div>
      ))}
    </div>
  );
}
