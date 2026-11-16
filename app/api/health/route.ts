import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import { apiJson, livePaymentsReady } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";
export async function GET() {
  let databaseReady = false;
  try { await getDb().select({ id: bookings.id }).from(bookings).limit(1); databaseReady = true; } catch {}
  return apiJson({ ok: databaseReady, databaseReady, paymentsReady: livePaymentsReady() }, databaseReady ? 200 : 503);
}

