import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { narrateTurkishLocally } from './narrate-ema.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const directory = join(root, 'shorts/output/.cache/italian-game-tr-v2');
mkdirSync(directory, { recursive: true });
// The reference is synthesized from our local stock EMA voice; no person's recording is used.
await narrateTurkishLocally({
  speed: 0.92,
  clips: [
    {
      text: 'Gel, şu konuma birlikte bakalım. Açılışta ne yaptığımızı anlayınca hamleleri hatırlamak da kolaylaşıyor. Hadi, bir de sen dene.',
      path: join(directory, 'style-reference.wav'),
    },
  ],
});
