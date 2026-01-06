import { NextRequest } from "next/server";
import { getDb } from "./mongo";
import { verifyAdminAccessFromCookie, verifyApiKey } from "./auth";

type Scope = "auth" | "public";

const DEFAULTS = {
  auth: {
    windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 1000,
  },
  public: {
    windowMs: Number(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 300,
  },
};

function getIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim();
  return ip || "unknown";
}

async function resolveIdentity(req: NextRequest, scope: Scope) {
  if (scope === "auth") {
    const auth = await verifyAdminAccessFromCookie(req);
    if (auth?.isValid && auth.adminId) return `admin:${auth.adminId}`;
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth?.adminId) return `apiKey:${apiKey}`;
    }
  } else {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) return `apiKey:${apiKey}`;
  }
  return `ip:${getIp(req)}`;
}

export async function rateLimit(
  req: NextRequest,
  scope: Scope
): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
}> {
  const cfg = DEFAULTS[scope];
  const identity = await resolveIdentity(req, scope);
  const now = Date.now();
  const bucket = Math.floor(now / cfg.windowMs) * cfg.windowMs;
  const key = `${scope}:${identity}:${bucket}`;
  const db = await getDb();
  const coll = db.collection("rate_limits");
  const res = await coll.findOneAndUpdate(
    { key },
    {
      $setOnInsert: {
        key,
        bucket,
        windowMs: cfg.windowMs,
        limit: cfg.max,
        createdAt: new Date(),
      },
      $inc: { count: 1 },
    },
    { upsert: true, returnDocument: "after" }
  );
  const doc = (res && (res.value as any)) || null;
  const count = doc && typeof doc.count === "number" ? doc.count : 1;
  const remaining = Math.max(0, cfg.max - count);
  const reset = bucket + cfg.windowMs;
  const headers = {
    "X-RateLimit-Limit": String(cfg.max),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };
  return { allowed: count <= cfg.max, headers };
}
