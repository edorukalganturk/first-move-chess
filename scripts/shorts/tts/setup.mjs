import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const modelDir = join(root, 'shorts/models/kokoro');
const repository = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const files = [
  'config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'onnx/model_quantized.onnx',
];
const manifestPath = join(modelDir, 'download-manifest.json');
mkdirSync(modelDir, { recursive: true });
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
let revision = previous?.revision;
if (!revision) {
  const response = await fetch(`https://huggingface.co/api/models/${repository}`);
  if (!response.ok) throw new Error(`Model metadata download failed: ${response.status}`);
  revision = (await response.json()).sha;
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Unexpected model revision.');
}
const manifest = { repository, revision, files: [] };
for (const file of files) {
  const target = join(modelDir, file);
  const old = previous?.files.find((entry) => entry.file === file);
  if (existsSync(target) && old) {
    const bytes = readFileSync(target);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (sha256 === old.sha256) {
      manifest.files.push(old);
      console.log(`Verified ${file}`);
      continue;
    }
  }
  console.log(`Downloading ${file}...`);
  const response = await fetch(`https://huggingface.co/${repository}/resolve/${revision}/${file}`);
  if (!response.ok) throw new Error(`Download failed for ${file}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  manifest.files.push({
    file,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(
  `Local model ready (${(manifest.files.reduce((sum, f) => sum + f.bytes, 0) / 1e6).toFixed(1)} MB). Production narration runs offline.`,
);
