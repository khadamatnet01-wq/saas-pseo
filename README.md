# مستودع البنية التحتية لمنظومة الـ SEO البرمجي (Astro + TypeScript B2B SaaS pSEO Boilerplate)

مستودع كود مصدري معياري متكامل (**Production-Ready Boilerplate**) مبني باستخدام **Astro** و **TypeScript** ومُغذّى فعلياً بمصفوفة بياناتك `tools_saas_dataset.csv` (**12 أداة B2B SaaS**، **12 صفحة بدائل**، و **33 صفحة مقارنة ثنائية وجهاً لوجه** بإجمالي **58 مساراً مهيأً للأرشفة**).

## 1. ملخص معالجة مصفوفة البيانات المرفقة (`tools_saas_dataset.csv`)

تمت معالجة ملف `data/tools_saas_dataset.csv` عبر أنبوب التحقق الصارم (**Zod ETL Pipeline**) وتوليد المصفوفة المهيكلة في `src/data/validated-tools.json`:

| المؤشر الهندسي | النتيجة الفعلية بعد تشغيل الـ ETL |
| :--- | :--- |
| **إجمالي الأدوات البرمجية المدخلة** | **12 أداة** (`Linear`, `Jira`, `ClickUp`, `Asana`, `Notion`, `monday.com`, `Trello`, `Basecamp`, `Airtable`, `Wrike`, `Coda`, `Todoist`) |
| **مصفوفة الميزات التقنية (`features_matrix`)** | **7 ميزات قياسية** (`sprints_cycles`, `kanban_boards`, `roadmaps`, `time_tracking`, `built_in_automations`, `ai_triage`, `enterprise_security`) |
| **فحص سلامة المراجع (`Referential Integrity`)** | تم رصد المعرف `height` داخل `alternatives_ids` الخاصة بأداة `linear` واستبعاده تلقائياً لعدم وجود سجل له في الجدول لمنع توليد روابط `404` مكسورة |
| **مسارات مراجعات الأدوات (`/tools/[slug]`)** | **12 صفحة** (جميعها حققت `completeness_score: 100/100` وحالة `index, follow`) |
| **مسارات البدائل (`/alternatives/[slug]-alternatives`)** | **12 صفحة** تعرض جدول المقارنة الشامل مع البدائل المرتبطة |
| **مسارات المقارنات الثنائية (`/compare/[slugA]-vs-[slugB]`)** | **33 صفحة مقارنة فريدة** (موحدة أبجدياً لمنع ازدواجية المحتوى `Duplicate Content`) |
| **إجمالي المسارات المدرجة في `sitemap-0.xml` و `IndexNow`** | **58 مساراً** (الصفحة الرئيسية + 12 أداة + 12 بدائل + 33 مقارنة ثنائية) |

## 2. جدول الأدوات الـ 12 ومؤشرات الـ SEO المستخرجة

| المعرف (`slug`) | الأداة (`tool_name`) | التصنيف (`category`) | نموذج التسعير | السعر الابتدائي | التقييم | الميزات المدعومة | البدائل النشطة المعتمدة |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `linear` | Linear | Project Management & Issue Tracking | Freemium | `$8/user/mo` | ★ 4.8 | 6 / 7 | `jira`, `clickup`, `asana` *(تمت تصفية `height`)* |
| `jira` | Jira | Issue Tracking & Agile Planning | Freemium | `$7.75/user/mo` | ★ 4.3 | 7 / 7 | `linear`, `clickup`, `monday`, `asana` |
| `clickup` | ClickUp | All-in-One Work Management | Freemium | `$7/user/mo` | ★ 4.6 | 7 / 7 | `monday`, `asana`, `notion`, `jira` |
| `asana` | Asana | Enterprise Work Management | Freemium | `$10.99/user/mo` | ★ 4.5 | 7 / 7 | `monday`, `clickup`, `jira`, `trello` |
| `notion` | Notion | Knowledge Base & Collaborative Workspace | Freemium | `$8/user/mo` | ★ 4.7 | 6 / 7 | `coda`, `clickup`, `airtable`, `basecamp` |
| `monday` | monday.com | Visual Work OS & Operations | Paid (Free Trial) | `$9/user/mo` | ★ 4.6 | 7 / 7 | `clickup`, `asana`, `trello`, `wrike` |
| `trello` | Trello | Lightweight Kanban Project Tracking | Freemium | `$5/user/mo` | ★ 4.4 | 3 / 7 | `asana`, `monday`, `clickup`, `linear` |
| `basecamp` | Basecamp | Team Communication & Simple Projects | Flat-rate / Per User | `$15/user/mo or $299 flat` | ★ 4.4 | 2 / 7 | `notion`, `asana`, `clickup`, `trello` |
| `airtable` | Airtable | Relational Database & App Platform | Freemium | `$20/user/mo` | ★ 4.6 | 5 / 7 | `notion`, `coda`, `monday`, `clickup` |
| `wrike` | Wrike | Enterprise Resource & Project Planning | Freemium | `$9.80/user/mo` | ★ 4.2 | 7 / 7 | `monday`, `asana`, `jira`, `clickup` |
| `coda` | Coda | Interactive All-in-One Docs & Workspaces | Freemium (Maker Pricing) | `$10/maker/mo` | ★ 4.6 | 6 / 7 | `notion`, `airtable`, `clickup`, `asana` |
| `todoist` | Todoist | Task Management & Personal Productivity | Freemium | `$4/user/mo` | ★ 4.7 | 2 / 7 | `trello`, `asana`, `notion`, `basecamp` |

