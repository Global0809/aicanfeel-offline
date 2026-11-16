---
name: AICANFEEL Offline
description: A black CRT campaign archive with physical VHS objects, photographic reels and precise production interfaces.
colors:
  bg: "#111"
  ink: "#ece9e1"
  quiet: "#b5b2aa"
  line: "#ece9e12e"
  outer: "#080808"
  television: "#070707"
  field-bg: "#191919"
  summary-bg: "#171717"
  next-steps-bg: "#181818"
  placeholder: "#a39f96"
  action-line: "#ece9e18a"
  field-line: "#ece9e13d"
  error-text: "#ffb8a6"
  error-line: "#ad6655"
  status-ready: "#b6cb95"
  payment-recorded: "#d5dfbc"
  runway-cobalt: "#2648ed"
  runway-chalk: "#ecebe2"
  runway-black: "#101113"
  cube-acid: "#e5e625"
  cube-black: "#181818"
  cube-white: "#ece9e0"
  painting-vermilion: "#e13724"
  painting-blush: "#e4b4ac"
  painting-ink: "#191516"
  procession-sky: "#789cbd"
  procession-indigo: "#25395d"
  procession-cream: "#ebe3d2"
  installation-orange: "#ee7732"
  installation-charcoal: "#292b2b"
  installation-concrete: "#c4beb1"
  coffee-oxblood: "#74262e"
  coffee-cream: "#eee1c9"
  coffee-espresso: "#2e201d"
  tryout-mint: "#a6cdb2"
  tryout-forest: "#204a38"
  tryout-ivory: "#ede5d2"
  trail-sunflower: "#edbd39"
  trail-navy: "#202d44"
  trail-stone: "#cec7b8"
  performance-fuchsia: "#dc368f"
  performance-scarlet: "#e83235"
  performance-black: "#1d171c"
  portrait-lavender: "#ac98ce"
  portrait-oxblood: "#6d2937"
  portrait-ivory: "#eee8da"
typography:
  display:
    fontFamily: "Advercase, Georgia, serif"
    fontSize: "clamp(44px, 5.5vw, 80px)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Advercase, Georgia, serif"
    fontSize: "clamp(32px, 3.4vw, 52px)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.035em"
  reel-title:
    fontFamily: "Advercase, Georgia, serif"
    fontSize: "clamp(35px, 4.5cqw, 67px)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Montreal, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "Bit, monospace"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: "-0.04em"
  tape-caption:
    fontFamily: "Bit, Mono, monospace"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  field:
    fontFamily: "Montreal, Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.35
rounded:
  square: "0"
  crt: "44px"
  crt-tablet: "32px"
  crt-mobile: "28px"
  reel-dialog: "35px"
spacing:
  micro: "5px"
  tight: "10px"
  small: "15px"
  pair: "20px"
  section: "25px"
  medium: "30px"
  broad: "35px"
  large: "40px"
  editorial: "60px"
  workspace: "80px"
  action: "17px 19px"
  field: "14px 13px"
  page: "28px 40px 30px"
  page-mobile: "19px 8px 15px"
components:
  action:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "{spacing.action}"
    width: "100%"
    typography: "{typography.label}"
  action-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
  text-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "4px 0"
  field:
    backgroundColor: "{colors.field-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "{spacing.field}"
    typography: "{typography.field}"
    width: "100%"
  navigation:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  filter-tab:
    backgroundColor: "transparent"
    textColor: "{colors.quiet}"
    padding: "5px 0"
  filter-tab-selected:
    textColor: "{colors.ink}"
  booking-summary:
    backgroundColor: "{colors.summary-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  next-steps:
    backgroundColor: "{colors.next-steps-bg}"
    padding: "{spacing.medium}"
  crt-shell:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.crt}"
---

# Design System: AICANFEEL Offline

## Overview

**Creative North Star: "The CRT Campaign Archive"**

The visual authority is the user's pinned arcmarumo.com design: a black television screen, quietly luminous perimeter controls and a carousel of dimensional, weathered VHS sleeves. AICANFEEL supplies the identity and campaign artwork within that composition. Physical objects and photographs lead; compact metadata identifies the offer and the next action. The world is already defined in code and must remain coherent as screens are added.

