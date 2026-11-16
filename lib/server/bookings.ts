import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings, bookingTimeline, requestLimits, campaignLinks } from "@/db/schema";
import { campaignById } from "@/lib/campaigns";
import { estimateCents, validateBookingInput } from "./validation";
import { ApiError, bearerToken, cleanText, constantTimeEqual, sha256, validDate } from "./security";
import { livePaymentsReady, paymentMode } from "./runtime";

export type BookingRow = typeof bookings.$inferSelect;
export const statusLabels: Record<string, string> = {
  requested: "Brief received", reviewing: "Production review", approved: "Scope approved",
  deposit_paid: "Deposit received", payment_tested: "Test checkout verified", scheduled: "Production scheduled", completed: "Campaign completed", cancelled: "Cancelled",
  deliverables_shared: "Deliverables shared", deliverables_updated: "Delivery links updated",
  receipt_refreshed: "Private link refreshed", quote_updated: "Quote updated", booking_updated: "Production update", internal_note_updated: "Production note updated",
};


async function enforceLimit(id: string, maximum: number, now: number): Promise<void> {
  const db = getDb();
  const expiresAt = (Math.floor(now / 3600000) + 2) * 3600000;
  const bucket = Math.floor(now / 3600000);
  const key = await sha256(id + ":" + bucket);
  const results = await db.insert(requestLimits).values({ id: key, count: 1, expiresAt })
    .onConflictDoUpdate({ target: requestLimits.id, set: { count: sql`${requestLimits.count} + 1` } })
    .returning({ count: requestLimits.count });
  if ((results[0]?.count || 0) > maximum) throw new ApiError(429, "rate_limited", "You have sent several requests. Please wait before trying again.");
}

export async function findBooking(id: string): Promise<BookingRow | null> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  const rows = await getDb().select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return rows[0] || null;
}

export async function requireBooking(request: Request, id: string): Promise<BookingRow> {
  const token = bearerToken(request);
  const row = await findBooking(id);
  if (!row || !token || !constantTimeEqual(await sha256(token), row.accessTokenHash)) {
    throw new ApiError(404, "booking_not_found", "This booking link is unavailable. Please use the private link saved when you submitted your brief.");
  }
  return row;
}

export async function createBooking(request: Request, raw: Record<string, unknown>) {
  const input = validateBookingInput(raw);
  const { idempotencyKey, city: _city, ...payload } = input;
  const idempotencyHash = await sha256("booking-request:" + idempotencyKey);
  const payloadHash = await sha256(JSON.stringify(payload));
  // The browser generates a random UUIDv4 for each request. Deterministic derivation
  // lets a network retry recover its private receipt without storing a raw bearer token.
  const accessToken = await sha256("aicanfeel-private-receipt:" + idempotencyKey + ":" + input.email);
  const accessTokenHash = await sha256(accessToken);
  const db = getDb();
  const existing = await db.select().from(bookings).where(eq(bookings.idempotencyHash, idempotencyHash)).limit(1);
  if (existing[0]) {
    if (!constantTimeEqual(existing[0].payloadHash, payloadHash)) throw new ApiError(409, "request_conflict", "This request key has already been used for a different brief. Refresh and submit again.");
    if (!constantTimeEqual(existing[0].accessTokenHash, accessTokenHash)) throw new ApiError(409, "receipt_rotated", "The private receipt link has been refreshed by the production team. Please use the new link they supplied.");
    return { row: existing[0], accessToken, replay: true };
  }
  const now = Date.now();
  const address = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "shared-local-preview";
  await enforceLimit("ip:" + address, 6, now);
  await enforceLimit("email:" + input.email, 4, now);
  await db.delete(requestLimits).where(lt(requestLimits.expiresAt, now));
  const id = crypto.randomUUID();
  const row: typeof bookings.$inferInsert = {
    id, accessTokenHash, idempotencyHash, payloadHash, campaignSlug: input.campaignSlug, market: input.market, currency: input.currency,
    brandName: input.brandName, contactName: input.contactName, email: input.email, phone: input.phone, website: input.website,
    desiredDate: input.desiredDate, message: input.message, addonsJson: JSON.stringify(input.addons), status: "requested",
    estimatedTotalCents: estimateCents(input.campaignSlug, input.market, input.addons), consentAt: now, createdAt: now, updatedAt: now,
  };
  try {
    await db.batch([
      db.insert(bookings).values(row),
      db.insert(bookingTimeline).values({ id: crypto.randomUUID(), bookingId: id, status: "requested", note: "Your brief is stored. Dates, location, total cost and production scope still need confirmation.", public: true, createdAt: now }),
    ]);
  } catch (error) {
    const raced = await db.select().from(bookings).where(eq(bookings.idempotencyHash, idempotencyHash)).limit(1);
    if (raced[0] && constantTimeEqual(raced[0].payloadHash, payloadHash)) return { row: raced[0], accessToken, replay: true };
    throw error;
  }
  const saved = await findBooking(id);
  if (!saved) throw new Error("Booking did not persist");
  return { row: saved, accessToken, replay: false };
}

