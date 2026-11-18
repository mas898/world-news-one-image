// Entry program: copy the repo's rendered poster to the output directory.
// A pure file copy, so repeated runs are byte-identical by construction.
// Standard library only; no network access.
//
// Output directory, in order of preference:
//   1. the first command-line argument (handy for local runs),
//   2. the MAKEFUN_OUTPUT_DIR environment variable,
//   3. /output (the grader's convention).
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.argv[2] ?? process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outDir, { recursive: true });
copyFileSync(source, join(outDir, "entry.png"));
