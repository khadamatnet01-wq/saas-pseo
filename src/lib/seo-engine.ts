export interface SEOMetadataInput {
  title: string;
  description: string;
  canonicalPath: string;
  ogSlug: string;
  shouldIndex: boolean;
  lastModified?: string;
  schemas?: Record<string, unknown>[];
}

export interface ComputedSEOMetadata {
  fullTitle: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string;
  robotsDirective: string;
  lastModified: string;
  jsonLdString: string;
}

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://saascompare.example.com').replace(/\/+$/, '');
const SITE_NAME = process.env.PUBLIC_SITE_NAME || 'B2B SaaS Radar';

export function buildSEOMetadata(input: SEOMetadataInput): ComputedSEOMetadata {
  const cleanPath = input.canonicalPath.startsWith('/')
    ? input.canonicalPath
    : `/${input.canonicalPath}`;

  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const ogImageUrl = `${SITE_URL}/og/${input.ogSlug}.png`;

  const robotsDirective = input.shouldIndex
    ? 'index, follow, max-snippet:-1, max-image-preview:large'
    : 'noindex, follow';

  const fullTitle = `${input.title} | ${SITE_NAME}`;

  return {
    fullTitle,
    description: input.description,
    canonicalUrl,
    ogImageUrl,
    robotsDirective,
    lastModified: input.lastModified || new Date().toISOString().split('T')[0],
    jsonLdString: JSON.stringify(input.schemas || [])
  };
}
