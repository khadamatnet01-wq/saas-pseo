import fs from 'node:fs';
import path from 'node:path';
import { getAllTools, getAllComparisonPairs } from '../src/lib/data-loader.js';

export interface OgCardPayload {
  title: string;
  subtitle: string;
  badge: string;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function renderOgCardSvg(payload: OgCardPayload): Promise<string> {
  const safeTitle = escapeXml(payload.title);
  const safeSubtitle = escapeXml(payload.subtitle);
  const safeBadge = escapeXml(payload.badge);

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect x="0" y="0" width="1200" height="12" fill="url(#accentGrad)" />
  <rect x="70" y="70" width="1060" height="490" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2" />
  <rect x="110" y="120" width="420" height="48" rx="24" fill="#1d4ed8" />
  <text x="320" y="152" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" text-anchor="middle">${safeBadge}</text>
  <text x="110" y="275" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="52" font-weight="800">${safeTitle}</text>
  <text x="110" y="355" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="26" font-weight="500">${safeSubtitle}</text>
  <line x1="110" y1="440" x2="1090" y2="440" stroke="#334155" stroke-width="2" />
  <text x="110" y="500" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="24" font-weight="700">B2B SaaS Radar — Programmatic SEO Intelligence</text>
</svg>`;
}

async function runBatchOgGeneration() {
  const outDir = path.join(process.cwd(), 'dist', 'og');
  fs.mkdirSync(outDir, { recursive: true });

  const tools = getAllTools();
  const pairs = getAllComparisonPairs();

  const items: { slug: string; payload: OgCardPayload }[] = [
    {
      slug: 'home',
      payload: {
        title: 'B2B SaaS Radar (2026)',
        subtitle: `${tools.length} Tools & ${pairs.length} Head-to-Head Comparisons`,
        badge: 'Programmatic SEO'
      }
    },
    ...tools.map((t) => ({
      slug: `tool-${t.slug}`,
      payload: {
        title: `${t.tool_name} Review & Pricing`,
        subtitle: `Rating: ${t.rating}/5 | ${t.pricing_model} (${t.pricing_starting_at})`,
        badge: t.category
      }
    })),
    ...tools.map((t) => ({
      slug: `alt-${t.slug}`,
      payload: {
        title: `Top ${t.alternatives_ids.length} ${t.tool_name} Alternatives`,
        subtitle: 'Side-by-Side Pricing & 7-Point Feature Matrix (2026)',
        badge: 'Alternatives Guide'
      }
    })),
    ...pairs.map((p) => ({
      slug: `cmp-${p.slug}`,
      payload: {
        title: `${p.toolA.tool_name} vs ${p.toolB.tool_name}`,
        subtitle: `${p.toolA.pricing_starting_at} vs ${p.toolB.pricing_starting_at} | ${p.sharedFeaturesCount}/7 Shared Features`,
        badge: 'Head-to-Head Comparison'
      }
    }))
  ];

  let sharpModule: typeof import('sharp') | null = null;
  try {
    sharpModule = (await import('sharp')).default;
  } catch {
    sharpModule = null;
  }

  for (const item of items) {
    const svg = await renderOgCardSvg(item.payload);
    if (sharpModule) {
      await sharpModule(Buffer.from(svg)).png({ quality: 90 }).toFile(path.join(outDir, `${item.slug}.png`));
    } else {
      fs.writeFileSync(path.join(outDir, `${item.slug}.svg`), svg, 'utf-8');
    }
  }

  console.log(`[OG Generator] تم توليد ${items.length} بطاقة معاينة اجتماعية في المسار: ${outDir}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBatchOgGeneration();
}
