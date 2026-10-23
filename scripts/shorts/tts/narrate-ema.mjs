import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// EMA Lightning by Canberk Aslan; ONNX export and frame-plan reference by Koray Orhun.
// Apache-2.0 license and notices are retained beside the pinned local model.
// https://github.com/korayorhun/ema-lightning-dotnet
const require = createRequire(import.meta.url);
const transformerRequire = createRequire(require.resolve('@huggingface/transformers'));
const ort = transformerRequire('onnxruntime-node');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const directory = join(root, 'shorts/models/ema-lightning');
const tensor = (type, values, dims) => new ort.Tensor(type, values, dims);
const int64 = (values, dims) => tensor('int64', BigInt64Array.from(values, BigInt), dims);
const mask = (length) => tensor('bool', new Uint8Array(length).fill(1), [1, length]);

function roundEven(value) {
  const floor = Math.floor(value);
  return value - floor === 0.5 ? floor + (floor % 2) : Math.round(value);
}
function gaussian(length, seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let n = Math.imul(state ^ (state >>> 15), state | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
  const noise = new Float32Array(length);
  for (let i = 0; i < length; i += 2) {
    const magnitude = Math.sqrt(-2 * Math.log(1 - random()));
    const phase = 2 * Math.PI * random();
    noise[i] = magnitude * Math.cos(phase);
    if (i + 1 < length) noise[i + 1] = magnitude * Math.sin(phase);
  }
  return noise;
}
function writeWav(path, audio, sampleRate) {
  const header = Buffer.alloc(44);
  const pcm = Buffer.alloc(audio.length * 2);
  audio.forEach((sample, i) => {
    if (!Number.isFinite(sample)) throw new Error('Non-finite Turkish speech sample.');
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), i * 2);
  });
  header.write('RIFF');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  writeFileSync(path, Buffer.concat([header, pcm]));
}

export async function narrateTurkishLocally(plan) {
  const manifestPath = join(directory, 'download-manifest.json');
  if (!existsSync(manifestPath)) throw new Error('Run node scripts/shorts/tts/setup-ema.mjs once.');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const file of manifest.files) {
    const actual = createHash('sha256')
      .update(readFileSync(join(directory, file.name)))
      .digest('hex');
    if (actual !== file.sha256)
      throw new Error(`Local Turkish model checksum differs: ${file.name}`);
  }
  const config = JSON.parse(readFileSync(join(directory, 'model-config.json'), 'utf8'));
  const vocab = JSON.parse(readFileSync(join(directory, 'vocab.json'), 'utf8'));
  const alphabet = new Map(vocab.map((value, i) => [value, i]));
  const signatures = plan.clips.map((clip) =>
    createHash('sha256')
      .update(
        JSON.stringify({
          text: clip.text,
          speed: plan.speed,
          seed: 7,
          revision: manifest.revision,
          frontend: 1,
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
  globalThis.fetch = async () => {
    throw new Error('Network is disabled during local Turkish narration.');
  };
  if (cached.every(Boolean)) {
    console.log('Using cached local Turkish narration.');
    return;
  }
  const sessions = [];
  try {
    console.log('Loading Turkish EMA Lightning on the local CPU...');
    for (const file of ['text.onnx', 'sound.onnx', 'decoder.onnx'])
      sessions.push(
        await ort.InferenceSession.create(join(directory, file), {
          executionProviders: ['cpu'],
          intraOpNumThreads: 4,
          interOpNumThreads: 1,
        }),
      );
    const [text, sound, decoder] = sessions;
    for (let i = 0; i < plan.clips.length; i++) {
      if (cached[i]) continue;
      const clip = plan.clips[i];
      // Narration is deliberately written out in Turkish, including chess coordinates and numbers.
      // Fail on unsupported symbols rather than silently dropping part of a sentence.
      const spoken = clip.text
        .replaceAll('’', "'")
        .toLocaleLowerCase('tr-TR')
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .trim();
      if (!spoken || [...spoken].some((letter) => !alphabet.has(letter)))
        throw new Error(`Write every Turkish speech token out: ${clip.text}`);
      console.log(`Synthesizing Turkish ${i + 1}/${plan.clips.length}: ${clip.text}`);
      const length = spoken.length;
      const ids = [...spoken].map((letter) => alphabet.get(letter));
      const bounds = [0];
      for (let letter = 1; letter < length; letter++)
        if (spoken[letter] !== ' ' && spoken[letter - 1] === ' ') bounds.push(letter);
      bounds.push(length);
      const cw = new Array(length),
        wstart = new Array(length);
      for (let word = 0; word < bounds.length - 1; word++)
        for (let letter = bounds[word]; letter < bounds[word + 1]; letter++) {
          cw[letter] = word;
          wstart[letter] = bounds[word];
        }
      const encoded = await text.run({ ids: int64(ids, [1, length]), mask: mask(length) });
      const durations = Float32Array.from(encoded.dur.data, (duration) => duration / plan.speed);
      const totals = new Float32Array(bounds.length - 1);
      durations.forEach((duration, letter) => {
        totals[cw[letter]] += duration;
      });
      const counts = [...totals].map((total) =>
        Math.max(1, Math.min(config.max_word_frames, roundEven(total))),
      );
      const frames = counts.reduce((sum, value) => sum + value, 0);
      if (frames > config.max_frames)
        throw new Error('Turkish narration is too long; split the scene.');
      const fw = [],
        fp = new Float32Array(frames);
      for (let word = 0; word < counts.length; word++)
        for (let frame = 0; frame < counts[word]; frame++) {
          fp[fw.length] = frame / counts[word];
          fw.push(word);
        }
      const generated = await sound.run({
        h: encoded.h,
        dur: tensor('float32', durations, [1, length]),
        mask: mask(length),
        cw: int64(cw, [1, length]),
        wstart: int64(wstart, [1, length]),
        fw: int64(fw, [1, frames]),
        fp: tensor('float32', fp, [1, frames]),
        fmask: mask(frames),
        noise: tensor('float32', gaussian(config.times.length * frames * config.latent_dim, 7), [
          1,
          config.times.length,
          frames,
          config.latent_dim,
        ]),
      });
      const latents = Object.values(generated)[0].data;
      const z = new Float32Array(frames * config.latent_dim);
      for (let frame = 0; frame < frames; frame++)
        for (let channel = 0; channel < config.latent_dim; channel++)
          z[channel * frames + frame] = latents[frame * config.latent_dim + channel];
      const decoded = await decoder.run({
        z: tensor('float32', z, [1, config.latent_dim, frames]),
      });
      const rawPath = `${clip.path}.raw.wav`;
      writeWav(rawPath, Object.values(decoded)[0].data, config.sample_rate);
      const trimmed = spawnSync(
        'ffmpeg',
        [
          '-v',
          'error',
          '-y',
          '-i',
          rawPath,
          '-af',
          'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse',
          '-c:a',
          'pcm_s16le',
          clip.path,
        ],
        { windowsHide: true, encoding: 'utf8' },
      );
      if (trimmed.status !== 0)
        throw new Error(trimmed.stderr || 'Could not trim Turkish narration.');
      writeFileSync(`${clip.path}.sha256`, signatures[i]);
    }
  } finally {
    for (const session of sessions) await session.release();
  }
}
