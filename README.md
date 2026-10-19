# StackRadar — Independent B2B Software Reviews & Comparisons Portal

A production-grade, authoritative software evaluation portal built with **Astro** and **TypeScript**. Designed for high organic search performance, conversion-focused user journeys, and seamless affiliate link monetization.

## 1. Architectural Highlights

| Feature | Implementation | Benefit |
| :--- | :--- | :--- |
| **Editorial Brand Identity** | Built as **StackRadar**, a trusted B2B software research and comparison hub. | Zero programmatic / pSEO footprint visible to visitors. Completely discrete and authentic. |
| **Affiliate Monetization** | Supports direct outbound URLs and custom affiliate redirect links via `affiliate_url`. | High-converting CTA buttons with `rel="sponsored nofollow noopener noreferrer"` on all review and comparison cards. |
| **Full English Experience** | 100% English typography, UI copy, and editorial benchmarks. | Native LTR presentation with Plus Jakarta Sans typography. |
| **Complete Route Coverage** | **58 Total Canonical Routes** across 12 SaaS tools, 12 alternatives pages, and 33 head-to-head comparison pages. | Every tool benchmarked across a 7-point technical specification matrix. |
| **Cloudflare Edge Ready** | Pre-configured `wrangler.jsonc` (Static Assets) and clean `public/_redirects`. | Deploys seamlessly without SSR overhead, zero redirect loops, and sub-50ms TTFB. |

## 2. Included Software Inventory (12 Tools)

| Tool | Category | Starting Price | Rating | Key Strength |
| :--- | :--- | :--- | :--- | :--- |
| **Linear** | Project Management & Issue Tracking | `$8/user/mo` | ★ 4.8 | Ultra-fast user interface & streamlined git sync |
| **Jira** | Issue Tracking & Agile Planning | `$7.75/user/mo` | ★ 4.3 | Unmatched enterprise governance & deep marketplace |
| **ClickUp** | All-in-One Work Management | `$7/user/mo` | ★ 4.6 | 15+ customizable data views & native time tracking |
| **Asana** | Enterprise Work Management | `$10.99/user/mo` | ★ 4.5 | Visual workflow builder & executive portfolio tracking |
| **Notion** | Knowledge Base & Workspace | `$8/user/mo` | ★ 4.7 | Relational databases & connected team documentation |
| **monday.com** | Visual Work OS & Operations | `$9/user/mo` | ★ 4.6 | Vibrant board interface with zero technical barrier |
| **Trello** | Lightweight Kanban Tracking | `$5/user/mo` | ★ 4.4 | Instant onboarding & lightweight Butler automation |
| **Basecamp** | Team Communication & Projects | `$15/user/mo` | ★ 4.4 | Calm notification architecture & flat-rate pricing |
| **Airtable** | Relational Database & App Platform | `$20/user/mo` | ★ 4.6 | Low-code relational modeling with custom interface apps |
| **Wrike** | Enterprise Resource Planning | `$9.80/user/mo` | ★ 4.2 | Top-tier workload capacity planning & asset approvals |
| **Coda** | Interactive Docs & Workspaces | `$10/maker/mo` | ★ 4.6 | Maker-based pricing with interactive buttons & formulas |
| **Todoist** | Personal & Team Task Management | `$4/user/mo` | ★ 4.7 | Best-in-class natural language quick task capture |

## 3. How Affiliate Links Work

Every tool in `src/data/validated-tools.json` (and `data/tools.json`) supports an optional `affiliate_url` field:

```json
{
  "slug": "clickup",
  "tool_name": "ClickUp",
  "website_url": "https://clickup.com",
  "affiliate_url": "https://clickup.pxf.io/c/YOUR_PARTNER_ID"
}
```

* **When `affiliate_url` is provided:** The CTA buttons ("Visit Official Site", "Try Free") automatically route visitors through your affiliate partner link.
* **When `affiliate_url` is blank:** The buttons route directly to the official website (`website_url`). You can launch directly with direct links and drop in your affiliate tags later without modifying any components!

## 4. Single-Command Build & Cloudflare Deployment

```bash
npm install
npm run build
```

Deploy to Cloudflare Workers / Pages:
```bash
npm run deploy
```
