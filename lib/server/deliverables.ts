import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings, bookingTimeline } from "@/db/schema";
import { clientBooking, findBooking, publicTimeline } from "./bookings";
import { ApiError, cleanText } from "./security";
import { validatedDestination } from "./tracking";

const kinds = ["film", "vertical", "stills", "report"] as const;
export type Deliverable = { kind: typeof kinds[number]; label: string; url: string; sharedAt: string };

export function validateDeliverables(input: Record<string, unknown>, origin: string, sharedAt = new Date().toISOString()): Deliverable[] {
  if (!Array.isArray(input.items) || input.items.length > 12) throw new ApiError(400, "invalid_deliverables", "Share up to 12 actual delivery links.");
  return input.items.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new ApiError(400, "invalid_deliverable", "Each delivery needs a type, label and HTTPS link.");
    const item = entry as Record<string, unknown>;
    if (!kinds.includes(item.kind as typeof kinds[number])) throw new ApiError(400, "invalid_deliverable_type", "Choose film, vertical, stills or report.");
    return { kind: item.kind as typeof kinds[number], label: cleanText(item.label, "Delivery label", 100, 2), url: validatedDestination(item.url, origin), sharedAt };
  });
}

export async function shareDeliverables(bookingId: string, input: Record<string, unknown>, origin: string) {
  const row = await findBooking(bookingId);
  if (!row) throw new ApiError(404, "booking_not_found", "Booking not found.");
  if (!["approved", "deposit_paid", "scheduled", "completed"].includes(row.status)) throw new ApiError(409, "approval_required", "Approve the campaign scope before sharing delivery links.");
  const now = Date.now();
  const items = validateDeliverables(input, origin, new Date(now).toISOString());
  const db = getDb();
  await db.batch([
    db.update(bookings).set({ deliverablesJson: JSON.stringify(items), updatedAt: now }).where(eq(bookings.id, bookingId)),
    db.insert(bookingTimeline).values({
      id: crypto.randomUUID(), bookingId, status: items.length ? "deliverables_shared" : "deliverables_updated",
      note: items.length ? "The production team shared " + items.length + " delivery link" + (items.length === 1 ? "." : "s.") + " These links are supplied by the team; contact them if a file needs access permission."
        : "The production team updated the delivery links. No files are currently shared here.",
      public: true, createdAt: now,
    }),
  ]);
  const saved = (await findBooking(bookingId))!;
  return { ...clientBooking(saved), internalNotes: saved.internalNotes, paymentReference: saved.paymentReference, timeline: await publicTimeline(bookingId) };
}

