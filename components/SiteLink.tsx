"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";
import { siteUrl } from "../lib/site-url";

export type SiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  as?: string;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
  passHref?: boolean;
  legacyBehavior?: boolean;
  onNavigate?: (event: { preventDefault: () => void }) => void;
};

const routerOnlyProps = [
  "prefetch", "replace", "scroll", "shallow", "locale", "passHref",
  "legacyBehavior", "onNavigate",
] as const;

/**
 * Ordinary browser navigation avoids the Vinext beta Link/router binding bug.
 * Keep anchor semantics (including modifiers, targets, downloads and fragments)
 * and consumer handlers/refs; do not attach an RSC prefetch or click interceptor.
 */
const SiteLink = forwardRef<HTMLAnchorElement, SiteLinkProps>(function SiteLink(
  { href, as, ...candidateProps },
  ref,
) {
  const anchorProps = { ...candidateProps };
  for (const prop of routerOnlyProps) delete anchorProps[prop];
  return <a {...anchorProps} ref={ref} href={siteUrl(as ?? href)} />;
});

export default SiteLink;
