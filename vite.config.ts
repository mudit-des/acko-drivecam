import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ackoRoot = fileURLToPath(new URL('./node_modules/@acko', import.meta.url))

export default defineConfig({
  // GitHub Pages serves the site from /acko-drivecam/; local dev and the Figma export stay at /.
  base: process.env.GH_PAGES ? '/acko-drivecam/' : '/',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      {
        // 5.0.0 tarball ships a dist barrel without sibling JS or .d.ts; use source.
        find: /^@acko\/(?!css(?:\/|$)|tokens(?:\/|$)|icons(?:\/|$))([^/]+)$/,
        replacement: `${ackoRoot}/$1/src/index.ts`,
      },
    ],
  },
})
