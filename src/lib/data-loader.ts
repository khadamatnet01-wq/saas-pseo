import validatedToolsJson from '../data/validated-tools.json';
import type { EnrichedSaaSTool } from '../schemas/tool.schema.js';

export interface ComparisonPair {
  slug: string;
  toolA: EnrichedSaaSTool;
  toolB: EnrichedSaaSTool;
  sharedFeaturesCount: number;
  shouldIndex: boolean;
}

const toolsCache: EnrichedSaaSTool[] = validatedToolsJson as EnrichedSaaSTool[];
const toolsMap = new Map<string, EnrichedSaaSTool>(toolsCache.map((t) => [t.slug, t]));

export function getAllTools(): EnrichedSaaSTool[] {
  return toolsCache;
}

export function getToolBySlug(slug: string): EnrichedSaaSTool | undefined {
  return toolsMap.get(slug);
}

export function getResolvedAlternatives(tool: EnrichedSaaSTool): EnrichedSaaSTool[] {
  return tool.alternatives_ids
    .map((slug) => toolsMap.get(slug))
    .filter((item): item is EnrichedSaaSTool => Boolean(item));
}

/**
 * توليد أزواج المقارنات الثنائية الموحدة أبجدياً (Canonical Comparison Pairs)
 */
export function getAllComparisonPairs(): ComparisonPair[] {
  const pairs: ComparisonPair[] = [];
  const seenPairs = new Set<string>();

  for (const toolA of toolsCache) {
    for (const altSlug of toolA.alternatives_ids) {
      const toolB = toolsMap.get(altSlug);
      if (!toolB) continue;

      const [first, second] = [toolA, toolB].sort((a, b) => a.slug.localeCompare(b.slug));
      const pairKey = `${first.slug}-vs-${second.slug}`;

      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const keys = Object.keys(first.features_matrix);
      const sharedFeaturesCount = keys.filter(
        (k) => first.features_matrix[k] === true && second.features_matrix[k] === true
      ).length;

      pairs.push({
        slug: pairKey,
        toolA: first,
        toolB: second,
        sharedFeaturesCount,
        shouldIndex: first.seo_metrics.should_index && second.seo_metrics.should_index
      });
    }
  }

  return pairs;
}
