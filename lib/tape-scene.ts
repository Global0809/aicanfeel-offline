import * as THREE from 'three';

export type TapeCampaign = {
  id: string;
  name: string;
  tape: string[];
  accent: string;
  number: string | number;
  image: string;
};

export type TapeSceneOptions = {
  onSelect?: (index: number) => void;
  onOpen?: (index: number) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onHover?: (index: number | null) => void;
  initialIndex?: number;
  brand?: string;
  fontFamily?: string;
  monoFamily?: string;
};

export type TapeScene = {
  setIndex: (index: number) => void;
  setBrand: (brand: string) => void;
  getLayout: () => { centerX: number; centerY: number; width: number; height: number };
  destroy: () => void;
};

const CASE = { w: 130, h: 196, d: 30 };
const CASSETTE = { w: 102.5, h: 187.5, d: 25 };
const mod = (n: number, length: number) => ((n % length) + length) % length;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const smoothstep = (n: number) => n * n * (3 - 2 * n);
const damp = (from: number, to: number, speed: number, dt: number) => THREE.MathUtils.lerp(from, to, 1 - Math.exp(-speed * dt));

function random(seed: number) {
  let state = Math.max(1, seed);
  return () => (state = (16807 * state) % 2147483647) / 2147483647;
}

function roundedShape(w: number, h: number, r: number) {
  const x = -w / 2, y = -h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function coverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawCover(
  canvas: HTMLCanvasElement,
  campaign: TapeCampaign,
  index: number,
  image: HTMLImageElement | undefined,
  brand: string,
  displayFamily: string,
  monoFamily: string,
) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const s = W / 762;
  ctx.save();
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.clearRect(0, 0, 762, 1150);
  ctx.fillStyle = '#0a0a09';
  ctx.fillRect(0, 0, 762, 1150);
  const accent = campaign.accent || '#e7e2d9';
  const rand = random(1701 + index * 7919);

  // Restrained ink underprint, as on a printed paper sleeve.
  ctx.strokeStyle = accent;
  ctx.globalAlpha = .42;
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 33, 710, 1084);
  ctx.globalAlpha = .13;
  ctx.beginPath();
  ctx.moveTo(0, 201); ctx.lineTo(762, 201);
  ctx.moveTo(0, 1050); ctx.lineTo(762, 1050);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `19px ${monoFamily}`;
  ctx.fillText(brand.toUpperCase(), 381, 55);
  ctx.font = `46px ${displayFamily}`;
  ctx.fillText('Street Video', 381, 107);
  ctx.font = `13px ${monoFamily}`;
  ctx.fillText('AN OFFLINE ADVERTISING COLLECTION', 381, 135);

  const photo = { x: 82, y: 165, w: 598, h: 482 };
  ctx.fillStyle = '#1a1a18';
  ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
  if (image?.naturalWidth) {
    ctx.save();
    ctx.beginPath(); ctx.rect(photo.x, photo.y, photo.w, photo.h); ctx.clip();
    coverImage(ctx, image, photo.x, photo.y, photo.w, photo.h);
    // A slightly smoky print, rather than a luminous digital display.
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    const shade = ctx.createLinearGradient(0, photo.y, 0, photo.y + photo.h);
    shade.addColorStop(0, 'rgba(0,0,0,.05)'); shade.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = shade; ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    ctx.restore();
  } else {
    // Meaningful typographic fallback while the genuine campaign photo decodes.
    ctx.fillStyle = accent;
    ctx.globalAlpha = .15;
    ctx.font = `230px ${displayFamily}`;
    ctx.fillText(String(campaign.number).padStart(2, '0'), 381, 488);
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = accent;
  ctx.globalAlpha = .9;
  ctx.lineWidth = 3;
  ctx.strokeRect(photo.x, photo.y, photo.w, photo.h);
  ctx.globalAlpha = 1;

  const lines = campaign.tape?.length ? campaign.tape.slice(0, 3) : campaign.name.toUpperCase().split(' ');
  const availableH = 342;
  const baseSize = lines.length > 2 ? 111 : 164;
  let fontSize = baseSize;
  ctx.font = `${fontSize}px ${displayFamily}`;
  for (const titleLine of lines) {
    const measure = ctx.measureText(titleLine.toUpperCase()).width;
    if (measure > 665) fontSize = Math.min(fontSize, baseSize * 665 / measure);
  }
  const lineHeight = Math.min(availableH / lines.length, fontSize * .9);
  const blockH = lineHeight * lines.length;
  const top = 690 + (availableH - blockH) / 2;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${fontSize}px ${displayFamily}`;
  ctx.lineWidth = 1.2;
  lines.forEach((titleLine, i) => {
    const y = top + lineHeight * (i + .84);
    ctx.fillStyle = accent;
    if (i === lines.length - 1 && index % 3 !== 1 && lines.length > 1) {
      ctx.strokeStyle = accent;
      ctx.strokeText(titleLine.toUpperCase(), 381, y);
    } else ctx.fillText(titleLine.toUpperCase(), 381, y);
  });

  // Printed issue furniture, intentionally kept smaller than the product title.
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = accent;
  ctx.textAlign = 'left';
  ctx.fillRect(32, 1073, 91, 42);
  ctx.fillStyle = '#0a0a09';
  ctx.font = `36px ${displayFamily}`;
  ctx.fillText('VHS', 38, 1107);
  ctx.fillStyle = accent;
  ctx.font = `17px ${monoFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText(String(campaign.number).padStart(3, '0'), 381, 1104);
  ctx.textAlign = 'right';
  ctx.font = `13px ${monoFamily}`;
  ctx.fillText('© 2026 / AICANFEEL', 729, 1105);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(684, 1066, 45, 13, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(684, 1066, 14, 13, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(640, 1066); ctx.lineTo(729, 1066); ctx.stroke();

  // Deterministic chipped paper edges: concentrated at folds, never noise over copy.
  for (let i = 0; i < 1650; i++) {
    const side = Math.floor(rand() * 4), t = rand();
    let x = 0, y = 0;
    const inset = Math.pow(rand(), 3) * 19;
    if (side === 0) { x = inset; y = t * 1150; }
    if (side === 1) { x = 762 - inset; y = t * 1150; }
    if (side === 2) { x = t * 762; y = inset; }
    if (side === 3) { x = t * 762; y = 1150 - inset; }
    ctx.fillStyle = `rgba(224,218,201,${.06 + rand() * .58})`;
    const w = 1 + rand() * 8, h = .5 + rand() * 4;
    ctx.save(); ctx.translate(x, y); ctx.rotate((rand() - .5) * .6); ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  for (let i = 0; i < 42; i++) {
    const x = rand() < .5 ? rand() * 24 : 738 + rand() * 24;
    const y = rand() * 1150;
    ctx.strokeStyle = `rgba(230,224,207,${.06 + rand() * .28})`;
    ctx.lineWidth = .7 + rand() * 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 30, y + 12 + rand() * 62); ctx.stroke();
  }
  // Fold creases retain the natural printing underneath.
  for (let i = 0; i < 3; i++) {
    const x = (i % 2 ? 742 : 18) + (rand() - .5) * 10;
    const y = rand() * 600;
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.quadraticCurveTo(381, y + 180, 762 - x, y + 280); ctx.stroke();
    ctx.strokeStyle = 'rgba(238,231,209,.09)'; ctx.lineWidth = .9;
    ctx.beginPath(); ctx.moveTo(x, y - 1); ctx.quadraticCurveTo(381, y + 179, 762 - x, y + 279); ctx.stroke();
  }
  const grain = ctx.getImageData(0, 0, W, H);
  const pixels = grain.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const d = (rand() - .5) * 7;
    pixels[i] = clamp(pixels[i] + d, 0, 255);
    pixels[i + 1] = clamp(pixels[i + 1] + d, 0, 255);
    pixels[i + 2] = clamp(pixels[i + 2] + d, 0, 255);
  }
  ctx.putImageData(grain, 0, 0);
  ctx.restore();
}

/**
 * Framework-neutral, original VHS carousel. Keep accessible links and previous /
 * next controls in the DOM alongside it. Nothing is persisted and no network is
 * used beyond the campaign image URLs supplied by the caller.
 */
export function mountTapeScene(container: HTMLElement, campaigns: TapeCampaign[], options: TapeSceneOptions = {}): TapeScene {
  if (!campaigns.length) throw new Error('The tape carousel needs at least one campaign.');
  let destroyed = false, raf = 0, lastFrame = 0, visible = true, ready = false;
  let brand = options.brand || 'AICANFEEL';
  let width = 1, height = 1, spacingPx = 300, coverWpx = 230, coverHpx = 347, centerY = 330;
  let unitsPerPixel = 1, mouseX = 0, mouseY = 0, tiltX = 0, tiltY = 0;
  let target = options.initialIndex || 0, current = target, emittedIndex = mod(Math.round(target), campaigns.length);
  let intro = 0, hoverIndex: number | null = null, wheelTimer: ReturnType<typeof setTimeout> | undefined;
  let pointer: { id: number; startX: number; startY: number; startIndex: number; lastX: number; lastTime: number; velocity: number; moved: boolean } | null = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) intro = 1;
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geo = <T extends THREE.BufferGeometry>(g: T) => { geometries.add(g); return g; };
  const mat = <T extends THREE.Material>(m: T) => { materials.add(m); return m; };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(14, 1, .1, 100);
  camera.position.z = 10;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:0;';
  canvas.className = 'tape-scene-canvas';
  container.appendChild(canvas);
  const oldTouchAction = container.style.touchAction;
  const oldCursor = container.style.cursor;
  container.style.touchAction = 'none';
  container.style.cursor = 'grab';
  scene.add(new THREE.AmbientLight(0xffffff, .42));
  const key = new THREE.DirectionalLight(0xffffff, 1.45);
  key.position.set(-3, 5, 10); scene.add(key);
  const fill = new THREE.DirectionalLight(0xa6b4cc, .22);
  fill.position.set(4, -2, 5); scene.add(fill);

  const shellGeo = geo(new THREE.BoxGeometry(CASE.w, CASE.h, .9));
  const wallGeo = geo(new THREE.BoxGeometry(1, CASE.h, CASE.d));
  const bottomGeo = geo(new THREE.BoxGeometry(CASE.w - 2, 1, CASE.d));
  const tapeGeo = geo(new THREE.ExtrudeGeometry(roundedShape(CASSETTE.w - 2, CASSETTE.h - 2, 5), { depth: CASSETTE.d - 2, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 2, curveSegments: 4 }));
  tapeGeo.translate(0, 0, -CASSETTE.d / 2 + 1);
  const windowGeo = geo(new THREE.ShapeGeometry(roundedShape(71, 57, 9), 5));
  const screwGeo = geo(new THREE.CylinderGeometry(2.1, 2.1, .55, 10)); screwGeo.rotateX(Math.PI / 2);
  const screwSlotGeo = geo(new THREE.BoxGeometry(2.8, .45, .35));
  const ridgeGeo = geo(new THREE.BoxGeometry(.55, 21, .5));
  const reelGeo = geo(new THREE.TorusGeometry(23, 2, 4, 28));
  const reelInnerGeo = geo(new THREE.RingGeometry(7.2, 19.5, 28));
  const hubGeo = geo(new THREE.CylinderGeometry(6, 6, 1.5, 16)); hubGeo.rotateX(Math.PI / 2);
  const spokeGeo = geo(new THREE.BoxGeometry(2.1, 13, 1));
  const ridgeMat = mat(new THREE.MeshStandardMaterial({ color: 0x353535, roughness: .7 }));
  const blackMat = mat(new THREE.MeshStandardMaterial({ color: 0x080808, roughness: .72, metalness: .03 }));
  const blackEdgeMat = mat(new THREE.MeshStandardMaterial({ color: 0x242424, roughness: .7 }));
  const glassMat = mat(new THREE.MeshStandardMaterial({ color: 0x202421, roughness: .33, metalness: .18 }));
  const reelMat = mat(new THREE.MeshStandardMaterial({ color: 0x6c6b64, roughness: .7, metalness: .04 }));
  const metalMat = mat(new THREE.MeshStandardMaterial({ color: 0x5b5c59, roughness: .6, metalness: .3 }));
  const hubMat = mat(new THREE.MeshStandardMaterial({ color: 0x161614, roughness: .7 }));
  const images = new Map<number, HTMLImageElement>();
  const css = getComputedStyle(container);
  const displayFamily = options.fontFamily || css.getPropertyValue('--font-display').trim() || 'Advercase, Georgia, serif';
  const monoFamily = options.monoFamily || css.getPropertyValue('--font-mono').trim() || 'monospace';

  const tapes = campaigns.map((campaign, index) => {
    const group = new THREE.Group(); scene.add(group);
    const sleeve = new THREE.Group(); group.add(sleeve);
    const artwork = document.createElement('canvas');
    artwork.width = container.clientWidth < 700 ? 610 : 762;
    artwork.height = Math.round(artwork.width * 1150 / 762);
    drawCover(artwork, campaign, index, undefined, brand, displayFamily, monoFamily);
    const texture = new THREE.CanvasTexture(artwork);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.add(texture);
    const coverMaterial = mat(new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff }));
    const sideMaterial = mat(new THREE.MeshStandardMaterial({ color: 0x262523, roughness: .88 }));
    const backMaterial = mat(new THREE.MeshStandardMaterial({ color: 0x111110, roughness: .9 }));
    const front = new THREE.Mesh(shellGeo, coverMaterial);
    front.position.z = CASE.d / 2;
    front.userData.tapeIndex = index;
    sleeve.add(front);
    const back = new THREE.Mesh(shellGeo, backMaterial); back.position.z = -CASE.d / 2; sleeve.add(back);
    const left = new THREE.Mesh(wallGeo, sideMaterial); left.position.x = -CASE.w / 2 + .5; sleeve.add(left);
    const right = new THREE.Mesh(wallGeo, sideMaterial); right.position.x = CASE.w / 2 - .5; sleeve.add(right);
    const bottom = new THREE.Mesh(bottomGeo, sideMaterial); bottom.position.y = -CASE.h / 2 + .5; sleeve.add(bottom);

    const cassette = new THREE.Group();
    cassette.position.z = -1;
    group.add(cassette);
    cassette.add(new THREE.Mesh(tapeGeo, blackMat));
    // The transparent reel window catches light above the sleeve's open mouth.
    const reelWindow = new THREE.Mesh(windowGeo, glassMat); reelWindow.position.set(0, 53.5, 12.6); cassette.add(reelWindow);
    const reels: THREE.Group[] = [];
    for (const y of [-53.5, 53.5]) {
      const reel = new THREE.Group(); reel.position.set(0, y, 13.1); cassette.add(reel); reels.push(reel);
      reel.add(new THREE.Mesh(reelGeo, blackEdgeMat));
      const ring = new THREE.Mesh(reelInnerGeo, reelMat); reel.add(ring);
      const hub = new THREE.Mesh(hubGeo, hubMat); hub.position.z = .8; reel.add(hub);
      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(spokeGeo, blackMat); spoke.rotation.z = i * Math.PI / 3;
        spoke.position.set(Math.sin(i * Math.PI / 3) * 12.4, Math.cos(i * Math.PI / 3) * 12.4, 1);
        reel.add(spoke);
      }
    }
    for (const x of [-43, 43]) for (const y of [-84, 84]) {
      const screw = new THREE.Mesh(screwGeo, metalMat); screw.position.set(x, y, 12.9); cassette.add(screw);
      const slot = new THREE.Mesh(screwSlotGeo, blackMat); slot.position.set(x, y, 13.4); slot.rotation.z = (index % 3 - 1) * .7; cassette.add(slot);
    }
    for (let i = 0; i < 14; i++) {
      const x = (i < 7 ? -1 : 1) * (39 + (i % 7) * 1.3);
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat); ridge.position.set(x, 64, 13); cassette.add(ridge);
    }
    const lip = new THREE.Mesh(geo(new THREE.BoxGeometry(CASSETTE.w - 9, 3, 2)), blackEdgeMat);
    lip.position.set(0, CASSETTE.h / 2 - 6, 12); cassette.add(lip);
    return { group, sleeve, cassette, reels, coverMaterial, sideMaterial, backMaterial, texture, artwork, front, peek: 0, brightness: 1 };
  });
  const pickables = tapes.map(tape => tape.front);
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  const invalidate = () => {
    if (!destroyed && !raf && visible && !document.hidden) raf = requestAnimationFrame(render);
  };

  function layout() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const mobile = width < 700;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.3 : 1.8));
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    unitsPerPixel = viewHeight / height;
    if (mobile) {
      coverWpx = Math.min(width * .72, (height * .54) * CASE.w / CASE.h);
      coverHpx = coverWpx * CASE.h / CASE.w;
      spacingPx = coverWpx * 1.27;
      centerY = height * .475;
    } else {
      coverWpx = Math.min(width * .195, (height * .54) * CASE.w / CASE.h);
      coverHpx = coverWpx * CASE.h / CASE.w;
      spacingPx = coverWpx * 1.31;
      centerY = height * .452;
    }
    invalidate();
  }

  function pick(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    pointerNdc.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObjects(pickables.filter(mesh => mesh.parent?.parent?.visible), false)[0];
    return hit ? Number(hit.object.userData.tapeIndex) : null;
  }

  function select(index: number) {
    const normalized = mod(index, campaigns.length);
    if (normalized !== emittedIndex) {
      emittedIndex = normalized;
      options.onSelect?.(normalized);
    }
  }

  function snap() {
    target = Math.round(target);
    select(target);
    invalidate();
  }

  function render(now: number) {
    raf = 0;
    if (destroyed || !visible || document.hidden) return;
    const dt = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : 1 / 60;
    lastFrame = now;
    if (reduced.matches) {
      current = target; intro = 1; tiltX = 0; tiltY = 0;
    } else {
      current = damp(current, target, pointer ? 19 : 8.8, dt);
      intro = damp(intro, 1, 5.5, dt);
      tiltX = damp(tiltX, mouseX, 4.5, dt);
      tiltY = damp(tiltY, mouseY, 4.5, dt);
    }
    const entering = intro < .999;
    if (!entering) intro = 1;
    const arcRadius = spacingPx * 4;
    const scale = coverWpx / CASE.w * unitsPerPixel;
    let settling = !reduced.matches && (Math.abs(current - target) > .0001 || Math.abs(tiltX - mouseX) > .001 || Math.abs(tiltY - mouseY) > .001 || entering);
    const activeIndex = mod(Math.round(current), campaigns.length);
    for (let i = 0; i < tapes.length; i++) {
      const tape = tapes[i];
      let delta = mod(i - current + campaigns.length / 2, campaigns.length) - campaigns.length / 2;
      if (campaigns.length === 1) delta = 0;
      const x = delta * spacingPx;
      const angle = x / arcRadius;
      tape.group.visible = Math.abs(x) < width / 2 + coverWpx;
      if (!tape.group.visible) continue;
      const drop = arcRadius * (1 - Math.cos(angle));
      tape.group.position.set(Math.sin(angle) * arcRadius * unitsPerPixel, (height / 2 - centerY - drop) * unitsPerPixel, -Math.abs(delta) * .018);
      tape.group.scale.setScalar(scale * (.95 + intro * .05));
      tape.group.rotation.z = -angle;
      tape.group.rotation.x = -.88 * (1 - smoothstep(intro)) - tiltY * .035;
      tape.group.rotation.y = tiltX * .065;
      const focus = clamp(1 - Math.abs(delta) / .72, 0, 1);
      const lit = smoothstep(focus);
      const brightness = (.13 + .87 * lit) * (.35 + intro * .65);
      tape.coverMaterial.color.setScalar(brightness);
      tape.sideMaterial.color.setScalar(.014 + .010 * lit);
      tape.backMaterial.color.setScalar(.003 + .003 * lit);
      const wantPeek = Math.abs(delta) < .1 && !pointer ? 1 : 0;
      tape.peek = reduced.matches ? wantPeek : damp(tape.peek, wantPeek, wantPeek ? 2.6 : 5.8, dt);
      if (Math.abs(tape.peek - wantPeek) > .001) settling = true;
      tape.sleeve.position.y = -tape.peek * 4;
      tape.cassette.position.y = tape.peek * 21;
      tape.cassette.visible = tape.peek > .025;
      if (!reduced.matches && settling) {
        tape.reels[0].rotation.z += dt * .6 * tape.peek;
        tape.reels[1].rotation.z -= dt * .78 * tape.peek;
      }
    }
    if (!pointer && Math.abs(current - target) < .07) select(activeIndex);
    renderer.render(scene, camera);
    if (settling) invalidate();
  }

  const pointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || (event.target instanceof Element && event.target.closest('a,button,input,select,textarea'))) return;
    pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, startIndex: target, lastX: event.clientX, lastTime: performance.now(), velocity: 0, moved: false };
    canvas.setPointerCapture(event.pointerId);
    container.style.cursor = 'grabbing';
    if (wheelTimer) clearTimeout(wheelTimer);
  };
  const pointerMove = (event: PointerEvent) => {
    const bounds = container.getBoundingClientRect();
    mouseX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    mouseY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    if (pointer?.id === event.pointerId) {
      const dx = event.clientX - pointer.startX, dy = event.clientY - pointer.startY;
      if (Math.hypot(dx, dy) > 6) pointer.moved = true;
      if (pointer.moved) {
        const time = performance.now();
        const elapsed = Math.max(8, time - pointer.lastTime);
        pointer.velocity = damp(pointer.velocity, -(event.clientX - pointer.lastX) / spacingPx / elapsed * 1000, 20, elapsed / 1000);
        pointer.lastX = event.clientX; pointer.lastTime = time;
        target = pointer.startIndex - dx / spacingPx;
        select(Math.round(target));
      }
    } else {
      const hovered = pick(event.clientX, event.clientY);
      if (hovered !== hoverIndex) { hoverIndex = hovered; options.onHover?.(hovered); }
      container.style.cursor = hovered === emittedIndex ? 'pointer' : 'grab';
    }
    if (!reduced.matches || pointer) invalidate();
  };
  const pointerUp = (event: PointerEvent) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const interaction = pointer; pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    container.style.cursor = 'grab';
    if (interaction.moved) {
      if (!reduced.matches && performance.now() - interaction.lastTime < 100) target += clamp(interaction.velocity * .15, -.7, .7);
      snap();
    } else {
      const index = pick(event.clientX, event.clientY);
      if (index !== null) {
        if (index === mod(Math.round(target), campaigns.length) && Math.abs(current - target) < .22) options.onOpen?.(index);
        else setIndex(index);
      }
    }
  };
  const pointerCancel = () => { pointer = null; container.style.cursor = 'grab'; snap(); };
  const pointerLeave = () => { mouseX = mouseY = 0; if (hoverIndex !== null) options.onHover?.(null); hoverIndex = null; invalidate(); };
  const wheel = (event: WheelEvent) => {
    if (event.target instanceof Element && event.target.closest('input,textarea,select,[data-scrollable]')) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const normalized = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
    target += clamp(normalized / 180, -1.4, 1.4);
    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(snap, 135);
    select(Math.round(target));
    invalidate();
  };
  function setIndex(index: number) {
    const normalized = mod(Math.round(index), campaigns.length);
    if (mod(Math.round(target), campaigns.length) === normalized) return;
    target += mod(normalized - mod(target, campaigns.length) + campaigns.length / 2, campaigns.length) - campaigns.length / 2;
    target = Math.round(target);
    select(target); invalidate();
  }
  function redraw(index: number) {
    if (destroyed) return;
    const tape = tapes[index];
    try {
      drawCover(tape.artwork, campaigns[index], index, images.get(index), brand, displayFamily, monoFamily);
      tape.texture.needsUpdate = true;
    } catch (error) {
      // Cross-origin images without CORS never break the functional carousel.
      console.warn('Campaign cover image could not be printed to the tape.', error);
    }
    invalidate();
  }
  function markReady() {
    if (destroyed || ready) return;
    ready = true;
    layout();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    render(performance.now());
    options.onReady?.();
    invalidate();
  }
  const resizeObserver = new ResizeObserver(layout); resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true;
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; }
    if (visible) invalidate();
  }, { threshold: .01 }); visibilityObserver.observe(container);
  const visibility = () => { if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; } else invalidate(); };
  const mediaChange = () => { if (reduced.matches) { mouseX = mouseY = tiltX = tiltY = 0; current = target; intro = 1; } invalidate(); };
  const contextLost = (event: Event) => { event.preventDefault(); if (raf) cancelAnimationFrame(raf); raf = 0; options.onError?.(new Error('The 3D display context was interrupted.')); };
  const contextRestored = () => { invalidate(); options.onReady?.(); };
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerCancel);
  canvas.addEventListener('pointerleave', pointerLeave);
  container.addEventListener('wheel', wheel, { passive: false });
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', mediaChange);
  layout();

  const fontReady = document.fonts?.ready || Promise.resolve();
  const imageLoads = campaigns.map((campaign, index) => new Promise<void>(resolve => {
    if (!campaign.image) { resolve(); return; }
    const image = new Image(); image.crossOrigin = 'anonymous'; image.decoding = 'async';
    image.onload = () => { if (!destroyed) { images.set(index, image); fontReady.then(() => redraw(index)); } resolve(); };
    image.onerror = () => resolve(); image.src = campaign.image;
  }));
  fontReady.then(() => { if (!destroyed) tapes.forEach((_, i) => redraw(i)); });
  const timeout = setTimeout(markReady, 3500);
  Promise.all([fontReady, imageLoads[emittedIndex]]).then(() => { clearTimeout(timeout); markReady(); });

  return {
    setIndex,
    setBrand(nextBrand: string) { brand = nextBrand; tapes.forEach((_, i) => redraw(i)); },
    getLayout() { return { centerX: width / 2, centerY, width: coverWpx, height: coverHpx }; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (wheelTimer) clearTimeout(wheelTimer);
      clearTimeout(timeout);
      resizeObserver.disconnect(); visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', mediaChange);
      canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerCancel); canvas.removeEventListener('pointerleave', pointerLeave);
      container.removeEventListener('wheel', wheel); canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
      textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose());
      renderer.renderLists.dispose(); renderer.dispose();
      canvas.remove(); container.style.touchAction = oldTouchAction; container.style.cursor = oldCursor;
      images.clear();
    },
  };
}