Advercase gives editorial content a distinctive serif voice. Mono and Bit keep navigation, indexing and tape furniture deliberately mechanical. Black glass, smoky print, chipped sleeve folds and restrained inertia create material depth. Campaign colour belongs to the selected artwork or brand-placement study; the surrounding instrument stays dark and quiet.

There are two surface modes within this identity. Discovery surfaces use tapes, photographic reels and editorial rhythm. Booking, the private receipt and the owner production desk retain the CRT shell but use labelled fields, ruled records, explicit status and ordinary vertical scrolling. A precise working interface is an intended expression of the world.

**Key Characteristics:**

- Curved black CRT shell with fixed pixel/mono perimeter navigation.
- Actual three-dimensional VHS sleeves with original campaign cover art.
- Horizontal photographic narrative on desktop; vertical narrative on smaller screens.
- Advercase editorial hierarchy with restrained, uppercase Mono metadata.
- Square operating controls, fine rules, clear currencies and visible state.
- Authored concept imagery and geometric SVG placement studies with honest labels.

This is a scan-mode record of `app/globals.css`, `app/reel.css`, `app/motion.css`, `app/owner.css`, `app/portal.css`, `app/about-profile.css`, `components/Studio.tsx`, `components/CampaignReel.tsx`, `components/SiteLink.tsx`, `lib/tape-scene.ts`, `lib/motion.js` and `lib/campaigns.ts`. The YAML owns extracted primitives; `.impeccable/design.json` owns extended motion, depth, breakpoints and portable component samples.

## Colors

Warm phosphor ink and muted putty sit on near-black glass. Colour appears through the selected campaign, the small spectrum mark and local brand personalisation.

### Primary

The campaign palettes are scoped families, not alternative application themes. The first token in each row is the campaign's `accent`; all three are offered by its placement study. Exact values live in the frontmatter.

| Campaign | Accent | Companion tones |
| --- | --- | --- |
| The Street Runway | `runway-cobalt` | `runway-chalk`, `runway-black` |
| QR Cube Crew | `cube-acid` | `cube-black`, `cube-white` |
| Live Brand Painting | `painting-vermilion` | `painting-blush`, `painting-ink` |
| Giant Product Procession | `procession-sky` | `procession-indigo`, `procession-cream` |
| Impact Art Installation | `installation-orange` | `installation-charcoal`, `installation-concrete` |
| Coffee on Your Brand | `coffee-oxblood` | `coffee-cream`, `coffee-espresso` |
| Product Tryout | `tryout-mint` | `tryout-forest`, `tryout-ivory` |
| Neighbourhood Brand Trail | `trail-sunflower` | `trail-navy`, `trail-stone` |
| Colour Block Performance | `performance-fuchsia` | `performance-scarlet`, `performance-black` |
| Portrait Pop-up | `portrait-lavender` | `portrait-oxblood`, `portrait-ivory` |

### Neutral

- **Black screen (`bg`)** is the main working background. `outer` and `television` create the dark physical surround.
- **Warm phosphor (`ink`)** is the reading and action colour; **muted putty (`quiet`)** carries supporting copy, labels and index furniture.
- **Ghost rule (`line`)** separates editorial and operational records. The stronger `action-line` and `field-line` identify interactive boundaries.
- **Field charcoal (`field-bg`)**, **summary charcoal (`summary-bg`)** and **next-step charcoal (`next-steps-bg`)** provide small tonal shifts without a generic raised-card system. `placeholder` is subordinate input guidance.
- **Error salmon (`error-text` / `error-line`)** marks field feedback. **Ready sage (`status-ready`)** supplies the small receipt-status square; **recorded sage (`payment-recorded`)** supports the explicitly worded payment receipt. Status always has text.

**The Campaign Boundary Rule.** Keep campaign palettes inside artwork, selected campaign emphasis and the local placement study; retain the shared black/ink/quiet instrument around them.

