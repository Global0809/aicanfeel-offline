/** Original AICANFEEL campaign motion studies. No network or runtime dependencies. */
let serial = 0;
const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const tags = {
  "street-runway": ["Street runway", "THE CITY IS YOUR CATWALK"],
  "qr-cube-crew": ["QR cube crew", "CURIOSITY. SCANNED."],
  "live-brand-painting": ["Live brand painting", "WATCH YOUR BRAND TAKE SHAPE"],
  "giant-product-procession": [
    "Giant product procession",
    "TOO BIG TO SCROLL PAST",
  ],
  "impact-art-installation": [
    "Impact art installation",
    "MAKE A PHYSICAL IMPRESSION",
  ],
  "coffee-on-your-brand": [
    "Coffee on your brand",
    "YOUR NEXT CONVERSATION STARTS HERE",
  ],
  "product-tryout": ["Product tryout", "FROM FIRST LOOK TO FIRST TRY"],
  "neighbourhood-brand-trail": [
    "Neighbourhood brand trail",
    "ONE DISCOVERY LEADS TO ANOTHER",
  ],
  "colour-block-performance": [
    "Colour block performance",
    "A BRAND IN PERFECT SYNC",
  ],
  "portrait-pop-up": ["Portrait pop-up", "MAKE THEM PART OF THE PICTURE"],
};

