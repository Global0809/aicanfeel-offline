"use client";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import Link from "./SiteLink";
import { siteUrl } from "../lib/site-url";
import dynamic from "next/dynamic";
import CampaignReel from "./CampaignReel";
import BookingPortal from "./BookingPortal";
import {
  campaigns,
  campaignById,
  cityInfo,
  commonFAQ,
  coverPhoto,
  money,
  photo,
  price,
  shotLabels,
  type Campaign,
  type City,
} from "../lib/campaigns";
import { campaignMotion, mountCampaignMotions } from "../lib/motion.js";

const OwnerDesk = dynamic(() => import("./OwnerDesk"), {
  loading: () => (
    <div className="page-wrap">
      <p>Opening production desk…</p>
    </div>
  ),
});

function TapeCounter() {
  const [elapsed, setElapsed] = useState("00:00:00");
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      setElapsed(
        [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
          .map((v) => String(v).padStart(2, "0"))
          .join(":"),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="timecode">{elapsed}</span>;
}
function CityClock({ city, onChange }: { city: City; onChange: () => void }) {
  const [clock, setClock] = useState("--:--");
  useEffect(() => {
    const update = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: cityInfo[city].timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [city]);
  return (
    <button
      className="location-clock"
      onClick={onChange}
      title="Switch New York / London"
      aria-label={`Campaign market: ${cityInfo[city].name}. Switch to ${city === "london" ? "New York" : "London"}.`}
    >
      {clock} <span>{city === "london" ? "LDN" : "NYC"}</span>
      <span className="clock-switch" aria-hidden="true">
        {" "}
        ↔
      </span>
    </button>
  );
}

async function jsonResult(response: Response): Promise<Record<string, any>> {
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "The production desk is temporarily unavailable. Please try again.",
    );
  const value: unknown = await response.json();
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(
      "The server returned an incomplete response. Please try again.",
    );
  return value as Record<string, any>;
}

type View =
  | "home"
  | "campaigns"
  | "campaign"
  | "how"
  | "about"
  | "book"
  | "booking"
  | "terms"
  | "privacy"
  | "studio";
type StudioProps = { view: View; slug?: string; bookingId?: string };
type SceneHandle = { setIndex: (index: number) => void; destroy: () => void };
const arrow = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19 19 5M5 5h14v14" />
  </svg>
);
const chevron = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m14 5-7 7 7 7" />
  </svg>
);
function Wordmark() {
  return (
    <span className="wordmark">
      <svg className="spectrum" viewBox="0 0 46 26" aria-hidden="true">
        <path fill="#5864cb" d="M10 1h35l-2 4H8z" />
        <path fill="#4f93b8" d="M8 6h35l-2 4H6z" />
        <path fill="#a8bb69" d="M6 11h35l-2 4H4z" />
        <path fill="#d9a351" d="M4 16h35l-2 4H2z" />
        <path fill="#b45c4a" d="M2 21h35l-2 4H0z" />
      </svg>
      <span>AICANFEEL</span>
    </span>
  );
}
function Action({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`action ${className}`} prefetch={false}>
      <span>{children}</span>
      {arrow}
    </Link>
  );
}