The SVG study calculates readable foreground from the chosen colour: linear-sRGB luminance above `.179` selects dark ink; otherwise it selects white. B&W is an explicit whole-screen grayscale control, with saved preference. The five-colour spectrum wordmark remains a small authored identity asset; do not turn it into a general UI gradient.

## Typography

**Display Font:** Advercase, with Georgia and serif fallbacks. **Body Font:** Montreal, with Arial and sans-serif fallbacks. **Label/Mono Font:** Mono, with monospace fallback. **Pixel Font:** Bit, with monospace fallback. These four faces are local WOFF2 assets in `public/fonts`, declared with `font-display: swap` and `font-synthesis: none`.

**Character:** editorial serif content sits inside a compact video-instrument vocabulary. Uppercase metadata stays compact; body text and working field values use the quieter sans face.

### Hierarchy

- **Display / headline:** frontmatter `display` and `headline` describe the shared heading defaults. Display emphasis uses quiet ink rather than simulated italics; headings balance text.
- **Reel title:** the `reel-title` role scales to its container. At compact mobile width the introduction resolves to `(43px / 1.04)`; reel copy headings resolve to `(36px)`.
- **Body:** the `body` role records paragraph styling; body element line-height is `(1.5)`. Supporting editorial text commonly uses `(13–17px)`. Reel copy deliberately uses Mono, with local sizes and line lengths of roughly `(45–65ch)`; FAQ answers return to Montreal.
- **Label:** the `label` role is the perimeter default. Smaller bracketed metadata uses `(9–11px)`; header links become `(10px)` and footer controls `(9px)` below the compact breakpoint. Uppercase and tight tracking are intentional reference traits.
- **Wordmark / tape caption:** `wordmark` and `tape-caption` use Bit. The header wordmark locally uses `(31px)` and an under-rule; the mobile header shows only the spectrum glyph. Sleeve artwork uses Advercase for its large printed title, with Mono issue furniture.
- **Field:** `field` supplies ordinary sentence-case values. Mobile booking inputs use `(16px / 1.35)` even when their labels remain visually small.
- **Profile:** the centred statement uses Advercase `(clamp(31px, 2.7vw, 42px) / 1.07)` and becomes `(29px / 1.08)` on compact mobile. It is intentionally calmer than a campaign opener.

**The Two Voices Rule.** Use Advercase for editorial titles and Mono/Bit for the archive's controls; keep editable prose and operational explanations in Montreal.

## Layout

The television is fixed to the viewport, with a clipped internal screen. Desktop shell inset is `(2.6vh 2.4vw)`. Perimeter controls sit inside the screen: header `(top: 5.6%; left/right: 4%)`, footer `(bottom: 4.8%; left/right: 4%)`. Internal page scrolling begins at `(122px 3% 86px)`, containing a centred page of maximum width `(1450px)` and the `page` padding token. The system uses observed local spacing rather than imposing a new numerical scale: small gaps and rules sit beside large editorial pauses.

Discovery surfaces have distinct compositions:

- **Home:** the physical tape is central; the offer introduction, selected name, starting price, market and Explore link remain readable. The Three.js scene uses a `(130 × 196 × 30)` sleeve with a `(102.5 × 187.5 × 25)` cassette. At scene width below `(700px)`, the tape width is capped by `min(width × .72, height × .54 × 130/196)` and centre height is `.475`; desktop uses width factor `.195` and centre height `.452`. Adjacent tapes retain their edges and recede into darkness. The DOM fallback preserves cover, title and exploration before WebGL is ready.
- **Catalogue:** ruled, horizontal rows combine index, image, title, price and arrow. The desktop columns are `(28px 200px minmax(0,1fr) 145px 22px)`, with `(28px)` gaps. Smaller widths progressively simplify supporting detail.
- **Campaign reel:** above `(1024px)`, the fixed-height container scrolls horizontally. Padding is `max(16px, 2.25cqw)`, gap `max(22px, 2.4cqw)`, toolbar height `(56px)`. The intro occupies about half the container, photo panels vary `(43–81cqw)`, copy uses `(39cqw)` with `(340px)` minimum, production `(65cqw)` and preview `(82cqw)`. This variation is editorial pacing, not a card grid.
- **Smaller-screen reel:** at `(1024px)` and below, the track becomes one native vertical column with `(30px)` gaps and a `(57px)` toolbar. At `(600px)` and below, padding is `(14px)` and gap `(25px)`; hero/portrait photos use `(4:3)`, most other images `(3:2)`. Scope and preview controls become single-column. An ordinary Overview remains available.
- **About/profile:** a small interactive sleeve sits above the centred statement and two compact metadata columns. The sleeve is `(92 × 139px)` on desktop and `(76 × 115px)` on compact mobile; this intimate scale is part of the pinned composition. How/process and legal pages use ordinary vertical editorial scrolling.

