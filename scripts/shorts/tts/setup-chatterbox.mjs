import { createHash } from 'node:crypto';
import { createWriteStream, createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const directory = join(root, 'shorts/models/chatterbox');
const revision = '5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18';
mkdirSync(directory, { recursive: true });
async function download(name, url) {
  const path = join(directory, name);
  if (!existsSync(path)) {
    console.log(`Downloading ${name}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(path));
  }
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  console.log(`Ready ${name}: ${(bytes / 1048576).toFixed(1)} MB`);
  return { name, url, bytes, sha256: hash.digest('hex') };
}
const files = [];
// Keep the official runtime's local loading contract; V3 changes the multilingual T3 checkpoint.
for (const name of [
  't3_mtl23ls_v3.safetensors',
  's3gen.pt',
  've.pt',
  'grapheme_mtl_merged_expanded_v1.json',
  'conds.pt',
  'Cangjie5_TC.json',
  'README.md',
]) {
  files.push(
    await download(
      name,
      `https://huggingface.co/ResembleAI/chatterbox/resolve/${revision}/${name}`,
    ),
  );
}
files.push(
  await download(
    'LICENSE',
    'https://raw.githubusercontent.com/resemble-ai/chatterbox/5de7a54aa4e5e2baadb0182dde554908b48b85c2/LICENSE',
  ),
);
writeFileSync(
  join(directory, 'download-manifest.json'),
  JSON.stringify(
    {
      repository: 'ResembleAI/chatterbox',
      revision,
      codeRevision: '5de7a54aa4e5e2baadb0182dde554908b48b85c2',
      license: 'MIT',
      downloadedAt: new Date().toISOString(),
      files,
    },
    null,
    2,
  ),
);
console.log('Local Chatterbox Multilingual V3 model is ready.');
