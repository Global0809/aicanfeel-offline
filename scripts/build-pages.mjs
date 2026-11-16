import { build } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await build({ configFile: path.join(root, "pages/vite.config.mjs") });
const output = path.join(root, "dist/pages");
const html = await readFile(path.join(output, "index.html"), "utf8");
const data = await readFile(path.join(root, "lib/campaigns.ts"), "utf8");
const ids = [...data.matchAll(/^\s+id: "([a-z0-9-]+)",/gm)].map(match => match[1]);
if (new Set(ids).size !== 10) throw new Error("Expected all ten campaigns in the Pages export.");
const routes = ["campaigns", "how-it-works", "about", "terms", "privacy", "studio",
  ...ids.map(id => `campaign/${id}`), ...ids.map(id => `book/${id}`)];
for (const route of routes) {
  await mkdir(path.join(output, route), { recursive: true });
  await writeFile(path.join(output, route, "index.html"), html);
}
await writeFile(path.join(output, "404.html"), html);
await writeFile(path.join(output, ".nojekyll"), "");
await writeFile(path.join(output, "robots.txt"), "User-agent: *\nAllow: /aicanfeel-offline/\n");
console.log(`GitHub Pages export ready: ${routes.length + 1} routes, ten campaigns, all public assets.`);
