// Render poster/poster.html to entry.png at exactly 1024x1024 using headless
// Chrome's built-in --screenshot mode. Dev-only: the grader never runs this.
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = join(repoRoot, "poster", "poster.html");
const outPath = process.argv[2] ?? join(repoRoot, "entry.png");

const candidates = [
  process.env.CHROME_PATH,
  join(process.env.HOME ?? "", "workspace/makefun/token-radar-work/chrome-linux64/chrome"),
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome binary found. Set CHROME_PATH.");
  process.exit(1);
}
if (!existsSync(htmlPath)) {
  console.error("Poster source missing:", htmlPath);
  process.exit(1);
}

// NOTE: Chrome's new headless mode sizes the layout viewport 87px shorter
// than --window-size here, leaving a white strip at the bottom of the shot.
// The old headless mode captures exactly the requested window size.
execFileSync(
  chrome,
  [
    "--headless=old",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1024,1024",
    "--virtual-time-budget=3000",
    `--screenshot=${outPath}`,
    pathToFileURL(htmlPath).href,
  ],
  { stdio: "inherit" },
);

const { size } = statSync(outPath);
const fd = openSync(outPath, "r");
const header = Buffer.alloc(24);
readSync(fd, header, 0, 24, 0);
closeSync(fd);
const width = header.readUInt32BE(16);
const height = header.readUInt32BE(20);
console.log(`Wrote ${outPath} (${size} bytes, ${width}x${height})`);
if (width !== 1024 || height !== 1024) {
  console.error("ERROR: image is not exactly 1024x1024.");
  process.exit(2);
}
if (size > 1048576) {
  console.error("ERROR: image exceeds the 1 MiB limit.");
  process.exit(2);
}
