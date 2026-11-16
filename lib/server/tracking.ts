import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { campaignLinks, campaignLinkDays } from "@/db/schema";
import { findBooking } from "./bookings";
import { ApiError, cleanText, validDate } from "./security";

export function validatedDestination(value: unknown, siteOrigin: string): string {
  const input = cleanText(value, "Campaign destination", 2048, 10);
  let parsed: URL;
  try { parsed = new URL(input); } catch { throw new ApiError(400, "invalid_destination", "Enter a complete https:// campaign destination."); }
  const host = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || !host.includes(".") ||
      host === "localhost" || /\.(localhost|local|internal|test)$/.test(host) ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":") || host.startsWith("[")) {
    throw new ApiError(400, "invalid_destination", "Use a public HTTPS website without credentials or an IP address.");
  }
  if (parsed.origin === siteOrigin && parsed.pathname.startsWith("/go/")) {
    throw new ApiError(400, "redirect_loop", "A campaign link cannot point back to a campaign redirect.");
  }
  return parsed.href;
}

export async function trackingReport(bookingId: string, origin: string, query?: URLSearchParams) {
  const booking = await findBooking(bookingId);
  if (!booking) throw new ApiError(404, "booking_not_found", "Booking not found.");
  const rows = await getDb().select().from(campaignLinks).where(eq(campaignLinks.bookingId, bookingId)).limit(1);
  const link = rows[0];
  if (!link) return { tracking: null, metrics: { redirectRequests: 0, days: [], timeZone: "UTC", definition: "Counts GET redirect requests, including repeat visits, bots and link previews. It is not a unique-person or impression count." } };
  const today = new Date().toISOString().slice(0, 10);
  const defaultSince = new Date(Date.now() - 89 * 86400000).toISOString().slice(0, 10);
  const since = query?.get("since") ? validDate(query.get("since"), "Start date") : defaultSince;
  const until = query?.get("until") ? validDate(query.get("until"), "End date") : today;
  if (since > until || Date.parse(until + "T12:00:00Z") - Date.parse(since + "T12:00:00Z") > 365 * 86400000) {
    throw new ApiError(400, "invalid_range", "Choose a reporting interval of no more than 366 days.");
  }
  const days = await getDb().select({ date: campaignLinkDays.date, redirectRequests: campaignLinkDays.redirectRequests }).from(campaignLinkDays)
    .where(and(eq(campaignLinkDays.linkId, link.id), gte(campaignLinkDays.date, since), lte(campaignLinkDays.date, until)))
    .orderBy(asc(campaignLinkDays.date)).limit(366);
  return {
    tracking: { code: link.code, publicUrl: origin + "/go/" + link.code, destination: link.destination, label: link.label, enabled: link.enabled },
    metrics: {
      redirectRequests: link.redirectRequests, intervalRedirectRequests: days.reduce((sum, day) => sum + day.redirectRequests, 0),
      days, since, until, timeZone: "UTC",
      definition: "Counts GET redirect requests, including repeat visits, bots and link previews. It is not a unique-person, footfall or impression count. HEAD requests are excluded.",
    },
    privacy: "Only aggregate counts and UTC dates are stored. No visitor IP, user agent, fingerprint or per-visitor record is retained for campaign analytics.",
  };
}

export async function saveTracking(bookingId: string, input: Record<string, unknown>, origin: string) {
  const booking = await findBooking(bookingId);
  if (!booking) throw new ApiError(404, "booking_not_found", "Booking not found.");
  const db = getDb();
  const prior = await db.select().from(campaignLinks).where(eq(campaignLinks.bookingId, bookingId)).limit(1);
  const existing = prior[0];
  if (!["approved", "deposit_paid", "scheduled", "completed"].includes(booking.status) && !(existing && input.enabled === false)) {
    throw new ApiError(409, "approval_required", "Approve the campaign scope before publishing a campaign destination.");
  }
  const destination = input.destination === undefined && existing ? existing.destination : validatedDestination(input.destination, origin);
  const label = input.label === undefined && existing ? existing.label : cleanText(input.label ?? "Campaign landing page", "Link label", 120, 2);
  const enabled = input.enabled === undefined ? true : input.enabled;
  if (typeof enabled !== "boolean") throw new ApiError(400, "invalid_enabled", "Choose whether the link is enabled.");
  const now = Date.now();
  await db.insert(campaignLinks).values({
    id: crypto.randomUUID(), bookingId, code: crypto.randomUUID().replaceAll("-", ""), destination, label, enabled,
    redirectRequests: 0, createdAt: now, updatedAt: now,
  }).onConflictDoUpdate({ target: campaignLinks.bookingId, set: { destination, label, enabled, updatedAt: now } });
  return trackingReport(bookingId, origin);
}

export async function campaignRedirect(code: string, count: boolean): Promise<Response> {
  if (!/^[a-f0-9]{32}$/.test(code)) return new Response("Campaign link not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
  const db = getDb();
  const rows = await db.select().from(campaignLinks).where(eq(campaignLinks.code, code)).limit(1);
  const link = rows[0];
  if (!link) return new Response("Campaign link not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!link.enabled) return new Response("This campaign link is no longer active.", { status: 410, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  if (count) {
    const date = new Date().toISOString().slice(0, 10);
    try {
      await db.batch([
        db.update(campaignLinks).set({ redirectRequests: sql`${campaignLinks.redirectRequests} + 1` }).where(eq(campaignLinks.id, link.id)),
        db.insert(campaignLinkDays).values({ id: link.id + ":" + date, linkId: link.id, date, redirectRequests: 1 })
          .onConflictDoUpdate({ target: campaignLinkDays.id, set: { redirectRequests: sql`${campaignLinkDays.redirectRequests} + 1` } }),
      ]);
    } catch { console.error("Campaign aggregate update unavailable"); }
  }
  return new Response(null, { status: 302, headers: {
    Location: link.destination, "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow, nosnippet", "X-Content-Type-Options": "nosniff",
  } });
}

