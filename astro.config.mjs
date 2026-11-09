// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { AstroPWAIntegration } from '@vite-pwa/astro';

const BRAND_COLOR = '#cc3333';
const BACKGROUND_COLOR = '#fdfcfa';

// https://astro.build/config
export default defineConfig({
  // Placeholder until the site gets a real domain; required by the sitemap
  site: 'https://noken.local',

  integrations: [
    react(),
    sitemap(),
    AstroPWAIntegration({
      registerType: 'autoUpdate',
      // Registered by hand in BaseLayout: Astro pages never go through Vite's HTML transform
      injectRegister: false,
      manifest: {
        name: 'Noken',
        short_name: 'Noken',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: BRAND_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      generateSW: {
        // The whole site, so lessons never opened before still work offline. No png:
        // the plugin adds the manifest icons itself and a duplicate URL breaks install.
        globPatterns: ['**/*.{html,js,css,json,woff2,svg,ico}'],
        navigateFallback: '/404.html',
        directoryIndex: 'index.html',
        // An empty list replaces the plugin's default transform, which renames every
        // page to its extensionless URL and would leave links ending in "/" uncached
        manifestTransforms: [],
        // Links exist both with and without a trailing slash; each page is cached once
        // as /path/index.html. Runs only after an exact match has failed. It is serialized
        // into sw.js, so it must be self-contained, and the block body is required: the
        // plugin's serializer cannot handle every expression as an arrow function body.
        urlManipulation: ({ url }) => {
          return [new URL(`${url.pathname}/index.html`, url.origin)];
        },
      },
    }),
  ],

  i18n: {
    locales: ['es'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
