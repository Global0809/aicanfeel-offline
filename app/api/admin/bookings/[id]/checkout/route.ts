import { apiFailure, apiJson, requireAdmin } from "@/lib/server/runtime";
import { findBooking } from "@/lib/server/bookings";
import { ApiError, assertSameOrigin } from "@/lib/server/security";
import { revokeDepositCheckout } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    const row = await findBooking(id);
    if (!row) throw new ApiError(404, "booking_not_found", "Booking not found.");
    return apiJson(await revokeDepositCheckout(row));
  } catch (error) { return apiFailure(error); }
}

