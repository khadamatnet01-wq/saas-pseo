import type { EnrichedSaaSTool } from '../schemas/tool.schema.js';

export interface FAQItem {
  question: string;
  answer: string;
}

export const FEATURE_LABELS: Record<string, { ar: string; en: string }> = {
  sprints_cycles: {
    ar: 'إدارة الدورات والسبرنتات (Sprints & Cycles)',
    en: 'Sprints & Cycles'
  },
  kanban_boards: {
    ar: 'لوحات كانبان التفاعلية (Kanban Boards)',
    en: 'Kanban Boards'
  },
  roadmaps: {
    ar: 'خرائط الطريق والتخطيط الزمني (Roadmaps)',
    en: 'Roadmaps'
  },
  time_tracking: {
    ar: 'تتبع الوقت المدمج (Native Time Tracking)',
    en: 'Time Tracking'
  },
  built_in_automations: {
    ar: 'أتمتة العمليات المدمجة (Built-in Automations)',
    en: 'Built-in Automations'
  },
  ai_triage: {
    ar: 'الفرز والتصنيف بالذكاء الاصطناعي (AI Triage & Copilot)',
    en: 'AI Triage'
  },
  enterprise_security: {
    ar: 'أمان المؤسسات والصلاحيات المتقدمة (Enterprise Security)',
    en: 'Enterprise Security'
  }
};

export function generateToolFAQs(
  tool: EnrichedSaaSTool,
  alternatives: EnrichedSaaSTool[]
): FAQItem[] {
  const topAltNames = alternatives.map((a) => a.tool_name).join('، ');
  const supportedNames = Object.entries(tool.features_matrix)
    .filter(([, v]) => v === true)
    .map(([k]) => FEATURE_LABELS[k]?.ar || k)
    .join('، ');

  return [
    {
      question: `ما هو نموذج تسعير ${tool.tool_name} وتكلفة الباقة الابتدائية؟`,
      answer: `يعمل ${tool.tool_name} بنموذج (${tool.pricing_model}) وتبدأ أسعاره من (${tool.pricing_starting_at})، وحصل على تقييم ${tool.rating}/5 في فئة ${tool.category}.`
    },
    {
      question: `ما هي الميزات التقنية المدعومة في ${tool.tool_name}؟`,
      answer: `يدعم ${tool.tool_name} ${tool.seo_metrics.supported_features_count} من أصل ${tool.seo_metrics.total_features_evaluated} ميزات أساسية تشمل: ${supportedNames}.`
    },
    {
      question: `ما هي أبرز مميزات وعيوب ${tool.tool_name} عند الاستخدام الفعلي؟`,
      answer: `تتمثل أبرز نقاط القوة في: (${tool.pros.join(' | ')})، بينما تشمل أبرز التحديات والقيود: (${tool.cons.join(' | ')}).`
    },
    {
      question: `ما هي أفضل البدائل المباشرة لـ ${tool.tool_name}؟`,
      answer: topAltNames
        ? `تشمل قائمة البدائل المعتمدة لـ ${tool.tool_name} كلاً من: ${topAltNames}. يمكنك مقارنة كل بديل وجهاً لوجه من حيث السعر ومصفوفة الميزات.`
        : `تتوفر عدة بدائل في فئة ${tool.category}.`
    }
  ];
}

export function generateComparisonFAQs(
  toolA: EnrichedSaaSTool,
  toolB: EnrichedSaaSTool
): FAQItem[] {
  const cheaperTool = toolA.starting_price_usd <= toolB.starting_price_usd ? toolA : toolB;
  const higherRated = toolA.rating >= toolB.rating ? toolA : toolB;

  return [
    {
      question: `أيهما أقل تكلفة: ${toolA.tool_name} أم ${toolB.tool_name}؟`,
      answer: `تبدأ تكلفة ${toolA.tool_name} من (${toolA.pricing_starting_at} - ${toolA.pricing_model})، بينما تبدأ تكلفة ${toolB.tool_name} من (${toolB.pricing_starting_at} - ${toolB.pricing_model})، مما يجعل ${cheaperTool.tool_name} الخيار الأقل سعراً عند البداية.`
    },
    {
      question: `أيهما يتفوق في تقييمات المستخدمين: ${toolA.tool_name} أم ${toolB.tool_name}؟`,
      answer: `يتفوق ${higherRated.tool_name} بتقييم ${higherRated.rating}/5 مقارنةً بمنافسه، ويتميز بـ: ${higherRated.pros[0]}.`
    },
    {
      question: `ما الفرق الجوهري بين ${toolA.tool_name} و ${toolB.tool_name} في الميزات التقنية؟`,
      answer: `يدعم ${toolA.tool_name} ${toolA.seo_metrics.supported_features_count}/7 من الميزات القياسية (${toolA.category})، بينما يدعم ${toolB.tool_name} ${toolB.seo_metrics.supported_features_count}/7 من الميزات (${toolB.category}).`
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

  const aDiff =
    uniqueToA.length > 0
      ? `يتفوق ${toolA.tool_name} بدعم (${uniqueToA.map((k) => FEATURE_LABELS[k]?.en || k).join(', ')})`
      : `يشترك ${toolA.tool_name} في كافة مزاياه الأساسية مع منافسه`;

  const bDiff =
    uniqueToB.length > 0
      ? `بينما ينفرد ${toolB.tool_name} بدعم (${uniqueToB.map((k) => FEATURE_LABELS[k]?.en || k).join(', ')})`
      : `ويقدم ${toolB.tool_name} تغطية مماثلة في مصفوفة الميزات`;

  return `مقارنة شاملة بين ${toolA.tool_name} (${toolA.pricing_starting_at}، تقييم ${toolA.rating}/5) و ${toolB.tool_name} (${toolB.pricing_starting_at}، تقييم ${toolB.rating}/5): ${aDiff}، ${bDiff}.`;
}
