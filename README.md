# StackRadar — 50 B2B SaaS Tools Reviews, Alternatives & Comparisons Portal

A production-ready B2B software evaluation portal built with **Astro** and **TypeScript**, pre-loaded with **50 high-intent B2B SaaS platforms** across 5 lucrative categories, generating **272 total canonical routes** (1 Homepage + 50 Tool Reviews + 50 Alternatives Guides + 171 Head-to-Head Comparisons).

## 1. Scale & Route Summary

| Metric | Count | Route Pattern |
| :--- | :---: | :--- |
| **Main Directory & Category Clusters** | **1** | `/` |
| **In-Depth Software Reviews** | **50** | `/tools/[slug]` |
| **Competitor & Alternatives Guides** | **50** | `/alternatives/[slug]-alternatives` |
| **Head-to-Head Comparison Pages** | **171** | `/compare/[slugA]-vs-[slugB]` |
| **Total Indexable Canonical Pages** | **272 Pages** | Listed in `dist/sitemap-0.xml` |

## 2. The 50 Included B2B SaaS Platforms by Category

### A. Project Management & Issue Tracking (15 Tools)
`Linear`, `Jira`, `ClickUp`, `Asana`, `monday.com`, `Trello`, `Basecamp`, `Wrike`, `Height`, `Shortcut`, `Smartsheet`, `Teamwork.com`, `MeisterTask`, `Nifty`, `Paymo`

### B. Knowledge Base, Docs & Collaborative Workspaces (13 Tools)
`Notion`, `Airtable`, `Coda`, `Todoist`, `TickTick`, `Atlassian Confluence`, `Slite`, `Nuclino`, `Craft Docs`, `Obsidian`, `Baserow`, `NocoDB`, `Fibery`

### C. CRM, Sales & Revenue Operations (8 Tools)
`HubSpot CRM`, `Pipedrive`, `Salesforce Sales Cloud`, `Zoho CRM`, `Close CRM`, `Attio`, `Copper CRM`, `Freshsales`

### D. Customer Support, Helpdesk & Product Analytics (8 Tools)
`Intercom`, `Zendesk`, `Freshdesk`, `Help Scout`, `Crisp`, `PostHog`, `Mixpanel`, `Amplitude`

### E. Workflow Automation & Team Collaboration (6 Tools)
`Zapier`, `Make (Integromat)`, `n8n`, `Slack`, `Microsoft Teams`, `Loom`

## 3. Affiliate Monetization Setup

All 50 tools currently route outbound CTA buttons directly to their official websites (`website_url`). To activate affiliate commissions for any tool, populate its `affiliate_url` field in `src/data/validated-tools.json` or `data/tools.json`.

## 4. Build & Deploy Commands

```bash
npm install
npm run build
```
