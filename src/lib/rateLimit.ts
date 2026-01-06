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

export function getIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim();
  return ip || "unknown";
}

export async function checkSpam(
  req: NextRequest,
  content: string
): Promise<{ action: "allow" | "warn" | "block"; message?: string }> {
  const ip = getIp(req);
  const db = await getDb();
  const spamTracking = db.collection("spam_tracking");
  const blocks = db.collection("blocks");

  // Use content directly for comparison
  const contentHash = content.trim();
  const now = new Date();

  // Find tracking record for this IP
  const record = await spamTracking.findOne({ ip });

  if (record && record.lastContent === contentHash) {
    // Duplicate message
    const newCount = (record.count || 0) + 1;

    // Update count
    await spamTracking.updateOne(
      { ip },
      {
        $set: { count: newCount, lastSeen: now },
      }
    );

    if (newCount === 3) {
      // Third time: Warn
      await spamTracking.updateOne({ ip }, { $set: { warned: true } });
      return { action: "warn", message: "please dont spam" };
    } else if (newCount > 3) {
      // More than 3 times: Block if previously warned
      if (record.warned) {
        // Block IP
        await blocks.updateOne(
          { type: "ip", value: ip },
          {
            $set: {
              type: "ip",
              value: ip,
              blocked: true,
              reason: "spam_repetition",
              createdAt: now,
              updatedAt: now,
              expiresAt: null, // Permanent block
            },
          },
          { upsert: true }
        );
        return { action: "block", message: "IP blocked due to spam" };
      }
      // If somehow reached >3 without warning flag, warn now
      return { action: "warn", message: "please dont spam" };
    }
  } else {
    // New message or different content -> Reset counter
    await spamTracking.updateOne(
      { ip },
      {
        $set: {
          lastContent: contentHash,
          count: 1,
          warned: false,
          lastSeen: now,
        },
      },
      { upsert: true }
    );
  }

  return { action: "allow" };
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
  blocked?: { type: string; value: string } | null;
}> {
  const cfg = DEFAULTS[scope];
  const now = Date.now();
  const ip = getIp(req);
  let adminId: string | null = null;
  let apiKey: string | null = null;
  if (scope === "auth") {
    const auth = await verifyAdminAccessFromCookie(req);
    if (auth?.isValid && auth.adminId) adminId = auth.adminId;
    apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (!apiAuth) apiKey = null;
    }
  } else {
    apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth?.adminId) {
        adminId = apiAuth.adminId;
      } else {
        apiKey = null;
      }
    }
  }
  const db = await getDb();
  const blocks = db.collection("blocks");
  const blockedDoc =
    (await blocks.findOne({
      $or: [
        { type: "ip", value: ip, blocked: true },
        ...(apiKey ? [{ type: "apiKey", value: apiKey, blocked: true }] : []),
        ...(adminId
          ? [{ type: "adminId", value: adminId, blocked: true }]
          : []),
      ],
    })) || null;
  if (blockedDoc) {
    if (
      blockedDoc.expiresAt &&
      new Date(blockedDoc.expiresAt).getTime() <= now
    ) {
      await blocks.deleteOne({ _id: blockedDoc._id });
    } else {
      const headers = {
        "X-RateLimit-Limit": String(cfg.max),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(now + cfg.windowMs),
      };
      return {
        allowed: false,
        headers,
        blocked: {
          type: String(blockedDoc.type),
          value: String(blockedDoc.value),
        },
      };
    }
  }
  const identity = adminId
    ? `admin:${adminId}`
    : apiKey
    ? `apiKey:${apiKey}`
    : `ip:${ip}`;
  const bucket = Math.floor(now / cfg.windowMs) * cfg.windowMs;
  const key = `${scope}:${identity}:${bucket}`;
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
  if (count <= cfg.max) {
    return { allowed: true, headers, blocked: null };
  }
  const THRESHOLDS = {
    ip: Number(process.env.RATE_LIMIT_BLOCK_THRESHOLD_IP) || 3,
    apiKey: Number(process.env.RATE_LIMIT_BLOCK_THRESHOLD_APIKEY) || 5,
    adminId: Number(process.env.RATE_LIMIT_BLOCK_THRESHOLD_ADMIN) || 10,
  };
  const BLOCK_TTL_MS = Number(process.env.RATE_LIMIT_BLOCK_TTL_MS) || 0;
  const violations = db.collection("rate_limit_violations");
  const items = [
    { type: "ip", value: ip },
    { type: "apiKey", value: apiKey },
    { type: "adminId", value: adminId },
  ];
  for (const it of items) {
    if (!it.value) continue;
    const vres = await violations.findOneAndUpdate(
      { key: `${it.type}:${it.value}` },
      {
        $setOnInsert: {
          key: `${it.type}:${it.value}`,
          type: it.type,
          value: it.value,
          createdAt: new Date(),
        },
        $inc: { count: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const vdoc = (vres && (vres.value as any)) || null;
    const vcount = vdoc && typeof vdoc.count === "number" ? vdoc.count : 1;
    const threshold =
      it.type === "ip"
        ? THRESHOLDS.ip
        : it.type === "apiKey"
        ? THRESHOLDS.apiKey
        : THRESHOLDS.adminId;
    if (vcount >= threshold) {
      const exists = await blocks.findOne({
        type: it.type,
        value: it.value,
        blocked: true,
      });
      if (!exists) {
        const expiresAt =
          BLOCK_TTL_MS > 0 ? new Date(Date.now() + BLOCK_TTL_MS) : null;
        await blocks.updateOne(
          { type: it.type, value: it.value },
          {
            $set: {
              type: it.type,
              value: it.value,
              blocked: true,
              reason: "rate_limit_exceeded",
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt,
              violations: vcount,
            },
          },
          { upsert: true }
        );
      }
    }
  }
  return { allowed: false, headers, blocked: null };
}