## 3. الهيكلة المعمارية للمستودع (Repository Architecture)

| المسار | الوظيفة التقنية داخل منظومة الـ pSEO |
| :--- | :--- |
| `data/tools_saas_dataset.csv` | مصفوفة البيانات الأساسية المرفقة (12 أداة B2B SaaS). |
| `src/schemas/tool.schema.ts` | مخطط **Zod** الصارم لفحص أعمدة CSV ومفاتيح `features_matrix` السبعة واستخراج السعر الرقمي للدولار (`starting_price_usd`). |
| `scripts/validate-and-etl.ts` | سكريبت **ETL** لتحويل CSV إلى JSON مهيكل، وفحص سلامة `alternatives_ids`، وحساب `completeness_score`. |
| `src/lib/schema-generator.ts` | مولد **JSON-LD** لوسوم `SoftwareApplication` / `Product` و `FAQPage` و `ItemList` و `BreadcrumbList`. |
| `src/lib/seo-engine.ts` | محرك توليد الروابط القانونية (`Canonical URLs`) وعلامات الروبوت التلقائية (`noindex` التلقائي للصفحات الناقصة). |
| `src/lib/content-engine.ts` | محرك القولبة المنطقية لتوليد ملخصات المقارنات التلقائية والأسئلة الشائعة المخصصة لكل صفحة. |
| `src/pages/tools/[slug].astro` | قالب المراجعة التفصيلية للأداة (12 مساراً). |
| `src/pages/alternatives/[slug]-alternatives.astro` | قالب بدائل الأداة ومقارنتها مع المنافسين المباشرين (12 مساراً). |
| `src/pages/compare/[slugA]-vs-[slugB].astro` | قالب المقارنة الثنائية المباشرة الموحد أبجدياً (33 مساراً). |
| `src/pages/og/[slug].png.ts` و `scripts/generate-og.ts` | توليد بطاقات المعاينة الاجتماعية (**Dynamic OpenGraph 1200x630**) عبر **Satori / Sharp**. |
| `scripts/generate-sitemaps.ts` | مقسم خرائط المواقع التلقائي (`dist/sitemap-index.xml` + `dist/sitemap-0.xml`). |
| `scripts/indexnow-submit.ts` | سكريبت **IndexNow API** لتوليد مفتاح التحقق وإرسال المسارات الـ 58 عبر مقارنة بصمات `SHA-256`. |
| `scripts/edge-worker-redirects.js` | Cloudflare Worker لإعادة التوجيه الطرفي (`301 Redirect`) للمقارنات المعكوسة (مثلاً `/compare/jira-vs-linear` إلى `/compare/linear-vs-jira`). |

## 4. متغيرات البيئة (`.env`) وطريقة التشغيل بأمر واحد

انسخ ملف `.env.example` إلى `.env` ثم شغّل دورة البناء الكاملة بأمر واحد:

```bash
cp .env.example .env
npm install
npm run build:pseo
```

### الأوامر الفرعية المتاحة

| الأمر البرمجي | الوظيفة |
| :--- | :--- |
| `npm run validate` | قراءة `data/tools_saas_dataset.csv`، التحقق عبر Zod، وتوليد `src/data/validated-tools.json`. |
| `npm run build` | تشغيل التحقق + بناء صفحات Astro الثابتة + توليد بطاقات OpenGraph + تقسيم خرائط المواقع. |
| `npm run og:generate` | توليد 58 بطاقة معاينة اجتماعية في `dist/og/`. |
| `npm run sitemap:partition` | توليد `dist/sitemap-index.xml` و `dist/sitemap-0.xml` (يضم 58 رابطاً). |
| `npm run indexnow:push` | توليد مفتاح التحقق وحمولة `dist/indexnow-payload.json` وإشعار محركات البحث عبر IndexNow API. |

## 5. دليل النشر على Cloudflare (حل مشكلة Wrangler في بيئات CI/CD)

إذا ظهر لك خطأ `Missing file or directory: public/.assetsignore` أو حاول Wrangler تشغيل `astro add cloudflare`، فالسبب هو محاولة Wrangler افتراضياً تحويل المشروع إلى نمط الخادم (SSR) عبر دالة تفاعلية في بيئة غير تفاعلية.

تم تزويد المستودع مسبقاً بملف `wrangler.jsonc` ومجلد `public/` لحل هذه المشكلة جذرياً:

1. **ملف `wrangler.jsonc` المدمج:**
   يخبر Wrangler بأن المشروع عبارة عن أصول ثابتة نقية (**Static Assets**):
   ```jsonc
   {
     "name": "saas-pseo",
     "compatibility_date": "2026-10-19",
     "assets": {
       "directory": "./dist",
       "html_handling": "auto-trailing-slash"
     }
   }
   ```
2. **ملفات `public/` الجاهزة:**
   - `public/.assetsignore`: لمنع أخطاء فحص الأصول في بيئات Cloudflare.
   - `public/_redirects`: تطبيق قواعد التحويل `301` تلقائياً على حافة الشبكة لمسارات المقارنات المعكوسة.
   - `public/_headers`: ضبط التخزين المؤقت وحماية الأمان لتقليل زمن الاستجابة `TTFB` لأقل من 50ms.

### أمر النشر الموصى به في إعدادات Cloudflare:
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy` (أو `npx wrangler pages deploy dist`)
- **Output directory:** `dist`
