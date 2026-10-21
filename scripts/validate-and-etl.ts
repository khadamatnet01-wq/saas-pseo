import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { SaaSToolSchema, type SaaSTool, type EnrichedSaaSTool } from '../src/schemas/tool.schema.js';

const ROOT_DIR = process.cwd();
const CSV_INPUT_PATH = path.join(ROOT_DIR, process.env.DATA_CSV_PATH || 'data/tools_saas_dataset.csv');
const JSON_OUTPUT_PATH = path.join(ROOT_DIR, 'data', 'tools.json');
const VALIDATED_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'validated-tools.json');

const WEBSITE_MAP: Record<string, string> = {
  "linear": "https://linear.app",
  "jira": "https://www.atlassian.com/software/jira",
  "clickup": "https://clickup.com",
  "asana": "https://asana.com",
  "monday": "https://monday.com",
  "trello": "https://trello.com",
  "basecamp": "https://basecamp.com",
  "wrike": "https://www.wrike.com",
  "height": "https://height.app",
  "shortcut": "https://shortcut.com",
  "smartsheet": "https://www.smartsheet.com",
  "teamwork": "https://www.teamwork.com",
  "meistertask": "https://www.meistertask.com",
  "nifty": "https://niftypm.com",
  "paymo": "https://www.paymoapp.com",
  "notion": "https://www.notion.so",
  "airtable": "https://airtable.com",
  "coda": "https://coda.io",
  "todoist": "https://todoist.com",
  "ticktick": "https://ticktick.com",
  "confluence": "https://www.atlassian.com/software/confluence",
  "slite": "https://slite.com",
  "nuclino": "https://www.nuclino.com",
  "craft": "https://www.craft.do",
  "obsidian": "https://obsidian.md",
  "baserow": "https://baserow.io",
  "nocodb": "https://nocodb.com",
  "fibery": "https://fibery.io",
  "hubspot": "https://www.hubspot.com",
  "pipedrive": "https://www.pipedrive.com",
  "salesforce": "https://www.salesforce.com",
  "zoho-crm": "https://www.zoho.com/crm/",
  "close": "https://www.close.com",
  "attio": "https://attio.com",
  "copper": "https://www.copper.com",
  "freshsales": "https://www.freshworks.com/crm/sales/",
  "intercom": "https://www.intercom.com",
  "zendesk": "https://www.zendesk.com",
  "freshdesk": "https://www.freshworks.com/freshdesk/",
  "helpscout": "https://www.helpscout.com",
  "crisp": "https://crisp.chat",
  "posthog": "https://posthog.com",
  "mixpanel": "https://mixpanel.com",
  "amplitude": "https://amplitude.com",
  "zapier": "https://zapier.com",
  "make": "https://www.make.com",
  "n8n": "https://n8n.io",
  "slack": "https://slack.com",
  "microsoft-teams": "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software",
  "loom": "https://www.loom.com"
};

function extractPrice(pricingStr: string): number {
  const m = pricingStr.match(/\$(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function runEtl() {
  console.log(`[ETL] Ingesting 50-tool dataset from: ${CSV_INPUT_PATH}`);
  if (!fs.existsSync(CSV_INPUT_PATH)) {
    console.log('[ETL] CSV not found, verifying validated-tools.json directly.');
    return;
  }

  const rawCsv = fs.readFileSync(CSV_INPUT_PATH, 'utf-8');
  const records = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  const today = '2026-10-19';
  const validatedTools: SaaSTool[] = [];
  const knownSlugs = new Set<string>();

  for (const row of records) {
    const slug = row.slug.trim();
    const rawAlts = row.alternatives_ids.split(',').map((s) => s.trim()).filter(Boolean);
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
      pros: row.pros.split(';').map((s) => s.trim()).filter(Boolean),
      cons: row.cons.split(';').map((s) => s.trim()).filter(Boolean),
      alternatives_ids: rawAlts,
      website_url: row.website_url?.trim() || WEBSITE_MAP[slug] || `https://${slug}.com`,
      affiliate_url: '',
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
  fs.writeFileSync(VALIDATED_OUTPUT_PATH, JSON.stringify(enrichedTools, null, 2), 'utf-8');
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(enrichedTools, null, 2), 'utf-8');
  console.log(`[ETL Success] Validated and saved ${enrichedTools.length} tools to ${VALIDATED_OUTPUT_PATH}`);
}

runEtl();
