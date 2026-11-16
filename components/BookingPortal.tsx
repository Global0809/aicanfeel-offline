"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "./SiteLink";
import { campaignById, coverPhoto } from "../lib/campaigns";

type Data = Record<string, any>;
const arrow = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19 19 5M5 5h14v14" />
  </svg>
);
const currency = (cents: number, code = "USD") =>
  new Intl.NumberFormat(code === "GBP" ? "en-GB" : "en-US", {
    style: "currency",
    currency: code,
  }).format(cents / 100);
const statusCopy: Record<string, [string, string]> = {
  requested: [
    "Brief received",
    "Your brief is saved for production review. Your date is not reserved and no payment has been taken.",
  ],
  reviewing: [
    "Production review",
    "Your preferred date, location and production plan are being reviewed. We will confirm the complete scope before requesting a deposit.",
  ],
  approved: [
    "Production scope approved",
    "Review the agreed production, confirmed date and total below. A 50% deposit reserves the confirmed supplier bookings.",
  ],
  deposit_paid: [
    "Deposit recorded",
    "Your deposit has been recorded. The source of the payment record is shown below. Your approved agreement defines the production schedule.",
  ],
  scheduled: [
    "Production scheduled",
    "Your production has been scheduled. Refer to the approved scope for arrival, activation and delivery times.",
  ],
  completed: [
    "Campaign completed",
    "Your production is marked complete. Shared delivery links and the execution timeline appear below.",
  ],
  cancelled: [
    "Request closed",
    "This request is closed. Any agreed cancellation or refund treatment follows your production agreement.",
  ],
};
async function readJSON(r: Response): Promise<Data> {
  if (!r.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "The production desk is temporarily unavailable. Please try again.",
    );
  const d = (await r.json()) as Data;
  if (!r.ok)
    throw new Error(d.error || "Your production request could not be loaded.");
  return d;
}

