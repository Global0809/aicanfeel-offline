import { apiFailure, apiJson, requireAdmin } from "@/lib/server/runtime";
import { clientBooking, findBooking, publicTimeline, updateBooking } from "@/lib/server/bookings";
import { ApiError, assertSameOrigin, readJson } from "@/lib/server/security";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const row = await findBooking(id);
    if (!row) throw new ApiError(404, "booking_not_found", "Booking not found.");
    return apiJson({ ...clientBooking(row), internalNotes: row.internalNotes, paymentReference: row.paymentReference, timeline: await publicTimeline(id) });
  } catch (error) { return apiFailure(error); }
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    const row = await updateBooking(id, await readJson(request));
    return apiJson({ ...clientBooking(row), internalNotes: row.internalNotes, paymentReference: row.paymentReference, timeline: await publicTimeline(id) });
  } catch (error) { return apiFailure(error); }
}

