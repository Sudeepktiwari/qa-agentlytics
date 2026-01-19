/**
 * Lightweight cURL command parser and helpers
 * Extracts method, URL, headers, content-type, and data payload from a cURL command.
 */

export interface ParsedCurl {
  method: string;
  url: string | null;
  headers: Record<string, string>;
  contentType: string;
  dataRaw?: string;
  dataJson?: Record<string, any> | null;
  dataForm?: Record<string, string> | null;
}

// Normalize smart quotes to straight quotes to improve parsing robustness
function normalizeQuotes(input: string): string {
  return input
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

/**
 * Parse a cURL registration command.
 * Supports common flags: -X, -H, -d/--data/--data-raw and --url forms.
 */
export function parseCurlRegistrationSpec(curlCommand: string): ParsedCurl {
  const cmd = normalizeQuotes(curlCommand)
    .replace(/\\[ \t]*\r?\n/g, " ")
    .replace(/\s{2,}/g, " ");

  const methodMatch = cmd.match(/-X\s+(GET|POST|PUT|PATCH|DELETE)/i);
  const method = (methodMatch?.[1] || "POST").toUpperCase();

  // Try to capture the URL from multiple forms
  let url: string | null = null;
  // --url with space and quotes/backticks
  const urlFlagQuoted = cmd.match(/--url\s+['"`](https?:\/\/[^'"`\s]+)['"`]/i);
  // --url with equals and optional quotes/backticks
  const urlFlagEqualsQuoted = cmd.match(/--url=([\'"`]?)(https?:\/\/[^'"`]+)\1/i);
  // --url with space, unquoted
  const urlFlagUnquoted = cmd.match(/--url\s+(https?:\/\/\S+)/i);
  // Positional URL after curl, quoted or unquoted (also supporting backticks)
  const urlQuoted = cmd.match(/curl\s+['"`](https?:\/\/[^'"`\s]+)['"`]/i);
  const urlUnquoted = cmd.match(/curl\s+(https?:\/\/\S+)/i);
  url =
    urlFlagQuoted?.[1] ||
    urlFlagEqualsQuoted?.[2] ||
    urlFlagUnquoted?.[1] ||
    urlQuoted?.[1] ||
    urlUnquoted?.[1] ||
    null;

  // Fallback: robust tokenization to find first non-flag URL argument
  if (!url) {
    const tokens: string[] = [];
    let current = "";
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    for (let i = 0; i < cmd.length; i++) {
      const ch = cmd[i];
      if (ch === "'" && !inDouble && !inBacktick) {
        inSingle = !inSingle;
        continue;
      }
      if (ch === '"' && !inSingle && !inBacktick) {
        inDouble = !inDouble;
        continue;
      }
      if (ch === "`" && !inSingle && !inDouble) {
        inBacktick = !inBacktick;
        continue;
      }
      const isSpace = /\s/.test(ch);
      if (!inSingle && !inDouble && !inBacktick && isSpace) {
        if (current.length > 0) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += ch;
      }
    }
    if (current.length > 0) tokens.push(current);

    // Find first token after 'curl' that is not a flag and looks like a URL
    const curlIdx = tokens.findIndex((t) => t.toLowerCase() === "curl");
    const searchStart = curlIdx >= 0 ? curlIdx + 1 : 0;
    for (let i = searchStart; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.startsWith("-")) continue;
      if (/^https?:\/\//i.test(t)) {
        url = t;
        break;
      }
    }
  }

  // Collect headers (support quotes and backticks). Also try a simple no-quote form.
  const headers: Record<string, string> = {};
  const headerRegexQuoted = /-H\s+['"`]([^'"`\n]+)['"`]/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headerRegexQuoted.exec(cmd)) !== null) {
    const raw = hMatch[1];
    const idx = raw.indexOf(":");
    if (idx > -1) {
      const keyRaw = raw.slice(0, idx).trim();
      const valueRaw = raw.slice(idx + 1).trim();
      const key = keyRaw.replace(/^[\'"`]/, "").replace(/[\'"`]$/, "");
      const value = valueRaw.replace(/^[\'"`]/, "").replace(/[\'"`]$/, "");
      headers[key] = value;
    }
  }
  // No-quote header form e.g. -H Content-Type: application/json
  const headerRegexPlain = /-H\s+(?!['"`])([A-Za-z0-9-]+:\s*[^\n]+)/gi;
  let hPlain: RegExpExecArray | null;
  while ((hPlain = headerRegexPlain.exec(cmd)) !== null) {
    const raw = hPlain[1];
    const idx = raw.indexOf(":");
    if (idx > -1) {
      const keyRaw = raw.slice(0, idx).trim();
      const valueRaw = raw.slice(idx + 1).trim();
      const key = keyRaw.replace(/^[\'"`]/, "").replace(/[\'"`]$/, "");
      const value = valueRaw.replace(/^[\'"`]/, "").replace(/[\'"`]$/, "");
      headers[key] = value;
    }
  }

  // Data flags: -d, --data, --data-raw (support quotes/backticks)
  const dataRegexes = [
    /-d\s+({[\s\S]*?})/i,
    /--data\s+({[\s\S]*?})/i,
    /--data-raw\s+({[\s\S]*?})/i,
    /-d\s+\$?(['"`])([\s\S]*?)\1/i,
    /--data\s+\$?(['"`])([\s\S]*?)\1/i,
    /--data-raw\s+\$?(['"`])([\s\S]*?)\1/i,
    /--data=(['"`]?)([\s\S]*?)\1/i,
    /--data-raw=(['"`]?)([\s\S]*?)\1/i,
  ];
  let dataRaw: string | undefined;
  for (const rx of dataRegexes) {
    const m = cmd.match(rx);
    if (m && (m[1] || m[2])) {
      dataRaw = (m[2] ?? m[1]) as string;
      break;
    }
  }

  // Fallback: if no explicit -d/--data found, try to extract a JSON object literal
  if (!dataRaw) {
    // Try to find a JSON object after -d/--data flags by scanning braces
    const findJsonAfterDataFlag = (s: string): string | undefined => {
      const flagIdx = (() => {
        const m1 = s.match(/-d\b/iu);
        if (m1) return s.indexOf(m1[0], 0);
        const m2 = s.match(/--data(?:-raw)?\b/iu);
        if (m2) return s.indexOf(m2[0], 0);
        return -1;
      })();
      const startSearch = flagIdx >= 0 ? flagIdx : 0;
      const braceStart = s.indexOf("{", startSearch);
      if (braceStart === -1) return undefined;
      let depth = 0;
      let inSingle = false;
      let inDouble = false;
      let inBacktick = false;
      for (let i = braceStart; i < s.length; i++) {
        const ch = s[i];
        if (ch === "'" && !inDouble && !inBacktick) { inSingle = !inSingle; }
        else if (ch === '"' && !inSingle && !inBacktick) { inDouble = !inDouble; }
        else if (ch === "`" && !inSingle && !inDouble) { inBacktick = !inBacktick; }
        if (inSingle || inDouble || inBacktick) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            return s.slice(braceStart, i + 1);
          }
        }
      }
      return undefined;
    };
    const jsonCandidate = findJsonAfterDataFlag(cmd);
    if (!jsonCandidate) {
      const match = cmd.match(/\{[\s\S]*\}/m);
      if (match) dataRaw = match[0];
    } else {
      dataRaw = jsonCandidate;
    }
  }

  // Determine content type
  let contentType = headers["Content-Type"] || headers["content-type"] || "";
  if (!contentType) {
    if (dataRaw && dataRaw.trim().startsWith("{")) {
      contentType = "application/json";
    } else if (dataRaw && /(?:^|&)\w+=/.test(dataRaw)) {
      contentType = "application/x-www-form-urlencoded";
    } else {
      contentType = "application/json"; // sensible default for registrations
    }
  }

  // Try to parse JSON or form
  let dataJson: Record<string, any> | null = null;
  let dataForm: Record<string, string> | null = null;
  if (dataRaw) {
    if (contentType.includes("json")) {
      try {
        dataJson = JSON.parse(dataRaw);
      } catch {
        dataJson = null;
      }
    } else if (contentType.includes("x-www-form-urlencoded")) {
      try {
        const params = new URLSearchParams(dataRaw);
        const obj: Record<string, string> = {};
        params.forEach((v, k) => {
          obj[k] = v;
        });
        dataForm = obj;
      } catch {
        dataForm = null;
      }
    }
  }

  return {
    method,
    url,
    headers,
    contentType,
    dataRaw,
    dataJson,
    dataForm,
  };
}

// Derive onboarding fields from cURL data keys
export interface DerivedField {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "email" | "phone" | "select" | "checkbox";
}

function flattenJsonLeaves(obj: any, prefix = ""): { key: string; value: any }[] {
  const out: { key: string; value: any }[] = [];
  if (obj === null || obj === undefined) return out;
  const isPrimitive = (v: any) => typeof v !== "object" || v === null;
  if (isPrimitive(obj)) {
    out.push({ key: prefix || "value", value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    // If array of primitives, treat as select options for this key
    const primitives = obj.filter((v) => isPrimitive(v));
    if (primitives.length === obj.length && prefix) {
      out.push({ key: prefix, value: obj });
      return out;
    }
    // Otherwise flatten each item without indices for field derivation
    for (const item of obj) {
      out.push(...flattenJsonLeaves(item, prefix));
    }
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (isPrimitive(v)) {
      out.push({ key: next, value: v });
    } else {
      out.push(...flattenJsonLeaves(v, next));
    }
  }
  return out;
}

function toLabel(key: string): string {
  return key
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferType(key: string, value: any): DerivedField["type"] {
  const kl = key.toLowerCase();
  if (kl.includes("email")) return "email";
  if (kl.includes("phone")) return "phone";
  if (typeof value === "boolean") return "checkbox";
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) return "select";
  return "text";
}

export function deriveOnboardingFieldsFromCurl(curlCommand: string): DerivedField[] {
  const parsed = parseCurlRegistrationSpec(curlCommand);
  let leaves: { key: string; value: any }[] = [];
  if (parsed.dataJson) {
    leaves = flattenJsonLeaves(parsed.dataJson);
  } else if (parsed.dataForm) {
    leaves = Object.keys(parsed.dataForm).map((k) => ({ key: k, value: parsed.dataForm![k] }));
  } else if (parsed.dataRaw) {
    const keys = extractBodyKeysFromCurl(curlCommand);
    leaves = keys.map((k) => ({ key: k, value: undefined }));
  }
  const seen = new Set<string>();
  const fields: DerivedField[] = [];
  for (const { key, value } of leaves) {
    const simpleKey = key.replace(/\[(\d+)\]/g, "");
    if (seen.has(simpleKey)) continue;
    seen.add(simpleKey);
    fields.push({
      key: simpleKey,
      label: toLabel(simpleKey),
      required: true,
      type: inferType(simpleKey, value),
    });
  }
  return fields;
}

export function extractBodyKeysFromCurl(curlCommand: string): string[] {
  const parsed = parseCurlRegistrationSpec(curlCommand);
  if (parsed.dataJson) {
    return Array.from(new Set(flattenJsonLeaves(parsed.dataJson).map(({ key }) => key.replace(/\[(\d+)\]/g, ""))));
  }
  if (parsed.dataForm) {
    return Object.keys(parsed.dataForm);
  }
  if (parsed.dataRaw) {
    const s = String(parsed.dataRaw);
    const keys = new Set<string>();
    const jsonKeyRx = /["']?([A-Za-z0-9_][A-Za-z0-9_\.\-]*)["']?\s*:/g;
    let jm: RegExpExecArray | null;
    while ((jm = jsonKeyRx.exec(s)) !== null) {
      keys.add(jm[1]);
    }
    const formKeyRx = /(?:^|&)\s*([^=&\s]+)=/g;
    let fm: RegExpExecArray | null;
    while ((fm = formKeyRx.exec(s)) !== null) {
      keys.add(fm[1]);
    }
    return Array.from(keys);
  }
  // Final fallback: scan entire cURL for JSON-like keys or form keys
  const scan = curlCommand;
  const keys2 = new Set<string>();
  const jsonKeyRx2 = /["']?([A-Za-z0-9_][A-Za-z0-9_\.\-]*)["']?\s*:/g;
  let jm2: RegExpExecArray | null;
  while ((jm2 = jsonKeyRx2.exec(scan)) !== null) {
    keys2.add(jm2[1]);
  }
  const formKeyRx2 = /(?:^|&)\s*([^=&\s]+)=/g;
  let fm2: RegExpExecArray | null;
  while ((fm2 = formKeyRx2.exec(scan)) !== null) {
    keys2.add(fm2[1]);
  }
  return Array.from(keys2);
}

// Build final request body from parsed cURL and collected user payload
export function buildBodyFromCurl(
  parsed: ParsedCurl,
  userPayload: Record<string, any>
): { body: string; keysUsed: string[] } {
  // Prefer keys from original cURL data, substituting values from userPayload
  if (parsed.contentType.includes("json")) {
    const base = parsed.dataJson && typeof parsed.dataJson === "object" ? { ...parsed.dataJson } : {};
    const keysUsed: string[] = [];
    const ignore = new Set(["__authToken", "__apiKey", "__userEmail", "__sessionId"]);

    const setByPath = (obj: any, path: string, value: any) => {
      const parts = String(path).split(".");
      let cur = obj;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        if (!isLast) {
          if (cur[part] === undefined || typeof cur[part] !== "object") {
            cur[part] = {};
          }
          cur = cur[part];
        } else {
          cur[part] = value;
        }
      }
    };

    for (const key of Object.keys(base)) {
      if (userPayload[key] !== undefined) {
        base[key] = userPayload[key];
        keysUsed.push(key);
      }
    }

    for (const [k, v] of Object.entries(userPayload)) {
      if (ignore.has(k)) continue;
      if (k in base) continue;
      if (k.includes(".")) {
        setByPath(base, k, v);
        keysUsed.push(k);
      } else {
        base[k] = v;
        keysUsed.push(k);
      }
    }

    return { body: JSON.stringify(base), keysUsed: Array.from(new Set(keysUsed)) };
  }

  // Form-encoded
  const baseForm = parsed.dataForm && typeof parsed.dataForm === "object" ? { ...parsed.dataForm } : {};
  const keysUsed: string[] = [];
  for (const key of Object.keys(baseForm)) {
    if (userPayload[key] !== undefined) {
      baseForm[key] = String(userPayload[key]);
    }
    keysUsed.push(key);
  }
  for (const [k, v] of Object.entries(userPayload)) {
    if (!(k in baseForm)) {
      baseForm[k] = typeof v === "string" ? v : JSON.stringify(v);
      keysUsed.push(k);
    }
  }
  const params = new URLSearchParams(baseForm as Record<string, string>);
  return { body: params.toString(), keysUsed: Array.from(new Set(keysUsed)) };
}

export function redactHeadersForLog(headers: Record<string, string>): Record<string, string> {
  const sensitive = ["authorization", "x-api-key", "api-key", "apikey", "token", "secret"];
  const redacted: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const kl = k.toLowerCase();
    const isSensitive = sensitive.some((s) => kl.includes(s));
    redacted[k] = isSensitive ? "***" : v;
  }
  return redacted;
}
