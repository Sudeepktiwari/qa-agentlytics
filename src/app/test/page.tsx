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

const Blob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  scale?: number;
}> = ({ x, y, size, color, scale = 1 }) => (
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

const TitleOverlay: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(
    frame % (fps * 12),
    [0, 8, fps * 12 - 12, fps * 12 - 2],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 120,
        padding: "10px 16px",
        borderRadius: 12,
        background: "rgba(15,23,42,.65)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 0.2,
        opacity: op,
        backdropFilter: "blur(6px)",
      }}
    >
      {label}
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  const alpha = (o: number) => 0.4 + (Math.sin((frame + o) / 8) + 1) * 0.3;
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 6,
        padding: "6px 12px",
        background: "#EFF6FF",
        border: "1px solid #DBEAFE",
        borderRadius: 999,
      }}
    >
      {[0, 6, 12].map((d, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: `rgba(37,99,235,${alpha(d)})`,
          }}
        />
      ))}
    </div>
  );
};

const ChatBubble: React.FC<{
  side: "bot" | "user";
  text: string;
  delay?: number;
}> = ({ side, text, delay = 0 }) => {
  const frame = useCurrentFrame() - (delay ?? 0);
  const op = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 8], [12, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        maxWidth: "60%",
        margin: side === "user" ? "10px 0 10px auto" : "10px 0",
        background: side === "user" ? "#EEF2FF" : "#EFF6FF",
        border: "1px solid #E2E8F0",
        padding: "12px 14px",
        borderRadius: 16,
        borderBottomLeftRadius: side === "user" ? 16 : 6,
        borderBottomRightRadius: side === "user" ? 6 : 16,
        color: BRAND.ink,
        opacity: op,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ fontSize: 22, lineHeight: 1.35 }}>{text}</div>
    </div>
  );
};