export default function BookingPortal({
  id,
  footer,
}: {
  id: string;
  footer?: ReactNode;
}) {
  const [booking, setBooking] = useState<Data | null>(null);
  const [tracking, setTracking] = useState<Data | null>(null);
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState("");
  const token = useRef("");
  const load = useCallback(async () => {
    setError("");
    setAccepted(false);
    try {
      const hash = new URLSearchParams(location.hash.slice(1));
      const access =
        hash.get("token") ||
        sessionStorage.getItem(`aicanfeel-booking-${id}`) ||
        "";
      if (!access)
        throw new Error(
          "Open the complete private link saved after you submitted your brief. If you have lost it, contact AICANFEEL with your booking reference.",
        );
      token.current = access;
      try {
        sessionStorage.setItem(`aicanfeel-booking-${id}`, access);
      } catch {}
      if (!location.hash)
        history.replaceState(
          null,
          "",
          location.pathname + "#token=" + encodeURIComponent(access),
        );
      const r = await fetch(`/api/booking/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      });
      const data = await readJSON(r);
      setBooking(data.booking || data);
      fetch(`/api/booking/${encodeURIComponent(id)}/tracking`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      })
        .then(readJSON)
        .then(setTracking)
        .catch(() => setTracking(null));
    } catch (e) {
      setBooking(null);
      setTracking(null);
      setQr("");
      setError(
        e instanceof TypeError ? "Your connection was interrupted. Check your internet and try again." : e instanceof Error ? e.message : "Your booking could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    let alive = true;
    const url = tracking?.tracking?.publicUrl;
    if (!url) {
      setQr("");
      return;
    }
    import("qrcode")
      .then((m) =>
        m.toDataURL(url, {
          width: 480,
          margin: 3,
          errorCorrectionLevel: "M",
          color: { dark: "#111111", light: "#ffffff" },
        }),
      )
      .then((url) => {
        if (alive) setQr(url);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [tracking?.tracking?.publicUrl]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setNotice("Your private booking link has been copied. Keep it private.");
    } catch {
      setNotice(
        "Copy the complete address from your browser, including the private token after #.",
      );
    }
  }
  async function checkout() {
    if (!booking || !accepted) return;
    setPaying(true);
    setError("");
    try {
      const r = await fetch(`/api/booking/${encodeURIComponent(id)}/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.current}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acceptApprovedScope: true,
          acceptedQuoteVersion: booking.quoteVersion,
        }),
      });
      const d = await readJSON(r);
      const checkoutUrl = d.checkoutUrl || d.url;
      if (
        typeof checkoutUrl !== "string" ||
        !checkoutUrl.startsWith("https://checkout.stripe.com/")
      )
        throw new Error(
          "A secure payment link is not available. Contact the production team.",
        );
      location.assign(checkoutUrl);
    } catch (e) {
      setError(
        e instanceof TypeError ? "Your connection was interrupted. Check your internet and try again." : e instanceof Error ? e.message : "Checkout could not be opened.",
      );
      setPaying(false);
    }
  }
  const c = campaignById(booking?.campaignSlug || "");
  const status = booking?.status || "requested";
  const [heading, explanation] = statusCopy[status] || [
    "Production update",
    "See the current production details below.",
  ];
  const paid = Number(booking?.paidAmountCents || 0) > 0;
  const contact = `mailto:aicanfeel@gmail.com?subject=${encodeURIComponent("AICANFEEL production · " + id)}`;
  return (
    <div className="page-wrap status-page">
      <h1>
        {loading
          ? "Opening your brief."
          : booking
            ? "Your campaign starts here."
            : "Your private booking."}
      </h1>
      {loading && (
        <p className="loading-copy" role="status">
          Loading your production request…
        </p>
      )}
      {error && (
        <div className="error-panel" role="alert">
          <p>{error}</p>
          <button className="text-button" onClick={load}>
            Try again
          </button>
          <a className="text-button" href={contact}>
            Contact production
          </a>
        </div>
      )}
      {booking && (
        <>
          <div className={`status-banner status-${status}`}>
            <span className="status-square" />
            <div>
              <h2>{heading}</h2>
              <p>{explanation}</p>
            </div>
          </div>
          <div className="status-layout">
            <div>
              <dl className="status-details">
                <div>
                  <dt>Booking reference</dt>
                  <dd>{id}</dd>
                </div>
                <div>
                  <dt>Brand</dt>
                  <dd>{booking.brandName}</dd>
                </div>
                <div>
                  <dt>Campaign</dt>
                  <dd>{c?.name || booking.campaignName}</dd>
                </div>
                <div>
                  <dt>City</dt>
                  <dd>
                    {booking.city ||
                      (booking.market === "UK" ? "London" : "New York")}
                  </dd>
                </div>
                <div>
                  <dt>
                    {booking.confirmedDate
                      ? "Confirmed date"
                      : "Preferred date"}
                  </dt>
                  <dd>
                    {booking.confirmedDate || booking.desiredDate}
                    {!booking.confirmedDate && " · subject to confirmation"}
                  </dd>
                </div>
                <div>
                  <dt>Starting estimate</dt>
                  <dd>
                    {currency(booking.estimatedTotalCents, booking.currency)}
                    <small>Before venue, permit fees and applicable tax</small>
                  </dd>
                </div>
              </dl>
              <div className="status-actions">
                <button className="text-button" onClick={copy}>
                  Copy private booking link
                </button>
                <button className="text-button" onClick={() => window.print()}>
                  Save / print brief
                </button>
                <button className="text-button" onClick={load}>
                  Refresh status
                </button>
                <a className="text-button" href={contact}>
                  Contact production
                </a>
              </div>
              {notice && (
                <p className="portal-notice" role="status">
                  {notice}
                </p>
              )}
              <p className="small-copy">
                The complete private link grants access to this booking. Keep it
                private. No automated confirmation email is sent from this page.
              </p>
              {booking.message && (
                <details className="portal-brief">
                  <summary>Your submitted brief</summary>
                  <p>{booking.message}</p>
                  <span>
                    {booking.addons?.length
                      ? "Requested additions: " +
                        booking.addons
                          .map((v: string) => v.replaceAll("-", " "))
                          .join(", ")
                      : "No optional additions requested."}
                  </span>
                </details>
              )}
              {booking.approvedTotalCents && (
                <section className="approved-quote">
                  <h2>
                    {status === "cancelled"
                      ? "Production proposal"
                      : "Your approved production"}
                  </h2>
                  {booking.customerMessage && (
                    <p className="portal-customer-update">
                      {booking.customerMessage}
                    </p>
                  )}
                  <p>{booking.quoteSummary}</p>
                  <dl className="portal-amounts">
                    <div>
                      <dt>Agreed production total</dt>
                      <dd>
                        {currency(booking.approvedTotalCents, booking.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt>50% production deposit</dt>
                      <dd>
                        {currency(booking.depositAmountCents, booking.currency)}
                      </dd>
                    </div>
                  </dl>
                  <p className="small-copy">
                    Quote version {booking.quoteVersion}. The itemized scope and
                    signed production agreement define the price, applicable
                    tax, rights and delivery.
                  </p>
                  {paid ? (
                    <div className="portal-payment-received">
                      <strong>
                        {currency(booking.paidAmountCents, booking.currency)}{" "}
                        deposit recorded
                      </strong>
                      <p>
                        {booking.paymentVerifiedByProvider
                          ? "Payment verified by the connected payment provider."
                          : "Deposit receipt recorded manually by the production team; not payment-provider verification."}
                      </p>
                      {booking.paidAt && (
                        <span>
                          {new Date(booking.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : booking.checkoutEligible ? (
                    <>
                      <label className="quote-consent">
                        <input
                          type="checkbox"
                          checked={accepted}
                          onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <span>
                          I accept quote version {booking.quoteVersion}, its
                          production scope and the displayed deposit amount.
                        </span>
                      </label>
                      <button
                        className="action"
                        disabled={paying || !accepted}
                        onClick={checkout}
                      >
                        {paying
                          ? "Opening secure checkout…"
                          : "Pay approved production deposit"}
                        {arrow}
                      </button>
                      <p className="small-copy">
                        Card details are entered only on the secure hosted
                        payment page.
                      </p>
                    </>
                  ) : status === "approved" ? (
                    <div className="portal-invoice">
                      <p>
                        The production team will arrange your approved deposit
                        invoice directly. A payment request must identify
                        AICANFEEL and match this agreed scope.
                      </p>
                      <a href={contact} className="action">
                        Ask about the production invoice {arrow}
                      </a>
                    </div>
                  ) : null}
                </section>
              )}
            </div>
            <aside className="portal-aside">
              {c && (
                <div className="portal-campaign-image">
                  <img src={coverPhoto(c)} alt={`${c.name} campaign concept`} />
                  <span>CAMPAIGN CONCEPT</span>
                </div>
              )}
              <div className="next-steps">
                <h2>Production timeline.</h2>
                <ol className="portal-timeline">
                  {booking.timeline?.length ? (
                    booking.timeline.map((event: Data, i: number) => (
                      <li key={`${event.at}-${i}`}>
                        <strong>{event.label}</strong>
                        <time dateTime={event.at}>
                          {new Date(event.at).toLocaleString()}
                        </time>
                        <p>{event.note}</p>
                      </li>
                    ))
                  ) : (
                    <li>
                      <strong>Brief received</strong>
                      <p>Your request is saved for production review.</p>
                    </li>
                  )}
                </ol>
              </div>
            </aside>
          </div>
          {booking.deliverables?.length > 0 && (
            <section className="portal-delivery">
              <div className="subheading">
                <h2>
                  Your campaign,
                  <br />
                  <em>delivered.</em>
                </h2>
                <p>
                  Production files shared by your AICANFEEL team.
                  <br />
                  Open each link to view or download the delivery.
                </p>
              </div>
              <div className="delivery-files">
                {booking.deliverables.map((item: Data, i: number) => (
                  <a
                    key={`${item.url}-${i}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      {item.kind === "film"
                        ? "CINEMATIC FILM"
                        : item.kind === "vertical"
                          ? "VERTICAL EDITS"
                          : item.kind === "stills"
                            ? "PHOTOGRAPHY"
                            : "EXECUTION REPORT"}
                    </span>
                    <h3>{item.label}</h3>
                    {arrow}
                  </a>
                ))}
              </div>
              <p className="small-copy">
                Delivery links may open an external storage provider. Use the
                agreed review process for your included consolidated revision
                round.
              </p>
              <a
                className="text-button"
                href={`${contact}&body=${encodeURIComponent("Hello AICANFEEL,\n\nMy consolidated review notes for booking " + id + ":\n\n")}`}
              >
                Send consolidated review notes
              </a>
            </section>
          )}
          {tracking?.tracking && (
            <section className="portal-campaign-report">
              <div>
                <h2>Your campaign link.</h2>
                <p>{tracking.tracking.label}</p>
                <a
                  className="portal-public-link"
                  href={tracking.tracking.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tracking.tracking.publicUrl}
                </a>
                <p className="small-copy">
                  {tracking.tracking.enabled
                    ? "This link is active."
                    : "This campaign link is disabled."}{" "}
                  The production team controls the approved destination.
                </p>
                <div className="portal-scan-count">
                  <strong>{tracking.metrics?.redirectRequests || 0}</strong>
                  <span>Redirect requests</span>
                </div>
                <p className="small-copy">{tracking.metrics?.definition}</p>
                {tracking.metrics?.days?.length > 0 && (
                  <table className="tracking-table">
                    <thead>
                      <tr>
                        <th>UTC date</th>
                        <th>Requests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracking.metrics.days.map((day: Data) => (
                        <tr key={day.date}>
                          <td>{day.date}</td>
                          <td>{day.redirectRequests}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {qr && (
                <div className="portal-qr">
                  <img
                    src={qr}
                    alt="Functional QR code for your approved campaign destination"
                  />
                  <a
                    className="text-button"
                    href={qr}
                    download={`aicanfeel-${id}-qr.png`}
                  >
                    Download campaign QR
                  </a>
                  <p className="small-copy">
                    Scan-test the printed code and destination before your
                    activation.
                  </p>
                </div>
              )}
            </section>
          )}
        </>
      )}
      <Link href="/campaigns" className="action portal-back">
        Back to the campaign collection {arrow}
      </Link>
      {footer}
    </div>
  );
}
