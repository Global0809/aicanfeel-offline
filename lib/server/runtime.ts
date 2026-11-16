import { env } from "cloudflare:workers";
import { ApiError, bearerToken, constantTimeEqual, sha256 } from "./security";

export type ServerEnv = Cloudflare.Env & {
  ADMIN_TOKEN?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
};

export function serverEnv(): ServerEnv { return env as ServerEnv; }
export function adminConfigured(): boolean { return (serverEnv().ADMIN_TOKEN || "").length >= 32; }
export function paymentsConfigured(): boolean {
  const values = serverEnv();
  return /^sk_(live|test)_/.test(values.STRIPE_SECRET_KEY || "") && /^whsec_/.test(values.STRIPE_WEBHOOK_SECRET || "");
}
export function paymentMode(): "live" | "test" | "not_connected" {
  if (!paymentsConfigured()) return "not_connected";
  return (serverEnv().STRIPE_SECRET_KEY || "").startsWith("sk_live_") ? "live" : "test";
}
export function livePaymentsReady(): boolean { return paymentMode() === "live"; }
export async function requireAdmin(request: Request): Promise<void> {
  const expected = serverEnv().ADMIN_TOKEN || "";
  const supplied = bearerToken(request);
  if (expected.length < 32 || !supplied || !constantTimeEqual(await sha256(supplied), await sha256(expected))) {
    throw new ApiError(401, "unauthorised", "Owner authorisation is required.");
  }
}
export function apiJson(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", ...headers },
  });
}
export function apiFailure(error: unknown): Response {
  if (error instanceof ApiError) {
    return apiJson({ error: error.message, code: error.code }, error.status, error.status === 429 ? { "Retry-After": "3600" } : {});
  }
  console.error("AICANFEEL API failure", error instanceof Error ? error.name : "UnknownError");
  return apiJson({ error: "We could not complete this request. Please try again shortly.", code: "service_unavailable" }, 503);
}

