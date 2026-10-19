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
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect x="0" y="0" width="1200" height="10" fill="url(#accentGrad)" />
  <rect x="60" y="60" width="1080" height="510" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2" />
  <rect x="100" y="110" width="280" height="42" rx="21" fill="#1d4ed8" />
  <text x="240" y="138" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">${safeBadge}</text>
  <text x="100" y="270" fill="#f8fafc" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="52" font-weight="800">${safeTitle}</text>
  <text x="100" y="350" fill="#94a3b8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="26" font-weight="500">${safeSubtitle}</text>
  <line x1="100" y1="440" x2="1100" y2="440" stroke="#334155" stroke-width="2" />
  <text x="100" y="495" fill="#38bdf8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="700">StackRadar — Independent Software Reviews</text>
</svg>`;
}

async function runBatchOg() {
  const outDir = path.join(process.cwd(), 'dist', 'og');
  fs.mkdirSync(outDir, { recursive: true });

  const tools = getAllTools();
  const pairs = getAllComparisonPairs();

  const items = [
    {
      slug: 'home',
      payload: {
        title: 'StackRadar',
        subtitle: `${tools.length} B2B Tools & ${pairs.length} Comparisons (2026)`,
        badge: 'Independent Reviews'
      }
    },
    ...tools.map((t) => ({
      slug: `tool-${t.slug}`,
      payload: {
        title: `${t.tool_name} Review`,
        subtitle: `Rating: ${t.rating}/5.0 | Starts at ${t.pricing_starting_at}`,
        badge: t.category
      }
    })),
    ...tools.map((t) => ({
      slug: `alt-${t.slug}`,
      payload: {
        title: `Top ${t.alternatives_ids.length} ${t.tool_name} Alternatives`,
        subtitle: `Pricing & Feature Matrix Breakdown (2026)`,
        badge: 'Alternatives Guide'
      }
    })),
    ...pairs.map((p) => ({
      slug: `cmp-${p.slug}`,
      payload: {
        title: `${p.toolA.tool_name} vs ${p.toolB.tool_name}`,
        subtitle: `${p.toolA.pricing_starting_at} vs ${p.toolB.pricing_starting_at} | Tested Specs`,
        badge: 'Head-to-Head'
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

  console.log(`[OG] Generated ${items.length} cards in ${outDir}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBatchOg();
}
