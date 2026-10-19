import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { SaaSToolSchema, type SaaSTool, type EnrichedSaaSTool } from '../src/schemas/tool.schema.js';

const ROOT_DIR = process.cwd();
const CSV_INPUT_PATH = path.join(ROOT_DIR, process.env.DATA_CSV_PATH || 'data/tools_saas_dataset.csv');
const JSON_OUTPUT_PATH = path.join(ROOT_DIR, 'data', 'tools.json');
const VALIDATED_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'validated-tools.json');

const MIN_FEATURES = Number(process.env.MIN_FEATURES_FOR_INDEXING || 5);
const MIN_PROS_CONS = Number(process.env.MIN_PROS_CONS_FOR_INDEXING || 2);

/**
 * استخراج القيمة الرقمية للدولار من حقل pricing_starting_at (مثل "$8/user/mo" -> 8)
 */
function extractStartingPriceUsd(pricingStr: string): number {
  const match = pricingStr.match(/\$(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

/**
 * قراءة وتحويل ملف tools_saas_dataset.csv إلى كائنات مطابقة لمخطط Zod
 */
function parseDatasetCsv(csvContent: string): unknown[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  const today = new Date().toISOString().split('T')[0];

  return records.map((row) => ({
    slug: row.slug.trim(),
    tool_name: row.tool_name.trim(),
    category: row.category.trim(),
    pricing_model: row.pricing_model.trim(),
    pricing_starting_at: row.pricing_starting_at.trim(),
    starting_price_usd: extractStartingPriceUsd(row.pricing_starting_at),
    rating: Number(row.rating),
    summary: row.summary.trim(),
    features_matrix: JSON.parse(row.features_matrix),
    pros: row.pros
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean),
    cons: row.cons
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean),
    alternatives_ids: row.alternatives_ids
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    last_updated: row.last_updated || today
  }));
}

function evaluateSeoQuality(tool: SaaSTool): EnrichedSaaSTool['seo_metrics'] {
  const entries = Object.entries(tool.features_matrix);
  const supportedCount = entries.filter(([, val]) => val === true).length;
  const totalFeatures = entries.length;

  let score = 40;
  if (tool.pros.length >= 3) score += 15;
  if (tool.cons.length >= 2) score += 15;
  if (totalFeatures >= 7) score += 15;
  if (tool.alternatives_ids.length >= 3) score += 15;

  const reasons: string[] = [];
  if (totalFeatures < MIN_FEATURES) {
    reasons.push(`عدد الميزات الموثقة (${totalFeatures}) أقل من الحد الأدنى (${MIN_FEATURES})`);
  }
  if (tool.pros.length < MIN_PROS_CONS || tool.cons.length < MIN_PROS_CONS) {
    reasons.push('عدد نقاط القوة أو الضعف أقل من الحد الأدنى للمراجعة المتوازنة');
  }
  if (tool.summary.length < 20) {
    reasons.push('الملخص التعريفي قصير جداً');
  }

  return {
    completeness_score: Math.min(100, score),
    should_index: reasons.length === 0,
    noindex_reason: reasons.length > 0 ? reasons.join(' | ') : null,
    supported_features_count: supportedCount,
    total_features_evaluated: totalFeatures
  };
}

function runEtlPipeline(): void {
  console.log(`[ETL] بدء قراءة ومعالجة مصفوفة البيانات: ${CSV_INPUT_PATH}`);
  if (!fs.existsSync(CSV_INPUT_PATH)) {
    throw new Error(`ملف البيانات غير موجود: ${CSV_INPUT_PATH}`);
  }

  const rawObjects = parseDatasetCsv(fs.readFileSync(CSV_INPUT_PATH, 'utf-8'));
  const validatedTools: SaaSTool[] = [];
  const knownSlugs = new Set<string>();

  rawObjects.forEach((obj, idx) => {
    const result = SaaSToolSchema.safeParse(obj);
    if (!result.success) {
      console.error(`[ETL Error] فشل التحقق من الصف رقم #${idx + 1}:`, result.error.format());
      process.exit(1);
    }
    if (knownSlugs.has(result.data.slug)) {
      console.error(`[ETL Error] تكرار في المعرف (slug): ${result.data.slug}`);
      process.exit(1);
    }
    knownSlugs.add(result.data.slug);
    validatedTools.push(result.data);
  });

  // حفظ نسخة JSON الخام المحولة من CSV
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(validatedTools, null, 2), 'utf-8');

  // فحص سلامة المراجع التبادلية (Referential Integrity Check)
  const enrichedTools: EnrichedSaaSTool[] = validatedTools.map((tool) => {
    const validAlternatives = tool.alternatives_ids.filter((altSlug) => {
      if (altSlug === tool.slug) return false;
      const exists = knownSlugs.has(altSlug);
      if (!exists) {
        console.warn(
          `[ETL Integrity Warning] الأداة "${tool.slug}" تشير إلى بديل غير مدرج في الجدول ("${altSlug}") — تم استبعاده تلقائياً من توليد المسارات لمنع صفحات 404.`
        );
      }
      return exists;
    });

    const cleanedTool: SaaSTool = {
      ...tool,
      alternatives_ids: validAlternatives
    };

    return {
      ...cleanedTool,
      raw_alternatives_ids: tool.alternatives_ids,
      seo_metrics: evaluateSeoQuality(cleanedTool)
    };
  });

  fs.mkdirSync(path.dirname(VALIDATED_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(VALIDATED_OUTPUT_PATH, JSON.stringify(enrichedTools, null, 2), 'utf-8');

  console.log(`[ETL Success] تم التحقق من ${enrichedTools.length} أداة بنجاح وحفظ المخرجات في: ${VALIDATED_OUTPUT_PATH}`);
}

runEtlPipeline();
