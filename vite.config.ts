import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'offline-precache',
      enforce: 'post',
      generateBundle(_, bundle) {
        const assets = [
          ...new Set([
            '/',
            '/index.html',
            '/icon.svg',
            '/manifest.webmanifest',
            '/brand/icon-192.png',
            '/brand/icon-512.png',
            '/brand/apple-touch-icon.png',
            ...Object.keys(bundle).map((name) => `/${name}`),
          ]),
        ];
        const version = createHash('sha256')
          .update(assets.join('|'))
          .update(readFileSync('public/icon.svg'))
          .digest('hex')
          .slice(0, 12);
        const worker = readFileSync('public/sw.js', 'utf8')
          .replace('chessmahal-v1', `chessmahal-${version}`)
          .replace(/const PRECACHE = \[[\s\S]*?\];/, `const PRECACHE = ${JSON.stringify(assets)};`);
        this.emitFile({ type: 'asset', fileName: 'sw.js', source: worker });
      },
    },
  ],
  server: { port: 5173 },
  test: { include: ['src/**/*.test.ts'] },
});
