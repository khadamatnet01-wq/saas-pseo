import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://saas-pseo.hefainahmed.workers.dev',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always'
  },
  compressHTML: true
});
