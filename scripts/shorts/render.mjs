import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { Chess } from 'chess.js';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const projectRequire = createRequire(join(root, 'package.json'));
const configFlag = process.argv.indexOf('--config');
const configPath = configFlag >= 0 ? process.argv[configFlag + 1] : 'shorts/italian-game-v3.json';
if (!configPath || configPath.startsWith('--')) throw new Error('--config needs a JSON path.');
const config = JSON.parse(readFileSync(resolve(root, configPath), 'utf8'));
const language = config.language || 'en';
if (!['en', 'tr'].includes(language)) throw new Error('Unsupported narration language.');
const isTurkish = language === 'tr';
const languageLabel = isTurkish ? 'Türkçe' : 'English';
const stem = config.outputStem || 'italian-game';
if (!/^[a-z0-9-]+$/.test(stem)) throw new Error('Invalid output name.');
const videoName = `${stem}-short.mp4`;
const out = join(root, 'shorts/output');
const cache = join(out, '.cache', stem);
const previewOnly = process.argv.includes('--preview');
config.scenes.forEach((scene, i) => {
  if (scene.start !== (i === 0 ? 0 : config.scenes[i - 1].end) || scene.end <= scene.start)
    throw new Error(`Invalid scene boundary: ${scene.id}`);
  if (scene.voice && (scene.voiceStart < scene.start || scene.voiceStart >= scene.end))
    throw new Error(`Invalid narration start: ${scene.id}`);
});
if (config.scenes.at(-1).end !== config.duration || !Number.isInteger(config.duration * config.fps))
  throw new Error('The scene timeline must cover an exact whole number of frames.');
if (config.answerWaitSeconds !== undefined) {
  const recall = config.scenes.find((scene) => scene.id === 'recall');
  if (
    !recall ||
    config.countdownStart < recall.start ||
    config.revealAt >= recall.end ||
    Math.abs(config.revealAt - config.countdownStart - config.answerWaitSeconds) > 1e-6
  )
    throw new Error('The recall countdown does not match the requested waiting time.');
}
mkdirSync(cache, { recursive: true });
mkdirSync(join(out, `${stem}-frames`), { recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error || result.status !== 0)
    throw new Error(`${command}: ${result.error?.message || result.stderr || result.stdout}`);
  return result.stdout.trim();
}
function probe(path) {
  return JSON.parse(
    run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path]),
  );
}

// Read the same authored content and original SVG pieces as the learning app.
// A small in-memory TS loader avoids altering the app or adding dependencies.
const moduleCache = new Map();
function projectModule(filename) {
  const path = resolve(root, filename);
  if (moduleCache.has(path)) return moduleCache.get(path).exports;
  const module = { exports: {} };
  moduleCache.set(path, module);
  const code = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
    },
  }).outputText;
  const localRequire = (specifier) => {
    if (!specifier.startsWith('.')) return projectRequire(specifier);
    const base = resolve(dirname(path), specifier);
    const found = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => existsSync(candidate));
    if (!found) throw new Error(`Cannot find project module: ${specifier}`);
    return projectModule(found);
  };
  new Function('React', 'require', 'module', 'exports', code)(
    React,
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}
const { openings } = projectModule('src/domain/openings.ts');
const opening = openings.find((item) => item.id === (config.openingId || 'italian-game'));
const variation = opening?.variations.find((line) => line.id === config.variationId);
if (!variation) throw new Error('Opening variation was not found in the app.');
const isSicilian = opening.id === 'sicilian-defense';
const displayVariation = config.displayVariation || variation.name;
if (isSicilian && config.displayVariation && config.displayVariation !== 'Open Sicilian')
  throw new Error('This episode stops at 4.Nxd4 and must be labeled Open Sicilian.');
if (!isSicilian && config.displayVariation && config.displayVariation !== variation.name)
  throw new Error('The displayed Italian variation must match the authored line.');
const { ChessPiece } = projectModule('src/components/ChessPiece.tsx');
const pieceSvgs = {};
for (const color of ['w', 'b'])
  for (const type of ['p', 'n', 'b', 'r', 'q', 'k']) {
    pieceSvgs[color + type] = renderToStaticMarkup(
      React.createElement(ChessPiece, { color, type }),
    ).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" ');
  }
