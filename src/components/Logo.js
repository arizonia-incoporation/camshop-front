import React from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/theme';

export default function Logo({ size = 64 }) {
  const c = size / 2;
  const r = size * 0.1;
  const spokeR = size * 0.36;
  const points = [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: c + spokeR * Math.cos(rad), y: c + spokeR * Math.sin(rad) };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {points.map((p, i) => (
        <Line key={i} x1={c} y1={c} x2={p.x} y2={p.y} stroke={colors.teal} strokeWidth={1.5} />
      ))}
      {points.map((p, i) => (
        <Circle key={`n${i}`} cx={p.x} cy={p.y} r={r * 0.6} fill={colors.lime} />
      ))}
      <Circle cx={c} cy={c} r={r * 1.4} fill={colors.navy} />
    </Svg>
  );
}

export function Wordmark({ size = 22 }) {
  return (
    <SvgText fontSize={size} fontWeight="800" fill={colors.navy}>
      cam<SvgText fill={colors.teal}>shop</SvgText>
    </SvgText>
  );
}
