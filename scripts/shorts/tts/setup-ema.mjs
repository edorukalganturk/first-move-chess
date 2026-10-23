import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const directory = join(root, 'shorts/models/ema-lightning');
const repository = 'korhun/ema-lightning-onnx';
const revision = '16220eaed41826cc4b38c4752504d9beb61f010f';
const files = [
  'text.onnx',
  'sound.onnx',
  'decoder.onnx',
  'vocab.json',
  'model-config.json',
  'LICENSE',
  'NOTICE',
  'README.md',
];
mkdirSync(directory, { recursive: true });
const downloaded = [];
for (const name of files) {
  const url = `https://huggingface.co/${repository}/resolve/${revision}/${name}`;
  console.log(`Downloading ${name}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(join(directory, name), bytes);
  downloaded.push({
    name,
    url,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}
const modelConfig = JSON.parse(readFileSync(join(directory, 'model-config.json'), 'utf8'));
writeFileSync(
  join(directory, 'download-manifest.json'),
  JSON.stringify(
    {
      repository,
      revision,
      sourceRevision: modelConfig.revision,
      source: 'https://huggingface.co/canberkkkkkk/ema-lightning',
      license: 'Apache-2.0',
      downloadedAt: new Date().toISOString(),
      files: downloaded,
    },
    null,
    2,
  ),
);
console.log('Turkish EMA Lightning model is ready for offline narration.');
