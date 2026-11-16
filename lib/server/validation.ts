import { campaignById, price, type City } from "@/lib/campaigns";
import { ApiError, cleanText, validDate } from "./security";

export const addonPrices = {
  "extra-hour": { USD: 750, GBP: 600, label: "One extra activation hour" },
  "extra-edit": { USD: 300, GBP: 240, label: "One extra vertical edit" },
} as const;

export type BookingInput = {
  campaignSlug: string; market: "US" | "UK"; city: City; currency: "USD" | "GBP";
  brandName: string; contactName: string; email: string; phone: string; website: string;
  desiredDate: string; message: string; addons: (keyof typeof addonPrices)[]; idempotencyKey: string;
};

export function validateBookingInput(raw: Record<string, unknown>, now = new Date()): BookingInput {
  const campaignSlug = cleanText(raw.campaignSlug, "Campaign", 80, 3);
  const campaign = campaignById(campaignSlug);
  if (!campaign) throw new ApiError(400, "invalid_campaign", "Please choose an available campaign.");
  const market = raw.market;
  if (market !== "US" && market !== "UK") throw new ApiError(400, "invalid_market", "Please choose New York or London.");
  const city: City = market === "UK" ? "london" : "new-york";
  if (raw.city && raw.city !== city && raw.city !== (market === "UK" ? "London" : "New York")) {
    throw new ApiError(400, "market_mismatch", "The city and market must match.");
  }
  const brandName = cleanText(raw.brandName, "Brand name", 120, 2);
  const contactName = cleanText(raw.contactName, "Contact name", 100, 2);
  const email = cleanText(raw.email, "Email", 254, 3).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "invalid_email", "Please enter a valid email address.");
  const phone = cleanText(raw.phone, "Phone", 40);
  let website = cleanText(raw.website, "Website", 500);
  if (website) {
    if (!/^https?:\/\//i.test(website)) website = "https://" + website;
    try {
      const parsed = new URL(website);
      if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname.includes(".") || parsed.username || parsed.password) throw new Error();
      website = parsed.href;
    } catch { throw new ApiError(400, "invalid_website", "Please enter a valid website address."); }
  }
  const desiredDate = validDate(raw.desiredDate, "Preferred date");
  const localParts = new Intl.DateTimeFormat("en-CA", { timeZone: market === "UK" ? "Europe/London" : "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => localParts.find((entry) => entry.type === type)?.value || "";
  const today = part("year") + "-" + part("month") + "-" + part("day");
  const earliest = new Date(Date.parse(today + "T12:00:00Z") + campaign.leadDays * 86400000).toISOString().slice(0, 10);
  if (desiredDate < earliest) throw new ApiError(400, "date_too_soon", "Please allow at least " + campaign.leadDays + " days for this campaign. The earliest request date is " + earliest + ".");
  if (desiredDate > new Date(now.getTime() + 730 * 86400000).toISOString().slice(0, 10)) throw new ApiError(400, "date_too_far", "Please choose a date within the next two years.");
  const message = cleanText(raw.message, "Campaign brief", 5000);
  const suppliedAddons = raw.addons ?? raw.addOns ?? [];
  if (!Array.isArray(suppliedAddons) || suppliedAddons.length > 2 || suppliedAddons.some((item) => typeof item !== "string" || !Object.prototype.hasOwnProperty.call(addonPrices, item))) {
    throw new ApiError(400, "invalid_addon", "Please choose only the available campaign extras.");
  }
  const addons = [...new Set(suppliedAddons)].sort() as (keyof typeof addonPrices)[];
  if (raw.consent !== true) throw new ApiError(400, "consent_required", "Please agree to the booking-request and privacy terms.");
  if (cleanText(raw.honeyPot ?? raw.honeypot, "Website verification", 100)) throw new ApiError(400, "request_rejected", "This request could not be submitted.");
  const idempotencyKey = cleanText(raw.idempotencyKey, "Request key", 36, 36).toLowerCase();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(idempotencyKey)) {
    throw new ApiError(400, "invalid_request_key", "Please refresh this form and try again.");
  }
  return { campaignSlug, market, city, currency: market === "UK" ? "GBP" : "USD", brandName, contactName, email, phone, website, desiredDate, message, addons, idempotencyKey };
}

export function estimateCents(campaignSlug: string, market: "US" | "UK", extras: (keyof typeof addonPrices)[]): number {
  const campaign = campaignById(campaignSlug);
  if (!campaign) throw new ApiError(400, "invalid_campaign", "Please choose an available campaign.");
  const currency = market === "UK" ? "GBP" : "USD";
  const amount = price(campaign, market === "UK" ? "london" : "new-york") + extras.reduce((sum, extra) => sum + addonPrices[extra][currency], 0);
  return Math.round(amount * 100);
}

