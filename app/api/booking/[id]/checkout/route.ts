import { assertSameOrigin, readJson } from "@/lib/server/security";
import { apiFailure, apiJson } from "@/lib/server/runtime";
import { requireBooking } from "@/lib/server/bookings";
import { createDepositCheckout } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const row = await requireBooking(request, id);
    return apiJson(await createDepositCheckout(request, row, await readJson(request)));
  } catch (error) { return apiFailure(error); }
}

