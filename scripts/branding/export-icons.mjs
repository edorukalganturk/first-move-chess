import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const projectRoot = new URL('../../', import.meta.url);
const outputDirectory = new URL('public/brand/', projectRoot);
const source = readFileSync(new URL('public/icon.svg', projectRoot), 'utf8');
const executablePath = [
  chromium.executablePath(),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);

if (!executablePath) throw new Error('A local Chromium, Edge, or Chrome browser is required.');

mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  for (const [name, size] of [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['apple-touch-icon.png', 180],
  ]) {
    const png = await page.evaluate(
      async ({ svg, size }) => {
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        canvas.getContext('2d').drawImage(image, 0, 0, size, size);
        return canvas.toDataURL('image/png').split(',')[1];
      },
      { svg: source, size },
    );
    const destination = new URL(name, outputDirectory);
    writeFileSync(destination, Buffer.from(png, 'base64'));
    console.log(`${fileURLToPath(destination)} (${size} × ${size})`);
  }
} finally {
  await browser.close();
}
