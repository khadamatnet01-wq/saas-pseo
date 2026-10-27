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

const SITE_URL = (import.meta.env?.PUBLIC_SITE_URL || 'https://stackvs.xyz').replace(/\/$/, '');

export function buildSEOMetadata(input: SEOMetadataInput): ComputedSEOMetadata {
  const cleanTitle = input.title
    .replace(/https?:\/\/[^\s|]+/g, '')
    .replace(/\|?\s*(StackRadar|StackVS)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanDesc = input.description
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const finalDesc =
    cleanDesc.length <= 155
      ? cleanDesc
      : cleanDesc.slice(0, 152).replace(/\s+\S*$/, '') + '...';

  const cleanPath = input.canonicalPath.startsWith('/')
    ? input.canonicalPath
    : `/${input.canonicalPath}`;
  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const ogImageUrl = `${SITE_URL}/og/${input.ogSlug}.png`;

  return {
    title: cleanTitle,
    description: finalDesc,
    canonicalUrl,
    ogImageUrl,
    robotsDirective: input.shouldIndex
      ? 'index, follow, max-snippet:-1, max-image-preview:large'
      : 'noindex, follow'
  };
}