Operate surfaces follow the content's reading and task order. Booking uses a `(1.3fr / .8fr)` two-column grid with `(80px)` gap and sticky summary; at `(850px)` and below it becomes one column. Receipt content uses `(1.5fr / 1fr)` with `(80px)` gap. The owner workspace uses `(1.3fr / 1fr)` with `(60px)` gap, tightens at `(1000px)` and stacks at `(600px)`. Amounts retain their currency and avoid wrapping; long private links wrap within their containers. Delivery entries and tracking tables use ruled rows.

At `(850px)`, the shell changes to `(2vh 2vw)` and `crt-tablet` corners. At `(600px)`, it uses `(12px 10px)` and `crt-mobile` corners, header inset `(30px 25px)`, footer side inset `(25px)`, and content scroll inset `(85px 17px 65px)`. Use the `page-mobile` padding. At `(1700px)` and above, perimeter lettering and interior padding increase. Height queries preserve the home offer: desktop at height `(730px)` or less moves it to `(13%)`; compact mobile at height `(740px)` or less moves it to `(48px)` with tightly spaced supporting text. Never hide this explanation to make a shorter viewport fit.

**Fixed-frame contract.** Preserve the CRT perimeter and scroll the relevant interior. A full-page screenshot of this application can validly show only the current fixed viewport.

## Elevation & Depth

Depth is physical and structural. The CRT has inset black shadows and a glass image, scanlines and vignette above the content. These overlays never intercept input. Photographs and operating records remain mostly flat; fine rules and tonal surfaces establish hierarchy. Three.js supplies real sleeve thickness, cassette extrusion, reel windows, screws and ridge geometry. Canvas artwork concentrates deterministic chips at paper folds, then adds restrained smoky print and grain without covering the title.

### Shadow Vocabulary

- **CRT shell:** inset shadow and outer black surround; exact declarations are in the sidecar.
- **CRT vignette:** two inset shadows; compact mobile halves the broad edge treatment.
- **Fallback sleeve:** short directional shadow under the non-WebGL tape.
- **Profile sleeve:** layered inset edges and a short offset shadow, paired with `(600px)` CSS perspective and slight Y rotation.

Glass opacity is `(.23)` on desktop and `(.17)` on compact mobile; scanline opacity changes from `(.3)` to `(.2)`. Scanlines repeat across four pixels and multiply into the screen; glass uses screen blending. B&W filter transition is `(.35s)`. The reel photo enlargement hint uses a small text shadow for local readability.

**The Material Depth Rule.** Use curved glass and sleeve construction for dimensional emphasis; keep working forms, lists and photographic panels square and quiet.

The tape scene renders on demand and stops when settled, outside the viewport or when the document is hidden. Pixel ratio is capped at `(1.8)` desktop and `(1.3)` below its scene breakpoint. Damping handles movement and cassette reveal; reduced motion removes entrance tilt and inertia. The reel uses a `(.55s power3.out)` glide on desktop and ordinary native touch scrolling on smaller screens. Hover/focus transitions are mostly `(.2–.5s)`. The profile sleeve uses `(.5s cubic-bezier(.16,1,.3,1))`.

