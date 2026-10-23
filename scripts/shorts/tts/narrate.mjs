import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export async function narrateLocally(plan) {
  const manifestPath = join(root, 'shorts/models/kokoro/download-manifest.json');
  if (!existsSync(manifestPath))
    throw new Error('Run node scripts/shorts/tts/setup.mjs once to download the local model.');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const signatures = plan.clips.map((clip) =>
    createHash('sha256')
      .update(
        JSON.stringify({
          text: clip.text,
          voice: plan.voice,
          speed: plan.speed,
          revision: manifest.revision,
        }),
      )
      .digest('hex'),
  );
  const cached = plan.clips.map(
    (clip, i) =>
      existsSync(clip.path) &&
      existsSync(`${clip.path}.sha256`) &&
      readFileSync(`${clip.path}.sha256`, 'utf8') === signatures[i],
  );
  env.localModelPath = join(root, 'shorts/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  env.useFSCache = false;
  // This process performs inference locally; even an accidental fetch must fail.
  globalThis.fetch = async () => {
    throw new Error('Network is disabled during local narration. Run setup separately.');
  };
  if (cached.every(Boolean)) {
    console.log('Using cached local neural narration.');
    return;
  }
  console.log('Loading Kokoro on the local CPU...');
  const tts = await KokoroTTS.from_pretrained('kokoro', { dtype: 'q8', device: 'cpu' });
  for (let i = 0; i < plan.clips.length; i++) {
    if (cached[i]) continue;
    const clip = plan.clips[i];
    console.log(`Synthesizing ${i + 1}/${plan.clips.length}: ${clip.text}`);
    const audio = await tts.generate(clip.text, { voice: plan.voice, speed: plan.speed });
    const raw = `${clip.path}.raw.wav`;
    await audio.save(raw);
    const trimmed = spawnSync(
      'ffmpeg',
      [
        '-v',
        'error',
        '-y',
        '-i',
        raw,
        '-af',
        'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse',
        '-c:a',
        'pcm_s16le',
        clip.path,
      ],
      { windowsHide: true, encoding: 'utf8' },
    );
    if (trimmed.status !== 0) throw new Error(trimmed.stderr || 'Could not trim speech silence.');
    writeFileSync(`${clip.path}.sha256`, signatures[i]);
  }
  await tts.model.dispose();
}
