import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export default defineConfig({
  root: path.join(root, "pages"),
  base: "/aicanfeel-offline/",
  publicDir: path.join(root, "public"),
  plugins: [react()],
  resolve: { alias: [{ find: "next/dynamic", replacement: path.join(root, "pages/dynamic.tsx") }] },
  define: { __GITHUB_PAGES_BASE__: JSON.stringify("/aicanfeel-offline") },
  build: { outDir: path.join(root, "dist/pages"), emptyOutDir: true },
});