const rect = (x, y, w, h, attrs = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/>`;
const line = (x1, y1, x2, y2, attrs = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`;
const circle = (x, y, r, attrs = "") =>
  `<circle cx="${x}" cy="${y}" r="${r}" ${attrs}/>`;
const text = (x, y, value, attrs = "") =>
  `<text x="${x}" y="${y}" ${attrs}>${esc(value)}</text>`;
const qr = (x, y, size = 96) => {
  const finder = (a, b) =>
    `${rect(a, b, 7, 7, 'fill="currentColor"')}${rect(a + 1, b + 1, 5, 5, 'fill="var(--cm-bg)"')}${rect(a + 2, b + 2, 3, 3, 'fill="currentColor"')}`;
  let cells = finder(0, 0) + finder(14, 0) + finder(0, 14);
  for (let a = 0; a < 21; a++)
    for (let b = 0; b < 21; b++)
      if (
        !((a < 8 && b < 8) || (a > 12 && b < 8) || (a < 8 && b > 12)) &&
        (a * a + b * 3 + a * b) % 7 < 3
      )
        cells += rect(a, b, 1, 1, 'fill="currentColor"');
  return `<g stroke="none" transform="translate(${x} ${y}) scale(${size / 21})">${cells}</g>`;
};
const crosses = `${line(38, 94, 50, 94)}${line(44, 88, 44, 100)}${line(750, 94, 762, 94)}${line(756, 88, 756, 100)}${line(38, 506, 50, 506)}${line(44, 500, 44, 512)}${line(750, 506, 762, 506)}${line(756, 500, 756, 512)}`;
const diagrams = {
  "street-runway": (uid) => `
    <g class="cm-dim">${line(132, 470, 328, 154)}${line(668, 470, 472, 154)}${line(258, 470, 368, 154)}${line(542, 470, 432, 154)}
      ${[0, 1, 2, 3, 4, 5].map((i) => `<path class="cm-runway-line" style="--i:${i}" d="M270 0H530"/>`).join("")}
    </g>
    <g class="cm-garment cm-garment-back"><path d="M360 194 382 180H418L440 194 458 236 436 246 426 222V296H374V222L364 246 342 236Z"/><path d="M386 184Q400 205 414 184M400 204V288" class="cm-dim"/></g>
    <g class="cm-garment cm-garment-front"><path d="M335 267 370 245H430L465 267 494 336 459 350 442 306V424H358V306L341 350 306 336Z"/><path d="M376 252Q400 285 424 252M400 282V410M365 389H435" class="cm-dim"/>${text(400, 352, "A / F", 'text-anchor="middle" class="cm-logo-type"')}</g>
    <path d="M120 470H680"/><g class="cm-runway-flash">${[160, 220, 580, 640].map((x) => circle(x, 445, 3, 'fill="currentColor"')).join("")}</g>`,
  "qr-cube-crew": (uid) => `
    <g class="cm-cube-orbit">${circle(400, 315, 174, 'class="cm-dim" stroke-dasharray="2 12"')}${line(218, 315, 236, 315)}${line(564, 315, 582, 315)}</g>
    <g class="cm-cube"><path d="M400 140 548 222V390L400 474 252 390V222Z" fill="var(--cm-bg)"/><path d="M252 222 400 306 548 222M400 306V474"/>
      <path class="cm-face-light" d="M400 140 548 222 400 306 252 222Z"/>
      <g transform="matrix(.9 .51 0 1 278 258)">${qr(0, 0, 103)}</g>
      <g transform="matrix(.9 -.51 0 1 423 337)">${qr(0, 0, 103)}</g>
      ${text(400, 227, "SCAN / CONNECT", 'text-anchor="middle" class="cm-micro" transform="rotate(0 400 227)"')}
    </g><path class="cm-scan-line" d="M206 274H594"/>`,
  "live-brand-painting": (uid) => `
    ${rect(192, 146, 416, 305, 'class="cm-dim"')}${line(180, 465, 620, 465)}${line(214, 451, 202, 482)}${line(586, 451, 598, 482)}
    <defs><clipPath id="${uid}-paint-clip">${rect(214, 163, 374, 264)}</clipPath></defs>
    <g clip-path="url(#${uid}-paint-clip)"><g class="cm-paint-strokes" stroke-width="38" stroke-linecap="square"><path class="cm-paint-stroke cm-paint-stroke-1" d="M239 202H562"/><path class="cm-paint-stroke cm-paint-stroke-2" d="M562 248H239"/><path class="cm-paint-stroke cm-paint-stroke-3" d="M239 294H562"/><path class="cm-paint-stroke cm-paint-stroke-4" d="M562 340H239"/><path class="cm-paint-stroke cm-paint-stroke-5" d="M239 386H562"/></g>
      ${text(400, 313, "AICANFEEL", 'text-anchor="middle" class="cm-brand-cutout"')}
    </g><g class="cm-roller">${rect(-31, -17, 62, 34, 'fill="currentColor" rx="2"')}<path d="M31 0H47V40H0V93"/>${rect(-5, 92, 10, 41, 'fill="currentColor"')}</g>`,
  "giant-product-procession": (uid) => `
    <g class="cm-procession-ground cm-dim">${Array.from({ length: 10 }, (_, i) => line(80 + i * 80, 466, 120 + i * 80, 466)).join("")}</g>
    <g class="cm-giant-product"><path d="M304 149H496L487 255 514 436H426L400 291 374 436H286L313 255Z" fill="var(--cm-bg)"/>
      <path d="M304 169H496M400 171V283M313 193Q355 219 367 171M487 193Q445 219 433 171M310 256 351 435M490 256 449 435" class="cm-dim"/>
      ${rect(321, 144, 158, 24, 'fill="var(--cm-bg)"')}${text(400, 161, "AICANFEEL / EXTRA LARGE", 'text-anchor="middle" class="cm-micro"')}
      ${line(400, 108, 400, 142)}${line(360, 116, 400, 100)}${line(440, 116, 400, 100)}
    </g><g class="cm-procession-carrier"><path d="M230 450H570V468H230Z" fill="currentColor"/>${[272, 528].map((x) => `${circle(x, 481, 13, 'fill="var(--cm-bg)"')}${circle(x, 481, 3, 'fill="currentColor"')}`).join("")}</g>
    <path class="cm-dim" d="M230 444 304 420M570 444 496 420"/>`,
  "impact-art-installation": (uid) => `
    ${circle(400, 312, 165, 'class="cm-dim" stroke-dasharray="2 12"')}
    <g class="cm-art-orbit"><path d="M400 146 548 390H252Z"/><path d="M400 478 548 234H252Z"/><path d="M234 312H566M400 146V478" class="cm-dim"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<g transform="rotate(${i * 60} 400 312)">${rect(385, 124, 30, 30, 'fill="var(--cm-bg)"')}${circle(400, 139, 3, 'fill="currentColor"')}</g>`).join("")}
    </g><g class="cm-art-core"><path d="M400 252 452 282V342L400 372 348 342V282Z" fill="var(--cm-bg)"/><path d="M348 282 400 312 452 282M400 312V372"/></g>
    <path d="M339 493H461" class="cm-dim"/>`,
  "coffee-on-your-brand": (uid) => `
    <g class="cm-coffee-steam">${[0, 1, 2].map((i) => `<path class="cm-steam" style="--i:${i}" d="M${370 + i * 30} 220C${350 + i * 30} 197 ${395 + i * 30} 178 ${374 + i * 30} 150"/>`).join("")}</g>
    <g class="cm-coffee-cup"><path d="M303 242H497L474 437Q400 457 326 437Z" fill="var(--cm-bg)"/><ellipse cx="400" cy="242" rx="105" ry="18" fill="var(--cm-bg)"/><ellipse cx="400" cy="237" rx="91" ry="10" class="cm-dim"/>
      <path d="M310 297Q400 316 490 297L482 373Q400 394 318 373Z" fill="currentColor"/>${text(400, 350, "AICANFEEL", 'text-anchor="middle" class="cm-coffee-brand"')}
      <path d="M328 418Q400 438 472 418" class="cm-dim"/>
    </g><g class="cm-coffee-ring">${circle(400, 341, 157, 'stroke-dasharray="1 12" class="cm-dim"')}</g>`,
  "product-tryout": (uid) => `
    <path d="M194 435H606M249 449H551" class="cm-dim"/>
    <g class="cm-try-tray">${rect(275, 380, 250, 25, 'fill="var(--cm-bg)"')}${line(307, 405, 307, 435)}${line(493, 405, 493, 435)}</g>
    <g class="cm-try-product">${rect(354, 213, 92, 156, 'rx="9" fill="var(--cm-bg)"')}${rect(373, 192, 54, 21, 'fill="var(--cm-bg)"')}${rect(368, 251, 64, 75, 'fill="currentColor"')}${text(400, 281, "A / F", 'class="cm-product-brand" text-anchor="middle"')}${text(400, 304, "TRY ME", 'class="cm-product-detail" text-anchor="middle"')}${line(373, 347, 427, 347, 'class="cm-dim"')}</g>
    <g class="cm-try-handoff"><path d="M193 322H253L283 343H343V366H270L240 349H193"/><path d="M607 279H547L517 301H457V324H530L560 306H607"/></g>
    <g class="cm-try-rings">${circle(400, 285, 138, 'class="cm-dim" stroke-dasharray="3 12"')}${circle(400, 285, 165, 'class="cm-dim" stroke-dasharray="1 18"')}</g>`,
  "neighbourhood-brand-trail": (uid) => `
    <g class="cm-map-blocks cm-dim">${[
      [155, 153, 113, 85],
      [300, 153, 146, 85],
      [478, 153, 150, 85],
      [155, 272, 160, 107],
      [350, 272, 100, 107],
      [483, 272, 145, 107],
      [155, 414, 115, 66],
      [302, 414, 180, 66],
      [517, 414, 111, 66],
    ]
      .map(([a, b, c, d]) => rect(a, b, c, d))
      .join("")}</g>
    <path class="cm-map-trail" d="M204 447H285V253H463V396H646V195H552"/>
    ${[
      [204, 447],
      [285, 253],
      [463, 396],
      [646, 195],
      [552, 195],
    ]
      .map(
        ([x, y], i) =>
          `<g class="cm-map-stop" style="--i:${i}">${circle(x, y, 9, 'fill="var(--cm-bg)"')}${circle(x, y, 3, 'fill="currentColor"')}</g>`,
      )
      .join("")}
    <circle class="cm-map-traveller" r="7" fill="currentColor"><animateMotion dur="8s" repeatCount="indefinite" path="M204 447H285V253H463V396H646V195H552"/></circle>
    ${text(175, 188, "A", 'class="cm-map-label"')}${text(322, 305, "F", 'class="cm-map-label"')}${text(506, 452, "A", 'class="cm-map-label"')}`,
  "colour-block-performance": (uid) => `
    <g class="cm-performance-frame cm-dim">${rect(180, 142, 440, 340)}${line(180, 397, 620, 397)}${line(400, 142, 400, 482)}</g>
    <g class="cm-block-grid">${Array.from({ length: 12 }, (_, i) => {
      const x = 236 + (i % 4) * 84,
        y = 193 + Math.floor(i / 4) * 84;
      return `<g class="cm-perform-block" style="--i:${i};--x:${x}px;--y:${y}px">${rect(x, y, 58, 58, 'fill="currentColor"')}${rect(x + 13, y + 13, 32, 32, 'fill="var(--cm-bg)"')}${circle(x + 29, y + 29, 5, 'fill="currentColor"')}</g>`;
    }).join("")}</g>
    ${text(400, 462, "MOVE AS ONE", 'text-anchor="middle" class="cm-micro"')}`,
  "portrait-pop-up": (uid) => `
    <g class="cm-camera-body">${rect(231, 183, 338, 246, 'fill="var(--cm-bg)"')}${rect(268, 162, 95, 21, 'fill="var(--cm-bg)"')}${rect(490, 202, 55, 30, 'class="cm-dim"')}
      <g class="cm-portrait-lens">${circle(400, 307, 90, 'fill="var(--cm-bg)"')}${circle(400, 307, 75, 'class="cm-dim"')}${circle(400, 307, 55)}${Array.from({ length: 6 }, (_, i) => `<path class="cm-shutter-blade" style="--i:${i}" transform="rotate(${i * 60} 400 307)" d="M400 252 448 279 420 307 400 307Z" fill="currentColor"/>`).join("")}</g>
      ${text(259, 405, "AICANFEEL", 'class="cm-micro"')}
    </g><g class="cm-photo-print">${rect(491, 332, 129, 154, 'fill="var(--cm-bg)"')}${rect(502, 344, 107, 107, 'fill="currentColor"')}${circle(555, 379, 16, 'fill="var(--cm-bg)"')}<path d="M520 437V422A35 35 0 0 1 590 422V437Z" fill="var(--cm-bg)"/>${text(555, 472, "YOU / AICANFEEL", 'text-anchor="middle" class="cm-photo-note"')}</g>
    <path class="cm-viewfinder" d="M190 165V143H214M586 143H610V165M190 447V469H214M586 469H610V447"/>
    <rect class="cm-camera-flash" x="231" y="183" width="338" height="246" fill="currentColor"/>`,
};

export function campaignMotion(type, options = {}) {
  const id = Object.hasOwn(diagrams, type) ? type : "impact-art-installation";
  const uid = String(options.uid || `cm-${++serial}`).replace(
    /[^a-zA-Z0-9_-]/g,
    "",
  );
  const title = options.title || tags[id][0];
  let diagram = diagrams[id](uid);
  if (options.brand !== undefined || options.logo) {
    const brand = String(options.brand || "YOUR BRAND").slice(0, 24);
    const logo = typeof options.logo === "string" && /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(options.logo) ? options.logo : null;
    const lockup = (x, y, width, height, reverse = false) => {
      const fill = reverse ? "var(--cm-bg)" : "currentColor";
      if (logo) return `<image data-brand-lockup="logo" href="${esc(logo)}" x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
      const size = Math.min(height * .62, width / Math.max(brand.length * .62, 1));
      return text(x, y, brand, `data-brand-lockup="name" text-anchor="middle" dominant-baseline="central" style="font-family:monospace;font-weight:700;letter-spacing:0;font-size:${size}px;fill:${fill};stroke:none"`);
    };
    const replace = (needle, x, y, width, height, reverse = false) => { diagram = diagram.replace(needle, lockup(x, y, width, height, reverse)); };
    if (id === "street-runway") replace(text(400, 352, "A / F", 'text-anchor="middle" class="cm-logo-type"'), 400, 352, 70, 36);
    if (id === "qr-cube-crew") replace(text(400, 227, "SCAN / CONNECT", 'text-anchor="middle" class="cm-micro" transform="rotate(0 400 227)"'), 400, 223, 132, 34);
    if (id === "live-brand-painting") replace(text(400, 313, "AICANFEEL", 'text-anchor="middle" class="cm-brand-cutout"'), 400, 306, 308, 64, true);
    if (id === "giant-product-procession") replace(text(400, 161, "AICANFEEL / EXTRA LARGE", 'text-anchor="middle" class="cm-micro"'), 400, 157, 145, 18);
    if (id === "impact-art-installation") diagram += lockup(400, 320, 64, 22);
    if (id === "coffee-on-your-brand") replace(text(400, 350, "AICANFEEL", 'text-anchor="middle" class="cm-coffee-brand"'), 400, 345, 143, 42, true);
    if (id === "product-tryout") {
      replace(text(400, 281, "A / F", 'class="cm-product-brand" text-anchor="middle"'), 400, 279, 54, 28, true);
    }
    if (id === "neighbourhood-brand-trail") diagram += `${rect(312, 163, 122, 58, 'fill="var(--cm-bg)" stroke="none"')}${lockup(373, 192, 112, 40)}`;
    if (id === "colour-block-performance") replace(text(400, 462, "MOVE AS ONE", 'text-anchor="middle" class="cm-micro"'), 400, 453, 206, 36);
    if (id === "portrait-pop-up") replace(text(555, 472, "YOU / AICANFEEL", 'text-anchor="middle" class="cm-photo-note"'), 555, 469, 112, 21);
  }
  return `<svg class="campaign-motion cm--${id}" data-campaign-motion="${id}" data-motion-running="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-labelledby="${uid}-title ${uid}-desc"><title id="${uid}-title">${esc(title)}</title><desc id="${uid}-desc">An animated geometric study of the ${esc(tags[id][0].toLowerCase())} campaign format.</desc><g class="cm-ink">${text(44, 58, "AICANFEEL", 'class="cm-top-label"')}${text(756, 58, "OFFLINE / IN MOTION", 'class="cm-top-label" text-anchor="end"')}<g class="cm-registration">${crosses}</g><g class="cm-diagram">${diagram}</g>${text(44, 553, tags[id][1], 'class="cm-footer-label"')}${text(756, 553, "PLAY ↗", 'class="cm-footer-label" text-anchor="end"')}</g></svg>`;
}

