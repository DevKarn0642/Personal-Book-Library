import path from 'node:path'
import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const require = createRequire(import.meta.url)
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'))
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{
        src: normalizePath(path.join(cMapsDir, '*')),
        dest: 'cmaps',
        rename: { stripBase: true },
      }],
    }),
  ],
})
