"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { campaignById } from "../lib/campaigns";

type RecordData = Record<string, any>;
type DeliveryItem = {
  kind: "film" | "vertical" | "stills" | "report";
  label: string;
  url: string;
};
type DeskRequest = { token: string; controller: AbortController };
const arrow = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19 19 5M5 5h14v14" />
  </svg>
);
const formats = (amount: number, currency = "USD") =>
  new Intl.NumberFormat(currency === "GBP" ? "en-GB" : "en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
function downloadBlob(content: string, type: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function OwnerDesk() {
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [token, setToken] = useState("");
  const [items, setItems] = useState<RecordData[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<number | null>(null);
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [tracking, setTracking] = useState<RecordData | null>(null);
  const [qr, setQr] = useState("");
  const [receipt, setReceipt] = useState("");
  const [invalidate, setInvalidate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [health, setHealth] = useState<RecordData | null>(null);
  const [supplierCost, setSupplierCost] = useState("");
  const [netQuote, setNetQuote] = useState("");
  const mounted = useRef(true);
  const activeRequest = useRef<DeskRequest | null>(null);
  const selectionVersion = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      selectionVersion.current += 1;
      activeRequest.current?.controller.abort();
      activeRequest.current = null;
    };
  }, []);

  // A response belongs to the interaction that started it, even when an
  // aborted transport still resolves. A newer action or signout revokes it.
  function isCurrent(request: DeskRequest) {
    return (
      mounted.current &&
      activeRequest.current === request &&
      !request.controller.signal.aborted
    );
  }
  function beginRequest(): DeskRequest {
    activeRequest.current?.controller.abort();
    const request = { token, controller: new AbortController() };
    activeRequest.current = request;
    return request;
  }
  function cancelPending() {
    activeRequest.current?.controller.abort();
    activeRequest.current = null;
    setBusy(false);
  }
  function clearSelection() {
    selectionVersion.current += 1;
    setSelected(null);
    setTracking(null);
    setDeliveryItems([]);
    setReceipt("");
    setQr("");
    setInvalidate(false);
    setSupplierCost("");
    setNetQuote("");
  }
  function closeRequest() {
    cancelPending();
    clearSelection();
    setError("");
    setNotice("");
  }
  function signOut() {
    closeRequest();
    setToken("");
    setLoaded(false);
    setItems([]);
    setCursor(null);
    setHealth(null);
    setFilter("");
    setSearch("");
  }

  async function api(
    path: string,
    request: DeskRequest,
    body?: RecordData,
    method = body ? "POST" : "GET",
  ) {
    if (!isCurrent(request))
      throw new DOMException("Request cancelled", "AbortError");
    const r = await fetch(path, {
      method,
      headers: {
        Authorization: `Bearer ${request.token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      signal: request.controller.signal,
    });
    const d = (await r.json()) as RecordData;
    if (!isCurrent(request))
      throw new DOMException("Request cancelled", "AbortError");
    if (!r.ok)
      throw new Error(
        d.error || "The production desk could not complete that action.",
      );
    return d;
  }
  async function load(append = false, request = beginRequest()) {
    if (!isCurrent(request)) return;
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      if (append && cursor) params.set("cursor", String(cursor));
      const d = await api("/api/admin/bookings?" + params, request);
      if (!isCurrent(request)) return;
      setItems((old) =>
        append
          ? [
              ...old,
              ...d.bookings.filter(
                (n: RecordData) =>
                  !old.some((o) => o.bookingId === n.bookingId),
              ),
            ]
          : d.bookings || [],
      );
      setCursor(d.nextCursor || null);
      setLoaded(true);
      const h = (await fetch("/api/health", {
        signal: request.controller.signal,
      }).then((r) => r.json())) as RecordData;
      if (isCurrent(request)) setHealth(h);
    } catch (e) {
      if (isCurrent(request))
        setError(
          e instanceof Error ? e.message : "Unable to open production desk.",
        );
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  async function choose(record: RecordData) {
    const request = beginRequest();
    clearSelection();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const [d, campaignTracking] = await Promise.all([
        api(`/api/admin/bookings/${record.bookingId}`, request),
        api(`/api/admin/bookings/${record.bookingId}/tracking`, request),
      ]);
      if (!isCurrent(request)) return;
      setSelected(d);
      setDeliveryItems(d.deliverables || []);
      setTracking(campaignTracking);
    } catch (e) {
      if (isCurrent(request))
        setError(e instanceof Error ? e.message : "Unable to open request.");
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  useEffect(() => {
    let alive = true;
    const version = selectionVersion.current;
    const current = () =>
      alive && mounted.current && version === selectionVersion.current;
    const url = tracking?.tracking?.publicUrl;
    if (!url) return; // clearSelection already removes the previous QR.
    import("qrcode")
      .then(async (m) => {
        const q = await m.toDataURL(url, {
          width: 480,
          margin: 3,
          errorCorrectionLevel: "M",
          color: { dark: "#111111", light: "#ffffff" },
        });
        if (current()) setQr(q);
      })
      .catch(() => {
        if (current()) setQr("");
      });
    return () => {
      alive = false;
    };
  }, [tracking, selected?.bookingId]);
  async function saveQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const request = beginRequest();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const amount = Number(f.get("approvedTotal"));
      const body: RecordData = {
        status: f.get("status") || selected.status,
        quoteSummary: f.get("quoteSummary"),
        customerMessage: f.get("customerMessage"),
        internalNotes: f.get("internalNotes"),
        scopeConfirmed: f.get("scopeConfirmed") === "on",
      };
      if (amount > 0) body.approvedTotalCents = Math.round(amount * 100);
      const date = f.get("confirmedDate");
      if (date) body.confirmedDate = date;
      const d = await api(
        `/api/admin/bookings/${selected.bookingId}`,
        request,
        body,
        "PATCH",
      );
      if (!isCurrent(request)) return;
      setSelected(d);
      setNotice("Production decision saved.");
      await load(false, request);
    } catch (e) {
      if (isCurrent(request))
        setError(
          e instanceof Error
            ? e.message
            : "Unable to save production decision.",
        );
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  async function saveTracking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const request = beginRequest();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const d = await api(
        `/api/admin/bookings/${selected.bookingId}/tracking`,
        request,
        {
          destination: f.get("destination"),
          label: f.get("label"),
          enabled: f.get("enabled") === "on",
        },
      );
      if (!isCurrent(request)) return;
      setTracking(d);
      setNotice(
        "Campaign destination saved. Test the final QR before printing.",
      );
    } catch (e) {
      if (isCurrent(request))
        setError(
          e instanceof Error
            ? e.message
            : "Unable to save campaign destination.",
        );
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  async function rotateLink() {
    if (!selected || !invalidate) return;
    const request = beginRequest();
    setBusy(true);
    setError("");
    try {
      const d = await api(
        `/api/admin/bookings/${selected.bookingId}/access-link`,
        request,
        { confirmInvalidatePrevious: true },
      );
      if (!isCurrent(request)) return;
      setReceipt(new URL(d.reviewUrl, location.origin).href);
      setInvalidate(false);
      setNotice(
        "A replacement private link is ready. Previous links have been revoked.",
      );
    } catch (e) {
      if (isCurrent(request))
        setError(
          e instanceof Error ? e.message : "Unable to replace private link.",
        );
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  async function recordPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const request = beginRequest();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const d = await api(
        `/api/admin/bookings/${selected.bookingId}/offline-payment`,
        request,
        {
          confirmFundsReceived: f.get("confirmFundsReceived") === "on",
          confirmScopeAccepted: f.get("confirmScopeAccepted") === "on",
          approvedQuoteVersion: selected.quoteVersion,
          amountCents: Math.round(Number(f.get("amount")) * 100),
          currency: selected.currency,
          reference: f.get("reference"),
          method: f.get("method"),
        },
      );
      if (!isCurrent(request)) return;
      setSelected(d);
      setNotice(
        "Deposit receipt recorded by the production team. This is a manual record, not payment-provider verification.",
      );
      await load(false, request);
    } catch (e) {
      if (isCurrent(request))
        setError(e instanceof Error ? e.message : "Unable to record deposit.");
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  async function shareDeliveries(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const request = beginRequest();
    setBusy(true);
    setError("");
    try {
      const d = await api(
        `/api/admin/bookings/${selected.bookingId}/deliverables`,
        request,
        { items: deliveryItems },
      );
      if (!isCurrent(request)) return;
      setSelected(d.booking || d);
      setDeliveryItems((d.booking || d).deliverables || []);
      setNotice(
        deliveryItems.length
          ? "Delivery links are shared on the private customer page."
          : "Delivery links have been cleared.",
      );
      await load(false, request);
    } catch (e) {
      if (isCurrent(request))
        setError(
          e instanceof Error
            ? e.message
            : "Delivery links could not be shared.",
        );
    } finally {
      if (isCurrent(request)) setBusy(false);
    }
  }
  function exportCSV() {
    const columns = [
      "bookingId",
      "brandName",
      "campaignName",
      "city",
      "desiredDate",
      "status",
      "contactName",
      "email",
      "currency",
      "estimatedTotalCents",
      "approvedTotalCents",
      "paymentStatus",
    ];
    const rows = [
      columns.map(csvCell).join(","),
      ...items.map((b) => columns.map((k) => csvCell(b[k])).join(",")),
    ].join("\r\n");
    downloadBlob(
      rows,
      "text/csv;charset=utf-8",
      "aicanfeel-production-requests.csv",
    );
  }
  async function qrSVG() {
    if (!selected || !tracking?.tracking?.publicUrl) return;
    const version = selectionVersion.current;
    const bookingId = selected.bookingId;
    const publicUrl = tracking.tracking.publicUrl;
    const m = await import("qrcode");
    if (!mounted.current || version !== selectionVersion.current) return;
    const svg = await m.toString(publicUrl, {
      type: "svg",
      margin: 3,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    });
    if (!mounted.current || version !== selectionVersion.current) return;
    downloadBlob(svg, "image/svg+xml", `aicanfeel-${bookingId}-qr.svg`);
  }
  async function copyText(value: string, message: string) {
    const version = selectionVersion.current;
    try {
      await navigator.clipboard.writeText(value);
      if (mounted.current && version === selectionVersion.current)
        setNotice(message);
    } catch {
      if (mounted.current && version === selectionVersion.current)
        setError(
          "The link could not be copied. Copy it from the displayed field.",
        );
    }
  }
  const visible = items.filter(
    (b) =>
      !search ||
      `${b.brandName} ${b.contactName} ${b.email} ${b.campaignName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const campaign = campaignById(selected?.campaignSlug || "");
  const paid = Number(selected?.paidAmountCents || 0) > 0;
  const approved = [
    "approved",
    "deposit_paid",
    "scheduled",
    "completed",
  ].includes(selected?.status || "");
  const draftScope = campaign
    ? `${campaign.name} — ${campaign.duration}.\n${campaign.physical}\n\nIncluded:\n${campaign.included.map((v) => "• " + v).join("\n")}\n\nQuoted separately: ${campaign.exclusions.join("; ")}.\nFinal site, approved artwork, usage licence, weather plan, total including applicable tax and delivery schedule follow the signed production agreement.`
    : "";
  const contribution =
    Number(netQuote) > 0 && Number(supplierCost) >= 0 && supplierCost !== ""
      ? ((Number(netQuote) - Number(supplierCost)) / Number(netQuote)) * 100
      : null;
  const mailBody = selected
    ? `Hello ${selected.contactName},\n\nAn update on your AICANFEEL production request ${selected.bookingId}:\n\n${selected.customerMessage || "We are reviewing your preferred date, location and production scope."}\n\n${selected.quoteSummary || ""}\n\n${selected.approvedTotalCents ? "Approved production total: " + formats(selected.approvedTotalCents, selected.currency) + "\nProduction deposit: " + formats(selected.depositAmountCents, selected.currency) + "\n" : ""}${receipt ? "Your private production page: " + receipt : "Please keep your original private booking link to view the current status."}\n\nAICANFEEL production team`
    : "";
  return (
    <div className="page-wrap owner-page">
      <h1>Production desk.</h1>
      <p className="small-copy">
        Owner access. Customer briefs, approved scopes and campaign delivery.
      </p>
      {!loaded ? (
        <form
          method="post"
          className="owner-login"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <label>
            Production access key
            <input
              type="password"
              value={token}
              onChange={(e) => {
                cancelPending();
                setToken(e.target.value);
              }}
              autoComplete="off"
              required
              minLength={32}
            />
          </label>
          <button className="action" disabled={busy}>
            {busy ? "Opening…" : "Open production desk"}
            {arrow}
          </button>
          <p className="small-copy">
            The access key stays in memory and is cleared when you sign out or
            close this page.
          </p>
        </form>
      ) : (
        <>
          <div className="desk-readiness">
            <span>
              Database{" "}
              <b>
                {health?.databaseReady ? "Connected" : "Check configuration"}
              </b>
            </span>
            <span>
              Card deposits{" "}
              <b>{health?.paymentsReady ? "Connected" : "Not connected"}</b>
            </span>
            <span>
              Invoice deposits <b>Manual receipt workflow</b>
            </span>
          </div>
          <div className="owner-toolbar">
            <label>
              Status
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All requests</option>
                {[
                  "requested",
                  "reviewing",
                  "approved",
                  "deposit_paid",
                  "scheduled",
                  "completed",
                  "cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="text-button"
              onClick={() => load()}
              disabled={busy}
            >
              Apply / refresh
            </button>
            <button className="text-button" onClick={exportCSV}>
              Export loaded requests
            </button>
            <button className="text-button" onClick={signOut}>
              Sign out
            </button>
          </div>
          <label className="desk-search">
            Search loaded requests
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Brand, contact or campaign"
            />
          </label>
          <div className="owner-list">
            {visible.length ? (
              visible.map((b) => (
                <button
                  key={b.bookingId}
                  onClick={() => choose(b)}
                  aria-pressed={selected?.bookingId === b.bookingId}
                >
                  <span>{b.brandName}</span>
                  <span>{b.campaignName}</span>
                  <span>{b.desiredDate}</span>
                  <strong>{b.status.replaceAll("_", " ")}</strong>
                </button>
              ))
            ) : (
              <p>No requests match this view.</p>
            )}
          </div>
          <div className="desk-list-footer">
            <span>{items.length} requests loaded</span>
            {cursor && (
              <button
                className="text-button"
                disabled={busy}
                onClick={() => load(true)}
              >
                Load next 50
              </button>
            )}
          </div>
          {selected && (
            <section className="desk-record" key={selected.bookingId}>
              <div className="desk-record-title">
                <div>
                  <h2>{selected.brandName}</h2>
                  <p>
                    {selected.campaignName} / {selected.city}
                  </p>
                  <span>{selected.bookingId}</span>
                </div>
                <button className="text-button" onClick={closeRequest}>
                  Close request
                </button>
              </div>
              <div className="desk-contact">
                <p>
                  <b>Contact</b>
                  {selected.contactName}
                  <a href={`mailto:${encodeURIComponent(selected.email)}`}>
                    {selected.email}
                  </a>
                  {selected.phone && <span>{selected.phone}</span>}
                </p>
                <p>
                  <b>Preferred date</b>
                  {selected.desiredDate}
                  <span>Requested, until confirmed in scope</span>
                </p>
                <p>
                  <b>Starting estimate</b>
                  {formats(selected.estimatedTotalCents, selected.currency)}
                  <span>Before venue, permits and applicable tax</span>
                </p>
              </div>
              <div className="desk-brief">
                <h3>Customer brief</h3>
                <p>{selected.message || "No additional message."}</p>
                {selected.website && (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Brand website ↗
                  </a>
                )}
              </div>
              <div className="desk-workspace">
                <div>
                  <form
                    method="post"
                    key={`${selected.bookingId}:${selected.updatedAt}:${selected.quoteVersion}:${selected.status}`}
                    className="booking-form desk-quote"
                    onSubmit={saveQuote}
                  >
                    <h3>Production decision</h3>
                    <label>
                      Status
                      <select name="status" defaultValue={selected.status}>
                        <option value="requested">Requested</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="approved">Approved</option>
                        <option value="deposit_paid" disabled>
                          Deposit recorded
                        </option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>
                    <div className="form-pair">
                      <label>
                        Final total, including applicable tax (
                        {selected.currency})
                        <input
                          name="approvedTotal"
                          type="number"
                          min="100"
                          max="500000"
                          step=".01"
                          defaultValue={
                            selected.approvedTotal ||
                            selected.estimatedTotalCents / 100
                          }
                        />
                      </label>
                      <label>
                        Confirmed production date
                        <input
                          name="confirmedDate"
                          type="date"
                          defaultValue={
                            selected.confirmedDate || selected.desiredDate
                          }
                        />
                      </label>
                    </div>
                    <label>
                      Customer-visible production scope
                      <textarea
                        name="quoteSummary"
                        rows={10}
                        minLength={20}
                        required
                        defaultValue={selected.quoteSummary || draftScope}
                      />
                    </label>
                    <label>
                      Customer update
                      <textarea
                        name="customerMessage"
                        rows={3}
                        defaultValue={selected.customerMessage || ""}
                      />
                    </label>
                    <label>
                      Internal notes
                      <textarea
                        name="internalNotes"
                        rows={4}
                        defaultValue={selected.internalNotes || ""}
                      />
                    </label>
                    <label className="consent">
                      <input name="scopeConfirmed" type="checkbox" />
                      <span>
                        The written scope, date, location, permissions, rights
                        and complete price have been agreed with the customer.
                      </span>
                    </label>
                    <button className="action" disabled={busy}>
                      Save production decision {arrow}
                    </button>
                    <p className="small-copy">
                      Approval enables the agreed 50% deposit stage. Mark a
                      production scheduled only after a real deposit is
                      recorded. Changes to a paid scope require a separate
                      change order.
                    </p>
                  </form>
                  <section className="desk-cost">
                    <h3>Check delivery economics</h3>
                    <p>
                      Draft calculation only. Use supplier quotes and values
                      before tax.
                    </p>
                    <div className="form-pair">
                      <label>
                        Production quote before tax
                        <input
                          type="number"
                          min="0"
                          step=".01"
                          value={netQuote}
                          onChange={(e) => setNetQuote(e.target.value)}
                        />
                      </label>
                      <label>
                        Delivery supplier costs
                        <input
                          type="number"
                          min="0"
                          step=".01"
                          value={supplierCost}
                          onChange={(e) => setSupplierCost(e.target.value)}
                        />
                      </label>
                    </div>
                    {contribution !== null && (
                      <p className={contribution < 30 ? "cost-warning" : ""}>
                        Modeled gross contribution:{" "}
                        <strong>{contribution.toFixed(1)}%</strong> ·{" "}
                        {contribution < 30
                          ? "Below the 30% planning target. Review the price or production scope."
                          : "At or above the 30% planning target."}
                      </p>
                    )}
                    <p className="small-copy">
                      Contribution precedes advertising, sales, overhead and
                      business tax. This calculation is not saved as a supplier
                      quote.
                    </p>
                  </section>
                </div>
                <aside className="desk-side">
                  <section>
                    <h3>Customer communication</h3>
                    <p>
                      Open an editable email draft in your mail app. Nothing is
                      sent automatically.
                    </p>
                    <a
                      className="action"
                      href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent("Your AICANFEEL campaign · " + selected.bookingId)}&body=${encodeURIComponent(mailBody)}`}
                    >
                      Open customer email draft {arrow}
                    </a>
                    <details className="desk-receipt">
                      <summary>Replace a lost private booking link</summary>
                      <p>
                        This revokes all previous customer access links. Send
                        the replacement only to the verified booking contact.
                      </p>
                      <label className="consent">
                        <input
                          type="checkbox"
                          checked={invalidate}
                          onChange={(e) => setInvalidate(e.target.checked)}
                        />
                        <span>
                          Revoke previous links and create a replacement.
                        </span>
                      </label>
                      <button
                        className="text-button"
                        disabled={busy || !invalidate}
                        onClick={rotateLink}
                      >
                        Create replacement private link
                      </button>
                      {receipt && (
                        <div className="private-link-result">
                          <input
                            readOnly
                            value={receipt}
                            aria-label="Replacement private booking link"
                          />
                          <button
                            className="text-button"
                            onClick={() =>
                              copyText(receipt, "Private link copied.")
                            }
                          >
                            Copy private link
                          </button>
                        </div>
                      )}
                    </details>
                  </section>
                  <section>
                    <h3>Deposit record</h3>
                    {paid ? (
                      <>
                        <p>
                          {formats(selected.paidAmountCents, selected.currency)}{" "}
                          received
                        </p>
                        <p className="small-copy">
                          {selected.paymentVerifiedByProvider
                            ? "Verified by the payment provider."
                            : "Receipt recorded manually by the production team."}
                          <br />
                          {selected.paymentSource?.replaceAll("_", " ")}
                          {selected.paymentReference
                            ? " · " + selected.paymentReference
                            : ""}
                        </p>
                      </>
                    ) : selected.status === "approved" ? (
                      <>
                        <p>
                          Expected deposit:{" "}
                          {formats(
                            selected.depositAmountCents,
                            selected.currency,
                          )}
                        </p>
                        <form method="post" className="booking-form" onSubmit={recordPayment}>
                          <label>
                            Amount actually received ({selected.currency})
                            <input
                              name="amount"
                              type="number"
                              required
                              min="1"
                              step=".01"
                            />
                          </label>
                          <label>
                            Receipt method
                            <select name="method" required defaultValue="">
                              <option value="" disabled>
                                Choose the actual method
                              </option>
                              <option value="bank">Bank transfer</option>
                              <option value="invoice">
                                External invoice payment
                              </option>
                            </select>
                          </label>
                          <label>
                            Settled payment reference
                            <input
                              name="reference"
                              required
                              minLength={8}
                              maxLength={200}
                            />
                          </label>
                          <label className="consent">
                            <input
                              type="checkbox"
                              name="confirmScopeAccepted"
                              required
                            />
                            <span>
                              The customer has accepted quote version{" "}
                              {selected.quoteVersion}.
                            </span>
                          </label>
                          <label className="consent">
                            <input
                              type="checkbox"
                              name="confirmFundsReceived"
                              required
                            />
                            <span>
                              I verified that these funds have actually settled.
                              This action does not collect money.
                            </span>
                          </label>
                          <button className="action" disabled={busy}>
                            Record settled deposit {arrow}
                          </button>
                        </form>
                      </>
                    ) : (
                      <p>
                        Approve the final scope before requesting or recording a
                        deposit.
                      </p>
                    )}
                  </section>
                  <section>
                    <h3>Production timeline</h3>
                    <ol className="desk-timeline">
                      {selected.timeline?.length ? (
                        selected.timeline.map(
                          (event: RecordData, i: number) => (
                            <li key={`${event.at}-${i}`}>
                              <strong>{event.label}</strong>
                              <span>{new Date(event.at).toLocaleString()}</span>
                              <p>{event.note}</p>
                            </li>
                          ),
                        )
                      ) : (
                        <li>Brief received. Production review pending.</li>
                      )}
                    </ol>
                  </section>
                </aside>
              </div>
              <section className="desk-tracking">
                <div>
                  <h3>Campaign QR &amp; visit report</h3>
                  <p>
                    Publish an approved HTTPS destination. The downloadable code
                    points to the tracked link; you can change its destination
                    later.
                  </p>
                  {!approved && (
                    <p className="small-copy">
                      Destination publishing becomes available after scope
                      approval.
                    </p>
                  )}
                  <form
                    method="post"
                    className="booking-form"
                    onSubmit={saveTracking}
                    key={tracking?.tracking?.destination || "new"}
                  >
                    <label>
                      Campaign destination
                      <input
                        name="destination"
                        type="url"
                        placeholder="https://yourbrand.com/campaign"
                        required
                        defaultValue={
                          tracking?.tracking?.destination ||
                          selected.website ||
                          ""
                        }
                      />
                    </label>
                    <label>
                      Link label
                      <input
                        name="label"
                        defaultValue={
                          tracking?.tracking?.label ||
                          `${selected.brandName} campaign`
                        }
                        required
                        maxLength={120}
                      />
                    </label>
                    <label className="consent">
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={
                          tracking?.tracking ? tracking.tracking.enabled : true
                        }
                      />
                      <span>Enable this campaign link.</span>
                    </label>
                    <button className="action" disabled={busy || !approved}>
                      Save campaign destination {arrow}
                    </button>
                  </form>
                </div>
                <div>
                  {tracking?.tracking && (
                    <>
                      <div className="tracking-link">
                        <span>Tracked campaign link</span>
                        <a
                          href={tracking.tracking.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {tracking.tracking.publicUrl}
                        </a>
                        <p>
                          {tracking.tracking.enabled ? "Active" : "Disabled"}
                        </p>
                      </div>
                      {qr && (
                        <div className="qr-download">
                          <img
                            src={qr}
                            alt={`Functional QR code for ${selected.brandName}'s approved campaign link`}
                          />
                          <div>
                            <a
                              className="text-button"
                              href={qr}
                              download={`aicanfeel-${selected.bookingId}-qr.png`}
                            >
                              Download PNG
                            </a>
                            <button className="text-button" onClick={qrSVG}>
                              Download SVG
                            </button>
                            <button
                              className="text-button"
                              onClick={() =>
                                copyText(
                                  tracking.tracking.publicUrl,
                                  "Campaign link copied.",
                                )
                              }
                            >
                              Copy tracked link
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="tracking-count">
                        <strong>
                          {tracking.metrics?.redirectRequests || 0}
                        </strong>{" "}
                        redirect requests
                      </p>
                      <p className="small-copy">
                        {tracking.metrics?.definition}
                      </p>
                      {tracking.metrics?.days?.length > 0 && (
                        <table className="tracking-table">
                          <thead>
                            <tr>
                              <th>UTC date</th>
                              <th>Requests</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tracking.metrics.days.map((day: RecordData) => (
                              <tr key={day.date}>
                                <td>{day.date}</td>
                                <td>{day.redirectRequests}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <p className="small-copy">{tracking.privacy}</p>
                    </>
                  )}
                </div>
              </section>
              <section className="desk-deliveries">
                <div>
                  <h3>Share the finished campaign</h3>
                  <p>
                    Add the actual film, vertical-edit, stills or
                    execution-report links. The customer can open them from
                    their private booking page.
                  </p>
                  <p className="small-copy">
                    Use approved HTTPS storage links and test the customer’s
                    access before sharing. This form shares links; it does not
                    upload or verify the files.
                  </p>
                </div>
                <form method="post" className="booking-form" onSubmit={shareDeliveries}>
                  {deliveryItems.map((item, index) => (
                    <div className="delivery-editor" key={index}>
                      <div className="form-pair">
                        <label>
                          Delivery type
                          <select
                            value={item.kind}
                            onChange={(e) =>
                              setDeliveryItems((items) =>
                                items.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        kind: e.target
                                          .value as DeliveryItem["kind"],
                                      }
                                    : v,
                                ),
                              )
                            }
                          >
                            <option value="film">Cinematic film</option>
                            <option value="vertical">Vertical edits</option>
                            <option value="stills">Edited stills</option>
                            <option value="report">Execution report</option>
                          </select>
                        </label>
                        <label>
                          File label
                          <input
                            required
                            minLength={2}
                            maxLength={100}
                            value={item.label}
                            onChange={(e) =>
                              setDeliveryItems((items) =>
                                items.map((v, i) =>
                                  i === index
                                    ? { ...v, label: e.target.value }
                                    : v,
                                ),
                              )
                            }
                          />
                        </label>
                      </div>
                      <label>
                        HTTPS delivery link
                        <input
                          required
                          type="url"
                          placeholder="https://"
                          value={item.url}
                          onChange={(e) =>
                            setDeliveryItems((items) =>
                              items.map((v, i) =>
                                i === index ? { ...v, url: e.target.value } : v,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() =>
                          setDeliveryItems((items) =>
                            items.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove this delivery
                      </button>
                    </div>
                  ))}
                  <div className="delivery-editor-actions">
                    <button
                      type="button"
                      className="text-button"
                      disabled={deliveryItems.length >= 12}
                      onClick={() =>
                        setDeliveryItems((items) => [
                          ...items,
                          { kind: "film", label: "", url: "" },
                        ])
                      }
                    >
                      Add delivery link
                    </button>
                    <span>{deliveryItems.length} / 12 links</span>
                  </div>
                  <button
                    className="action"
                    type="submit"
                    disabled={busy || !approved}
                  >
                    {deliveryItems.length
                      ? "Share delivery links"
                      : "Clear shared delivery links"}
                    {arrow}
                  </button>
                  {!approved && (
                    <p className="small-copy">
                      Approve the production scope before sharing delivery
                      files.
                    </p>
                  )}
                </form>
              </section>
            </section>
          )}
        </>
      )}
      {busy && (
        <p className="desk-working" role="status">
          Updating production desk…
        </p>
      )}
      {notice && (
        <p className="desk-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="form-error desk-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