function positionAfter(ply) {
  const chess = new Chess();
  variation.moves.slice(0, ply).forEach((m) => chess.move(m.san, { strict: true }));
  return {
    ply,
    fen: chess.fen(),
    pieces: chess
      .board()
      .flat()
      .filter(Boolean)
      .map((p) => ({ square: p.square, key: p.color + p.type })),
  };
}
const positions = (isSicilian ? [1, 2, 3, 4, 5, 6, 7] : [4, 5, 6, 7]).map(positionAfter);
const expected = isSicilian
  ? ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4']
  : ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'];
if (expected.some((san, i) => variation.moves[i]?.san !== san))
  throw new Error('The video and authored opening line have diverged.');
// Verify the instructional claims, rather than just the displayed move order.
let chessClaimsVerified;
if (isSicilian) {
  const reply = new Chess(positions[0].fen);
  if (reply.turn() !== 'b' || reply.move('c5', { strict: true }).from !== 'c7')
    throw new Error('The Sicilian recall position or answer is incorrect.');
  const pressure = new Chess(positions[1].fen);
  if (!pressure.attackers('d4', 'b').includes('c5'))
    throw new Error('The c5 pawn must control d4.');
  const trade = new Chess(positions[4].fen).move('cxd4', { strict: true });
  if (trade.from !== 'c5' || trade.to !== 'd4' || trade.captured !== 'p')
    throw new Error('The central pawn exchange is incorrect.');
  const after = new Chess(positions[6].fen);
  if (
    after.get('d4')?.type !== 'n' ||
    after.get('d4')?.color !== 'w' ||
    after.get('c2')?.color !== 'w' ||
    '12345678'
      .split('')
      .some(
        (rank) => after.get(`c${rank}`)?.color === 'b' && after.get(`c${rank}`)?.type === 'p',
      ) ||
    after.get('d6')?.color !== 'b' ||
    after.get('e7')?.color !== 'b'
  )
    throw new Error('The semi-open c-file or retained Black central pawns need review.');
  chessClaimsVerified = [
    'legal opening moves',
    '1...c5 is legal after 1.e4',
    'c5 controls d4',
    "cxd4 trades the c-pawn for White's d-pawn",
    'Nxd4 leaves a semi-open c-file for Black',
    'Black retains the d- and e-pawns',
  ];
} else {
  const pressure = new Chess(positions[1].fen);
  if (
    pressure.attackers('f7', 'w').join() !== 'c4' ||
    pressure.attackers('f7', 'b').join() !== 'e8'
  )
    throw new Error('The f7 attacker/defender claim needs review.');
  const castle = new Chess(positions[2].fen);
  if (!castle.moves().includes('O-O') || castle.get('f1') || castle.get('g1'))
    throw new Error('Castling illustration is not legal.');
  const center = new Chess(positions[3].fen);
  if (!center.attackers('d4', 'w').includes('c3'))
    throw new Error('The c3 support of d4 was not verified.');
  chessClaimsVerified = [
    'legal opening moves',
    'Bc4 attacks f7',
    'only the king defends f7',
    'O-O is legal after Bc5',
    'c3 supports d4',
  ];
}

const fonts = [];
for (const weight of [400, 500, 700]) {
  const dir = dirname(projectRequire.resolve('@fontsource/dm-sans/package.json'));
  for (const subset of isTurkish ? ['latin', 'latin-ext'] : ['latin'])
    fonts.push({
      family: 'DM Sans',
      weight,
      base64: readFileSync(join(dir, `files/dm-sans-${subset}-${weight}-normal.woff2`)).toString(
        'base64',
      ),
    });
}
const serifDir = dirname(projectRequire.resolve('@fontsource/dm-serif-display/package.json'));
for (const subset of isTurkish ? ['latin', 'latin-ext'] : ['latin'])
  fonts.push({
    family: 'DM Serif Display',
    weight: 400,
    base64: readFileSync(
      join(serifDir, `files/dm-serif-display-${subset}-400-normal.woff2`),
    ).toString('base64'),
  });

