import { apiFailure, apiJson } from "@/lib/server/runtime";
import { clientBooking, publicTimeline, requireBooking } from "@/lib/server/bookings";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const row = await requireBooking(request, id);
    return apiJson({ ...clientBooking(row), timeline: await publicTimeline(id) });
  } catch (error) { return apiFailure(error); }
}

