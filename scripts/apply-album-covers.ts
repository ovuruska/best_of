/**
 * Updates tournaments.ts to use local WebP album covers
 *
 * Usage:
 *   npx tsx scripts/apply-album-covers.ts
 *
 * Replaces img('...') calls with '/best_of/albums/aXX.webp' for albums
 * that have a corresponding WebP file in public/albums/
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";

const ALBUMS_DIR = "public/albums";
const TOURNAMENTS_FILE = "src/data/tournaments.ts";

function main() {
  // Find all available WebP covers
  const available = new Set(
    readdirSync(ALBUMS_DIR)
      .filter((f) => f.endsWith(".webp"))
      .map((f) => f.replace(".webp", ""))
  );

  console.log(`Found ${available.size} WebP covers in ${ALBUMS_DIR}/`);

  let src = readFileSync(TOURNAMENTS_FILE, "utf-8");
  let replaced = 0;

  for (const id of available) {
    // Replace: imageUrl: img('whatever') → imageUrl: '/best_of/albums/aXX.webp'
    const pattern = new RegExp(
      `(id:\\s*'${id}',.*?imageUrl:\\s*)img\\(['\"][^'\"]*['\"]\\)`,
      "s"
    );
    const newSrc = src.replace(pattern, `$1'/best_of/albums/${id}.webp'`);
    if (newSrc !== src) {
      replaced++;
      src = newSrc;
    }
  }

  writeFileSync(TOURNAMENTS_FILE, src);
  console.log(`Updated ${replaced} album imageUrls to local WebP assets`);

  // Check remaining img() calls
  const remainingImgCalls = (src.match(/img\(/g) || []).length;
  if (remainingImgCalls === 0) {
    console.log(
      "All img() calls replaced — removing helper from tournaments.ts"
    );
    // Remove the img helper line
    src = src.replace(
      /const img = \(seed: string\) => `https:\/\/picsum\.photos\/seed\/\$\{seed\}\/400\/400`;\n\n/,
      ""
    );
    writeFileSync(TOURNAMENTS_FILE, src);
  } else {
    console.log(
      `${remainingImgCalls} img() calls remain (villains/games still use placeholders)`
    );
  }
}

main();
