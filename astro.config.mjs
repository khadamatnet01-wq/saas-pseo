import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://saascompare.example.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always'
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true
    }
  }
});
