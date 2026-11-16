import { integer, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  accessTokenHash: text("access_token_hash").notNull(),
  idempotencyHash: text("idempotency_hash").notNull(),
  payloadHash: text("payload_hash").notNull(),
  campaignSlug: text("campaign_slug").notNull(),
  market: text("market").notNull(),
  currency: text("currency").notNull(),
  brandName: text("brand_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  website: text("website").notNull().default(""),
  desiredDate: text("desired_date").notNull(),
  message: text("message").notNull().default(""),
  addonsJson: text("addons_json").notNull().default("[]"),
  status: text("status").notNull().default("requested"),
  estimatedTotalCents: integer("estimated_total_cents").notNull(),
  approvedTotalCents: integer("approved_total_cents"),
  depositAmountCents: integer("deposit_amount_cents"),
  confirmedDate: text("confirmed_date"),
  quoteSummary: text("quote_summary").notNull().default(""),
  customerMessage: text("customer_message").notNull().default(""),
  internalNotes: text("internal_notes").notNull().default(""),
  quoteVersion: integer("quote_version").notNull().default(0),
  approvedAt: integer("approved_at"),
  consentAt: integer("consent_at").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripeCheckoutUrl: text("stripe_checkout_url"),
  stripeExpiresAt: integer("stripe_expires_at"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAmountCents: integer("paid_amount_cents").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("not_requested"),
  paymentSource: text("payment_source").notNull().default("none"),
  paymentReference: text("payment_reference").notNull().default(""),
  paidAt: integer("paid_at"),
  deliverablesJson: text("deliverables_json").notNull().default("[]"),
}, (t) => [
  uniqueIndex("bookings_idempotency_idx").on(t.idempotencyHash),
  index("bookings_created_idx").on(t.createdAt),
  index("bookings_status_idx").on(t.status),
]);

export const bookingTimeline = sqliteTable("booking_timeline", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  status: text("status").notNull(),
  note: text("note").notNull().default(""),
  public: integer("public", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
}, (t) => [index("timeline_booking_idx").on(t.bookingId)]);

export const requestLimits = sqliteTable("request_limits", {
  id: text("id").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: integer("expires_at").notNull(),
});

export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  bookingId: text("booking_id"),
  createdAt: integer("created_at").notNull(),
});

export const campaignLinks = sqliteTable("campaign_links", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  code: text("code").notNull(),
  destination: text("destination").notNull(),
  label: text("label").notNull().default("Campaign landing page"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  redirectRequests: integer("redirect_requests").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (t) => [
  uniqueIndex("campaign_links_booking_idx").on(t.bookingId),
  uniqueIndex("campaign_links_code_idx").on(t.code),
]);

export const campaignLinkDays = sqliteTable("campaign_link_days", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull().references(() => campaignLinks.id),
  date: text("date").notNull(),
  redirectRequests: integer("redirect_requests").notNull().default(0),
}, (t) => [index("campaign_link_days_link_date_idx").on(t.linkId, t.date)]);

