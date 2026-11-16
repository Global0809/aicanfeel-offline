import { assertSameOrigin, readJson } from "@/lib/server/security";
import { apiFailure, apiJson } from "@/lib/server/runtime";
import { createBooking } from "@/lib/server/bookings";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { row, accessToken, replay } = await createBooking(request, await readJson(request));
    return apiJson({
      bookingId: row.id, status: row.status, accessToken,
      reviewUrl: "/booking/" + row.id + "#token=" + accessToken,
      paymentRequired: false, emailSent: false, replay,
      estimatedTotalCents: row.estimatedTotalCents, currency: row.currency,
      message: "Your campaign brief is stored. Save your private booking link. Dates, location and total price need confirmation before any deposit is requested.",
    }, replay ? 200 : 201);
  } catch (error) { return apiFailure(error); }
}