Geometric SVG studies use an `(800 × 600)` viewBox, fine `(1.5px)` strokes and cycles ranging from `(3s)` ground motion to `(45s)` orbit. Pause, reduced motion, viewport visibility and document visibility govern both CSS animation and SVG SMIL. Retain the actual observed SVG when colour or pause changes; when brand/logo changes replace it, pause and dispose the old observation and mount the new artwork with the current state. GSAP contexts, event listeners, observers, animation frames, scene geometries, textures and materials must be cleaned up on replacement/unmount.

## Shapes

Large curved corners belong to the television and modal glass, using the `crt`, `crt-tablet`, `crt-mobile` and `reel-dialog` tokens. Inputs, action outlines, photographic panels, booking summaries and operating sections are square. Rules are predominantly `(1px)`; focus is a stronger `(2px)` ink outline. Small physical cassette corners, reel circles and screws belong to the VHS object rather than to a general rounded-card language.

SVG placement studies use clean geometric outlines, registration crosses, circles, grids and stylised production objects. They are original motion diagrams for the ten campaign formats. The study's colour field is an authored local preview surface, not a replacement for the black application background.

## Components

### Buttons

Actions are square, full-width outlined controls: `action` padding, minimum height `(53px)`, `(1px)` action rule, uppercase `(12px)` Mono label, and a small inline diagonal arrow. Hover inverts to warm ink with black text over `(.2s)`. Text buttons use `(11px)` Mono with an under-rule and `(4px 0)` padding. Disabled buttons retain their label, reduce opacity to `(.5)` and use a wait cursor; reel ends instead use `(.25)` opacity and the default cursor. Preserve actual buttons and links as appropriate to the action.

### Chips

Catalogue filters are plain `(11px)` uppercase Mono tabs. Quiet ink is default; selected state uses full ink and a single bottom rule, with `aria-pressed`. Palette buttons are `(27 × 27px)` squares separated by `(10px)`; a `(1px)` ink outline offset `(3px)` marks the selected swatch. Semantic colour names/values remain available through accessible labels. Best-for tags are small square outlined labels, not filled pills.

### Cards / Containers

The booking summary is the canonical contained surface: square charcoal, `(3:2)` image, `(27px)` content padding, Advercase title, ruled amount breakdown and clearly qualified starting price. Next steps use a related tonal panel with `next-steps` padding. Owner records, scope sections, timelines and deliverables primarily use rules rather than separate floating cards. Status, working and error notices keep visible text and distinct muted tones; the owner's notices remain sticky near the bottom of its scroll area.

### Inputs / Fields

Fields use `field` tokens, a `(1px)` field rule, minimum height `(48px)`, visible labels, ordinary sentence-case values and quiet placeholders. Focus uses the shared `(2px)` ink outline with `(2px)` offset. Textareas resize vertically and start at `(125px)` height. Native selects remain usable; operating forms do not inherit display-size serif values. Mobile fields use `(16px)` values. Consent and add-ons use real checkboxes and associated text, with underlined policy links. Validation explains the affected value and remains visible in salmon; alerts announce errors. Do not encode field state through colour alone.

### Navigation

Fixed top/bottom controls use the frontmatter label role, subtle white hover and a square active-page marker `(7px)` desktop / `(5px)` compact mobile. Compact mobile retains the small visible letters but adds centred transparent hit areas at least `(44px)` high and `(44px)` wide to header links, logo, footer clock, B&W and brief controls. Preserve separation between adjacent hit areas. A skip link appears on focus. The standard focus outline is `(2px)` ink with `(6px)` offset, reduced locally for fields and dialog controls.

Route changes intentionally use ordinary browser navigation. `SiteLink` renders a plain anchor, preserves consumer handlers/refs, modifiers, targets, downloads and fragments, and strips framework-router-only props. It attaches no route prefetch or click interceptor. Programmatic transitions use `location.assign`. Keep this native full-page behavior when extending navigation; the Three.js carousel, reel controls and SVG study remain interactive within their current page. This source contract addresses a confirmed Vinext beta link-binding defect; public cross-engine verification is a separate deployment check.

### VHS selection

The WebGL canvas is decorative to assistive technology. Selection and opening remain available through semantic DOM controls, labelled previous/next buttons, a selected-tape announcement and keyboard handling. Drag, wheel and raycast/tap add physical direct manipulation; they do not replace Explore links or the catalogue. The profile's small sleeve exposes the same hover/focus cassette reveal with reduced-motion-safe transitions.

