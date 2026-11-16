import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings, bookingTimeline, stripeEvents } from "@/db/schema";
import { findBooking, type BookingRow } from "./bookings";
import { ApiError, cleanText } from "./security";
import { paymentsConfigured, serverEnv } from "./runtime";

type StripeSession = { id: string; url?: string | null; status?: string; payment_status?: string; amount_total?: number; currency?: string; expires_at?: number; payment_intent?: string | null; metadata?: Record<string, string>; livemode?: boolean };

async function stripeRequest(path: string, method = "GET", parameters?: URLSearchParams, idempotencyKey?: string) {
  const secret = serverEnv().STRIPE_SECRET_KEY || "";
  if (!/^sk_(live|test)_/.test(secret)) throw new ApiError(503, "payments_unavailable", "Card deposits are not connected. Your booking request remains stored for an itemised proposal.");
  const headers: Record<string, string> = { Authorization: "Bearer " + secret, "Stripe-Version": "2026-10-28.endive" };
  if (parameters) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch("https://api.stripe.com/v1/" + path, { method, headers, body: parameters });
  const data = await response.json() as StripeSession & { error?: { message?: string } };
  if (!response.ok) throw new ApiError(502, "payment_provider_error", "The payment provider could not prepare this deposit. Please try again or contact the production team.");
  return data;
}

export async function createDepositCheckout(request: Request, row: BookingRow, input: Record<string, unknown>) {
  if (!paymentsConfigured()) throw new ApiError(503, "payments_unavailable", "Card deposits are not connected. Your approved proposal can be handled by the production team.");
  if (row.status !== "approved" || !row.approvedTotalCents || !row.depositAmountCents || !row.confirmedDate || row.paidAmountCents > 0) {
    throw new ApiError(409, "approval_required", "A deposit is available only after the final date, scope and total have been approved.");
  }
  if (input.acceptApprovedScope !== true || input.acceptedQuoteVersion !== row.quoteVersion) {
    throw new ApiError(409, "scope_acceptance_required", "Review and accept the current itemised production scope before paying.");
  }
  let previousSession = row.stripeSessionId;
  if (previousSession) {
    const existing = await stripeRequest("checkout/sessions/" + encodeURIComponent(previousSession));
    if (existing.status === "complete" || existing.payment_status === "paid") throw new ApiError(409, "payment_verifying", "A payment has already been submitted. Its confirmation is being verified.");
    if (existing.status === "open" && existing.url && (existing.expires_at || 0) * 1000 > Date.now()) {
      return { checkoutUrl: existing.url, sessionId: existing.id, depositAmountCents: row.depositAmountCents, currency: row.currency, paymentMode: existing.livemode ? "live" : "test" };
    }
  }
  const origin = new URL(request.url).origin;
  const fields = new URLSearchParams({
    mode: "payment",
    customer_email: row.email,
    client_reference_id: row.id,
    success_url: origin + "/booking/" + row.id + "?checkout=returned",
    cancel_url: origin + "/booking/" + row.id + "?checkout=cancelled",
    "line_items[0][price_data][currency]": row.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(row.depositAmountCents),
    "line_items[0][price_data][product_data][name]": "AICANFEEL — approved campaign deposit",
    "line_items[0][price_data][product_data][description]": "50% deposit for approved quote " + row.quoteVersion + ". Campaign date: " + row.confirmedDate + ".",
    "line_items[0][quantity]": "1",
    "metadata[booking_id]": row.id,
    "metadata[quote_version]": String(row.quoteVersion),
    "payment_intent_data[metadata][booking_id]": row.id,
    "payment_intent_data[metadata][quote_version]": String(row.quoteVersion),
    billing_address_collection: "required",
  });
  const session = await stripeRequest("checkout/sessions", "POST", fields, "aicanfeel-deposit-" + row.id + "-" + row.quoteVersion + "-" + (previousSession || "first"));
  if (!session.id || !session.url || new URL(session.url).hostname !== "checkout.stripe.com") throw new ApiError(502, "invalid_checkout", "A secure payment page could not be prepared.");
  const saved = await getDb().update(bookings).set({ stripeSessionId: session.id, stripeCheckoutUrl: session.url, stripeExpiresAt: (session.expires_at || 0) * 1000, paymentStatus: "awaiting_deposit", updatedAt: Date.now() }).where(and(eq(bookings.id, row.id), eq(bookings.quoteVersion, row.quoteVersion), eq(bookings.status, "approved"))).returning({ id: bookings.id });
  if (!saved.length) {
    await stripeRequest("checkout/sessions/" + encodeURIComponent(session.id) + "/expire", "POST", new URLSearchParams());
    throw new ApiError(409, "quote_changed", "The approved quote changed while checkout was being prepared. Please review the current scope.");
  }
  return { checkoutUrl: session.url, sessionId: session.id, depositAmountCents: row.depositAmountCents, currency: row.currency, paymentMode: session.livemode ? "live" : "test" };
}

