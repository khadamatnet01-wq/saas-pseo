import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://stackvs.xyz").replace(/\/+$/, "");
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || "8f9d2a7b4c6e1f3a9d8b7c6e5f4a3b2c";
const DIST_DIR = path.join(process.cwd(), "dist");
const URLS_FILE = path.join(DIST_DIR, "indexable-urls.json");

async function submitIndexNow() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  const keyFilePath = path.join(DIST_DIR, `${INDEXNOW_KEY}.txt`);
  fs.writeFileSync(keyFilePath, INDEXNOW_KEY, "utf-8");

  if (!fs.existsSync(URLS_FILE)) {
    console.log("[IndexNow] indexable-urls.json not found, skipping.");
    return;
  }

  const entries: { loc: string; lastmod: string }[] = JSON.parse(fs.readFileSync(URLS_FILE, "utf-8"));
  const host = new URL(SITE_URL).host;
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: entries.map((e) => e.loc).slice(0, 10000)
  };

  fs.writeFileSync(path.join(DIST_DIR, "indexnow-payload.json"), JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[IndexNow] Prepared ${payload.urlList.length} URLs for ${host}`);
}

submitIndexNow();
