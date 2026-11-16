'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from './SiteLink';
import gsap from 'gsap';
import { campaigns, cityInfo, commonFAQ, money, photo, price, shotLabels, type Campaign, type City } from '../lib/campaigns';

export type CampaignReelProps = {
  campaign: Campaign;
  city: City;
  onCityChange?: (city: City) => void;
  preview?: ReactNode;
  onOverview?: () => void;
};

type ReelControls = { move: (direction: number) => void; jump: (index: number) => void };
const inertControls: ReelControls = { move: () => {}, jump: () => {} };
const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function canScrollInside(target: EventTarget | null, boundary: HTMLElement, delta: number) {
  let node = target instanceof Element ? target.closest<HTMLElement>('[data-reel-scroll]') : null;
  while (node && node !== boundary) {
    if (node.scrollHeight > node.clientHeight + 2 && ((delta > 0 && node.scrollTop < node.scrollHeight - node.clientHeight - 1) || (delta < 0 && node.scrollTop > 1))) return true;
    node = node.parentElement?.closest<HTMLElement>('[data-reel-scroll]') ?? null;
  }
  return false;
}

export default function CampaignReel(props: CampaignReelProps) {
  return <CampaignReelContent key={props.campaign.id} {...props}/>;
}

function CampaignReelContent({ campaign: c, city, onCityChange, preview, onOverview }: CampaignReelProps) {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const controls = useRef<ReelControls>(inertControls);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [ends, setEnds] = useState({ start: true, end: false });
  const [zoom, setZoom] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = `cr-${c.id}`;
  const helpId = `${uid}-help`, titleId = `${uid}-title`, cityId = `${uid}-city`;
  const hasPreview = Boolean(preview);
  const frames = hasPreview ? 16 : 15;
  const currentCampaign = campaigns.findIndex(item => item.id === c.id);
  const nextCampaign = campaigns[(currentCampaign + 1 + campaigns.length) % campaigns.length];

  // Vinext's SSR graph can load a second React through @gsap/react. The native
  // effect avoids that edge case; matchMedia owns and reverts all GSAP contexts.
  useEffect(() => {
    if (!viewport.current || !track.current) return;
    const view = viewport.current, reel = track.current;
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 1025px)', mobile: '(max-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      const horizontal = Boolean(context.conditions?.desktop);
      const reduced = Boolean(context.conditions?.reduce);
      const property = horizontal ? 'scrollLeft' : 'scrollTop';
      const panels = [...reel.querySelectorAll<HTMLElement>('[data-reel-panel]')];
      let positions: number[] = [], maximum = 0, intended = 0, syncRaf = 0, suppressClickUntil = 0;
      let drag: { id: number; x: number; y: number; start: number; lastX: number; time: number; velocity: number; moved: boolean } | null = null;
      const glide = gsap.quickTo(view, property, { duration: .55, ease: 'power3.out', overwrite: true });

      const sync = () => {
        syncRaf = 0;
        const position = view[property];
        let nearest = 0, distance = Infinity;
        positions.forEach((stop, i) => { const d = Math.abs(stop - position); if (d <= distance) { distance = d; nearest = i; } });
        if (nearest !== activeRef.current) { activeRef.current = nearest; setActive(nearest); }
        const atStart = position < 2, atEnd = position > maximum - 2;
        setEnds(old => old.start === atStart && old.end === atEnd ? old : { start: atStart, end: atEnd });
        if (progressBar.current) progressBar.current.style.transform = `scaleX(${maximum ? clamp(position / maximum, 0, 1) : 0})`;
      };
      const queueSync = () => { if (!syncRaf) syncRaf = requestAnimationFrame(sync); };
      const go = (destination: number, immediate = false) => {
        intended = clamp(destination, 0, maximum);
        if (reduced || immediate) { glide.tween.pause(); view[property] = intended; queueSync(); }
        else glide(intended, view[property]);
      };
      const measure = () => {
        const style = getComputedStyle(reel);
        const padding = parseFloat(horizontal ? style.paddingLeft : style.paddingTop) || 0;
        maximum = Math.max(0, horizontal ? view.scrollWidth - view.clientWidth : view.scrollHeight - view.clientHeight);
        positions = panels.map(panel => clamp((horizontal ? panel.offsetLeft : panel.offsetTop) - padding, 0, maximum));
        intended = clamp(view[property], 0, maximum);
        queueSync();
      };
      controls.current = {
        move(direction) {
          let planned = activeRef.current, closest = Infinity;
          positions.forEach((stop, index) => { const difference = Math.abs(stop - intended); if (difference <= closest) { closest = difference; planned = index; } });
          go(positions[clamp(planned + direction, 0, panels.length - 1)] || 0);
        },
        jump(index) { go(positions[clamp(index, 0, panels.length - 1)] || 0); },
      };
      const onScroll = () => { if (!glide.tween.isActive() && !drag) intended = view[property]; queueSync(); };
      const onWheel = (event: WheelEvent) => {
        if (!horizontal) { glide.tween.pause(); intended = view[property]; return; }
        if (event.ctrlKey || (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable="true"]'))) return;
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta || canScrollInside(event.target, view, delta)) return;
        event.preventDefault();
        const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.clientWidth : 1;
        go(intended + delta * multiplier);
      };
      const onDown = (event: PointerEvent) => {
        if (!horizontal || event.pointerType === 'touch') { glide.tween.pause(); intended = view[property]; return; }
        if (event.button !== 0) return;
        const protectedNode = event.target instanceof Element ? event.target.closest('a,input,select,textarea,summary,[contenteditable="true"],[data-reel-no-drag],button:not([data-reel-photo])') : null;
        if (protectedNode) return;
        glide.tween.pause();
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: view.scrollLeft, lastX: event.clientX, time: performance.now(), velocity: 0, moved: false };
      };
      const onMove = (event: PointerEvent) => {
        if (!drag || drag.id !== event.pointerId) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (!drag.moved && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) { drag.moved = true; view.setPointerCapture(event.pointerId); view.classList.add('cr-is-dragging'); }
        if (!drag.moved) return;
        event.preventDefault();
        const time = performance.now(), elapsed = Math.max(8, time - drag.time);
        drag.velocity = clamp(-(event.clientX - drag.lastX) / elapsed, -4, 4);
        drag.lastX = event.clientX; drag.time = time;
        intended = clamp(drag.start - dx, 0, maximum);
        view.scrollLeft = intended;
      };
      const onUp = (event: PointerEvent) => {
        if (!drag || drag.id !== event.pointerId) return;
        const gesture = drag; drag = null;
        if (view.hasPointerCapture(event.pointerId)) view.releasePointerCapture(event.pointerId);
        view.classList.remove('cr-is-dragging');
        if (gesture.moved) { suppressClickUntil = performance.now() + 250; if (performance.now() - gesture.time < 90) go(intended + gesture.velocity * 145); }
      };
      const onCancel = () => { drag = null; view.classList.remove('cr-is-dragging'); };
      const onClick = (event: MouseEvent) => { if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); } };
      const onFocus = (event: FocusEvent) => {
        const panel = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-reel-panel]') : null;
        if (!panel || panel === panels[0]) return;
        const index = panels.indexOf(panel);
        if (index >= 0) go(positions[index]);
      };
      const resize = new ResizeObserver(measure); resize.observe(view); resize.observe(reel);
      view.addEventListener('scroll', onScroll, { passive: true });
      view.addEventListener('wheel', onWheel, { passive: false });
      view.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onCancel);
      view.addEventListener('click', onClick, true); view.addEventListener('focusin', onFocus);
      measure();
      const preserved = Math.min(activeRef.current, panels.length - 1);
      go(positions[preserved] || 0, true);
      return () => {
        controls.current = inertControls;
        if (syncRaf) cancelAnimationFrame(syncRaf);
        resize.disconnect(); glide.tween.kill();
        view.removeEventListener('scroll', onScroll); view.removeEventListener('wheel', onWheel); view.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel);
        view.removeEventListener('click', onClick, true); view.removeEventListener('focusin', onFocus); view.classList.remove('cr-is-dragging');
      };
    });
    return () => media.revert();
  }, [c.id, hasPreview]);

  useEffect(() => {
    if (zoom !== null && !dialog.current?.open) dialog.current?.showModal();
    if (zoom === null && dialog.current?.open) dialog.current.close();
  }, [zoom]);

  const imagePanel = (index: number, className = '') => <figure className={`cr-panel cr-photo ${className}`} data-reel-panel data-reel-label={shotLabels[index - 1]} key={`photo-${index}`}>
    <button type="button" data-reel-photo onClick={() => setZoom(index - 1)} aria-label={`Enlarge photograph ${index}: ${shotLabels[index - 1]}`}>
      <img src={photo(c, index)} alt={`${c.name}: ${shotLabels[index - 1].toLowerCase()}. Campaign concept visualization.`} width="1536" height="1024" loading={index === 1 ? 'eager' : 'lazy'} fetchPriority={index === 1 ? 'high' : 'auto'} draggable={false}/>
      <span className="cr-enlarge" aria-hidden="true">[Enlarge ↗]</span>
    </button>
    <figcaption><span>{pad(index)} / {shotLabels[index - 1]}</span><span>Concept visualization</span></figcaption>
  </figure>;

  const keyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable="true"]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); controls.current.move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); controls.current.move(-1); }
    if (event.key === 'Home') { event.preventDefault(); controls.current.jump(0); }
    if (event.key === 'End') { event.preventDefault(); controls.current.jump(frames - 1); }
  };

  return <article className="campaign-reel" ref={root} aria-labelledby={titleId}>
    <p className="cr-sr-only" id={helpId}>Explore this campaign as a photographic reel. On a large screen, scroll or drag sideways. On a smaller screen, scroll down. Focus this gallery and use the left and right arrow keys to move between panels, or Home and End to reach either end. Each photograph opens an enlarged view.</p>
    <div className="cr-scroll" ref={viewport} tabIndex={0} role="region" aria-label={`${c.name} campaign reel`} aria-describedby={helpId} onKeyDown={keyDown}>
      <div className="cr-track" ref={track}>
        <section className="cr-panel cr-intro" data-reel-panel data-reel-label="Campaign overview" aria-label="Campaign overview" data-reel-no-drag>
          <dl className="cr-meta">
            <div><dt>[Format]</dt><dd>{c.format}</dd></div>
            <div><dt><label htmlFor={onCityChange ? cityId : undefined}>[City]</label></dt><dd>{onCityChange ? <select id={cityId} value={city} onChange={event => onCityChange(event.target.value as City)} aria-label="Choose campaign city"><option value="new-york">New York / USD</option><option value="london">London / GBP</option></select> : cityInfo[city].name}</dd></div>
            <div><dt>[Duration]</dt><dd>{c.duration}</dd><dd>{c.lead}</dd></div>
            <div><dt>[Production from]</dt><dd>{money(price(c, city), city)} {cityInfo[city].currency}</dd><dd className="cr-dim">Location fees &amp; tax extra</dd></div>
          </dl>
          <div className="cr-intro-story" data-reel-scroll>
            <h1 id={titleId}>{c.name}</h1>
            <p>{c.description}</p>
            <Link href={`/book/${c.id}`} className="cr-book-link" prefetch={false}>Build this campaign <span aria-hidden="true">[↗]</span></Link>
            <p className="cr-small">Date, location and scope are approved before payment.</p>
          </div>
        </section>
        {imagePanel(1, 'cr-photo-hero')}
        {imagePanel(4, 'cr-photo-wide')}
        <section className="cr-panel cr-copy cr-scope" data-reel-panel data-reel-label="The physical idea" aria-label="The physical idea" data-reel-scroll data-reel-no-drag>
          <p className="cr-panel-label">[The physical idea]</p><h2>{c.tagline}</h2><p>{c.physical}</p>
          <dl className="cr-detail-list"><div><dt>On site</dt><dd>{c.crew}</dd></div><div><dt>Planning</dt><dd>{c.lead}</dd></div><div><dt>Made for</dt><dd>{c.bestFor.join(' / ')}</dd></div></dl>
        </section>
        {imagePanel(2, 'cr-photo-portrait')}
        {imagePanel(3, 'cr-photo-composition')}
        <section className="cr-panel cr-copy" data-reel-panel data-reel-label="How the moment unfolds" aria-label="How the moment unfolds" data-reel-scroll data-reel-no-drag>
          <p className="cr-panel-label">[The experience]</p><h2>From first look<br/>to real encounter.</h2><ol className="cr-experience">{c.experience.map(step => <li key={step}>{step}</li>)}</ol>
          <p className="cr-small">Creative, casting and the production site are confirmed together.</p>
        </section>
        {imagePanel(5, 'cr-photo-wide')}
        <section className="cr-panel cr-copy cr-production" data-reel-panel data-reel-label="Included and quoted separately" aria-label="Included and quoted separately" data-reel-scroll data-reel-no-drag>
          <p className="cr-panel-label">[Your production]</p><h2>A clear scope.<br/>Before we roll.</h2>
          <div className="cr-scope-columns"><div><h3>Included</h3><ul>{c.included.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>Quoted separately</h3><ul>{c.exclusions.map(item => <li key={item}>{item}</li>)}</ul><p className="cr-small">Location fees, public permissions, weather fallback and usage rights are written into your final proposal.</p></div></div>
        </section>
        {imagePanel(6, 'cr-photo-film')}
        {imagePanel(7, 'cr-photo-setup')}
        {preview ? <section className="cr-panel cr-preview-panel" data-reel-panel data-reel-label="Your brand direction" aria-label="Your brand direction" data-reel-scroll data-reel-no-drag><div className="cr-preview-heading"><p className="cr-panel-label">[Your brand, in motion]</p><h2>Put your name<br/>in the picture.</h2></div><div className="cr-preview-content">{preview}</div></section> : null}
        {imagePanel(8, 'cr-photo-audience')}
        <section className="cr-panel cr-copy cr-questions" data-reel-panel data-reel-label="Before you book" aria-label="Before you book" data-reel-scroll data-reel-no-drag><p className="cr-panel-label">[Before you book]</p><h2>The details<br/>behind the moment.</h2><div className="cr-faq">{commonFAQ.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
        {imagePanel(9, 'cr-photo-finale')}
        <section className="cr-panel cr-copy cr-finish" data-reel-panel data-reel-label="Build your campaign" aria-label="Build your campaign" data-reel-scroll data-reel-no-drag><p className="cr-panel-label">[Your next real-world moment]</p><h2>Make it<br/>your campaign.</h2><p>{c.tagline}</p><div className="cr-final-price"><span>Production from</span><strong>{money(price(c, city), city)}</strong><span>{cityInfo[city].currency} / {cityInfo[city].name}</span></div><Link href={`/book/${c.id}`} className="cr-book-link" prefetch={false}>Start your brief <span aria-hidden="true">[↗]</span></Link><p className="cr-small">No payment until your production scope is approved.</p><Link className="cr-next-campaign" href={`/campaign/${nextCampaign.id}`} prefetch={false}><span>[Next tape]</span><span>{nextCampaign.name} ↗</span></Link></section>
      </div>
    </div>
    <div className="cr-toolbar">
      <div className="cr-progress" aria-hidden="true"><span ref={progressBar}/></div>
      <div className="cr-reel-controls"><button type="button" onClick={() => controls.current.move(-1)} aria-label="Previous reel panel" disabled={ends.start}>←</button><span className="cr-count" aria-live="polite" aria-atomic="true">{pad(active + 1)} <span>/ {pad(frames)}</span></span><button type="button" onClick={() => controls.current.move(1)} aria-label="Next reel panel" disabled={ends.end}>→</button>{onOverview ? <button type="button" className="cr-overview" onClick={onOverview}>Overview</button> : null}</div>
      <Link className="cr-mini-buy" href={`/book/${c.id}`} prefetch={false}><span>From {money(price(c, city), city)} <small>{cityInfo[city].currency}</small></span><span>Build <span className="cr-buy-full">campaign </span>↗</span></Link>
    </div>
    <dialog className="cr-zoom" ref={dialog} onCancel={() => setZoom(null)} onClose={() => setZoom(null)} aria-label={`${c.name} enlarged concept photographs`} onClick={event => { if (event.target === dialog.current) setZoom(null); }} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); setZoom(old => old === null ? null : (old + 1) % 9); } if (event.key === 'ArrowLeft') { event.preventDefault(); setZoom(old => old === null ? null : (old + 8) % 9); } }}>
      <button className="cr-zoom-close" type="button" onClick={() => setZoom(null)}>Close [ESC]</button>
      {zoom !== null ? <><img src={photo(c, zoom + 1)} alt={`${c.name}: ${shotLabels[zoom]}. Campaign concept visualization.`}/><div className="cr-zoom-caption"><button type="button" aria-label="Previous photograph" onClick={() => setZoom((zoom + 8) % 9)}>←</button><p>{pad(zoom + 1)} / 09 · {shotLabels[zoom]}<small>Concept visualization</small></p><button type="button" aria-label="Next photograph" onClick={() => setZoom((zoom + 1) % 9)}>→</button></div></> : null}
    </dialog>
  </article>;
}
