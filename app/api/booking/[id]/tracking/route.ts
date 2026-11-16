import { apiFailure, apiJson } from "@/lib/server/runtime";
import { requireBooking } from "@/lib/server/bookings";
import { trackingReport } from "@/lib/server/tracking";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await requireBooking(request, id);
    const url = new URL(request.url);
    return apiJson(await trackingReport(id, url.origin, url.searchParams));
  } catch (error) { return apiFailure(error); }
}

