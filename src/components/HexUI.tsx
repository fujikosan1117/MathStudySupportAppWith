/**
 * HexUI.tsx — 六角形デザインの共有 UI コンポーネント集
 *
 * Hexagon:           SVG 六角形 (アイコンバッジ・装飾に使用)
 * HexGridBackground: 画面全体に敷く六角形グリッド背景
 * ScanLine:          上→下に流れるスキャンラインアニメーション
 * FloatingHex:       浮遊する装飾用六角形 (回転 + フェード)
 * HexDivider:        六角形付きの区切り線
 * HexRowDecoration:  ページ下部の六角形装飾列
 * C:                 アプリ全体のカラーパレット定数
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Color Palette (shared) ---
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

// --- Hexagon SVG Component ---
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
    <Svg width={w} height={h} style={{ opacity }}>
      <Polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </Svg>
  );
}

// --- Hex-Grid Background ---
export function HexGridBackground() {
  const hexSize = 30;
  const hexH = hexSize * 1.1547;
  const cols = Math.ceil(SCREEN_WIDTH / (hexSize * 1.5)) + 2;
  const rows = Math.ceil(SCREEN_HEIGHT / hexH) + 2;

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
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        {hexagons.map((hex, i) => {
          const points = `${hex.x + w / 2},${hex.y} ${hex.x + w},${hex.y + h / 4} ${hex.x + w},${hex.y + (h * 3) / 4} ${hex.x + w / 2},${hex.y + h} ${hex.x},${hex.y + (h * 3) / 4} ${hex.x},${hex.y + h / 4}`;
          return (
            <Polygon
              key={i}
              points={points}
              fill="none"
              stroke={C.border}
              strokeWidth={0.5}
              opacity={0.15}
            />
          );
        })}
      </Svg>
    </View>
  );
}

// --- Animated Scan Line ---
export function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, SCREEN_HEIGHT + 20],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: C.accent,
        opacity: 0.04,
        zIndex: 1,
        transform: [{ translateY }],
      }}
    />
  );
}

// --- Floating Hexagon Decoration ---
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
  const anim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    );
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000 + delay,
        useNativeDriver: true,
      })
    );
    floatLoop.start();
    rotateLoop.start();
    return () => {
      floatLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.12] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        opacity,
        transform: [{ translateY }, { rotate }],
      }}
    >
      <Hexagon size={size} stroke={C.accent} strokeWidth={1.5} />
    </Animated.View>
  );
}

// --- Hex Divider ---
export function HexDivider() {
  return (
    <View style={hexDividerStyles.row}>
      <View style={hexDividerStyles.line} />
      <Hexagon size={10} fill={C.border} opacity={0.5} />
      <View style={hexDividerStyles.line} />
    </View>
  );
}

const hexDividerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
});

// --- Hex Row Decoration ---
export function HexRowDecoration() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingTop: 8 }}>
      {[12, 18, 12, 24, 12, 18, 12].map((size, i) => (
        <View key={i} style={{ opacity: 0.06 + (i === 3 ? 0.06 : 0) }}>
          <Hexagon size={size} stroke={C.accent} strokeWidth={i === 3 ? 1.5 : 0.5} />
        </View>
      ))}
    </View>
  );
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };
