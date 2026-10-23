import type { EnrichedSaaSTool } from '../schemas/tool.schema.js';

export interface FAQItem {
  question: string;
  answer: string;
}

export const FEATURE_METADATA: Record<string, { label: string; description: string }> = {
  sprints_cycles: {
    label: 'Sprints & Agile Cycles',
    description: 'Built-in support for time-boxed sprints, iterations, and agile backlog management.'
  },
  kanban_boards: {
    label: 'Interactive Kanban Boards',
    description: 'Visual drag-and-drop workflow tracking with custom status columns and swimlanes.'
  },
  roadmaps: {
    label: 'Strategic Roadmaps & Gantt',
    description: 'Timeline visualization, project milestone dependencies, and executive portfolio views.'
  },
  time_tracking: {
    label: 'Native Time Tracking',
    description: 'In-app timers, billable hours tracking, and detailed timesheet reporting.'
  },
  built_in_automations: {
    label: 'No-Code Workflow Automations',
    description: 'Trigger-based automations to assign tasks, sync statuses, and send notifications.'
  },
  ai_triage: {
    label: 'AI Copilot & Smart Triage',
    description: 'Generative AI assistance for summarizing issues, auto-labeling, and drafting updates.'
  },
  enterprise_security: {
    label: 'Enterprise Security & Governance',
    description: 'SOC2 Type II compliance, SAML SSO single sign-on, and granular role permissions.'
  }
};

export function generateToolFAQs(
  tool: EnrichedSaaSTool,
  alternatives: EnrichedSaaSTool[]
): FAQItem[] {
  const altNames = alternatives.map((a) => a.tool_name).join(', ');

  return [
    {
      question: `How much does ${tool.tool_name} cost, and is there a free plan?`,
      answer: `${tool.tool_name} operates on a ${tool.pricing_model} pricing model, with paid plans starting at ${tool.pricing_starting_at}. Most plans include a risk-free trial period to test core features before upgrading.`
    },
    {
      question: `What are the best alternatives to ${tool.tool_name}?`,
      answer: altNames
        ? `Top market alternatives to ${tool.tool_name} in the ${tool.category} space include ${altNames}. The ideal choice depends on your team's workflow, budget, and integration requirements.`
        : `Several competitive solutions exist across ${tool.category} offering varied feature sets and pricing tiers.`
    },
    {
      question: `What are the primary strengths and limitations of ${tool.tool_name}?`,
      answer: `Key advantages include ${tool.pros.slice(0, 2).join(' and ')}. On the other hand, potential limitations reported by users include ${tool.cons.slice(0, 2).join(' and ')}.`
    },
    {
      question: `Does ${tool.tool_name} support enterprise-level security and compliance?`,
      answer: tool.features_matrix.enterprise_security
        ? `Yes, ${tool.tool_name} includes enterprise-grade governance controls, data encryption, and role-based access controls designed for scaling organizations.`
        : `${tool.tool_name} provides standard cloud security protocols, though large enterprises should verify custom compliance needs.`
    }
  ];
}

export function generateComparisonFAQs(
  toolA: EnrichedSaaSTool,
  toolB: EnrichedSaaSTool
): FAQItem[] {
  const higherRated = toolA.rating >= toolB.rating ? toolA : toolB;
  const lowerRated = higherRated.slug === toolA.slug ? toolB : toolA;

  const cheaper = toolA.starting_price_usd <= toolB.starting_price_usd ? toolA : toolB;
  const pricier = cheaper.slug === toolA.slug ? toolB : toolA;

  const pricingAnswer =
    toolA.starting_price_usd === toolB.starting_price_usd
      ? `${toolA.tool_name} starts at ${toolA.pricing_starting_at} (${toolA.pricing_model}), while ${toolB.tool_name} also begins at ${toolB.pricing_starting_at} (${toolB.pricing_model}). Since both platforms share the same entry price point, total cost-effectiveness depends on seat scaling and enterprise add-ons.`
      : `${cheaper.tool_name} starts at an entry rate of ${cheaper.pricing_starting_at} (${cheaper.pricing_model}), whereas ${pricier.tool_name} begins at ${pricier.pricing_starting_at} (${pricier.pricing_model}). For teams prioritizing lean software budgets, ${cheaper.tool_name} provides a more accessible starting point.`;

  const ratingAnswer =
    toolA.rating === toolB.rating
      ? `Both ${toolA.tool_name} and ${toolB.tool_name} are tied with a verified user rating of ${toolA.rating}/5.0. Users praise ${toolA.tool_name} for ${toolA.pros[0]}, whereas ${toolB.tool_name} stands out for ${toolB.pros[0]}.`
      : `${higherRated.tool_name} holds the edge with a verified rating of ${higherRated.rating}/5.0, praised especially for ${higherRated.pros[0]}. Meanwhile, ${lowerRated.tool_name} scores ${lowerRated.rating}/5.0 and is recognized for ${lowerRated.pros[0]}.`;

  return [
    {
      question: `Which is more cost-effective: ${toolA.tool_name} or ${toolB.tool_name}?`,
      answer: pricingAnswer
    },
    {
      question: `How do ${toolA.tool_name} and ${toolB.tool_name} compare in verified user ratings?`,
      answer: ratingAnswer
    },
    {
      question: `When should you choose ${toolA.tool_name} over ${toolB.tool_name}?`,
      answer: `Choose ${toolA.tool_name} if your priority is ${toolA.pros[0]} within ${toolA.category}. Opt for ${toolB.tool_name} if you require ${toolB.pros[0]} and ${toolB.pricing_starting_at} pricing.`
    }
  ];
}

export function generateComparisonVerdict(
  toolA: EnrichedSaaSTool,
  toolB: EnrichedSaaSTool
): string {
  const uniqueToA = Object.keys(toolA.features_matrix).filter(
    (k) => toolA.features_matrix[k] === true && toolB.features_matrix[k] === false
  );
  const uniqueToB = Object.keys(toolB.features_matrix).filter(
    (k) => toolB.features_matrix[k] === true && toolA.features_matrix[k] === false
  );

  const aText =
    uniqueToA.length > 0
      ? `${toolA.tool_name} stands out with native support for ${uniqueToA.map((k) => FEATURE_METADATA[k]?.label || k).join(', ')}`
      : `${toolA.tool_name} delivers dependable standard features for ${toolA.category}`;

  const bText =
    uniqueToB.length > 0
      ? `while ${toolB.tool_name} counters with specialized capabilities in ${uniqueToB.map((k) => FEATURE_METADATA[k]?.label || k).join(', ')}`
      : `while ${toolB.tool_name} matches core capabilities with competitive pricing starting at ${toolB.pricing_starting_at}`;

  return `In our head-to-head analysis of ${toolA.tool_name} (${toolA.pricing_starting_at}, rated ${toolA.rating}/5) versus ${toolB.tool_name} (${toolB.pricing_starting_at}, rated ${toolB.rating}/5), ${aText}, ${bText}.`;
}
