import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const plan = read('shorts/italian-game-tr-flow.json');
const [lesson, answer] = read('shorts/output/italian-game-tr-v4.alignment.json');
if (lesson.expected !== plan.clips[0].text || answer.expected !== plan.clips[1].text)
  throw new Error('Align the current narration before rebuilding its timeline.');
function duration(path) {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(root, path)],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.status !== 0) throw new Error(result.stderr);
  return Number(result.stdout.trim());
}
const clean = (text) => text.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]/gu, '');
function anchor(section, prefix, occurrence = 0) {
  const matches = section.chunks.filter((word) => clean(word.text).startsWith(prefix));
  const time = matches[occurrence]?.timestamp?.[0];
  if (!Number.isFinite(time)) throw new Error(`Speech anchor not found: ${prefix}`);
  return time;
}
const tenth = (t) => Math.round(t * 10) / 10;
const ms = (t) => Math.round(t * 1000) / 1000;
const start = 2.06;
const marks = {
  develop: anchor(lesson, 'güzel'),
  pressure: anchor(lesson, 'hem', 1),
  castle: anchor(lesson, 'siyah'),
  center: anchor(lesson, 'ardından'),
  recall: anchor(lesson, 'peki'),
  practice: anchor(answer, 'açılış'),
};
const lessonEnd = start + duration(plan.clips[0].path);
const countdownStart = Math.ceil((lessonEnd + 0.12) * 10) / 10;
const revealAt = ms(countdownStart + 3);
const answerStart = ms(revealAt + 0.1);
const answerEnd = answerStart + duration(plan.clips[1].path);
const starts = [
  0,
  2,
  ...['develop', 'pressure', 'castle', 'center', 'recall'].map((key) =>
    tenth(start + marks[key] - 0.1),
  ),
  tenth(answerStart + marks.practice - 0.1),
];
const total = Math.ceil(answerEnd + 0.45);
if (starts.some((time, i) => i && time <= starts[i - 1]))
  throw new Error('The spoken scene anchors are out of order.');
const current = read('shorts/italian-game-tr.json');
if (
  current.id === 'italian-game-tr-v3' &&
  !existsSync(join(root, 'shorts/italian-game-tr-v3.json'))
)
  copyFileSync(
    join(root, 'shorts/italian-game-tr.json'),
    join(root, 'shorts/italian-game-tr-v3.json'),
  );
const config = read('shorts/italian-game-tr-v2.json');
Object.assign(config, {
  id: 'italian-game-tr-v4',
  outputStem: 'italian-game-tr-v4',
  speechEngine: 'voxcpm2',
  voice: plan.voice,
  voiceSettings: plan.voiceSettings,
  duration: total,
  title: 'Bu fil hamlesi ne işe yarıyor? | İtalyan Açılışı: Giuoco Piano',
  countdownStart,
  revealAt,
  questionSegmentId: 'lesson',
  answerHeading: ["Fil c4'e", 'geliyor.'],
  answerBody: 'Filimizi geliştirirken f7 piyonuna baskı kuruyoruz.',
  answerNoteLabel: 'CEVAP: 3. Fc4',
  answerNote: 'Hamlenin arkasındaki fikir bu.',
});
config.ui.answered = 'CEVAP';
config.ui.footer = 'FİKRİ ANLA, HAMLEYİ DENE.';
config.badges["THAT'S THE MOVE"] = '3. Fc4';
config.scenes.forEach((scene, i) => {
  scene.start = starts[i];
  scene.end = starts[i + 1] ?? total;
  for (const key of ['voice', 'speechText', 'voiceStart']) delete scene[key];
});
Object.assign(config.scenes[1], {
  heading: ['Bu fil hamlesi', 'ne işe yarıyor?'],
  body: "İtalyan Açılışı'nın arkasındaki fikre bakalım.",
});
Object.assign(config.scenes[2], {
  heading: ["Fili c4'e", 'geliştiriyoruz.'],
  body: 'Fil oyuna girerken f7 piyonuna da bakıyor.',
});
Object.assign(config.scenes[5], {
  heading: ['Merkezi', 'destekliyoruz.'],
  body: 'c3 ile ilerideki d4 sürüşüne hazırlanıyoruz.',
});
Object.assign(config.scenes[6], {
  eyebrow: 'BİR DÜŞÜN / HAMLE BEYAZDA',
  heading: ['Fili hangi', 'kareye çıkarmıştık?'],
  body: 'Tahtaya bakıp hamleyi hatırla.',
  noteLabel: 'SIRA SENDE',
});
Object.assign(config.scenes[7], {
  eyebrow: 'AÇILIŞIN DEVAMI',
  heading: ['Devamını', 'kendin dene.'],
  body: "Bu varyantı ChessMahal'da oynayabilirsin.",
  noteLabel: 'CHESSMAHAL',
  note: 'Açılışı oynayarak öğren.',
});
config.narration = [
  { id: 'lesson', start, voiceStart: start, end: countdownStart, voice: plan.clips[0].text },
  {
    id: 'answer',
    start: answerStart,
    voiceStart: answerStart,
    end: total,
    voice: "Filimiz c4'e geliyor. Açılışın devamını ChessMahal'da kendin de deneyebilirsin.",
    speechText: plan.clips[1].text,
  },
];
const cue = (a, b, text) => ({ start: ms(a), end: ms(b), text });
config.captions = [
  cue(start, start + marks.develop, "İtalyan Açılışı'nda bu fil hamlesini çok görürüz."),
  cue(
    start + marks.develop,
    start + marks.pressure,
    'Güzel tarafı şu: hem taşımızı geliştiriyoruz',
  ),
  cue(
    start + marks.pressure,
    start + marks.castle,
    'hem de sadece şahın koruduğu piyona baskı yapıyoruz.',
  ),
  cue(
    start + marks.castle,
    start + marks.center,
    'Siyah da filini çıkardığında rok yolumuz açılıyor.',
  ),
  cue(
    start + marks.center,
    start + marks.recall,
    'Ardından bu piyon hamlesiyle merkezi destekliyoruz.',
  ),
  cue(start + marks.recall, lessonEnd, 'Peki, fili hangi kareye çıkarmıştık?'),
  cue(answerStart, answerStart + marks.practice, "Filimiz c4'e geliyor."),
  cue(
    answerStart + marks.practice,
    answerEnd,
    "Açılışın devamını ChessMahal'da kendin de deneyebilirsin.",
  ),
];
config.effectEvents = [
  [0.12, 261.63, 0.05],
  [0.28, 329.63, 0.045],
  [0.46, 392, 0.04],
  [1.82, 880, 0.02],
  [ms(starts[2] + 0.2), 240, 0.08],
  [ms(starts[4] + 0.5), 205, 0.08],
  [ms(starts[5] + 0.5), 240, 0.08],
  ...[0, 1, 2].map((offset) => [ms(countdownStart + offset), 680, 0.025]),
  [ms(revealAt + 0.1), 310, 0.07],
];
config.previewTimes = config.scenes.map((scene) =>
  scene.id === 'recall' ? countdownStart + 1.2 : ms((scene.start + scene.end) / 2),
);
writeFileSync(join(root, 'shorts/italian-game-tr.json'), JSON.stringify(config, null, 2) + '\n');
console.log(
  JSON.stringify({
    duration: total,
    lessonEnd,
    questionStarts: start + marks.recall,
    countdownStart,
    revealAt,
    answerStart,
    answerEnd,
    sceneStarts: starts,
  }),
);