const narratedScenes = config.narration || config.scenes.filter((scene) => scene.voice);
const clips = narratedScenes.map((scene) => ({
  text: scene.speechText || scene.voice,
  path: join(cache, `${scene.id}.wav`),
}));
const speechPlan = join(cache, 'speech-plan.json');
writeFileSync(
  speechPlan,
  JSON.stringify(
    { voice: config.voice, rate: config.voiceRate, voiceSettings: config.voiceSettings, clips },
    null,
    2,
  ),
);
console.log(`Generating local ${languageLabel} narration...`);
if (config.speechEngine === 'kokoro') {
  const { narrateLocally } = await import('./tts/narrate.mjs');
  await narrateLocally({ voice: config.voice, speed: config.voiceSpeed || 1, clips });
} else if (config.speechEngine === 'ema') {
  const { narrateTurkishLocally } = await import('./tts/narrate-ema.mjs');
  await narrateTurkishLocally({ speed: config.voiceSpeed || 1, clips });
} else if (config.speechEngine === 'chatterbox') {
  console.log(
    run(join(root, 'shorts/models/chatterbox-runtime/Scripts/python.exe'), [
      '-X',
      'utf8',
      '-u',
      join(root, 'scripts/shorts/tts/narrate-chatterbox.py'),
      speechPlan,
    ]),
  );
} else if (config.speechEngine === 'voxcpm2') {
  console.log(
    run(join(root, 'shorts/models/chatterbox-runtime/Scripts/python.exe'), [
      '-X',
      'utf8',
      '-u',
      join(root, 'scripts/shorts/tts/narrate-voxcpm.py'),
      speechPlan,
    ]),
  );
} else {
  const narrationSource = readFileSync(join(root, 'scripts/shorts/narrate.ps1'), 'utf8');
  const narrationCommand = `& {\n${narrationSource}\n} -PlanPath '${speechPlan.replaceAll("'", "''")}'`;
  run('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-EncodedCommand',
    Buffer.from(narrationCommand, 'utf16le').toString('base64'),
  ]);
}
const voiceDurations = clips.map((clip) => Number(probe(clip.path).format.duration));
narratedScenes.forEach((scene, i) => {
  if (scene.voiceStart + voiceDurations[i] > scene.end - 0.08) {
    throw new Error(
      `Narration exceeds scene ${scene.id}: ${voiceDurations[i].toFixed(2)}s. Shorten it or adjust the voice rate/timeline.`,
    );
  }
});
if (config.answerWaitSeconds !== undefined) {
  const i = narratedScenes.findIndex(
    (scene) => scene.id === (config.questionSegmentId || 'recall'),
  );
  if (i < 0) throw new Error('The narration must identify the spoken recall question.');
  if (narratedScenes[i].voiceStart + voiceDurations[i] > config.countdownStart - 0.08)
    throw new Error('The question must finish before the full thinking countdown begins.');
}
console.log('Narration fits all scenes:', voiceDurations.map((s) => `${s.toFixed(2)}s`).join(', '));

// Original, synthesized move sounds. No sampled music or third-party audio.
const effectEvents = config.effectEvents || [
  [5.3, 240, 0.16],
  [14.85, 205, 0.16],
  [20.5, 240, 0.16],
  [26.8, 680, 0.05],
  [27.8, 680, 0.05],
  [28.8, 680, 0.05],
  [30.4, 310, 0.16],
];
const rate = 48000,
  samples = Math.ceil(config.duration * rate);
