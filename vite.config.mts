// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '.' },
        { src: 'public/icon.png', dest: '.' }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/Popup.html'),
        overlay: resolve(__dirname, 'src/content/ui/overlay.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background/background.js';
          if (chunkInfo.name === 'content') return 'content/content.js';
          if (chunkInfo.name === 'popup') return 'popup.js';
          if (chunkInfo.name === 'overlay') return 'overlay.js';
          return '[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    target: 'esnext',
  },
  publicDir: false,
  // Move HTML outputs to dist root
  buildEnd() {
    const fs = require('fs');
    const path = require('path');
    const popupHtml = path.join(__dirname, 'dist/src/popup/Popup.html');
    const overlayHtml = path.join(__dirname, 'dist/src/content/ui/overlay.html');
    if (fs.existsSync(popupHtml)) {
      fs.renameSync(popupHtml, path.join(__dirname, 'dist/popup.html'));
    }
    if (fs.existsSync(overlayHtml)) {
      fs.renameSync(overlayHtml, path.join(__dirname, 'dist/overlay.html'));
    }
  }
})
