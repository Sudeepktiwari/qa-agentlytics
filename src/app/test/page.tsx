// Agentlytics Vector Explainer — Full Journey (Intercom-style)
// One-file Remotion project with text overlays, vector scenes, and safe H.264 rendering.
// Drop this in src/AgentlyticsVectorExplainer.tsx and wire as Root (see bottom).
"use client";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { Player } from "@remotion/player";

// Explicit props type including children to satisfy TS
type MacWindowProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  children?: React.ReactNode;
};

// ------------------ Brand Tokens ------------------
const BRAND = {
  indigo: "#6366F1",
  violet: "#8B5CF6",
  ink: "#0F172A",
  slate600: "#475569",
  slate700: "#334155",
  white: "#FFFFFF",
  bgTop: "#EEF2FF",
  bgBottom: "#FFFFFF",
} as const;

// ------------------ Generic Atoms ------------------
const GradientBG: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 40), [-1, 1], [0.96, 1.04]);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${BRAND.bgTop}, ${BRAND.bgBottom})`,
        }}
      />
      {/* soft blobs */}
      <Blob x={-220} y={-160} size={700} color="#E0E7FF" scale={pulse} />
      <Blob x={1520} y={680} size={640} color="#E9D5FF" scale={2 - pulse} />
    </AbsoluteFill>
  );
};

const Blob: React.FC<{ x: number; y: number; size: number; color: string; scale?: number }>
= ({ x, y, size, color, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      background: color,
      borderRadius: size,
      filter: "blur(60px)",
      opacity: 0.7,
      transform: `scale(${scale})`,
    }}
  />
);

const TitleOverlay: React.FC<{ label: string }>= ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(frame % (fps * 12), [0, 8, (fps * 12) - 12, (fps * 12) - 2], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 60, left: 120, padding: '10px 16px', borderRadius: 12, background: 'rgba(15,23,42,.65)', color: '#fff', fontWeight: 700, fontSize: 26, letterSpacing: 0.2, opacity: op, backdropFilter: 'blur(6px)' }}>
      {label}
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  const alpha = (o: number) => 0.4 + (Math.sin((frame + o) / 8) + 1) * 0.3;
  return (
    <div style={{ display: 'inline-flex', gap: 6, padding: '6px 12px', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 999 }}>
      {[0, 6, 12].map((d, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: `rgba(37,99,235,${alpha(d)})` }} />
      ))}
    </div>
  );
};

const ChatBubble: React.FC<{ side: 'bot' | 'user'; text: string; delay?: number }>
= ({ side, text, delay = 0 }) => {
  const frame = useCurrentFrame() - (delay ?? 0);
  const op = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 8], [12, 0], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        maxWidth: '60%',
        margin: side === 'user' ? '10px 0 10px auto' : '10px 0',
        background: side === 'user' ? '#EEF2FF' : '#EFF6FF',
        border: '1px solid #E2E8F0',
        padding: '12px 14px',
        borderRadius: 16,
        borderBottomLeftRadius: side === 'user' ? 16 : 6,
        borderBottomRightRadius: side === 'user' ? 6 : 16,
        color: BRAND.ink,
        opacity: op,
        transform: `translateY(${y}px)`
      }}
    >
      <div style={{ fontSize: 22, lineHeight: 1.35 }}>{text}</div>
    </div>
  );
};

const MacWindow: React.FC<MacWindowProps>
= ({ x, y, w, h, title = 'Agentlytics · Live', children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200, stiffness: 120 } });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, background: '#FFFFFF', boxShadow: '0 24px 60px rgba(2,6,23,.12)', border: '1px solid #E2E8F0', transform: `scale(${interpolate(s, [0,1],[0.98,1])})` }}>
      <div style={{ height: 44, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 12px', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FCA5A5' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FCD34D' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#86EFAC' }} />
        </div>
        <div style={{ marginLeft: 12, fontSize: 14, color: '#64748B' }}>{title}</div>
      </div>
      <div style={{ padding: 18, width: '100%', height: h - 44, overflow: 'hidden' }}>{children}</div>
    </div>
  );
};

const VectorExplainerVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      <GradientBG />
      <div style={{ position: 'absolute', top: 120, left: 120, fontSize: 48, fontWeight: 800, color: BRAND.ink, opacity: op }}>
        Vector Explainer — Smoke Test
      </div>
      <MacWindow x={420} y={360} w={1080} h={280}>
        <ChatBubble side="bot" text="If you can see this, player is wired." />
      </MacWindow>
    </AbsoluteFill>
  );
};

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <Player
        component={VectorExplainerVideo}
        durationInFrames={150}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
      />
    </div>
  );
}
