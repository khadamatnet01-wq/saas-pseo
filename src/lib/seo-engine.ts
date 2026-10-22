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

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://stackvs.xyz').replace(/\/+$/, '');
const SITE_NAME = process.env.PUBLIC_SITE_NAME || 'StackVS';

export function buildSEOMetadata(input: SEOMetadataInput): ComputedSEOMetadata {
  const cleanPath = input.canonicalPath.startsWith('/')
    ? input.canonicalPath
    : `/${input.canonicalPath}`;

  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const ogImageUrl = `${SITE_URL}/og/${input.ogSlug}.png`;

  const robotsDirective = input.shouldIndex
    ? 'index, follow, max-snippet:-1, max-image-preview:large'
    : 'noindex, follow';

  // Format clean title without redundant domain or URL leakage
  const cleanTitle = input.title.replace(/^https?:\/\/[^\s]+/, '').trim();
  const fullTitle = cleanTitle.includes(SITE_NAME)
    ? cleanTitle
    : `${cleanTitle} | ${SITE_NAME}`;

  // Format clean description ensuring keywords rather than URLs
  const cleanDescription = input.description.replace(/^https?:\/\/[^\s]+/, '').trim();

  return {
    fullTitle,
    description: cleanDescription,
    canonicalUrl,
    ogImageUrl,
    robotsDirective,
    lastModified: input.lastModified || '2026-10-22',
    jsonLdString: JSON.stringify(input.schemas || [])
  };
}
