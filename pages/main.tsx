import { createRoot } from "react-dom/client";
import Studio from "../components/Studio";
import NotFound from "../app/not-found";
import { campaignById } from "../lib/campaigns";
import { siteUrl } from "../lib/site-url";
import "../app/globals.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const path = location.pathname.slice(base.length).replace(/\/+$/, "") || "/";
const campaign = /^\/campaign\/([^/]+)$/.exec(path)?.[1];
const views = {
  "/": "home", "/campaigns": "campaigns", "/how-it-works": "how",
  "/about": "about", "/terms": "terms", "/privacy": "privacy",
} as const;
const view = views[path as keyof typeof views];
const root = createRoot(document.getElementById("root")!);

if (/^\/(?:book|booking)(?:\/|$)|^\/studio(?:\/|$)/.test(path)) {
  // Preserve private receipt fragments and brand/colour/city query parameters.
  const destination = siteUrl(path + location.search + location.hash);
  location.replace(destination);
  root.render(<main className="not-found"><h1>Opening the production desk.</h1><a className="action" href={destination}>Continue to your booking ↗</a></main>);
} else if (campaign && campaignById(campaign)) {
  document.title = `${campaignById(campaign)!.name} — AICANFEEL`;
  root.render(<Studio view="campaign" slug={campaign}/>);
} else if (view) {
  root.render(<Studio view={view}/>);
} else {
  document.title = "Page not found — AICANFEEL";
  root.render(<NotFound/>);
}