export function clientBooking(row: BookingRow) {
  const campaign = campaignById(row.campaignSlug);
  return {
    bookingId: row.id, campaignSlug: row.campaignSlug, campaignName: campaign?.name || row.campaignSlug,
    market: row.market, city: row.market === "UK" ? "London" : "New York", currency: row.currency,
    brandName: row.brandName, contactName: row.contactName, email: row.email, phone: row.phone, website: row.website,
    desiredDate: row.desiredDate, message: row.message, addons: JSON.parse(row.addonsJson) as string[],
    status: row.status, statusLabel: statusLabels[row.status] || row.status,
    estimatedTotalCents: row.estimatedTotalCents, approvedTotalCents: row.approvedTotalCents, depositAmountCents: row.depositAmountCents,
    approvedTotal: row.approvedTotalCents === null ? null : row.approvedTotalCents / 100,
    depositAmount: row.depositAmountCents === null ? null : row.depositAmountCents / 100,
    confirmedDate: row.confirmedDate, quoteSummary: row.quoteSummary, customerMessage: row.customerMessage,
    quoteVersion: row.quoteVersion, paymentStatus: row.paymentStatus, paidAmountCents: row.paidAmountCents,
    paymentSource: row.paymentSource, paymentVerifiedByProvider: row.paymentSource === "stripe" && row.paymentStatus === "paid",
    paymentReferenceLast4: row.paymentReference ? row.paymentReference.slice(-4) : null,
    paidAt: row.paidAt ? new Date(row.paidAt).toISOString() : null,
    deliverables: JSON.parse(row.deliverablesJson) as { kind: string; label: string; url: string; sharedAt: string }[],
    checkoutEligible: row.status === "approved" && row.approvedTotalCents !== null && row.depositAmountCents !== null && row.paidAmountCents === 0 && livePaymentsReady(),
    paymentsConfigured: livePaymentsReady(), paymentMode: paymentMode(),
    createdAt: new Date(row.createdAt).toISOString(), updatedAt: new Date(row.updatedAt).toISOString(),
    scopeNote: "A requested date is not confirmed. Only the itemised scope approved by both parties defines the final cost and delivery.",
  };
}

export async function publicTimeline(id: string) {
  const events = await getDb().select().from(bookingTimeline).where(and(eq(bookingTimeline.bookingId, id), eq(bookingTimeline.public, true))).orderBy(asc(bookingTimeline.createdAt));
  return events.map((event) => ({ status: event.status, label: statusLabels[event.status] || event.status, note: event.note, at: new Date(event.createdAt).toISOString() }));
}

export async function listBookings(cursor: number | null, status: string | null) {
  const clauses = [];
  if (cursor) clauses.push(lt(bookings.createdAt, cursor));
  if (status) {
    if (!statusLabels[status]) throw new ApiError(400, "invalid_status", "Unknown booking status.");
    clauses.push(eq(bookings.status, status));
  }
  const rows = await getDb().select().from(bookings).where(clauses.length ? and(...clauses) : undefined).orderBy(desc(bookings.createdAt)).limit(51);
  return {
    bookings: rows.slice(0, 50).map((row) => ({ ...clientBooking(row), internalNotes: row.internalNotes, paymentReference: row.paymentReference })),
    nextCursor: rows.length > 50 ? rows[49].createdAt : null,
  };
}

