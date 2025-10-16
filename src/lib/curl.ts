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

/**
 * Parse a cURL registration command.
 * Supports common flags: -X, -H, -d/--data/--data-raw.
 */
export function parseCurlRegistrationSpec(curlCommand: string): ParsedCurl {
  const methodMatch = curlCommand.match(/-X\s+(GET|POST|PUT|PATCH|DELETE)/i);
  const method = (methodMatch?.[1] || "POST").toUpperCase();

  // Try to capture the URL (quoted or unquoted) after 'curl'
  let url: string | null = null;
  const urlQuoted = curlCommand.match(/curl\s+['"](https?:\/\/[^'"\s]+)['"]/i);
  const urlUnquoted = curlCommand.match(/curl\s+(https?:\/\/\S+)/i);
  url = urlQuoted?.[1] || urlUnquoted?.[1] || null;

  // Collect headers
  const headers: Record<string, string> = {};
  const headerRegex = /-H\s+['"]([^'"\n]+)['"]/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headerRegex.exec(curlCommand)) !== null) {
    const raw = hMatch[1];
    const idx = raw.indexOf(":");
    if (idx > -1) {
      const key = raw.slice(0, idx).trim();
      const value = raw.slice(idx + 1).trim();
      headers[key] = value;
    }
  }

  // Data flags: -d, --data, --data-raw
  const dataRegexes = [
    /-d\s+['"]([\s\S]*?)['"]/i,
    /--data\s+['"]([\s\S]*?)['"]/i,
    /--data-raw\s+['"]([\s\S]*?)['"]/i,
  ];
  let dataRaw: string | undefined;
  for (const rx of dataRegexes) {
    const m = curlCommand.match(rx);
    if (m && m[1]) {
      dataRaw = m[1];
      break;
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

export function deriveOnboardingFieldsFromCurl(curlCommand: string): DerivedField[] {
  const parsed = parseCurlRegistrationSpec(curlCommand);
  const keys: string[] = parsed.dataJson
    ? Object.keys(parsed.dataJson)
    : parsed.dataForm
    ? Object.keys(parsed.dataForm)
    : [];

  const toLabel = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const toType = (k: string): DerivedField["type"] => {
    const kl = k.toLowerCase();
    if (kl.includes("email")) return "email";
    if (kl.includes("phone")) return "phone";
    return "text";
  };

  const fields: DerivedField[] = [];
  for (const key of keys) {
    fields.push({ key, label: toLabel(key), required: true, type: toType(key) });
  }

  // If no keys found, provide a minimal sensible set
  if (fields.length === 0) {
    fields.push({ key: "email", label: "Email", required: true, type: "email" });
    fields.push({ key: "name", label: "Name", required: true, type: "text" });
    fields.push({ key: "password", label: "Password", required: true, type: "text" });
  }

  return fields;
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
    for (const key of Object.keys(base)) {
      if (userPayload[key] !== undefined) {
        base[key] = userPayload[key];
      }
      keysUsed.push(key);
    }
    // Also include extra provided fields that weren't in the base if any
    for (const [k, v] of Object.entries(userPayload)) {
      if (!(k in base)) {
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