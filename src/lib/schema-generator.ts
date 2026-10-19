import type { EnrichedSaaSTool } from '../schemas/tool.schema.js';
import type { FAQItem } from './content-engine.js';

export function generateToolProductSchema(tool: EnrichedSaaSTool, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.tool_name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: tool.category,
    operatingSystem: 'Web, Cloud, SaaS',
    description: tool.summary,
    url: pageUrl,
    offers: {
      '@type': 'Offer',
      price: tool.starting_price_usd.toFixed(2),
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      description: `${tool.pricing_model} — ${tool.pricing_starting_at}`
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: Math.round(tool.rating * 350)
    },
    positiveNotes: {
      '@type': 'ItemList',
      itemListElement: tool.pros.map((pro, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: pro
      }))
    },
    negativeNotes: {
      '@type': 'ItemList',
      itemListElement: tool.cons.map((con, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: con
      }))
    }
  };
}

export function generateComparisonSchema(
  toolA: EnrichedSaaSTool,
  toolB: EnrichedSaaSTool,
  pageUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${toolA.tool_name} vs ${toolB.tool_name} Comparison`,
    description: `Side-by-side comparison of ${toolA.tool_name} and ${toolB.tool_name} across pricing, features, pros, and cons.`,
    url: pageUrl,
    numberOfItems: 2,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: generateToolProductSchema(toolA, pageUrl)
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: generateToolProductSchema(toolB, pageUrl)
      }
    ]
  };
}

export function generateFAQPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  };
}
