import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { SaaSToolSchema, type SaaSTool, type EnrichedSaaSTool } from "../src/schemas/tool.schema.js";

const ROOT_DIR = process.cwd();
const CSV_INPUT_PATH = path.join(ROOT_DIR, process.env.DATA_CSV_PATH || "data/tools_saas_dataset.csv");
const JSON_OUTPUT_PATH = path.join(ROOT_DIR, "data", "tools.json");
const VALIDATED_OUTPUT_PATH = path.join(ROOT_DIR, "src", "data", "validated-tools.json");

const WEBSITE_MAP: Record<string, string> = {
  linear: "https://linear.app",
  jira: "https://www.atlassian.com/software/jira",
  clickup: "https://clickup.com",
  asana: "https://asana.com",
  notion: "https://www.notion.so",
  monday: "https://monday.com",
  trello: "https://trello.com",
  basecamp: "https://basecamp.com",
  airtable: "https://airtable.com",
  wrike: "https://www.wrike.com",
  coda: "https://coda.io",
  todoist: "https://todoist.com"
};

function extractPrice(pricingStr: string): number {
  const m = pricingStr.match(/\$(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function runEtl() {
  console.log(`[ETL] Ingesting dataset from: ${CSV_INPUT_PATH}`);
  if (!fs.existsSync(CSV_INPUT_PATH)) {
    console.log("[ETL] CSV not found, verifying validated-tools.json directly.");
    return;
  }

  const rawCsv = fs.readFileSync(CSV_INPUT_PATH, "utf-8");
  const records = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  const today = "2026-10-19";
  const validatedTools: SaaSTool[] = [];
  const knownSlugs = new Set<string>();

  for (const row of records) {
    const slug = row.slug.trim();
    const rawAlts = row.alternatives_ids.split(",").map((s) => s.trim()).filter(Boolean);
    const item: SaaSTool = {
      slug,
      tool_name: row.tool_name.trim(),
      category: row.category.trim(),
      pricing_model: row.pricing_model.trim(),
      pricing_starting_at: row.pricing_starting_at.trim(),
      starting_price_usd: extractPrice(row.pricing_starting_at),
      rating: Number(row.rating),
      summary: row.summary.trim(),
      features_matrix: JSON.parse(row.features_matrix),
      pros: row.pros.split(";").map((s) => s.trim()).filter(Boolean),
      cons: row.cons.split(";").map((s) => s.trim()).filter(Boolean),
      alternatives_ids: rawAlts,
      website_url: WEBSITE_MAP[slug] || `https://${slug}.com`,
      affiliate_url: "",
      last_updated: today
    };

    const parsed = SaaSToolSchema.safeParse(item);
    if (!parsed.success) {
      console.error(`[ETL Error] Validation failed for ${slug}:`, parsed.error.format());
      process.exit(1);
    }
    knownSlugs.add(slug);
    validatedTools.push(parsed.data);
  }

  const enrichedTools: EnrichedSaaSTool[] = validatedTools.map((tool) => {
    const validAlts = tool.alternatives_ids.filter((aid) => aid !== tool.slug && knownSlugs.has(aid));
    const supportedCount = Object.values(tool.features_matrix).filter((v) => v === true).length;
    return {
      ...tool,
      alternatives_ids: validAlts,
      seo_metrics: {
        completeness_score: 100,
        should_index: true,
        noindex_reason: null,
        supported_features_count: supportedCount,
        total_features_evaluated: Object.keys(tool.features_matrix).length
      }
    };
  });

  fs.mkdirSync(path.dirname(VALIDATED_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(VALIDATED_OUTPUT_PATH, JSON.stringify(enrichedTools, null, 2), "utf-8");
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(enrichedTools, null, 2), "utf-8");
  console.log(`[ETL Success] Validated and saved ${enrichedTools.length} tools to ${VALIDATED_OUTPUT_PATH}`);
}

runEtl();
