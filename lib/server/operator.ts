import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings, bookingTimeline } from "@/db/schema";
import { clientBooking, findBooking, publicTimeline } from "./bookings";
import { ApiError, cleanText, sha256 } from "./security";
import { serverEnv } from "./runtime";

export async function rotateReceiptLink(bookingId: string, input: Record<string, unknown>) {
  if (input.confirmInvalidatePrevious !== true) throw new ApiError(400, "rotation_confirmation_required", "Confirm that the previous private receipt links will stop working.");
  const row = await findBooking(bookingId);
  if (!row) throw new ApiError(404, "booking_not_found", "Booking not found.");
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const accessToken = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const accessTokenHash = await sha256(accessToken);
  const now = Date.now();
  const db = getDb();
  await db.batch([
    db.update(bookings).set({ accessTokenHash, updatedAt: now }).where(eq(bookings.id, bookingId)),
    db.insert(bookingTimeline).values({ id: crypto.randomUUID(), bookingId, status: "receipt_refreshed", note: "Your private booking link was refreshed by the production team. Previous private links no longer work.", public: true, createdAt: now }),
  ]);
  return { bookingId, accessToken, reviewUrl: "/booking/" + bookingId + "#token=" + accessToken, previousLinksInvalidated: true };
}

export async function recordOfflineDeposit(bookingId: string, input: Record<string, unknown>) {
  if (input.confirmFundsReceived !== true || input.confirmScopeAccepted !== true) {
    throw new ApiError(400, "receipt_confirmation_required", "Explicitly confirm that the funds have actually been received and the client accepted the approved scope.");
  }
  const row = await findBooking(bookingId);
  if (!row) throw new ApiError(404, "booking_not_found", "Booking not found.");
  const method = input.method;
  if (method !== "bank" && method !== "invoice") throw new ApiError(400, "invalid_payment_method", "Choose bank or invoice.");
  const reference = cleanText(input.reference, "Real payment reference", 200, 8);
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents !== row.depositAmountCents || input.currency !== row.currency) {
    throw new ApiError(400, "receipt_amount_mismatch", "The received amount and currency must match the exact approved deposit.");
  }
  if (input.approvedQuoteVersion !== row.quoteVersion || !row.approvedAt || !row.approvedTotalCents || !row.depositAmountCents || !row.confirmedDate) {
    throw new ApiError(409, "quote_mismatch", "Review the current approved date, scope and deposit before recording funds.");
  }
  const source = "manual_" + method;
  if (row.paidAmountCents > 0) {
    if (row.paymentSource === source && row.paymentReference === reference && row.paidAmountCents === input.amountCents) {
      return { ...clientBooking(row), paymentReference: row.paymentReference, internalNotes: row.internalNotes, timeline: await publicTimeline(bookingId), replay: true };
    }
    throw new ApiError(409, "deposit_already_recorded", "A deposit is already recorded. Reconcile it before recording any additional funds.");
  }
  if (row.status !== "approved") throw new ApiError(409, "approval_required", "Only a currently approved campaign scope can receive an initial deposit record.");
  if (row.stripeSessionId) throw new ApiError(409, "checkout_locked", "Revoke or resolve the existing online checkout before recording a bank or invoice deposit.");
  const binding = serverEnv().DB;
  if (!binding) throw new Error("D1 binding unavailable");
  const now = Date.now();
  const note = "Deposit receipt recorded by the production team (" + method + "). This is a manual receipt record, not payment-provider verification.";
  const results = await binding.batch([
    binding.prepare("UPDATE bookings SET status = 'deposit_paid', payment_status = 'manually_recorded', payment_source = ?, payment_reference = ?, paid_amount_cents = ?, paid_at = ?, updated_at = ? WHERE id = ? AND status = 'approved' AND paid_amount_cents = 0 AND quote_version = ? AND deposit_amount_cents = ? AND currency = ?")
      .bind(source, reference, input.amountCents, now, now, bookingId, row.quoteVersion, input.amountCents, row.currency),
    binding.prepare("INSERT INTO booking_timeline (id, booking_id, status, note, public, created_at) SELECT ?, id, 'deposit_paid', ?, 1, ? FROM bookings WHERE id = ? AND payment_source = ? AND payment_reference = ? AND paid_amount_cents = ? ON CONFLICT(id) DO NOTHING")
      .bind("manual-deposit-" + bookingId + "-" + row.quoteVersion, note, now, bookingId, source, reference, input.amountCents),
  ]);
  const saved = await findBooking(bookingId);
  if (!saved || saved.paymentSource !== source || saved.paymentReference !== reference || saved.paidAmountCents !== input.amountCents) {
    throw new ApiError(409, "receipt_conflict", "This booking changed while the receipt was being recorded. Review its current payment status.");
  }
  return { ...clientBooking(saved), paymentReference: saved.paymentReference, internalNotes: saved.internalNotes, timeline: await publicTimeline(bookingId), replay: (results[0].meta.changes || 0) === 0 };
}