export async function revokeDepositCheckout(row: BookingRow) {
  if (row.paidAmountCents > 0) throw new ApiError(409, "payment_already_received", "A received payment requires the provider refund process; a session cannot be revoked instead.");
  if (row.stripeSessionId) {
    const session = await stripeRequest("checkout/sessions/" + encodeURIComponent(row.stripeSessionId));
    if (session.status === "complete" || session.payment_status === "paid") throw new ApiError(409, "payment_verifying", "The payment was completed. Wait for verified payment status before any change.");
    if (session.status === "open") await stripeRequest("checkout/sessions/" + encodeURIComponent(row.stripeSessionId) + "/expire", "POST", new URLSearchParams());
  }
  await getDb().update(bookings).set({ stripeSessionId: null, stripeCheckoutUrl: null, stripeExpiresAt: null, paymentStatus: row.status === "approved" ? "awaiting_deposit" : "not_requested", updatedAt: Date.now() }).where(eq(bookings.id, row.id));
  return { revoked: true };
}

export async function processStripeEvent(event: Record<string, unknown>) {
  const id = cleanText(event.id, "Event ID", 100, 5);
  const type = cleanText(event.type, "Event type", 100, 3);
  if (!/^evt_[A-Za-z0-9_]+$/.test(id)) throw new ApiError(400, "invalid_event", "Invalid payment event.");
  const supported = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired"];
  if (!supported.includes(type)) return { received: true, ignored: true };
  const data = event.data as { object?: StripeSession } | undefined;
  const session = data?.object;
  if (!session?.id || !session.metadata?.booking_id) return { received: true, ignored: true };
  const expectsLive = (serverEnv().STRIPE_SECRET_KEY || "").startsWith("sk_live_");
  if (event.livemode !== expectsLive) throw new ApiError(400, "payment_mode_mismatch", "Payment mode mismatch.");
  const db = getDb();
  const prior = await db.select().from(stripeEvents).where(eq(stripeEvents.id, id)).limit(1);
  if (prior.length) return { received: true, duplicate: true };
  const row = await findBooking(session.metadata.booking_id);
  if (!row || row.stripeSessionId !== session.id || Number(session.metadata.quote_version) !== row.quoteVersion) {
    throw new ApiError(409, "payment_quote_mismatch", "This payment event does not match the current approved quote.");
  }
  const now = Date.now();
  if (type === "checkout.session.expired") {
    await db.batch([
      db.insert(stripeEvents).values({ id, type, bookingId: row.id, createdAt: now }).onConflictDoNothing(),
      db.update(bookings).set({ stripeCheckoutUrl: null, stripeExpiresAt: now, updatedAt: now }).where(eq(bookings.id, row.id)),
    ]);
    return { received: true };
  }
  if (session.payment_status !== "paid") return { received: true, pending: true };
  if (session.amount_total !== row.depositAmountCents || session.currency?.toUpperCase() !== row.currency) {
    throw new ApiError(409, "payment_amount_mismatch", "The payment amount does not match the approved deposit.");
  }
  if (!expectsLive) {
    await db.batch([
      db.insert(stripeEvents).values({ id, type, bookingId: row.id, createdAt: now }).onConflictDoNothing(),
      db.update(bookings).set({ paymentStatus: "test_paid", paymentSource: "stripe_test", stripeSessionId: null, stripeCheckoutUrl: null, stripeExpiresAt: null, updatedAt: now }).where(eq(bookings.id, row.id)),
      db.insert(bookingTimeline).values({ id: "stripe-" + id, bookingId: row.id, status: "payment_tested", note: "A test-mode checkout was verified. No real money was collected and production is not confirmed by this test.", public: true, createdAt: now }).onConflictDoNothing(),
    ]);
    return { received: true, testMode: true };
  }
  const cancelled = row.status === "cancelled";
  await db.batch([
    db.insert(stripeEvents).values({ id, type, bookingId: row.id, createdAt: now }).onConflictDoNothing(),
    db.update(bookings).set({
      status: cancelled ? "cancelled" : row.status === "scheduled" || row.status === "completed" ? row.status : "deposit_paid",
      paymentStatus: cancelled ? "paid_review_required" : "paid",
      paymentSource: "stripe", paymentReference: session.id, paidAt: now,
      paidAmountCents: session.amount_total,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripeCheckoutUrl: null, updatedAt: now,
    }).where(eq(bookings.id, row.id)),
    db.insert(bookingTimeline).values({ id: "stripe-" + id, bookingId: row.id, status: "deposit_paid", note: cancelled ? "A deposit was received after cancellation. The production team must review it; this does not reinstate the booking." : "Your deposit has been verified by the payment provider. The production team will confirm the next production steps.", public: true, createdAt: now }).onConflictDoNothing(),
  ]);
  return { received: true };
}

