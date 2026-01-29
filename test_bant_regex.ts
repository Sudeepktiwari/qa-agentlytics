function computeBantMissingDims(
  messages: any[],
  profile: any = null,
): ("budget" | "authority" | "need" | "timeline" | "segment")[] {
  const allDims: ("budget" | "authority" | "need" | "timeline" | "segment")[] =
    ["segment", "budget", "authority", "need", "timeline"];
  const answered = new Set<
    "budget" | "authority" | "need" | "timeline" | "segment"
  >();

  let pendingAsked:
    | "budget"
    | "authority"
    | "need"
    | "timeline"
    | "segment"
    | null = null;
  let pendingAskedButtons: string[] = [];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i] || {};
    const role = String(m.role || "").toLowerCase();
    const content = String(m.content || "");

    console.log(`Processing message [${role}]: "${content}"`);

    if (role === "assistant") {
      // simulate finding pending asked from previous turn
      // In this test, we might not need accurate assistant tracking if we focus on user content regex
      continue;
    }
    if (role === "user") {
      const s = content.toLowerCase();
      // Stricter regex for unsolicited budget info
      if (
        /\b\d+\s*(usd|dollars|\$|k|grand)\b|per\s*month|\/mo\b|per\s*year|\/yr\b|budget\s*(is|of|range)|less\s*than|under|below|more\s*than|above|over|free/.test(
          s,
        )
      ) {
        console.log("  -> Matched Budget");
        answered.add("budget");
      }
      // Stricter regex for timeline
      if (
        /\b(this\s*week|next\s*week|this\s*month|next\s*month|this\s*year|next\s*year|quarter|q[1-4]|in\s+\d+\s*(days?|weeks?|months?|years?|mos?|yrs?)|\d{4}-\d{2}-\d{2}|immediately|soon|later|evaluating|exploring|just\s*looking|active|months?|weeks?|days?|years?)\b/.test(
          s,
        ) ||
        /\b\d+\s*[-–]\s*\d+\s*(months?|weeks?|days?|yrs?|years?)\b/.test(s)
      ) {
        console.log("  -> Matched Timeline");
        answered.add("timeline");
      }
      // Authority
      if (
        /i\s*(am|'m)\s*the\s*decision\s*maker|\b(it'?s\s*me|myself)\b|i\s*(decide|approve|buy)\b|my\s*manager|team\s*lead|we\s*decide|manager\s*approval|need\s*approval|procurement|legal|finance|cfo|ceo|owner|founder|director|vp|cx|admin|head|chief|executive|officer|consultant|analyst|developer|engineer|architect/.test(
          s,
        )
      ) {
        console.log("  -> Matched Authority");
        answered.add("authority");
      }
      // Need
      if (
        /workflows|embeds|analytics|integration|automation|reminders|api|webhooks|availability|templates|reporting|compliance|security|scheduling|project\s*management|collaboration|data\s*analytics|capture|leads|lead\s*gen|lead\s*generation|ai\s*tools|qualified|engage|visitors|manual|sales|support|work|understand|intent|behavior|growth|scale|revenue|efficiency|optimize|optimization|conversion|convert|traffic|user\s*experience|ux/.test(
          s,
        )
      ) {
        console.log("  -> Matched Need");
        answered.add("need");
      }
      // Segment
      if (
        /(individual|solo|freelancer)\b/.test(s) ||
        /\bpersonal\s*(use|plan|account|project)\b/.test(s)
      ) {
        console.log("  -> Matched Segment (Individual)");
        answered.add("segment");
      }
      if (
        /(smb|small\s*business|startup|mid\s*market|medium\s*business)\b/.test(
          s,
        ) ||
        /\bteam\s*(of|size|plan)\b/.test(s)
      ) {
        console.log("  -> Matched Segment (SMB)");
        answered.add("segment");
      }
      if (
        /(enterprise|corporate|large\s*company|non[\s-]*profit)\b/.test(s) ||
        /\bglobal\s*(deployment|scale|rollout)\b/.test(s)
      ) {
        console.log("  -> Matched Segment (Enterprise)");
        answered.add("segment");
      }
    }
  }
  return allDims.filter((d) => !answered.has(d));
}

const messages = [
  { role: "user", content: "Lead Generation Ai" },
  { role: "assistant", content: "Lead Generation AI helps..." },
  { role: "assistant", content: "What specific aspect..." },
  { role: "user", content: "AI tools" },
  { role: "assistant", content: "AI tools can really help..." },
  { role: "user", content: "lion@tiger.com" },
  { role: "assistant", content: "Thank you..." },
  { role: "assistant", content: "What is your budget?" },
  { role: "user", content: "Under $500" },
  { role: "assistant", content: "When are you looking..." },
  { role: "user", content: "Immediately" },
];

const missing = computeBantMissingDims(messages);
console.log("Missing dimensions:", missing);
