/** Build the published images from the reviewed manifest, including selected revisions. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = process.cwd();
const input = path.resolve(root, '../imagery');
const output = path.join(root, 'public/campaigns');
const manifest = JSON.parse(await fs.readFile(path.join(input, 'asset-manifest.json'), 'utf8'));
const assets = manifest.assets;
if (assets.length !== 90 || new Set(assets.map(a => `${a.slug}/${a.index}`)).size !== 90) throw new Error('Expected 90 unique reviewed image slots.');
let written = 0, bytes = 0;
const selected = [];
for (const asset of assets) {
  const source = path.resolve(asset.path);
  if (!source.startsWith(input + path.sep)) throw new Error('Image source is outside the imagery folder.');
  const out = path.join(output, asset.slug);
  await fs.mkdir(out, { recursive: true });
  const stem = String(asset.index).padStart(2, '0');
  const target = path.join(out, `${stem}.webp`);
  const sourceTime = (await fs.stat(source)).mtimeMs;
  let fresh = false;
  try { fresh = (await fs.stat(target)).mtimeMs >= sourceTime; } catch {}
  if (!fresh) {
    await sharp(source).resize({ width: 1536, withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(target);
    written++;
  }
  bytes += (await fs.stat(target)).size;
  if (asset.index === 1) {
    const cover = path.join(out, 'cover.webp');
    let freshCover = false;
    try { freshCover = (await fs.stat(cover)).mtimeMs >= sourceTime; } catch {}
    if (!freshCover) await sharp(source).resize({ width: 768, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(cover);
  }
  selected.push({ slug: asset.slug, index: asset.index, file: `${asset.slug}/${stem}.webp`, shotLabel: asset.shotLabel, palette: asset.palette, sourceSha256: asset.sha256 });
}
await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify({ classification: manifest.classification, assets: selected }, null, 2) + '\n');
await fs.mkdir(path.join(root, 'docs'), { recursive: true });
const provenance = assets.map(a => ({
  slug: a.slug, index: a.index,
  file: `public/campaigns/${a.slug}/${String(a.index).padStart(2, '0')}.webp`,
  shotLabel: a.shotLabel, palette: a.palette, prompt: a.prompt,
  originalSha256: a.sha256, selectedOriginal: path.basename(a.path), generator: manifest.tool,
}));
await fs.writeFile(path.join(root, 'docs/image-provenance.json'), JSON.stringify({ classification: manifest.classification, assets: provenance }, null, 2) + '\n');
console.log(JSON.stringify({ publishedSlots: selected.length, written, totalBytes: bytes }));
