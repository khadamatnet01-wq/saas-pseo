import type { APIRoute } from 'astro';
import { getAllTools, getAllComparisonPairs } from '../../lib/data-loader';
import { renderOgCardSvg } from '../../../scripts/generate-og';
import sharp from 'sharp';

export async function getStaticPaths() {
  const tools = getAllTools();
  const pairs = getAllComparisonPairs();

  return [
    {
      params: { slug: 'home' },
      props: {
        title: 'StackVS',
        subtitle: `${tools.length} B2B Tools & ${pairs.length} Comparisons (2026)`,
        badge: 'Independent Reviews'
      }
    },
    ...tools.map((t) => ({
      params: { slug: `tool-${t.slug}` },
      props: {
        title: `${t.tool_name} Review`,
        subtitle: `Rating: ${t.rating}/5.0 | Starts at ${t.pricing_starting_at}`,
        badge: t.category
      }
    })),
    ...tools.map((t) => ({
      params: { slug: `alt-${t.slug}` },
      props: {
        title: `Top ${t.alternatives_ids.length} ${t.tool_name} Alternatives`,
        subtitle: `Pricing & Feature Matrix Breakdown (2026)`,
        badge: 'Alternatives Guide'
      }
    })),
    ...pairs.map((p) => ({
      params: { slug: `cmp-${p.slug}` },
      props: {
        title: `${p.toolA.tool_name} vs ${p.toolB.tool_name}`,
        subtitle: `${p.toolA.pricing_starting_at} vs ${p.toolB.pricing_starting_at} | Tested Specs`,
        badge: 'Head-to-Head'
      }
    }))
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle, badge } = props as { title: string; subtitle: string; badge: string };
  const svg = await renderOgCardSvg({ title, subtitle, badge });
  const pngBuffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};