const pcm = Buffer.alloc(samples * 2);
for (const [time, frequency, volume] of effectEvents) {
  const start = Math.floor(time * rate),
    length = Math.floor(0.16 * rate);
  for (let n = 0; n < length && start + n < samples; n++) {
    const t = n / rate,
      envelope = Math.exp(-t * 38) * Math.min(1, n / 35);
    const wave =
      Math.sin(2 * Math.PI * frequency * t) * 0.8 +
      Math.sin(2 * Math.PI * frequency * 2.07 * t) * 0.2;
    const offset = (start + n) * 2;
    const value = pcm.readInt16LE(offset) + Math.round(wave * envelope * volume * 32767);
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, value)), offset);
  }
}
const wav = Buffer.alloc(44);
wav.write('RIFF');
wav.writeUInt32LE(36 + pcm.length, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(pcm.length, 40);
const effectsPath = join(cache, 'move-sounds.wav');
writeFileSync(effectsPath, Buffer.concat([wav, pcm]));
const audioArgs = clips.flatMap((clip) => ['-i', clip.path]);
audioArgs.push('-i', effectsPath);
const filters = narratedScenes.map(
  (scene, i) =>
    `[${i}:a]aresample=48000,adelay=${Math.round(scene.voiceStart * 1000)}:all=1[v${i}]`,
);
filters.push(
  `${narratedScenes.map((_, i) => `[v${i}]`).join('')}[${clips.length}:a]amix=inputs=${clips.length + 1}:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[audio]`,
);
const audioPath = join(cache, 'narration-mix.wav');
run('ffmpeg', [
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  ...audioArgs,
  '-filter_complex',
  filters.join(';'),
  '-map',
  '[audio]',
  '-t',
  String(config.duration),
  '-ar',
  '48000',
  '-c:a',
  'pcm_s16le',
  audioPath,
]);

function timestamp(t, separator = ',') {
  const ms = Math.round(t * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}${separator}${String(ms % 1000).padStart(3, '0')}`;
}
const subtitleCues =
  config.captions ||
  narratedScenes.map((scene, i) => ({
    start: scene.voiceStart,
    end: scene.voiceStart + voiceDurations[i],
    text: scene.voice,
  }));
subtitleCues.forEach((cue, i) => {
  if (
    cue.start < 0 ||
    cue.end <= cue.start ||
    cue.end > config.duration ||
    (i > 0 && cue.start < subtitleCues[i - 1].end - 0.001)
  )
    throw new Error('Caption cue timing is invalid.');
});
const subtitles = subtitleCues
  .map((cue, i) => `${i + 1}\n${timestamp(cue.start)} --> ${timestamp(cue.end)}\n${cue.text}\n`)
  .join('\n');
writeFileSync(join(out, `${stem}.${language}.srt`), subtitles);
writeFileSync(
  join(out, `${stem}.${language}.vtt`),
  `WEBVTT\n\n${subtitles.replaceAll(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')}`,
);
writeFileSync(
  join(out, `${stem}.transcript.txt`),
  narratedScenes.map((scene) => scene.voice).join('\n\n'),
);

const candidates = [
  process.env.SHORTS_BROWSER_PATH,
  chromium.executablePath(),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);
const executablePath = candidates.find(existsSync);
if (!executablePath)
  throw new Error('Set SHORTS_BROWSER_PATH to a local Chromium, Chrome, or Edge executable.');
const browser = await chromium.launch({ executablePath, headless: true });
let encoder;
try {
  const page = await browser.newPage({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Everything is embedded locally. Block network requests as a guard against accidental dependencies.
  await page.route(/^https?:/, (route) => route.abort());
  await page.setContent(
    `<html><body style="margin:0"><canvas width="${config.width}" height="${config.height}"></canvas></body></html>`,
  );
  await page.addScriptTag({ path: join(root, 'scripts/shorts/scene.js') });
  await page.evaluate(async (input) => window.initShorts(input), {
    config,
    positions,
    fonts,
    pieceSvgs,
    opening: {
      name: config.displayOpening || opening.name,
      variation: displayVariation,
      side: opening.side,
    },
  });

  const previewTimes = config.previewTimes || [1.2, 6, 10.8, 16.8, 22.8, 28.1, 30.6, 33.5];
  const previewFrames = [];
  for (let i = 0; i < previewTimes.length; i++) {
    const base64 = await page.evaluate((t) => window.renderShortsFrame(t, true), previewTimes[i]);
    previewFrames.push(base64);
    writeFileSync(
      join(out, `${stem}-frames`, `${String(i + 1).padStart(2, '0')}.png`),
      Buffer.from(base64, 'base64'),
    );
  }
  writeFileSync(
    join(out, `${stem}.poster.png`),
    Buffer.from(previewFrames[config.posterFrameIndex ?? 1], 'base64'),
  );
  const contact = await page.evaluate(async (frames) => {
    const sheet = document.createElement('canvas');
    sheet.width = 1080;
    sheet.height = 960;
    const c = sheet.getContext('2d');
    for (let i = 0; i < frames.length; i++) {
      const img = new Image();
      img.src = `data:image/png;base64,${frames[i]}`;
      await img.decode();
      c.drawImage(img, (i % 4) * 270, Math.floor(i / 4) * 480, 270, 480);
    }
    return sheet.toDataURL('image/png').split(',')[1];
  }, previewFrames);
  writeFileSync(join(out, `${stem}.contact-sheet.png`), Buffer.from(contact, 'base64'));
  console.log('Preview frames ready.');

  if (!previewOnly) {
    const videoPath = join(out, videoName);
    encoder = spawn(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-f',
        'image2pipe',
        '-framerate',
        String(config.fps),
        '-vcodec',
        'mjpeg',
        '-i',
        'pipe:0',
        '-i',
        audioPath,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-vf',
        'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '18',
        '-pix_fmt',
        'yuv420p',
        '-color_range',
        'tv',
        '-colorspace',
        'bt709',
        '-color_primaries',
        'bt709',
        '-color_trc',
        'bt709',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-ar',
        '48000',
        '-movflags',
        '+faststart',
        '-metadata',
        `title=${config.title}`,
        '-metadata:s:a:0',
        `language=${isTurkish ? 'tur' : 'eng'}`,
        '-t',
        String(config.duration),
        videoPath,
      ],
      { cwd: root, windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] },
    );
    let encoderErrors = '';
    encoder.stderr.on('data', (chunk) => {
      encoderErrors += chunk.toString();
    });
    const done = new Promise((resolveDone, rejectDone) => {
      encoder.on('error', rejectDone);
      encoder.on('close', (code) =>
        code === 0
          ? resolveDone()
          : rejectDone(new Error(encoderErrors || `FFmpeg exited ${code}`)),
      );
    });
    // Attach immediately so an encoder failure never becomes an unhandled rejection.
    done.catch(() => {});
    encoder.stdin.on('error', () => {});
    const count = Math.round(config.duration * config.fps);
    for (let i = 0; i < count; i++) {
      if (encoder.exitCode !== null) throw new Error(encoderErrors || 'The video encoder stopped.');
      const base64 = await page.evaluate((t) => window.renderShortsFrame(t), i / config.fps);
      if (!encoder.stdin.write(Buffer.from(base64, 'base64'))) await once(encoder.stdin, 'drain');
      if (i % (config.fps * 3) === 0)
        console.log(`Rendered ${(i / config.fps).toFixed(0)} / ${config.duration}s`);
    }
    encoder.stdin.end();
    await done;
    const media = probe(videoPath);
    const video = media.streams.find((stream) => stream.codec_type === 'video');
    const audio = media.streams.find((stream) => stream.codec_type === 'audio');
    if (video.width !== 1080 || video.height !== 1920 || video.pix_fmt !== 'yuv420p' || !audio)
      throw new Error('Output format validation failed.');
    if (
      Number(video.nb_frames) !== count ||
      Math.abs(Number(media.format.duration) - config.duration) > 0.1
    )
      throw new Error('Output timing validation failed.');
    run('ffmpeg', ['-v', 'error', '-i', videoPath, '-f', 'null', '-']);
    writeFileSync(
      join(out, `${stem}.validation.json`),
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          title: config.title,
          localOnly: true,
          speechEngine: config.speechEngine || 'windows-sapi',
          voice: config.voice,
          voiceSpeed: config.voiceSpeed,
          narrationNetworkBlocked: ['kokoro', 'ema', 'chatterbox', 'voxcpm2'].includes(
            config.speechEngine,
          ),
          voiceSettings: config.voiceSettings,
          language,
          chessClaimsVerified,
          opening: opening.name,
          variation: displayVariation,
          sourceVariation: variation.name,
          brandName: config.brandName,
          introDuration: config.introDuration || 0,
          boardFlipped: !!config.boardFlipped,
          answerWaitSeconds: config.answerWaitSeconds,
          countdownStart: config.countdownStart,
          revealAt: config.revealAt,
          voiceDurations,
          narration: narratedScenes.map((scene, i) => ({
            scene: scene.id,
            start: scene.voiceStart,
            duration: voiceDurations[i],
            end: scene.voiceStart + voiceDurations[i],
          })),
          browserErrors: errors,
          media,
        },
        null,
        2,
      ),
    );
    console.log(`Video complete: ${videoPath}`);
  }
  if (errors.length) throw new Error(`Browser rendering errors: ${errors.join('; ')}`);
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
}

writeFileSync(
  join(out, `${stem}.preview.html`),
  `<!doctype html><html lang="${language}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${config.title}</title><style>body{margin:0;background:#102b26;color:#f4efdf;font:16px system-ui;display:grid;justify-items:center;padding:24px}video{width:min(100%,432px);max-height:85vh;border-radius:16px}p{max-width:432px;line-height:1.5}a{color:#efbd78}</style><video controls playsinline preload="metadata" poster="${stem}.poster.png" src="${videoName}"><track kind="captions" src="${stem}.${language}.vtt" srclang="${language}" label="${languageLabel}"></video><p>${config.title}<br>${isTurkish ? 'Yerel üretim · Türkçe metin ve yapay zekâ seslendirmesi.' : 'Local production · English narration and on-screen text.'}</p><p><a href="${videoName}" download>${isTurkish ? 'MP4 indir' : 'Download MP4'}</a> · <a href="${stem}.${language}.srt" download>${languageLabel} ${isTurkish ? 'altyazı' : 'subtitles'}</a></p></html>`,
);
