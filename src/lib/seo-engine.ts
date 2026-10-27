import type { EnrichedSaaSTool } from '../schemas/tool.schema.js';

export interface SEOMetadataInput {
  title: string;
  description: string;
  canonicalPath: string;
  ogSlug: string;
  shouldIndex: boolean;
}

export interface ComputedSEOMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string;
  robotsDirective: string;
}

const SITE_NAME = 'StackVS';
const SITE_URL = (import.meta.env?.PUBLIC_SITE_URL || 'https://stackvs.xyz').replace(/\/$/, '');
const CURRENT_YEAR = new Date().getFullYear() >= 2026 ? new Date().getFullYear() : 2026;

/**
 * Extracts a concise 2-3 word punchy hook from a longer pro string so titles stay under 60 chars
 */
export function extractShortHook(rawPro?: string, fallbackCategory?: string): string {
  if (!rawPro || rawPro.trim().length === 0) {
    return fallbackCategory ? fallbackCategory.split('&')[0].trim() : 'Core Features';
  }
  const cleaned = rawPro
    .replace(/^(Best-in-class|Industry-leading|Unmatched|Unrivaled|Native|Built-in|Generous|Powerful|Ultra-fast|Sub-\d+ms)\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .trim();

  const words = cleaned.split(/\s+/).slice(0, 3).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Truncates text cleanly at word boundaries to respect strict SERP pixel/character limits
 */
function truncateClean(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 30 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:!?-]+$/, '') + '…';
}

/**
 * Dynamic CTR-Optimized Meta Generator for Head-to-Head Comparison Pages
 */
export function buildComparisonMeta(toolA: EnrichedSaaSTool, toolB: EnrichedSaaSTool): { title: string; description: string } {
  const proA = toolA.pros?.[0];
  const proB = toolB.pros?.[0];

  if (!proA || !proB) {
    return {
      title: `${toolA.tool_name} vs ${toolB.tool_name} (${CURRENT_YEAR}): Comparison`,
      description: truncateClean(
        `Compare ${toolA.tool_name} vs ${toolB.tool_name} (${CURRENT_YEAR}). Side-by-side pricing, feature matrices, and verified user ratings.`,
        155
      )
    };
  }

  const hookA = extractShortHook(proA, toolA.category);
  const hookB = extractShortHook(proB, toolB.category);
  const fullTitle = `${toolA.tool_name} vs ${toolB.tool_name} ${CURRENT_YEAR}: ${hookA} or ${hookB}?`;

  const finalTitle =
    fullTitle.length <= 62
      ? fullTitle
      : truncateClean(`${toolA.tool_name} vs ${toolB.tool_name} ${CURRENT_YEAR}: ${hookA}?`, 60);

  const rawDesc = `Stuck between ${toolA.tool_name} and ${toolB.tool_name}? Compare ${toolA.tool_name}'s ${proA.toLowerCase()} against ${toolB.tool_name}'s ${proB.toLowerCase()}. See ${CURRENT_YEAR} pricing.`;

  return {
    title: finalTitle,
    description: truncateClean(rawDesc, 155)
  };
}

/**
 * Dynamic CTR-Optimized Meta Generator for Single Software Review Pages
 */
export function buildReviewMeta(
  tool: EnrichedSaaSTool,
  closestCompetitor?: EnrichedSaaSTool
): { title: string; description: string } {
  if (!closestCompetitor) {
    return {
      title: `${tool.tool_name} Review (${CURRENT_YEAR}): Pricing, Pros & Cons`,
      description: truncateClean(
        `In-depth ${CURRENT_YEAR} ${tool.tool_name} review. Explore starting costs (${tool.pricing_starting_at}), core features, pros, cons, and top alternatives.`,
        155
      )
    };
  }

  const fullTitle = `${tool.tool_name} Review ${CURRENT_YEAR}: Better Than ${closestCompetitor.tool_name}?`;
  const finalTitle =
    fullTitle.length <= 62
      ? fullTitle
      : truncateClean(`${tool.tool_name} Review ${CURRENT_YEAR}: vs ${closestCompetitor.tool_name}?`, 60);

  const rawDesc = `Our independent ${CURRENT_YEAR} ${tool.tool_name} review. Discover why its ${tool.pricing_starting_at} value beats ${closestCompetitor.tool_name}, plus top features, pros, and cons.`;

  return {
    title: finalTitle,
    description: truncateClean(rawDesc, 155)
  };
}

export function buildSEOMetadata(input: SEOMetadataInput): ComputedSEOMetadata {
  const cleanTitle = input.title
    .replace(/https?:\/\/[^\s|]+/g, '')
    .replace(/\|?\s*(StackRadar|StackVS)\s*$/i, '')
    .trim();

  const fullTitle =
    cleanTitle.length > 52 ? cleanTitle : `${cleanTitle} | ${SITE_NAME}`;

  const cleanDesc = truncateClean(
    input.description.replace(/https?:\/\/[^\s]+/g, '').trim(),
    155
  );

  const cleanPath = input.canonicalPath.startsWith('/')
    ? input.canonicalPath
    : `/${input.canonicalPath}`;
  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const ogImageUrl = `${SITE_URL}/og/${input.ogSlug}.png`;

  return {
    title: fullTitle,
    description: cleanDesc,
    canonicalUrl,
    ogImageUrl,
    robotsDirective: input.shouldIndex
      ? 'index, follow, max-snippet:-1, max-image-preview:large'
      : 'noindex, follow'
  };
}