const MacWindow: React.FC<MacWindowProps> = ({
  x,
  y,
  w,
  h,
  title = "Agentlytics · Live",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200, stiffness: 120 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 18,
        background: "#FFFFFF",
        boxShadow: "0 24px 60px rgba(2,6,23,.12)",
        border: "1px solid #E2E8F0",
        transform: `scale(${interpolate(s, [0, 1], [0.98, 1])})`,
      }}
    >
      <div
        style={{
          height: 44,
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          background: "#F8FAFC",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#FCA5A5",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#FCD34D",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#86EFAC",
            }}
          />
        </div>
        <div style={{ marginLeft: 12, fontSize: 14, color: "#64748B" }}>
          {title}
        </div>
      </div>
      <div
        style={{
          padding: 18,
          width: "100%",
          height: h - 44,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ------------------ Title component (with overlay text) ------------------
const Title: React.FC<{ text: string; subtitle?: string }> = ({
  text,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 12], [10, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 120,
        right: 120,
        transform: `translateY(${y}px)`,
        opacity: op,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 58,
          lineHeight: 1.05,
          color: BRAND.ink,
        }}
      >
        {text}
      </div>
      {subtitle && (
        <div style={{ marginTop: 12, fontSize: 24, color: BRAND.slate700 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ------------------ Scene: Engage ------------------
const SceneEngage: React.FC = () => {
  return (
    <>
      <Title
        text="Engage Visitors"
        subtitle="Proactive chat when intent peaks"
      />
      <MacWindow x={220} y={240} w={1480} h={560}>
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "#DBEAFE",
            }}
          />
          <div style={{ fontSize: 18, color: BRAND.slate700 }}>
            Landing on Pricing
          </div>
        </div>
        <ChatBubble side="bot" text="👋 Hi there! Need help choosing a plan?" />
        <TypingDots />
      </MacWindow>
    </>
  );
};

// ------------------ Scene: Qualify ------------------
const SceneQualify: React.FC = () => {
  return (
    <>
      <Title text="Qualify Leads Instantly" subtitle="Ask, understand, adapt" />
      <MacWindow x={220} y={240} w={1480} h={560}>
        <ChatBubble side="bot" text="What brings you here today?" />
        <ChatBubble side="user" text="Comparing Pro vs Business." delay={6} />
        <ChatBubble
          side="bot"
          text="Got it. What team size are we talking?"
          delay={12}
        />
        <ChatBubble side="user" text="About 12 people." delay={18} />
      </MacWindow>
    </>
  );
};

// ------------------ Scene: Book ------------------
const SceneBook: React.FC = () => {
  const Slot: React.FC<{ t: string; i: number }> = ({ t, i }) => {
    const frame = useCurrentFrame();
    const op = interpolate(frame, [i * 4, i * 4 + 8], [0, 1], {
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [i * 4, i * 4 + 8], [10, 0], {
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          height: 64,
          display: "grid",
          placeItems: "center",
          border: "1px solid #CBD5E1",
          borderRadius: 14,
          fontSize: 22,
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        {t}
      </div>
    );
  };
  return (
    <>
      <Title text="Book Demos in Chat" subtitle="Pick a time — no emails" />
      <MacWindow x={220} y={220} w={820} h={600}>
        <div style={{ fontSize: 16, color: "#64748B", marginBottom: 10 }}>
          Pick a time
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {["10:00", "12:30", "15:00", "16:30", "17:15", "18:00"].map(
            (t, i) => (
              <Slot key={t} t={t} i={i} />
            )
          )}
        </div>
        <div style={{ marginTop: 16, fontSize: 16, color: "#64748B" }}>
          Calendar sync · Reminders included
        </div>
      </MacWindow>
      <MacWindow x={1080} y={220} w={620} h={600} title="Confirmation">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: "#DCFCE7",
            }}
          />
          <div>
            Booked for <strong>12:30 Tue</strong> ✅
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 16, color: "#64748B" }}>
          Invite sent · Reschedule anytime
        </div>
      </MacWindow>
    </>
  );
};

// ------------------ Scene: Support ------------------
const SceneSupport: React.FC = () => {
  return (
    <>
      <Title text="Automate Customer Support" subtitle="Resolve with context" />
      <MacWindow x={260} y={260} w={680} h={540} title="Helpdesk">
        <ChatBubble side="user" text="How do I connect Slack alerts?" />
        <ChatBubble
          side="bot"
          text="Go to Settings → Alerts → Connect Slack."
          delay={8}
        />
        <ChatBubble
          side="bot"
          text="Want me to set it up for you now?"
          delay={14}
        />
      </MacWindow>
      <MacWindow x={980} y={260} w={960} h={540} title="Setup Guide">
        <div style={{ fontSize: 18, color: BRAND.slate700, marginBottom: 10 }}>
          Steps
        </div>
        <ol style={{ lineHeight: 1.7, fontSize: 20, paddingLeft: 18 }}>
          <li>
            Open <em>Settings</em> in top right
          </li>
          <li>
            Choose <em>Alerts</em> → <em>Integrations</em>
          </li>
          <li>
            Click <strong>Connect Slack</strong>
          </li>
          <li>Approve workspace permissions</li>
        </ol>
      </MacWindow>
    </>
  );
};

// ------------------ Scene: Insights ------------------
const SceneInsights: React.FC = () => {
  const StatCard: React.FC<{ title: string; value: string; i: number }> = ({
    title,
    value,
    i,
  }) => {
    const frame = useCurrentFrame();
    const op = interpolate(frame, [i * 6, i * 6 + 10], [0, 1], {
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [i * 6, i * 6 + 10], [12, 0], {
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: 24,
          background: "#FFFFFF",
          boxShadow: "0 12px 28px rgba(2,6,23,.06)",
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        <div style={{ fontSize: 16, color: "#64748B" }}>{title}</div>
        <div style={{ fontWeight: 800, fontSize: 42, marginTop: 6 }}>
          {value}
        </div>
      </div>
    );
  };
  return (
    <>
      <Title
        text="Turn Conversations into Insights"
        subtitle="See lift & satisfaction"
      />
      <div
        style={{
          position: "absolute",
          left: 220,
          top: 340,
          right: 220,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 18,
        }}
      >
        <StatCard title="Conversion Lift" value="↑ 2.8×" i={0} />
        <StatCard title="Ghosted Chats" value="↓ 41%" i={1} />
        <StatCard title="CSAT" value="4.7/5" i={2} />
      </div>
    </>
  );
};

// ------------------ Scene: CTA ------------------
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = interpolate(Math.sin(frame / 12), [-1, 1], [0.4, 1]);
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", opacity: op }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.05,
            color: BRAND.ink,
          }}
        >
          Let Your Website Talk First
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: BRAND.slate700 }}>
          Agentlytics — Proactive AI for Every Journey
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 28,
            padding: "18px 28px",
            borderRadius: 12,
            color: "#fff",
            background: `linear-gradient(180deg, ${BRAND.indigo}, ${BRAND.violet})`,
            fontWeight: 700,
            fontSize: 26,
            boxShadow: `0 18px 44px rgba(99,102,241,${0.25 * glow})`,
          }}
        >
          Start Free Trial
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Replace simplified VectorExplainerVideo with the original multi-scene sequence
// ------------------ Main Vector Explainer ------------------
const VectorExplainerVideo: React.FC = () => {
  const fps = 30;
  const T1 = 0; // Engage (0–12s)
  const T2 = 12 * fps; // Qualify (12–25s)
  const T3 = 25 * fps; // Book (25–40s)
  const T4 = 40 * fps; // Support (40–55s)
  const T5 = 55 * fps; // Insights (55–70s)
  const T6 = 70 * fps; // CTA (70–75s)

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <GradientBG />

      <Sequence from={T1} durationInFrames={12 * fps} name="Engage">
        <SceneEngage />
      </Sequence>
      <Sequence from={T2} durationInFrames={13 * fps} name="Qualify">
        <SceneQualify />
      </Sequence>
      <Sequence from={T3} durationInFrames={15 * fps} name="Book">
        <SceneBook />
      </Sequence>
      <Sequence from={T4} durationInFrames={15 * fps} name="Support">
        <SceneSupport />
      </Sequence>
      <Sequence from={T5} durationInFrames={15 * fps} name="Insights">
        <SceneInsights />
      </Sequence>
      <Sequence from={T6} durationInFrames={5 * fps} name="CTA">
        <SceneCTA />
      </Sequence>

      {/* Global scene label pulsers (subtle, optional) */}
      <Sequence from={T1} durationInFrames={12 * fps}>
        <TitleOverlay label="Engage" />
      </Sequence>
      <Sequence from={T2} durationInFrames={13 * fps}>
        <TitleOverlay label="Qualify" />
      </Sequence>
      <Sequence from={T3} durationInFrames={15 * fps}>
        <TitleOverlay label="Book" />
      </Sequence>
      <Sequence from={T4} durationInFrames={15 * fps}>
        <TitleOverlay label="Support" />
      </Sequence>
      <Sequence from={T5} durationInFrames={15 * fps}>
        <TitleOverlay label="Insights" />
      </Sequence>
    </AbsoluteFill>
  );
};

export default function Page() {
  const fps = 30;
  return (
    <div style={{ padding: 20 }}>
      <Player
        component={VectorExplainerVideo}
        durationInFrames={75 * fps}
        fps={fps}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
      />
    </div>
  );
}
