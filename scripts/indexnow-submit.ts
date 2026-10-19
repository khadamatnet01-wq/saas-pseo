import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { SitemapEntry } from './generate-sitemaps.js';

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://saascompare.example.com').replace(/\/+$/, '');
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || '8f9d2a7b4c6e1f3a9d8b7c6e5f4a3b2c';
const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const IS_DRY_RUN = process.env.INDEXNOW_DRY_RUN !== 'false';

const DIST_DIR = path.join(process.cwd(), 'dist');
const CACHE_FILE = path.join(process.cwd(), '.indexnow-cache.json');
const URLS_FILE = path.join(DIST_DIR, 'indexable-urls.json');

async function submitIndexNowBatch() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  const keyFilePath = path.join(DIST_DIR, `${INDEXNOW_KEY}.txt`);
  fs.writeFileSync(keyFilePath, INDEXNOW_KEY, 'utf-8');

  if (!fs.existsSync(URLS_FILE)) {
    throw new Error('لم يتم العثور على dist/indexable-urls.json — شغّل npm run sitemap:partition أولاً.');
  }

  const entries: SitemapEntry[] = JSON.parse(fs.readFileSync(URLS_FILE, 'utf-8'));
  const previousHashes: Record<string, string> = fs.existsSync(CACHE_FILE)
    ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
    : {};

  const currentHashes: Record<string, string> = {};
  const urlsToSubmit: string[] = [];

  for (const entry of entries) {
    const hash = crypto
      .createHash('sha256')
      .update(`${entry.loc}|${entry.lastmod}`)
      .digest('hex')
      .slice(0, 16);

    currentHashes[entry.loc] = hash;
    if (previousHashes[entry.loc] !== hash) {
      urlsToSubmit.push(entry.loc);
    }
  }

  const host = new URL(SITE_URL).host;
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urlsToSubmit.slice(0, 10000)
  };

  const payloadOutPath = path.join(DIST_DIR, 'indexnow-payload.json');
  fs.writeFileSync(payloadOutPath, JSON.stringify(payload, null, 2), 'utf-8');

  if (IS_DRY_RUN) {
    console.log(`[IndexNow Dry-Run] تم تجهيز ${payload.urlList.length} رابطاً للإرسال إلى ${INDEXNOW_ENDPOINT}`);
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`[IndexNow Error] HTTP ${response.status}`);
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(currentHashes, null, 2), 'utf-8');
}

submitIndexNowBatch();