### Photographic reel and gallery

The reel is a labelled, focusable region with keyboard help. Left/right arrows move panels, Home/End reach the ends, and focus brings the current panel into view. Form editing is protected from wheel/keyboard interception; nested copy scroll remains usable. The live panel counter is polite and atomic. Each photograph is a real button opening a native modal dialog, with Escape/close, labelled previous/next and a concept caption. The zoom dialog contains the full image with `object-fit: contain`; reel photographs use authored `object-fit: cover` crops. Progress is decorative, separate from the announced count.

### Brand direction study

Each campaign has its own original SVG diagram. The local name is uppercased and capped at `(24)` characters; logo input accepts PNG/JPG/WebP up to `(3MB)` and downsamples to a maximum `(512px)` dimension. The logo stays in the browser. Swatches and a native colour input update the diagram with calculated foreground ink. Keep the visible Pause/Play control, study qualification, local error and route into the brief. The explanatory label says this is a placement study rather than final artwork. The sidecar's SVG sample records visual grammar only; application lifecycle and actual pause behavior remain in the source.

### Operate state

Booking and receipt interfaces use explicit labels, validation, amount/currency pairs, scope acceptance and textual payment status. A browser success parameter is never payment proof. The owner desk must clear selection-dependent details together; late responses cannot mix a request with another request's QR/report or restore information after sign-out. Private notes stay private, and receipt credentials stay out of ordinary URL paths/query strings. These state contracts are part of making the precise visual interface truthful.

Mutation forms declare `method="post"` for their native HTML fallback; JavaScript submission handlers retain validation and API state. After a successful brief, the receipt credential is saved to session storage and the review destination retains its token fragment through native navigation. Preserve that credential handling when changing receipt links or transitions.

The independent finish review records F1–F4 resolved; the targeted functional verdict records the actual SVG Pause/Play lifecycle defect F5 resolved. No unresolved material visual drift is recorded by those bounded verdicts. They do not certify physical-phone/Safari behavior, real merchant/supplier readiness or final public access; documentation is not a replacement for those checks.

## Do's and Don'ts

### Do:

- **Do** preserve the pinned black CRT, pixel/mono perimeter, Advercase content and dimensional weathered tape composition.
- **Do** keep discovery and Operate surfaces recognisably in one world while giving forms, status and owner records direct labels and ordinary reading order.
- **Do** use each campaign's palette consistently across its nine-image concept sequence, sleeve and local placement study.
- **Do** retain the two-line offline-campaign/filmmaker/Live explanation in short viewports and keep it clear of the sleeve and perimeter controls.
- **Do** preserve focus, keyboard alternatives, independent touch targets, reduced motion and real SVG Pause/Play behavior.
- **Do** keep generated imagery labelled as campaign concepts and preserve its provenance.

### Don't:

- **Don't** replace this pinned interface with a generic landing page, uniform card grid, new palette or new typographic identity.
- **Don't** promote a selected campaign colour or a local preview colour into the shared application theme.
- **Don't** remove semantic navigation or overview access when adding direct manipulation, motion or visual effects.
- **Don't** present concept boards, generated code motifs or on-location visualisations as executed client work, functional QR codes, measured results or committed scenery.
- **Don't** let stale responses, return URLs or purely decorative status colours imply a customer's production or payment state.

The selected gallery set contains ninety distinct concept photographs across ten nine-image sequences. The shot vocabulary runs from Art direction, Portrait & material and Composition study through In the city, The encounter, Filming the moment, Before doors open, Audience perspective and The final moment. Studio frames establish art direction; on-location frames express production concepts. Neither is documentary case-study evidence. `public/campaigns/manifest.json` records classification, group, shot, palette and source hash; `docs/image-provenance.json` carries generation provenance. Preserve these relationships when extending imagery. Frontmatter campaign colours are the actual UI swatches; sidecar tonal ramps are inspection aids and do not author extra production theme tokens.
