import { NextRequest } from "next/server";
import { z } from "zod";

export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function clampNumber(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function computeDepth(
  value: unknown,
  visited = new Set<object>()
): number {
  if (value === null || typeof value !== "object") return 0;
  const obj = value as Record<string, unknown>;
  if (visited.has(obj)) return 0;
  visited.add(obj);
  let depth = 1;
  for (const key of Object.keys(obj)) {
    depth = Math.max(depth, 1 + computeDepth(obj[key], visited));
  }
  return depth;
}

export function assertBodyConstraints(
  body: unknown,
  opts?: { maxBytes?: number; maxDepth?: number }
) {
  const maxBytes = opts?.maxBytes ?? 128 * 1024;
  const maxDepth = opts?.maxDepth ?? 8;
  const json = JSON.stringify(body);
  const size = Buffer.byteLength(json, "utf8");
  if (size > maxBytes) {
    throw new Error("Payload too large");
  }
  const depth = computeDepth(body);
  if (depth > maxDepth) {
    throw new Error("Payload too deep");
  }
}

export const UpdateLeadSchema = z
  .object({
    leadId: z.string().min(1).max(64),
    status: z.string().min(1).max(32).optional(),
    notes: z.string().min(0).max(2000).optional(),
    value: z.number().nonnegative().max(1_000_000_000).optional(),
    tags: z.array(z.string().min(1).max(32)).max(20).optional(),
  })
  .strict();

export const ChatBodySchema = z
  .object({
    question: z.string().min(0).max(2000).optional(),
    sessionId: z.string().min(1).max(128).optional(),
    pageUrl: z.string().url().max(2048).optional(),
    adminId: z.string().min(1).max(128).optional(),
    followup: z.union([z.boolean(), z.number().int().min(0).max(5)]).optional(),
    proactive: z.boolean().optional(),
  })
  .passthrough();

export function sanitizeSearchTerm(search?: string, maxLen = 128) {
  if (!search) return null;
  const s = String(search).slice(0, maxLen);
  return new RegExp(escapeRegex(s), "i");
}
