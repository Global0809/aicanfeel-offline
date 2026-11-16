const encoder = new TextEncoder();

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function sha256(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function constantTimeEqual(a: string, b: string): boolean {
  let difference = a.length ^ b.length;
  const maximum = Math.max(a.length, b.length);
  for (let index = 0; index < maximum; index += 1) {
    difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9._~-]{20,4096})$/.exec(header);
  return match?.[1] || "";
}

export function assertSameOrigin(request: Request, allowMissing = false): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (allowMissing && request.headers.get("sec-fetch-site") !== "cross-site") return;
    throw new ApiError(403, "origin_required", "Open this form on the AICANFEEL website and try again.");
  }
  if (origin === "null" || origin !== new URL(request.url).origin) {
    throw new ApiError(403, "origin_mismatch", "This request must come from the AICANFEEL website.");
  }
}

export async function readTextLimited(request: Request, limit = 24000): Promise<string> {
  if (Number(request.headers.get("content-length") || "0") > limit) {
    throw new ApiError(413, "body_too_large", "The request is too large.");
  }
  if (!request.body) return "";
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new ApiError(413, "body_too_large", "The request is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

export async function readJson(request: Request, limit = 24000): Promise<Record<string, unknown>> {
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    throw new ApiError(415, "json_required", "Send this request as JSON.");
  }
  let value: unknown;
  try { value = JSON.parse(await readTextLimited(request, limit)); }
  catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "invalid_json", "The request could not be read. Please try again.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "invalid_body", "The request could not be read.");
  }
  return value as Record<string, unknown>;
}

export function cleanText(value: unknown, name: string, maximum: number, minimum = 0): string {
  if (typeof value !== "string") {
    if (minimum === 0 && (value === undefined || value === null)) return "";
    throw new ApiError(400, "invalid_field", name + " is required.");
  }
  const cleaned = value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (cleaned.length < minimum || cleaned.length > maximum) {
    throw new ApiError(400, "invalid_field", name + " must be between " + minimum + " and " + maximum + " characters.");
  }
  return cleaned;
}

export function validDate(value: unknown, name: string): string {
  const text = cleanText(value, name, 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ApiError(400, "invalid_date", name + " must be a valid date.");
  }
  const parsed = new Date(text + "T12:00:00Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new ApiError(400, "invalid_date", name + " must be a valid date.");
  }
  return text;
}

export async function verifyStripeSignature(rawBody: string, header: string, secret: string, now = Date.now()): Promise<boolean> {
  const values = header.split(",").map((entry) => entry.trim().split("="));
  const timeText = values.find(([name]) => name === "t")?.[1] || "";
  const timestamp = Number(timeText);
  if (!/^\d+$/.test(timeText) || !Number.isFinite(timestamp) || Math.abs(now / 1000 - timestamp) > 300) return false;
  const signatures = values.filter(([name]) => name === "v1").map(([, value]) => value);
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(timeText + "." + rawBody)));
  const expected = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => /^[a-f0-9]{64}$/i.test(signature || "") && constantTimeEqual(expected, signature.toLowerCase()));
}

