import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "dist", "client");
const siteHtml = join(outDir, "site.html");
const indexHtml = join(outDir, "index.html");

if (!existsSync(siteHtml)) {
  console.error("[copy-index] dist/client/site.html not found. Run npm run build first.");
  process.exit(1);
}

copyFileSync(siteHtml, indexHtml);
console.log("[copy-index] Created dist/client/index.html from site.html");