export async function updateBooking(id: string, raw: Record<string, unknown>) {
  const existing = await findBooking(id);
  if (!existing) throw new ApiError(404, "booking_not_found", "Booking not found.");
  const allowed = ["requested", "reviewing", "approved", "scheduled", "completed", "cancelled"];
  const status = raw.status === undefined ? existing.status : cleanText(raw.status, "Status", 30, 3);
  if (!allowed.includes(status) && status !== existing.status) throw new ApiError(400, "invalid_status", "Choose an available production status.");
  if (["deposit_paid", "scheduled", "completed"].includes(existing.status) && ["requested", "reviewing", "approved"].includes(status)) {
    throw new ApiError(409, "invalid_transition", "A paid or scheduled campaign cannot be moved back to an unpaid quote.");
  }
  if (status === "scheduled" && existing.paidAmountCents === 0) throw new ApiError(409, "deposit_required", "Confirm a real deposit before marking production scheduled.");
  if (status === "completed" && !["scheduled", "completed"].includes(existing.status)) throw new ApiError(409, "invalid_transition", "Schedule the production before marking it completed.");
  const internalNotes = raw.internalNotes === undefined ? existing.internalNotes : cleanText(raw.internalNotes, "Internal notes", 10000);
  const customerMessage = raw.customerMessage === undefined ? existing.customerMessage : cleanText(raw.customerMessage, "Customer message", 5000);
  const quoteSummary = raw.quoteSummary === undefined ? existing.quoteSummary : cleanText(raw.quoteSummary, "Quote summary", 10000);
  const requestedAmount = raw.approvedTotalCents === undefined ? existing.approvedTotalCents : raw.approvedTotalCents;
  const confirmedDate = raw.confirmedDate === undefined ? existing.confirmedDate : validDate(raw.confirmedDate, "Confirmed date");
  if (requestedAmount !== null && (!Number.isSafeInteger(requestedAmount) || (requestedAmount as number) < 10000 || (requestedAmount as number) > 50000000)) {
    throw new ApiError(400, "invalid_amount", "Approved total must be an integer amount in cents between 100 and 500,000.");
  }
  const quoteChanged = requestedAmount !== existing.approvedTotalCents || confirmedDate !== existing.confirmedDate || quoteSummary !== existing.quoteSummary;
  if (status === "approved" && (!requestedAmount || !confirmedDate || quoteSummary.trim().length < 20 || ((existing.status !== "approved" || quoteChanged) && raw.scopeConfirmed !== true))) {
    throw new ApiError(400, "approval_incomplete", "Confirm the agreed date, itemised tax-inclusive total, written scope and scopeConfirmed before enabling a deposit.");
  }
  if (status === "cancelled" && existing.stripeSessionId && existing.paidAmountCents === 0 && (existing.stripeExpiresAt || 0) > Date.now()) {
    throw new ApiError(409, "checkout_locked", "Revoke the open payment session before cancelling this booking.");
  }
  if (existing.stripeSessionId && quoteChanged) throw new ApiError(409, "checkout_locked", "A payment session already exists. Resolve or expire it with the payment provider before changing the approved quote.");
  if (existing.paidAmountCents > 0 && quoteChanged) throw new ApiError(409, "paid_quote_locked", "A paid quote cannot be changed here. Use a signed change order and a separate invoice.");
  const now = Date.now();
  const approvedAmount = requestedAmount as number | null;
  const nextVersion = quoteChanged || (status === "approved" && existing.quoteVersion === 0) ? existing.quoteVersion + 1 : existing.quoteVersion;
  const update = {
    status, internalNotes, customerMessage, quoteSummary, confirmedDate, approvedTotalCents: approvedAmount,
    depositAmountCents: approvedAmount === null ? null : Math.round(approvedAmount / 2),
    quoteVersion: nextVersion, approvedAt: status === "approved" ? now : existing.approvedAt, updatedAt: now,
    paymentStatus: status === "approved" && existing.paidAmountCents === 0 ? "awaiting_deposit" : existing.paymentStatus,
  };
  const statusChanged = status !== existing.status;
  const messageChanged = customerMessage !== existing.customerMessage;
  const publicChange = statusChanged || quoteChanged || messageChanged;
  const eventStatus = statusChanged ? status : quoteChanged ? "quote_updated" : messageChanged ? "booking_updated" : "internal_note_updated";
  const eventNote = messageChanged && customerMessage ? customerMessage
    : statusChanged ? (status === "approved" ? "The agreed production scope is ready for review. A 50% deposit is due only after you accept it." : statusLabels[status] || status)
    : quoteChanged ? "The production quote was updated. Review the current itemised scope, date and total before accepting it."
    : messageChanged ? "The production team updated its message."
    : "The production team updated an internal note.";
  const mutations = [
    getDb().update(bookings).set(update).where(eq(bookings.id, id)),
    getDb().insert(bookingTimeline).values({ id: crypto.randomUUID(), bookingId: id, status: eventStatus, note: eventNote, public: publicChange, createdAt: now }),
  ] as const;
  if (status === "cancelled") {
    await getDb().batch([...mutations, getDb().update(campaignLinks).set({ enabled: false, updatedAt: now }).where(eq(campaignLinks.bookingId, id))]);
  } else {
    await getDb().batch(mutations);
  }
  return (await findBooking(id))!;
}

