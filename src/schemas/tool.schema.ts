import { z } from 'zod';

export const FeaturesMatrixSchema = z.object({
  sprints_cycles: z.boolean(),
  kanban_boards: z.boolean(),
  roadmaps: z.boolean(),
  time_tracking: z.boolean(),
  built_in_automations: z.boolean(),
  ai_triage: z.boolean(),
  enterprise_security: z.boolean()
}).catchall(z.boolean());

export const SaaSToolSchema = z.object({
  slug: z.string().min(2),
  tool_name: z.string().min(2),
  category: z.string().min(2),
  pricing_model: z.string().min(2),
  pricing_starting_at: z.string().min(2),
  starting_price_usd: z.number().min(0),
  rating: z.number().min(1).max(5),
  summary: z.string().min(20),
  features_matrix: FeaturesMatrixSchema,
  pros: z.array(z.string().min(3)),
  cons: z.array(z.string().min(3)),
  alternatives_ids: z.array(z.string()),
  website_url: z.string().url(),
  affiliate_url: z.string().optional().default(''),
  logo_url: z.string().url().optional(),
  screenshot_url: z.string().url().optional(),
  last_updated: z.string()
});

export const EnrichedSaaSToolSchema = SaaSToolSchema.extend({
  seo_metrics: z.object({
    completeness_score: z.number(),
    should_index: z.boolean(),
    noindex_reason: z.string().nullable(),
    supported_features_count: z.number(),
    total_features_evaluated: z.number()
  })
});

export type SaaSTool = z.infer<typeof SaaSToolSchema>;
export type EnrichedSaaSTool = z.infer<typeof EnrichedSaaSToolSchema>;
