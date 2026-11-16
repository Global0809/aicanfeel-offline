import { apiFailure, apiJson, paymentsConfigured, requireAdmin } from "@/lib/server/runtime";
import { listBookings } from "@/lib/server/bookings";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const url = new URL(request.url);
    const rawCursor = Number(url.searchParams.get("cursor") || "0");
    const cursor = Number.isSafeInteger(rawCursor) && rawCursor > 0 ? rawCursor : null;
    return apiJson({ ...await listBookings(cursor, url.searchParams.get("status")), paymentsConfigured: paymentsConfigured() });
  } catch (error) { return apiFailure(error); }
}

