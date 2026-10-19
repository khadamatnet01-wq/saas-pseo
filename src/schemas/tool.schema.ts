import { z } from 'zod';

/**
 * مخطط مصفوفة الميزات السبعة المعتمدة في ملف tools_saas_dataset.csv
 */
export const FeaturesMatrixSchema = z.object({
  sprints_cycles: z.boolean(),
  kanban_boards: z.boolean(),
  roadmaps: z.boolean(),
  time_tracking: z.boolean(),
  built_in_automations: z.boolean(),
  ai_triage: z.boolean(),
  enterprise_security: z.boolean()
}).catchall(z.boolean());

/**
 * مخطط التحقق الصارم عبر Zod لمصفوفة بيانات tools_saas_dataset.csv
 * الأعمدة: slug, tool_name, category, pricing_model, pricing_starting_at, rating, summary, features_matrix, pros, cons, alternatives_ids
 */
export const SaaSToolSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'المعرف (slug) يجب أن يتكون من أحرف صغيرة وأرقام وشرطات فقط'),
  tool_name: z.string().min(2, 'اسم الأداة مطلوب'),
  category: z.string().min(2, 'تصنيف الأداة مطلوب'),
  pricing_model: z.string().min(2, 'نموذج التسعير مطلوب'),
  pricing_starting_at: z.string().min(2, 'نص السعر الابتدائي مطلوب'),
  starting_price_usd: z.number().min(0, 'السعر الرقمي المستخرج يجب أن يكون 0 أو أكبر'),
  rating: z.number().min(1).max(5, 'التقييم يجب أن يكون بين 1.0 و 5.0'),
  summary: z.string().min(20, 'الوصف التلخيصي (summary) يجب ألا يقل عن 20 حرفاً'),
  features_matrix: FeaturesMatrixSchema,
  pros: z
    .array(z.string().min(3))
    .min(1, 'يجب توفير ميزة إيجابية واحدة على الأقل'),
  cons: z
    .array(z.string().min(3))
    .min(1, 'يجب توفير نقطة ضعف واحدة على الأقل'),
  alternatives_ids: z
    .array(z.string().regex(/^[a-z0-9-]+$/))
    .min(1, 'يجب ربط الأداة ببديل واحد على الأقل'),
  last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const EnrichedSaaSToolSchema = SaaSToolSchema.extend({
  raw_alternatives_ids: z.array(z.string()),
  seo_metrics: z.object({
    completeness_score: z.number().min(0).max(100),
    should_index: z.boolean(),
    noindex_reason: z.string().nullable(),
    supported_features_count: z.number().int(),
    total_features_evaluated: z.number().int()
  })
});

export type SaaSTool = z.infer<typeof SaaSToolSchema>;
export type EnrichedSaaSTool = z.infer<typeof EnrichedSaaSToolSchema>;
export type FeaturesMatrix = z.infer<typeof FeaturesMatrixSchema>;
