import { apiFailure, apiJson, paymentsConfigured, serverEnv } from "@/lib/server/runtime";
import { ApiError, readTextLimited, verifyStripeSignature } from "@/lib/server/security";
import { processStripeEvent } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    if (!paymentsConfigured()) throw new ApiError(503, "payments_unavailable", "Payment processing is not connected.");
    const body = await readTextLimited(request, 256000);
    if (!await verifyStripeSignature(body, request.headers.get("stripe-signature") || "", serverEnv().STRIPE_WEBHOOK_SECRET || "")) {
      throw new ApiError(400, "invalid_signature", "Invalid payment signature.");
    }
    let event: unknown;
    try { event = JSON.parse(body); } catch { throw new ApiError(400, "invalid_event", "Invalid payment event."); }
    if (!event || typeof event !== "object" || Array.isArray(event)) throw new ApiError(400, "invalid_event", "Invalid payment event.");
    return apiJson(await processStripeEvent(event as Record<string, unknown>));
  } catch (error) { return apiFailure(error); }
}

