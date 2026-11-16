// The Worker build keeps its existing root URLs. Only the Pages build defines
// this constant, so both deployments share the same components and assets.
declare const __GITHUB_PAGES_BASE__: string;
const pagesBase = typeof __GITHUB_PAGES_BASE__ === "string" ? __GITHUB_PAGES_BASE__ : "";
export const bookingOrigin = "https://aicanfeel-offline.globalgupta14.chatgpt.site";

export function siteUrl(path: string) {
  if (!pagesBase || !path.startsWith("/") || path.startsWith("//")) return path;
  const target = new URL(path, "https://pages.invalid");
  if (/^\/(?:book|booking)(?:\/|$)|^\/studio(?:\/|$)/.test(target.pathname)) {
    if (target.pathname.startsWith("/book/")) {
      try {
        const city = localStorage.getItem("aicanfeel-city");
        if (!target.searchParams.has("city") && (city === "london" || city === "new-york")) {
          target.searchParams.set("city", city);
        }
      } catch { /* Storage can be disabled; the booking form still has a city selector. */ }
    }
    return bookingOrigin + target.pathname + target.search + target.hash;
  }
  if (!target.pathname.split("/").at(-1)?.includes(".") && !target.pathname.endsWith("/")) target.pathname += "/";
  return pagesBase + target.pathname + target.search + target.hash;
}
