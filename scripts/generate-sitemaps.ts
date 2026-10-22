import fs from 'node:fs';
import path from 'node:path';
import { getAllTools, getAllComparisonPairs } from '../src/lib/data-loader.js';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://stackvs.xyz').replace(/\/+$/, '');
const DIST_DIR = path.join(process.cwd(), 'dist');

export function collectIndexableUrls(): SitemapEntry[] {
  const tools = getAllTools();
  const pairs = getAllComparisonPairs();
  const today = '2026-10-19';

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
      lastmod: today,
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
  const today = '2026-10-19';

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-0.xml'), buildSitemapXml(allEntries), 'utf-8');
  fs.writeFileSync(
    path.join(DIST_DIR, 'sitemap-index.xml'),
    buildSitemapIndexXml([{ filename: 'sitemap-0.xml', lastmod: today }]),
    'utf-8'
  );
  fs.writeFileSync(path.join(DIST_DIR, 'indexable-urls.json'), JSON.stringify(allEntries, null, 2), 'utf-8');

  console.log(`[Sitemap] Successfully generated ${allEntries.length} canonical URLs for ${SITE_URL}`);
}

runSitemapPartitioner();