/** Observe mounted SVGs; call returned cleanup before replacing the enclosing view. */
/** @param {Document | Element} root */
export function mountCampaignMotions(root = document) {
  const items = [...root.querySelectorAll("[data-campaign-motion]")];
  if (root.matches?.("[data-campaign-motion]")) items.unshift(root);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const visible = new Set(items);
  const apply = () =>
    items.forEach((el) => {
      const running =
        visible.has(el) &&
        !document.hidden &&
        !reduced.matches &&
        !el.closest('[data-motion-paused="true"]');
      el.dataset.motionRunning = String(running);
      // SVG SMIL is paused separately from CSS; visibility never burns hidden work.
      if (running) el.unpauseAnimations?.();
      else el.pauseAnimations?.();
    });
  const observer =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries)
              entry.isIntersecting
                ? visible.add(entry.target)
                : visible.delete(entry.target);
            apply();
          },
          { threshold: 0.05 },
        )
      : null;
  items.forEach((el) => observer?.observe(el));
  const pauseObserver =
    typeof MutationObserver === "function" ? new MutationObserver(apply) : null;
  pauseObserver?.observe(root, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-motion-paused"],
  });
  reduced.addEventListener?.("change", apply);
  document.addEventListener("visibilitychange", apply);
  apply();
  return () => {
    observer?.disconnect();
    pauseObserver?.disconnect();
    reduced.removeEventListener?.("change", apply);
    document.removeEventListener("visibilitychange", apply);
    items.forEach((el) => el.pauseAnimations?.());
  };
}

export const campaignMotionTypes = Object.keys(diagrams);