export default function Studio({ view, slug, bookingId }: StudioProps) {
  const [city, setCity] = useState<City>("new-york");
  const [bw, setBw] = useState(false);
  const [selected, setSelected] = useState(0);
  const [motion, setMotion] = useState(true);
  const [campaignMode, setCampaignMode] = useState<"reel" | "overview">("reel");
  const screenRef = useRef<HTMLDivElement>(null);
  const campaign = campaignById(slug || "") || campaigns[selected];
  useEffect(() => {
    try {
      const query = new URLSearchParams(location.search);
      const requested =
        query.get("city") === "london" ||
        query.get("market")?.toUpperCase() === "UK"
          ? "london"
          : query.get("city") === "new-york" ||
              query.get("market")?.toUpperCase() === "US"
            ? "new-york"
            : null;
      const c = requested || localStorage.getItem("aicanfeel-city");
      if (c === "london" || c === "new-york") setCity(c);
      if(requested)localStorage.setItem('aicanfeel-city',requested);
      const saved = Number(sessionStorage.getItem("aicanfeel-selected-tape"));
      if (Number.isInteger(saved) && saved >= 0 && saved < campaigns.length)
        setSelected(saved);
      setBw(localStorage.getItem("aicanfeel-bw") === "1");
    } catch {}
    setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("aicanfeel-selected-tape", String(selected));
    } catch {}
  }, [selected]);
  const chooseCity = (next: City) => {
    setCity(next);
    try {
      localStorage.setItem("aicanfeel-city", next);
    } catch {}
  };
  const toggleBw = () =>
    setBw((old) => {
      try {
        localStorage.setItem("aicanfeel-bw", old ? "0" : "1");
      } catch {}
      return !old;
    });
  useEffect(() => {
    if (view !== "home") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,select,textarea,button,a"))
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected((i) => (i + 1) % campaigns.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected((i) => (i + campaigns.length - 1) % campaigns.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);
  useEffect(() => {
    screenRef.current?.scrollTo(0, 0);
    setCampaignMode("reel");
    if(view==='campaign'&&slug){const index=campaigns.findIndex(c=>c.id===slug);if(index>=0)setSelected(index)}
  }, [view, slug]);
  const next = (amount: number) =>
    setSelected((i) => (i + amount + campaigns.length) % campaigns.length);
  return (
    <div
      className={`television ${bw ? "is-bw" : ""} ${view === "home" ? "is-home" : "is-inside"} ${!motion ? "motion-off" : ""}`}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="screen-shell">
        <div className="screen-colour">
          <header className="tv-header">
            <div className="header-left">
              <Link
                href="/"
                aria-current={view === "home" ? "page" : undefined}
                prefetch={false}
              >
                Home
              </Link>
              <TapeCounter />
            </div>
            <Link
              href="/"
              className="logo-link"
              aria-label="AICANFEEL home"
              prefetch={false}
            >
              <Wordmark />
              <span className="logo-caption">
                <span>OFFLINE STUDIO</span>
                <span>2026</span>
              </span>
            </Link>
            <nav aria-label="Main navigation">
              <Link
                href="/campaigns"
                aria-current={
                  view === "campaigns" || view === "campaign"
                    ? "page"
                    : undefined
                }
                prefetch={false}
              >
                Campaigns
              </Link>
              <Link
                href="/how-it-works"
                aria-current={view === "how" ? "page" : undefined}
                prefetch={false}
              >
                <span className="desktop-label">How it works</span>
                <span className="mobile-label">How</span>
              </Link>
              <Link
                href="/about"
                aria-current={view === "about" ? "page" : undefined}
                prefetch={false}
              >
                Studio
              </Link>
            </nav>
          </header>
          {view === "home" ? (
            <main id="main-content" className="home-stage">
              <div className="home-intro">
                <h1>Put your brand out there.</h1>
                <p>
                  10 offline campaigns. New York / London.
                  <br />
                  Real filmmaker + scheduled Instagram Live.
                </p>
              </div>
              <TapeDeck
                index={selected}
                onSelect={setSelected}
                onOpen={(index) =>
                  window.location.assign(siteUrl(`/campaign/${campaigns[index].id}`))
                }
                motion={motion}
              />
              <button
                className="deck-arrow previous"
                onClick={() => next(-1)}
                aria-label="Previous campaign"
              >
                {chevron}
              </button>
              <button
                className="deck-arrow next"
                onClick={() => next(1)}
                aria-label="Next campaign"
              >
                {chevron}
              </button>
              <div
                className="deck-caption"
                key={campaign.id}
                aria-live="polite"
              >
                <span className="deck-number">
                  CAMPAIGN {campaign.number} / 10
                </span>
                <h2>{campaign.name}</h2>
                <p>{campaign.tagline}</p>
                <Link
                  className="deck-explore"
                  href={`/campaign/${campaign.id}`}
                  prefetch={false}
                >
                  Explore campaign · from {money(price(campaign, city), city)}{" "}
                  {arrow}
                </Link>
              </div>
              <div className="deck-bottom">
                <span>DRAG / SCROLL / ARROW KEYS</span>
                <Link href="/campaigns" prefetch={false}>
                  View all 10 campaigns {arrow}
                </Link>
              </div>
            </main>
          ) : (
            <main
              id="main-content"
              ref={screenRef}
              className={`screen-scroll view-${view} ${view === "campaign" && campaignMode === "reel" ? "has-campaign-reel" : ""}`}
            >
              {view === "campaigns" && (
                <Catalogue city={city} setCity={chooseCity} />
              )}
              {view === "campaign" &&
                (campaignMode === "reel" ? (
                  <CampaignReel
                    campaign={campaign}
                    city={city}
                    onCityChange={chooseCity}
                    preview={<BrandVisualizer campaign={campaign} />}
                    onOverview={() => setCampaignMode("overview")}
                  />
                ) : (
                  <>
                    <div className="campaign-view-switch">
                      <button
                        className="text-button"
                        onClick={() => setCampaignMode("reel")}
                      >
                        Return to campaign reel →
                      </button>
                    </div>
                    <CampaignPage
                      campaign={campaign}
                      city={city}
                      setCity={chooseCity}
                    />
                  </>
                ))}
              {view === "how" && <HowPage />}
              {view === "about" && <AboutPage />}
              {view === "book" && (
                <BookingForm
                  initial={campaign}
                  city={city}
                  setCity={chooseCity}
                />
              )}
              {view === "booking" && <BookingStatus id={bookingId || ""} />}
              {(view === "terms" || view === "privacy") && (
                <LegalPage type={view} />
              )}
              {view === "studio" && <OwnerStudio />}
            </main>
          )}
          <footer className="tv-footer">
            <CityClock
              city={city}
              onChange={() =>
                chooseCity(city === "london" ? "new-york" : "london")
              }
            />
            <button onClick={toggleBw} aria-pressed={bw}>
              B&amp;W [{bw ? "ON" : "OFF"}]
            </button>
            <div className="market-toggle" aria-label="Campaign market">
              <button
                onClick={() => chooseCity("new-york")}
                aria-pressed={city === "new-york"}
              >
                USD / NYC
              </button>
              <span>—</span>
              <button
                onClick={() => chooseCity("london")}
                aria-pressed={city === "london"}
              >
                GBP / LDN
              </button>
            </div>
            <Link href={`/book/${campaign.id}`} prefetch={false}>
              Start a brief {arrow}
            </Link>
          </footer>
        </div>
        <div className="crt-scan" aria-hidden="true" />
        <img
          src={siteUrl("/ui/tv-glass.webp")}
          className="crt-glass"
          alt=""
          aria-hidden="true"
        />
        <div className="crt-vignette" aria-hidden="true" />
      </div>
    </div>
  );
}

function TapeDeck({
  index,
  onSelect,
  onOpen,
  motion,
}: {
  index: number;
  onSelect: (i: number) => void;
  onOpen: (i: number) => void;
  motion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = useRef<SceneHandle | null>(null);
  const currentIndex = useRef(index);
  currentIndex.current = index;
  const [ready, setReady] = useState(false);
  const callbacks = useRef({ onSelect, onOpen });
  callbacks.current = { onSelect, onOpen };
  useEffect(() => {
    let alive = true;
    let cleanup: SceneHandle | null = null;
    import("../lib/tape-scene")
      .then(async (module) => {
        if (!alive || !ref.current) return;
        cleanup = await module.mountTapeScene(
          ref.current,
          campaigns.map((c) => ({ ...c, image: coverPhoto(c) })),
          {
            onSelect: (i: number) => callbacks.current.onSelect(i),
            onOpen: (i: number) => callbacks.current.onOpen(i),
            onReady: () => {
              if (alive) setReady(true);
            },
          },
        );
        handle.current = cleanup;
        cleanup.setIndex(currentIndex.current);
        if (!alive) cleanup.destroy();
      })
      .catch(() => setReady(false));
    return () => {
      alive = false;
      cleanup?.destroy();
      handle.current = null;
    };
  }, []);
  useEffect(() => handle.current?.setIndex(index), [index]);
  return (
    <div className={`tape-deck ${ready ? "is-ready" : ""}`}>
      <div className="deck-fallback" aria-hidden="true">
        <div className="fallback-cassette">
          <div className="fallback-reel" />
          <div className="fallback-reel" />
        </div>
        <div
          className="fallback-sleeve"
          style={{ "--tape-accent": campaigns[index].accent } as CSSProperties}
        >
          <div className="tape-label">AICANFEEL HOME VIDEO</div>
          <img src={coverPhoto(campaigns[index])} alt="" />
          <div className="fallback-title">
            {campaigns[index].tape.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="tape-small">
            VHS / OFFLINE CAMPAIGN / {campaigns[index].number}
          </div>
        </div>
      </div>
      <div
        className="three-mount"
        ref={ref}
        role="img"
        aria-label={`Interactive VHS carousel. Selected: ${campaigns[index].name}. Use the previous and next buttons to choose a campaign.`}
      />
      <Link
        href={`/campaign/${campaigns[index].id}`}
        className="tape-hit-area"
        aria-label={`Explore ${campaigns[index].name}`}
        prefetch={false}
      />
      <ul className="sr-only">
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link href={`/campaign/${c.id}`} prefetch={false}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
function MarketSelect({
  city,
  setCity,
}: {
  city: City;
  setCity: (c: City) => void;
}) {
  return (
    <div className="market-select">
      <label htmlFor="market">Your city</label>
      <select
        id="market"
        value={city}
        onChange={(e) => setCity(e.target.value as City)}
      >
        <option value="new-york">New York · USD</option>
        <option value="london">London · GBP</option>
      </select>
    </div>
  );
}
function Catalogue({
  city,
  setCity,
}: {
  city: City;
  setCity: (c: City) => void;
}) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("curated");
  const shown = useMemo(() => {
    const a = campaigns.filter(
      (c) => filter === "All" || c.category === filter,
    );
    return sort === "price"
      ? [...a].sort((a, b) => price(a, city) - price(b, city))
      : a;
  }, [filter, sort, city]);
  return (
    <div className="page-wrap catalogue">
      <div className="section-heading">
        <div>
          <h1>
            Choose your
            <br />
            <em>real-world moment.</em>
          </h1>
          <p>
            Ten formats. A defined production scope.
            <br />A filmmaker and scheduled Live in every campaign.
          </p>
        </div>
        <MarketSelect city={city} setCity={setCity} />
      </div>
      <div className="catalogue-tools">
        <div className="filter-tabs" aria-label="Filter campaigns">
          {["All", "Fashion", "Street", "Art", "Experience", "Spectacle"].map(
            (f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
                {f === "All" ? " / 10" : ""}
              </button>
            ),
          )}
        </div>
        <label className="sort-control">
          Sort{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="curated">Studio selection</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>
      <div className="campaign-index">
        {shown.map((c) => (
          <Link
            href={`/campaign/${c.id}`}
            className="campaign-row"
            key={c.id}
            prefetch={false}
            style={{ "--campaign-accent": c.accent } as CSSProperties}
          >
            <span className="row-number">{c.number}</span>
            <div className="row-image">
              <img
                src={coverPhoto(c)}
                alt={`${c.name} art direction concept`}
                loading="lazy"
              />
            </div>
            <div className="row-title">
              <span className="row-category">
                {c.category} / {c.duration}
              </span>
              <h2>{c.name}</h2>
              <p>{c.tagline}</p>
            </div>
            <div className="row-price">
              <span>Production from</span>
              <strong>{money(price(c, city), city)}</strong>
              <span>{cityInfo[city].currency}</span>
            </div>
            <span className="row-arrow">{arrow}</span>
          </Link>
        ))}
      </div>
      <p className="catalogue-note">
        Starting production prices. Venue hire, public permits and applicable
        tax are confirmed in your proposal before payment. Concept imagery shows
        creative direction.
      </p>
      <a className="text-button" href={siteUrl("/AICANFEEL-Campaign-Book.pdf")} download>
        Download the campaign collection · PDF {arrow}
      </a>
      <CommonClose />
    </div>
  );
}

function CampaignPage({
  campaign: c,
  city,
  setCity,
}: {
  campaign: Campaign;
  city: City;
  setCity: (c: City) => void;
}) {
  return (
    <article
      className="page-wrap campaign-page"
      style={{ "--campaign-accent": c.accent } as CSSProperties}
    >
      <Link href="/campaigns" className="back-link" prefetch={false}>
        ← All campaigns
      </Link>
      <div className="campaign-opening">
        <div className="campaign-opening-image">
          <img
            src={photo(c, 4)}
            alt={`${c.name}: on-location campaign concept`}
            fetchPriority="high"
          />
          <span className="concept-tag">CAMPAIGN CONCEPT / {c.number}</span>
        </div>
        <div className="campaign-opening-copy">
          <div className="campaign-meta">
            <span>{c.category}</span>
            <span>{c.number} / 10</span>
          </div>
          <h1>{c.name}</h1>
          <p className="campaign-description">{c.description}</p>
          <div className="campaign-pricing">
            <MarketSelect city={city} setCity={setCity} />
            <div>
              <span>Production from</span>
              <strong>{money(price(c, city), city)}</strong>
              <small>
                {cityInfo[city].currency} · before location fees &amp; tax
              </small>
            </div>
          </div>
          <Action href={`/book/${c.id}`}>Build this campaign</Action>
          <p className="booking-note">
            No payment until your date, location and scope are approved.
          </p>
        </div>
      </div>
      <div className="campaign-facts">
        <div>
          <span>Live activation</span>
          <strong>{c.duration}</strong>
        </div>
        <div>
          <span>Your crew</span>
          <strong>{c.crew}</strong>
        </div>
        <div>
          <span>Production planning</span>
          <strong>{c.lead}</strong>
        </div>
        <div>
          <span>Every booking</span>
          <strong>Filmmaker + scheduled Live</strong>
        </div>
      </div>
      <section className="experience-section">
        <h2>
          What actually
          <br />
          <em>happens.</em>
        </h2>
        <div className="experience-steps">
          {c.experience.map((step, i) => (
            <div key={step}>
              <span>0{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="gallery-section">
        <div className="subheading">
          <h2>See the campaign.</h2>
          <p>
            Nine concept photographs. One visual direction.
            <br />
            Your final artwork, casting and location are approved together.
          </p>
        </div>
        <Gallery campaign={c} />
      </section>
      <section className="direction-section">
        <div className="subheading">
          <h2>
            Put your name
            <br />
            <em>in the picture.</em>
          </h2>
          <p>
            Try a colour and brand placement.
            <br />A direction study, before we make it physical.
          </p>
        </div>
        <BrandVisualizer campaign={c} />
      </section>
      <section className="scope-section">
        <div className="scope-heading">
          <h2>
            The production.
            <br />
            <em>Precisely scoped.</em>
          </h2>
          <p>{c.physical}</p>
          <div className="best-for">
            <span>Made for</span>
            {c.bestFor.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>
        <div className="scope-lists">
          <div>
            <h3>Included in your production</h3>
            <ul>
              {c.included.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Quoted separately</h3>
            <ul>
              {c.exclusions.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
            <p>
              Venue and authority permissions, weather fallback and usage rights
              are documented in your final scope. We never promise a public
              location before approval.
            </p>
          </div>
        </div>
      </section>
      <section className="film-section">
        <div className="film-still">
          <img
            src={photo(c, 6)}
            alt="Concept visualization of professional filmmaker coverage"
            loading="lazy"
          />
          <span className="rec-mark">
            <i /> FILM / 4K CAPTURE
          </span>
        </div>
        <div>
          <h2>
            It happens once.
            <br />
            <em>The film keeps working.</em>
          </h2>
          <p>
            A real filmmaker captures the activation. Your delivery includes a
            cinematic hero film, three vertical cuts and fifteen stills, ready
            for your brand channels.
          </p>
          <div className="film-deliverables">
            <span>01 cinematic film</span>
            <span>03 vertical edits</span>
            <span>15 edited stills</span>
            <span>20-minute scheduled Live</span>
          </div>
          <p className="small-copy">
            Instagram Live runs through a dedicated mobile rig, subject to
            account eligibility and connectivity. Smart-glasses POV is used
            where supported and pretested. Recorded coverage is delivered if the
            live connection fails.
          </p>
        </div>
      </section>
      <section className="faq-section">
        <h2>Before you book.</h2>
        <FAQ />
      </section>
      <div className="closing-book">
        <p>{c.tagline}</p>
        <h2>
          Make it
          <br />
          <em>your campaign.</em>
        </h2>
        <Action href={`/book/${c.id}`}>Build this campaign</Action>
        <span>
          From {money(price(c, city), city)} · {cityInfo[city].name}
        </span>
      </div>
      <CommonClose />
    </article>
  );
}

function Gallery({ campaign: c }: { campaign: Campaign }) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (active !== null && !dialog.current?.open) dialog.current?.showModal();
    if (active === null && dialog.current?.open) dialog.current.close();
  }, [active]);
  const move = (delta: number) =>
    setActive((a) => (a === null ? null : (a + delta + 9) % 9));
  return (
    <>
      <div className="photo-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            type="button"
            className={`photo-cell photo-cell-${i + 1}`}
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Open photo ${i + 1}: ${shotLabels[i]}`}
          >
            <img
              src={photo(c, i + 1)}
              alt={`${c.name} — ${shotLabels[i].toLowerCase()}, campaign concept`}
              loading="lazy"
            />
            <span>
              <b>{String(i + 1).padStart(2, "0")}</b>
              {shotLabels[i]}
              {arrow}
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="photo-dialog"
        onCancel={() => setActive(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setActive(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
        aria-label={`${c.name} concept gallery`}
      >
        <button
          className="dialog-close"
          onClick={() => setActive(null)}
          aria-label="Close photo"
        >
          Close [ESC]
        </button>
        {active !== null && (
          <>
            <img
              src={photo(c, active + 1)}
              alt={`${c.name} — ${shotLabels[active]}`}
            />
            <div className="dialog-caption">
              <button onClick={() => move(-1)} aria-label="Previous photo">
                ←
              </button>
              <p>
                {String(active + 1).padStart(2, "0")} / 09 ·{" "}
                {shotLabels[active]}
                <small>Campaign concept visualization</small>
              </p>
              <button onClick={() => move(1)} aria-label="Next photo">
                →
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

function BrandVisualizer({ campaign: c }: { campaign: Campaign }) {
  const [brand, setBrand] = useState("YOUR BRAND");
  const [colour, setColour] = useState(c.accent);
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const previewInk = useMemo(() => {
    const rgb = colour.replace("#", "").match(/.{2}/g)?.map(v => {
      const n = parseInt(v, 16) / 255;
      return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
    }) || [0, 0, 0];
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2] > .179 ? "#101113" : "#ffffff";
  }, [colour]);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId().replaceAll(":", "");
  const svg = useMemo(
    () => campaignMotion(c.id, { title: `${c.name} motion direction`, uid, brand, logo }),
    [c.id, uid, brand, logo],
  );
  // Preserve the SVG node while colour/pause controls update. Replacing its
  // innerHTML would leave the visibility and SMIL observers on a detached SVG.
  const artwork = useMemo(() => (
    <div className="svg-viewport" dangerouslySetInnerHTML={{ __html: svg }} />
  ), [svg]);
  useEffect(() => {
    if (!root.current) return;
    return mountCampaignMotions(root.current);
  }, [svg]);
  return (
    <div className="brand-visualizer">
      <div
        ref={root}
        data-motion-paused={paused}
        className={`motion-preview ${paused ? "is-paused" : ""}`}
        style={{ "--preview-colour": colour, "--preview-ink": previewInk } as CSSProperties}
      >
        {artwork}
        <button className="motion-toggle" onClick={() => setPaused((v) => !v)}>
          {paused ? "Play motion" : "Pause motion"}
        </button>
        <span className="preview-label">
          BRAND PLACEMENT STUDY / NOT FINAL ARTWORK
        </span>
      </div>
      <div className="visualizer-controls">
        <label>
          Brand name
          <input
            value={brand}
            onChange={(e) =>
              setBrand(e.target.value.toUpperCase().slice(0, 24))
            }
            placeholder="YOUR BRAND"
            maxLength={24}
          />
        </label>
        <label>
          Campaign colour
          <div className="colour-control">
            <input
              aria-label="Choose campaign colour"
              type="color"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
            />
            <span>{colour.toUpperCase()}</span>
          </div>
        </label>
        <div className="swatch-list">
          {[...c.palette, "#ece9e1"].map((v, i) => (
            <button
              key={`${v}-${i}`}
              style={{ backgroundColor: v }}
              onClick={() => setColour(v)}
              aria-label={`Use colour ${v}`}
              aria-pressed={colour === v}
            />
          ))}
        </div>
        <label className="upload-label">
          Your logo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 3 * 1024 * 1024) {
                setError("Choose a logo smaller than 3 MB.");
                return;
              }
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(file.type)
              ) {
                setError("Choose a PNG, JPG or WebP logo.");
                return;
              }
              const r = new FileReader();
              r.onerror = () => setError("That logo could not be read. Please choose it again.");
              r.onload = () => {
                const image = new Image();
                image.onerror = () => setError("That image could not be opened. Try another PNG, JPG or WebP.");
                image.onload = () => {
                  const scale = Math.min(1, 512 / Math.max(image.width, image.height));
                  const canvas = document.createElement("canvas");
                  canvas.width = Math.max(1, Math.round(image.width * scale));
                  canvas.height = Math.max(1, Math.round(image.height * scale));
                  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
                  setLogo(canvas.toDataURL("image/png"));
                  setError("");
                };
                image.src = String(r.result);
              };
              r.readAsDataURL(file);
            }}
          />
          <span>PNG, JPG or WebP · up to 3 MB</span>
        </label>
        {logo && (
          <button className="text-button" onClick={() => setLogo(null)}>
            Remove logo
          </button>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <p className="small-copy">
          Your logo stays in this browser. This study previews placement and
          colour; our creative team develops your final artwork after the brief.
        </p>
        <Action
          href={`/book/${c.id}?brand=${encodeURIComponent(brand === "YOUR BRAND" ? "" : brand)}&colour=${encodeURIComponent(colour)}`}
        >
          Use this direction
        </Action>
      </div>
    </div>
  );
}
function FAQ() {
  return (
    <div className="faq-list">
      {commonFAQ.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span>+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

function HowPage() {
  return (
    <div className="page-wrap how-page">
      <div className="editorial-opening">
        <h1>
          A real campaign.
          <br />
          <em>Without the guesswork.</em>
        </h1>
        <p>
          Choose a format. Build a brief. Approve the production.
          <br />
          We turn the plan into a physical brand experience.
        </p>
      </div>
      <div className="process-list">
        {[
          [
            "Choose your format",
            "Explore ten clearly scoped activations. Every campaign page shows the experience, crew, physical setup, concept gallery and starting production price.",
          ],
          [
            "Tell us what you are launching",
            "Choose New York or London, a preferred date and the outcome you want. Send a short brief. There is no charge for a booking request.",
          ],
          [
            "Approve the real production",
            "We confirm the local crew, location, permissions, final artwork, rights and weather plan. You receive an itemized scope and a production schedule before payment.",
          ],
          [
            "Confirm and reserve",
            "Once you approve the final scope, a 50% production deposit secures confirmed supplier bookings. The balance and any cancellation terms are set out in the signed agreement.",
          ],
          [
            "Show up in the real world",
            "Your producer manages the activation, filmmaker and scheduled live coverage. The physical work is executed against the agreed plan.",
          ],
          [
            "Keep the footage working",
            "Receive your cinematic film, three vertical edits, fifteen stills and an execution report. First edit target: seven business days, with one consolidated revision round.",
          ],
        ].map(([title, body], i) => (
          <section key={title}>
            <span>0{i + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </section>
        ))}
      </div>
      <section className="delivery-strip">
        <h2>
          Every campaign comes
          <br />
          <em>with its own film.</em>
        </h2>
        <div>
          <p>
            Real filmmaker. Cinematic edit. Paid-social-friendly cuts. Scheduled
            Instagram Live through a dedicated mobile rig.
          </p>
          <p className="small-copy">
            Smart-glasses POV is captured where supported. Live eligibility and
            connectivity are tested in advance. Venue and authority approvals
            remain specific to each production.
          </p>
        </div>
      </section>
      <section className="faq-section">
        <h2>The practical questions.</h2>
        <FAQ />
      </section>
      <Action href="/campaigns">Find your campaign</Action>
      <CommonClose />
    </div>
  );
}
function AboutPage() {
  return (
    <div className="page-wrap about-page about-profile">
      <Link href="/campaigns" className="profile-vhs" aria-label="Explore the AICANFEEL campaign collection" prefetch={false}>
        <span className="profile-vhs-cassette" aria-hidden="true"><i/><i/></span>
        <span className="profile-vhs-sleeve" aria-hidden="true">
          <span className="profile-vhs-brand">AICANFEEL</span>
          <img src={photo("street-runway", 2)} alt="" width="180" height="150"/>
          <span className="profile-vhs-title">REAL<br/>WORLD</span>
          <span className="profile-vhs-edition">VHS / OFFLINE STUDIO / 2026</span>
        </span>
      </Link>
      <div className="profile-statement">
        <h1>AICANFEEL brings brands into the real world through people, art and experiences — then turns the moment into film made to travel further.</h1>
      </div>
      <div className="profile-metadata">
        <section className="profile-formats" aria-labelledby="profile-formats-title">
          <h2 id="profile-formats-title">[Campaign formats]</h2>
          <ul>
            <li>Street runway</li>
            <li>QR cube crew</li>
            <li>Live brand painting</li>
            <li>Giant product procession</li>
            <li>Impact installations</li>
            <li>Hosted brand experiences</li>
            <li>Portrait pop-ups</li>
          </ul>
        </section>
        <section className="profile-production" aria-labelledby="profile-production-title">
          <h2 id="profile-production-title">[Our production]</h2>
          <ul>
            <li>Creative + production planning</li>
            <li>People, props + site review</li>
            <li>Real filmmaker on site</li>
            <li>Cinematic hero film</li>
            <li>Vertical edits + stills</li>
            <li>Scheduled Instagram Live</li>
            <li>Approval before payment</li>
          </ul>
        </section>
      </div>
      <div className="profile-context">
        <p>New York and London are our launch markets. People, location, permissions, build and delivery are confirmed in your production review before a deposit is accepted.</p>
        <p>Our approach connects physical production with Meta advertising expertise. Gallery images show the creative direction; your casting, location and final artwork are approved together.</p>
        <Link href="/campaigns" className="profile-explore" prefetch={false}>Explore the campaign collection <span aria-hidden="true">[↗]</span></Link>
      </div>
    </div>
  );
}

function BookingForm({
  initial,
  city,
  setCity,
}: {
  initial: Campaign;
  city: City;
  setCity: (c: City) => void;
}) {
  const [selected, setSelected] = useState(initial.id);
  const c = campaignById(selected) || initial;
  const [addons, setAddons] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState("");
  const [colour, setColour] = useState(c.accent);
  const key = useRef("");
  useEffect(() => {
    key.current = crypto.randomUUID();
    const q = new URLSearchParams(location.search);
    setBrand(q.get("brand")?.slice(0, 80) || "");
    if (/^#[0-9a-f]{6}$/i.test(q.get("colour") || ""))
      setColour(q.get("colour")!);
  }, []);
  const addOnData = [
    {
      id: "extra-hour",
      name: "One extra activation hour",
      usd: 750,
      gbp: 600,
      note: "Subject to crew and location availability.",
    },
    {
      id: "extra-edit",
      name: "One additional vertical edit",
      usd: 300,
      gbp: 240,
      note: "One 15-second cut from captured footage.",
    },
  ];
  const subtotal =
    price(c, city) +
    addOnData
      .filter((a) => addons.includes(a.id))
      .reduce((sum, a) => sum + (city === "london" ? a.gbp : a.usd), 0);
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + c.leadDays);
  const minimum = earliest.toISOString().slice(0, 10);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug: selected,
          market: city === "london" ? "UK" : "US",
          brandName: brand,
          contactName: data.get("contactName"),
          email: data.get("email"),
          phone: data.get("phone"),
          website: data.get("website"),
          desiredDate: data.get("desiredDate"),
          message: `${data.get("message") || ""}\nPreferred visual direction: ${colour}`,
          addons,
          consent: data.get("consent") === "on",
          idempotencyKey: key.current,
          honeyPot: data.get("companyFax") || "",
        }),
      });
      const result = await jsonResult(response);
      if (!response.ok)
        throw new Error(
          result.error || "Your brief could not be sent. Please try again.",
        );
      try {
        sessionStorage.setItem(
          `aicanfeel-booking-${result.bookingId}`,
          result.accessToken,
        );
      } catch {}
      window.location.assign(
        result.reviewUrl ||
          `/booking/${result.bookingId}#token=${result.accessToken}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your brief could not be sent. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-wrap book-page">
      <Link href={`/campaign/${c.id}`} className="back-link" prefetch={false}>
        ← Campaign details
      </Link>
      <div className="section-heading">
        <div>
          <h1>
            Let’s make
            <br />
            <em>your moment.</em>
          </h1>
          <p>
            Start with a short brief. We confirm the production
            <br />
            before you pay anything.
          </p>
        </div>
        <span className="secure-note">BOOKING REQUEST / NO CHARGE TODAY</span>
      </div>
      <div className="booking-layout">
        <form method="post" onSubmit={submit} className="booking-form">
          <fieldset>
            <legend>Your campaign</legend>
            <label>
              Campaign format
              <select
                name="campaign"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setAddons([]);
                }}
              >
                {campaigns.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.number} / {a.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-pair">
              <label>
                City
                <select
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value as City)}
                >
                  <option value="new-york">New York, USA · USD</option>
                  <option value="london">London, UK · GBP</option>
                </select>
              </label>
              <label>
                Preferred date
                <input type="date" name="desiredDate" min={minimum} required />
                <span>{c.lead}. Date is subject to confirmation.</span>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Your brand</legend>
            <label>
              Brand or company name
              <input
                name="brandName"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                autoComplete="organization"
                required
                maxLength={80}
              />
            </label>
            <div className="form-pair">
              <label>
                Your name
                <input
                  name="contactName"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            </div>
            <div className="form-pair">
              <label>
                Website <small>optional</small>
                <input
                  name="website"
                  type="url"
                  autoComplete="url"
                  placeholder="https://"
                  maxLength={300}
                />
              </label>
              <label>
                Phone <small>optional</small>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                />
              </label>
            </div>
            <label>
              What are you launching?
              <textarea
                name="message"
                rows={4}
                placeholder="Your product, audience, campaign goal and anything we should know."
                maxLength={3000}
              />
            </label>
            <label className="honeypot" aria-hidden="true">
              Company fax
              <input name="companyFax" tabIndex={-1} autoComplete="off" />
            </label>
          </fieldset>
          <fieldset>
            <legend>Optional additions</legend>
            {addOnData.map((a) => (
              <label className="addon-option" key={a.id}>
                <input
                  type="checkbox"
                  checked={addons.includes(a.id)}
                  onChange={(e) =>
                    setAddons((current) =>
                      e.target.checked
                        ? [...current, a.id]
                        : current.filter((v) => v !== a.id),
                    )
                  }
                />
                <span>
                  <strong>{a.name}</strong>
                  <small>{a.note}</small>
                </span>
                <b>+ {money(city === "london" ? a.gbp : a.usd, city)}</b>
              </label>
            ))}
          </fieldset>
          <label className="consent">
            <input type="checkbox" required name="consent" />
            <span>
              I have read the{" "}
              <Link href="/terms" target="_blank">
                booking terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank">
                privacy notice
              </Link>
              . I understand this is a production request, with no payment or
              date confirmation yet.
            </span>
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button
            className="action submit-action"
            disabled={busy}
            type="submit"
          >
            <span>
              {busy ? "Sending your brief…" : "Send my production brief"}
            </span>
            {arrow}
          </button>
          <p className="small-copy">
            Your request is stored securely for production review. Keep the
            private confirmation link shown after submission.
          </p>
        </form>
        <aside className="booking-summary">
          <img src={coverPhoto(c)} alt={`${c.name} campaign concept`} />
          <div className="summary-content">
            <span>YOUR PRODUCTION</span>
            <h2>{c.name}</h2>
            <p>
              {cityInfo[city].name} / {c.duration}
            </p>
            <dl>
              <div>
                <dt>Base production</dt>
                <dd>{money(price(c, city), city)}</dd>
              </div>
              {addOnData
                .filter((a) => addons.includes(a.id))
                .map((a) => (
                  <div key={a.id}>
                    <dt>{a.name}</dt>
                    <dd>{money(city === "london" ? a.gbp : a.usd, city)}</dd>
                  </div>
                ))}
              <div className="subtotal">
                <dt>Production subtotal</dt>
                <dd>{money(subtotal, city)}</dd>
              </div>
            </dl>
            <p className="summary-exclusions">
              Venue, permits and applicable tax are additional. Your final
              itemized quote comes before payment.
            </p>
            <ul>
              <li>Real filmmaker + cinematic hero film</li>
              <li>3 vertical cuts + 15 edited stills</li>
              <li>20-minute scheduled Instagram Live</li>
              <li>Written scope and location approval</li>
            </ul>
            <p className="small-copy">
              After approval, a 50% deposit reserves the confirmed production.
              No deposit is taken from this form.
            </p>
          </div>
        </aside>
      </div>
      <CommonClose />
    </div>
  );
}

function BookingStatus({ id }: { id: string }) {
  return <BookingPortal id={id} footer={<CommonClose />} />;
}

function LegalPage({ type }: { type: "terms" | "privacy" }) {
  return (
    <div className="page-wrap legal-page">
      <h1>{type === "terms" ? "Booking terms." : "Your privacy."}</h1>
      <p className="legal-date">AICANFEEL / Updated 16 November 2026</p>
      {type === "terms" ? (
        <>
          <section>
            <h2>Booking requests and confirmation</h2>
            <p>
              This website offers defined offline campaign production formats.
              Submitting a brief is a request for review, not a confirmed
              production booking. Dates, crew availability, location permission
              and the complete scope must be confirmed in writing before
              payment.
            </p>
          </section>
          <section>
            <h2>Prices and payment</h2>
            <p>
              Published prices are starting production prices in USD for New
              York and GBP for London. Venue hire, public authority fees,
              applicable tax and stated extras are additional. Your written
              proposal specifies the complete amount, payment recipient and
              contracting details. After acceptance, a 50% production deposit
              reserves confirmed supplier commitments. The balance schedule is
              set out in the production agreement.
            </p>
          </section>
          <section>
            <h2>Changes, weather and cancellation</h2>
            <p>
              You may withdraw an unapproved request without charge. Before
              taking a deposit, we agree the weather fallback, cancellation
              conditions and any non-recoverable third-party commitments.
              Changes to date, location, scale or deliverables require written
              agreement and may affect cost. Nothing here removes rights that
              applicable consumer law provides.
            </p>
          </section>
          <section>
            <h2>Creative approval and rights</h2>
            <p>
              Concept photographs are generated visualizations, not evidence of
              completed client campaigns. Actual casting, artwork, props,
              location and deliverables follow the approved scope. You must have
              permission to supply and use your brand assets. Talent, artwork,
              music and footage rights are documented in the production
              agreement; extended or different use may require an additional
              licence.
            </p>
          </section>
          <section>
            <h2>Filming and live coverage</h2>
            <p>
              A real filmmaker captures the campaign. Featured participant
              footage requires appropriate permission. Scheduled Instagram Live
              depends on account eligibility, account access and network
              conditions. A dedicated phone rig is the standard live method.
              Smart-glasses POV is subject to compatibility and a preproduction
              test. Recorded coverage is delivered if live transmission is
              unavailable.
            </p>
          </section>
          <section>
            <h2>Execution and reporting</h2>
            <p>
              We agree production time, crew and delivery quantities. Footfall,
              public participation, impressions, social reach, sales and
              virality are not guaranteed. Counted activity is distinguished
              from estimated exposure. Locations are never implied to be
              approved before the necessary permissions are obtained.
            </p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2>Information you provide</h2>
            <p>
              A booking brief collects your contact name, business email, brand,
              selected campaign, city, preferred date and optional website,
              phone and message. We use this information to assess and manage
              your production request, communicate about the proposal and
              fulfill an agreed service.
            </p>
          </section>
          <section>
            <h2>Private booking access</h2>
            <p>
              Your confirmation includes a private access link. Anyone with the
              complete link may be able to view your booking; do not post or
              share it publicly. Booking information is stored in the website’s
              production database and is available only through the private link
              or authenticated production administration.
            </p>
          </section>
          <section>
            <h2>Brand previews and browser storage</h2>
            <p>
              Logo uploads in the visualizer stay in your browser and are not
              uploaded to the booking database. Browser storage remembers your
              selected city, display preference and private booking token. These
              preferences can be removed by clearing site data.
            </p>
          </section>
          <section>
            <h2>Payments and service providers</h2>
            <p>
              Where an approved booking offers online payment, a hosted payment
              provider processes card details. This website does not collect raw
              card numbers. Production information may be shared with the local
              crew and suppliers as needed to assess or deliver your agreed
              campaign.
            </p>
          </section>
          <section>
            <h2>Marketing and requests</h2>
            <p>
              Submitting a brief does not enroll you in a marketing list. No
              Meta advertising pixel or optional marketing tracker is enabled by
              default. For access, correction or deletion requests, contact{" "}
              <a href="mailto:aicanfeel@gmail.com">aicanfeel@gmail.com</a> and
              include your booking reference. Necessary transaction records may
              be retained where required by applicable law.
            </p>
          </section>
        </>
      )}
      <CommonClose />
    </div>
  );
}

function OwnerStudio() {
  return <OwnerDesk />;
}
function CommonClose() {
  return (
    <footer className="content-footer">
      <Link href="/" aria-label="AICANFEEL home" prefetch={false}>
        <Wordmark />
      </Link>
      <p>
        Real people. Real places.
        <br />A real impression.
      </p>
      <div>
        <Link href="/terms" prefetch={false}>
          Booking terms
        </Link>
        <Link href="/privacy" prefetch={false}>
          Privacy
        </Link>
        <a href="mailto:aicanfeel@gmail.com">aicanfeel@gmail.com</a>
        <span>© AICANFEEL 2026</span>
      </div>
    </footer>
  );
}
