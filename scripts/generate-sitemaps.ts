import fs from 'node:fs';
import path from 'node:path';
import { getAllTools, getAllComparisonPairs } from '../src/lib/data-loader.js';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://saascompare.example.com').replace(/\/+$/, '');
const RAW_CHUNK_SIZE = Number(process.env.SITEMAP_MAX_URLS_PER_FILE || 25000);
const CHUNK_SIZE = Math.max(10000, Math.min(45000, RAW_CHUNK_SIZE));
const DIST_DIR = path.join(process.cwd(), 'dist');

export function collectIndexableUrls(): SitemapEntry[] {
  const tools = getAllTools();
  const pairs = getAllComparisonPairs();
  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    {
      loc: `${SITE_URL}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0'
    }
  ];

  for (const tool of tools) {
    if (!tool.seo_metrics.should_index) continue;

    entries.push({
      loc: `${SITE_URL}/tools/${tool.slug}`,
      lastmod: tool.last_updated,
      changefreq: 'weekly',
      priority: '0.9'
    });

    if (tool.alternatives_ids.length > 0) {
      entries.push({
        loc: `${SITE_URL}/alternatives/${tool.slug}-alternatives`,
        lastmod: tool.last_updated,
        changefreq: 'weekly',
        priority: '0.8'
      });
    }
  }

  for (const pair of pairs) {
    if (!pair.shouldIndex) continue;
    entries.push({
      loc: `${SITE_URL}/compare/${pair.slug}`,
      lastmod: pair.toolA.last_updated,
      changefreq: 'weekly',
      priority: '0.8'
    });
  }

  return entries;
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map(
      (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

function buildSitemapIndexXml(sitemapFiles: { filename: string; lastmod: string }[]): string {
  const sitemapNodes = sitemapFiles
    .map(
      (s) => `  <sitemap>
    <loc>${SITE_URL}/${s.filename}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNodes}
</sitemapindex>
`;
}

function runSitemapPartitioner(): void {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  const allEntries = collectIndexableUrls();
  const today = new Date().toISOString().split('T')[0];

  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
    chunks.push(allEntries.slice(i, i + CHUNK_SIZE));
  }

  const generatedFiles: { filename: string; lastmod: string }[] = [];

  chunks.forEach((chunk, idx) => {
    const filename = `sitemap-${idx}.xml`;
    fs.writeFileSync(path.join(DIST_DIR, filename), buildSitemapXml(chunk), 'utf-8');
    generatedFiles.push({ filename, lastmod: today });
  });

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-index.xml'), buildSitemapIndexXml(generatedFiles), 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'indexable-urls.json'), JSON.stringify(allEntries, null, 2), 'utf-8');

  console.log(`[Sitemap Partitioner] تم توليد ${allEntries.length} رابطاً عبر ${generatedFiles.length} خريطة فرعية.`);
}

runSitemapPartitioner();
