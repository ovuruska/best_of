/**
 * Full pipeline: Find album cover URLs via Claude CLI → Download → Convert to WebP
 *
 * Usage:
 *   npx tsx scripts/fetch-album-covers.ts
 *
 * Requires: claude CLI installed locally, sharp npm package
 *
 * Output:
 *   - public/albums/a1.webp, a2.webp, ...
 *   - scripts/album-covers.json
 */

import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const ALBUMS_DIR = "public/albums";
const PROGRESS_FILE = "scripts/album-covers.json";
const COVER_SIZE = 400;

// ---------- Parse album data ----------

interface AlbumEntry {
  id: string;
  name: string;
  subtitle: string;
}

function parseAlbums(): AlbumEntry[] {
  const src = readFileSync("src/data/tournaments.ts", "utf-8");
  const albums: AlbumEntry[] = [];
  const re =
    /\{\s*id:\s*'(a\d+)',\s*name:\s*['"](.*?)['"],\s*subtitle:\s*['"](.*?)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src)) !== null) {
    albums.push({ id: match[1], name: match[2], subtitle: match[3] });
  }
  return albums;
}

// ---------- Find cover URLs via Claude CLI ----------

function findCoversViaCLI(albums: AlbumEntry[]): Record<string, string> {
  const albumList = albums
    .map(
      (a) =>
        `- id:"${a.id}" | "${a.name}" by ${a.subtitle.split("·")[0].trim()}`
    )
    .join("\n");

  const prompt = `Find the album cover image URL for each of these albums. I need DIRECT image URLs that can be downloaded.

Rules:
- Return direct image URLs (from upload.wikimedia.org, i.scdn.spotify.com, or similar CDNs)
- Prefer high resolution (300px+) square album art
- For Wikipedia, use the actual file URL (e.g. https://upload.wikimedia.org/wikipedia/en/X/XX/Album.jpg)
- Return ONLY a valid JSON object, absolutely no other text

Albums:
${albumList}

Return ONLY: {"${albums[0].id}": "https://...", ...}`;

  try {
    const result = execSync(
      `claude -p --output-format text --allowedTools WebSearch WebFetch --model sonnet --dangerously-skip-permissions "${prompt.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`,
      {
        encoding: "utf-8",
        timeout: 300_000, // 5 min per batch
        maxBuffer: 1024 * 1024 * 10,
      }
    );

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("  No JSON found in response");
      return {};
    }
    return JSON.parse(jsonMatch[0]) as Record<string, string>;
  } catch (err) {
    console.error(
      `  CLI call failed: ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`
    );
    return {};
  }
}

// ---------- Download + convert to WebP ----------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function downloadWithRetry(
  url: string,
  retries = 5
): Promise<Response | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
    });
    if (res.ok) return res;
    if (res.status === 429) {
      const wait = 3000 * (attempt + 1);
      console.error(`  Rate limited, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    console.error(`  HTTP ${res.status}`);
    return null;
  }
  return null;
}

async function downloadAndConvert(
  id: string,
  url: string
): Promise<boolean> {
  const outPath = join(ALBUMS_DIR, `${id}.webp`);

  try {
    const res = await downloadWithRetry(url);

    if (!res) return false;

    const contentType = res.headers.get("content-type") || "";
    if (
      !contentType.includes("image") &&
      !contentType.includes("octet-stream")
    ) {
      console.error(`  ${id}: Not an image (${contentType})`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length < 1000) {
      console.error(`  ${id}: File too small (${buffer.length} bytes)`);
      return false;
    }

    await sharp(buffer)
      .resize(COVER_SIZE, COVER_SIZE, { fit: "cover", position: "centre" })
      .webp({ quality: 80 })
      .toFile(outPath);

    return true;
  } catch (err) {
    console.error(
      `  ${id}: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
}

// ---------- Main ----------

async function main() {
  mkdirSync(ALBUMS_DIR, { recursive: true });
  mkdirSync("scripts", { recursive: true });

  const albums = parseAlbums();
  console.log(`Found ${albums.length} albums\n`);

  // Load existing URL progress
  let urlMap: Record<string, string> = {};
  if (existsSync(PROGRESS_FILE)) {
    urlMap = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    console.log(`Loaded ${Object.keys(urlMap).length} cached URLs`);
  }

  // Phase 1: Find URLs
  const needUrls = albums.filter((a) => !urlMap[a.id]);
  if (needUrls.length > 0) {
    console.log(
      `\n=== Phase 1: Finding URLs for ${needUrls.length} albums ===\n`
    );
    const BATCH_SIZE = 8;
    for (let i = 0; i < needUrls.length; i += BATCH_SIZE) {
      const batch = needUrls.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(needUrls.length / BATCH_SIZE);
      console.log(
        `[${batchNum}/${totalBatches}] Searching: ${batch.map((a) => a.id).join(", ")}`
      );

      const results = findCoversViaCLI(batch);
      const found = Object.keys(results).length;
      console.log(`  Found ${found}/${batch.length}`);

      Object.assign(urlMap, results);
      writeFileSync(PROGRESS_FILE, JSON.stringify(urlMap, null, 2));
    }
  }

  // Phase 2: Download + WebP convert
  const needDownload = albums.filter(
    (a) => urlMap[a.id] && !existsSync(join(ALBUMS_DIR, `${a.id}.webp`))
  );

  if (needDownload.length > 0) {
    console.log(
      `\n=== Phase 2: Downloading & converting ${needDownload.length} covers ===\n`
    );

    let ok = 0;
    let fail = 0;

    for (let i = 0; i < needDownload.length; i++) {
      const a = needDownload[i];
      const success = await downloadAndConvert(a.id, urlMap[a.id]);
      if (success) {
        ok++;
        console.log(`  [${ok + fail}/${needDownload.length}] ✓ ${a.id} — ${a.name}`);
      } else {
        fail++;
        console.log(`  [${ok + fail}/${needDownload.length}] ✗ ${a.id} — ${a.name}`);
      }
      // Polite delay between downloads to avoid rate limits
      await sleep(2000);
    }

    console.log(`\nDownload: ${ok} ok, ${fail} failed`);
  }

  // Summary
  const ready = albums.filter((a) =>
    existsSync(join(ALBUMS_DIR, `${a.id}.webp`))
  );
  console.log(`\n=== Done: ${ready.length}/${albums.length} WebP covers ready ===`);

  if (ready.length < albums.length) {
    const missing = albums.filter(
      (a) => !existsSync(join(ALBUMS_DIR, `${a.id}.webp`))
    );
    console.log(`Missing: ${missing.map((a) => a.id).join(", ")}`);
    console.log(`\nRe-run the script to retry missing albums.`);
  } else {
    console.log(`\nAll covers ready! Run: npx tsx scripts/apply-album-covers.ts`);
  }
}

main().catch(console.error);
