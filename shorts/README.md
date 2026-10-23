# Local Shorts

The Italian Game episode teaches `3.Bc4`: pressure on f7, space for castling, and the c3/d4 central plan. The Sicilian Defense episode teaches `1...c5`: control of d4, the Open Sicilian pawn exchange, and the semi-open c-file. Both end with a recall question and an invitation to practice in the app. The original episodes have English text and narration. The Italian episode also has a Turkish version with the same lesson sequence. Its second version rewrites the text as everyday Turkish and allows slightly longer scenes for a conversational voice.

Version 2 is 22.2 seconds (the first version was 36.5 seconds). It opens immediately with **One pawn. One defender.**, a quick camera move, and an animated f7 target in the first two seconds. The move animations and recall countdown are faster. Kokoro replaces the original Windows speech voice with local neural English speech (`af_heart`, speed 1.06).

The current Italian version 3 is 26.3 seconds and keeps that fast presentation with a full **three-second countdown after the spoken question finishes**. The Sicilian episode uses the same style and voice, lasts 30.4 seconds, and presents the board from Black's side. Its countdown is also exactly three seconds. The generator validates the interval and ensures the spoken question finishes before the clock starts.

All current episodes begin with a two-second animated **ChessMahal** introduction showing the opening, variation, and lesson moves. The opening and variation also remain in the header throughout the lesson: **Italian Game / Giuoco Piano** and **Sicilian Defense / Open Sicilian**. The Turkish version displays **İtalyan Açılışı / Giuoco Piano** and Turkish piece initials (`F` for bishop, `A` for knight); the app's canonical SAN and opening IDs remain unchanged. The introduction uses a locally synthesized sound sting and does not add spoken narration.

## Generate locally

One-time setup, with the project's Node dependencies installed:

```sh
pnpm --dir scripts/shorts/tts install
node scripts/shorts/tts/setup.mjs
```

Setup downloads the approximately 92.4 MB ONNX model plus its tokenizer/config files. The model revision and file hashes are recorded in `shorts/models/kokoro/download-manifest.json`. The model files and runtime dependencies remain on this computer. [Kokoro's official JavaScript documentation](https://github.com/hexgrad/kokoro/tree/main/kokoro.js) describes the local engine; the [ONNX model repository](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) supplies the weights.

Generate the current Italian episode:

```sh
node scripts/shorts/render.mjs
```

Generate the Sicilian episode:

```sh
node scripts/shorts/render.mjs --config shorts/sicilian-defense.json
```

The first Turkish version used the approximately 35 MB EMA Lightning ONNX model. It is retained for comparison and supplies a synthetic reference for the new voice:

```sh
node scripts/shorts/tts/setup-ema.mjs
node scripts/shorts/render.mjs --config shorts/italian-game-tr-v1.json
```

The original Turkish video is 26.3 seconds, with a two-second introduction and three-second recall countdown. Its stock synthetic voice is generated on the local CPU with EMA Lightning (speed 1.05). [EMA Lightning by Canberk Aslan](https://huggingface.co/canberkkkkkk/ema-lightning) and [Koray Orhun's ONNX export](https://huggingface.co/korhun/ema-lightning-onnx) publish the weights under Apache-2.0. The setup pins the export revision, retains LICENSE/NOTICE and records SHA-256 hashes. The scripted text spells chess coordinates out; `speechText` can supply pronunciation while captions retain the normal brand spelling.

### Conversational Turkish version

`italian-game-tr-v2.json` preserves the 30.9-second conversational second version. It uses inclusive, spoken Turkish such as “Fili buraya çıkaralım” and “Hadi sen dene. Fili nereye koyarsın?” instead of literal English slogans. The board shows the bishop's c4 destination explicitly; “c3 oynuyoruz” has separate pronunciation text for clarity. The lesson, two-second introduction, Giuoco Piano label, and full three-second thinking interval are preserved.

The voice is [Chatterbox Multilingual V3](https://github.com/resemble-ai/chatterbox), running on the local RTX 5070. The pinned model download is approximately 3.1 GB, plus the one-time Python/CUDA runtime installation. The reference voice is generated locally from the stock EMA voice; no person's recording is used. Narration blocks network connections and loads only downloaded files. The generated audio retains the model's PerTh watermark and an on-screen label identifies synthetic narration. See `scripts/shorts/tts/CHATTERBOX-NOTICE.md` for revisions and the Turkish-only tokenizer initialization adjustment.

One-time Windows setup with Python 3.12 installed (use your Python 3.12 executable instead of `py -3.12` if needed):

```powershell
py -3.12 -m venv --copies shorts/models/chatterbox-runtime
$voicePython = 'shorts/models/chatterbox-runtime/Scripts/python.exe'
& $voicePython -m pip install torch==2.7.1 torchaudio==2.7.1 --index-url https://download.pytorch.org/whl/cu128
& $voicePython -m pip install -r scripts/shorts/tts/requirements-chatterbox.txt
& $voicePython -m pip install --no-deps 'https://github.com/resemble-ai/chatterbox/archive/5de7a54aa4e5e2baadb0182dde554908b48b85c2.zip'
node scripts/shorts/tts/setup-chatterbox.mjs
```

Generate offline after setup (EMA setup above is needed once for the synthetic reference):

```sh
node scripts/shorts/tts/prepare-chatterbox-reference.mjs
node scripts/shorts/render.mjs --config shorts/italian-game-tr.json
```

`voiceSettings` records the reference, seed, temperature, CFG and exaggeration. Version 2 uses exaggeration 0.55, CFG 0.3 and temperature 0.75. Identical generated clips are cached independently from the earlier version.

`italian-game-tr-v3.json` preserves version 3 with the user's requested more flirtatious/playful delivery. The “40%” request is recorded as a creative direction, not a measured psychological or acoustic quantity. Exaggeration increases from 0.55 to 0.77 (40% relative); CFG is 0.28, with the same synthetic voice reference. A gentle local delivery pass sets tempo to 0.97, pitch to -0.35 semitones with formants preserved, body EQ at 180 Hz to +1.4 dB and an air shelf at 5.5 kHz to +1.6 dB. These settings aim at the requested effect; exaggeration is not a dedicated flirtation control. The output and cache use a separate `italian-game-tr-v3` prefix.

### Continuous Turkish narration, version 4

The current `italian-game-tr.json` produces a **32-second** fourth version in response to feedback about disconnected speech and artificial reactions. [VoxCPM2](https://huggingface.co/openbmb/VoxCPM2) designs a new synthetic Turkish narrator from a prose description. The explanation and recall question are generated together as one 20.6-second passage. A second passage continues from that generated audio and transcript to explain the answer and invite practice. No person's recording or earlier EMA reference is used.

Scene transitions follow word times from a local recognizer. The authored captions retain correct chess terminology and brand spelling; recognizer text is not published as the script. The question finishes at 22.662 seconds, the countdown runs from 22.8 to 25.8, and the answer begins at 25.9. The on-screen answer is descriptive, with no automatic praise or claim that the viewer answered correctly. Pitch/tempo/color processing from version 3 is absent; the voice keeps its generated phrasing, with edge silence trimming and final loudness mixing only.

One-time additional setup in the existing Python 3.12 / CUDA environment:

```powershell
$voicePython = 'shorts/models/chatterbox-runtime/Scripts/python.exe'
$env:SETUPTOOLS_SCM_PRETEND_VERSION_FOR_VOXCPM = '0.0.0+git.cce58a5'
& $voicePython -m pip install --no-deps 'https://github.com/OpenBMB/VoxCPM/archive/cce58a5b59303c9bd63d12f23afe6a49a4a80c59.zip'
& $voicePython -m pip install 'pydantic>=2,<3' addict argbind simplejson sortedcontainers
& $voicePython scripts/shorts/tts/setup-voxcpm.py --alignment
```

Generate the voice, align the timeline and render entirely locally:

```powershell
& $voicePython scripts/shorts/tts/narrate-voxcpm.py shorts/italian-game-tr-flow.json
& $voicePython scripts/shorts/tts/align-flow.py
node scripts/shorts/build-italian-tr-flow.mjs
node scripts/shorts/render.mjs --config shorts/italian-game-tr.json
```

`VOXCPM-NOTICE.md` records source and model revisions. The weights, hashes and Apache-2.0 license are retained locally. Generation and alignment block network connections, and the on-screen AI narration disclosure remains. The first two passages take two audio inputs even while spanning eight visual scenes; older configurations continue to use per-scene narration. `captions` can now carry separately timed authored subtitle cues.

Requires FFmpeg and FFprobe on PATH and local Edge/Chrome/Chromium. Override the browser location with `SHORTS_BROWSER_PATH` if necessary. After the one-time dependency/model downloads, production is offline: network access is disabled for neural narration and web requests are blocked in the frame renderer. No cloud speech API or remote rendering service is used. English and the first Turkish voice run on the CPU; the current Turkish voice runs on the GPU. Encoding and frame generation also run on this computer.

To generate just the narration and preview images:

```sh
node scripts/shorts/render.mjs --preview
```

The current content and scene timings are in `italian-game-v3.json` and `sicilian-defense.json`. The generator reuses the app's original SVG pieces and its authored Giuoco Piano/Classical Sicilian lesson data. The Sicilian episode stops at `4.Nxd4`, before a Classical-specific continuation, so its displayed variation is **Open Sicilian**. It validates the move order and instructional chess claims with chess.js before rendering. It checks that the narration fits every scene, verifies the final media format and frame count, and decodes the whole MP4 to catch encoding errors. Identical narration clips are cached locally; editing text, speed, or voice invalidates the clip cache.

The original MP4 remains available for comparison. To reproduce the original version with the Windows `Microsoft Zira Desktop` voice:

```sh
node scripts/shorts/render.mjs --config shorts/italian-game.json
```

## Output

- `output/italian-game-v3-short.mp4`: 1080 × 1920, 30 fps, 26.3 seconds, H.264/AAC.
- `output/sicilian-defense-short.mp4`: 1080 × 1920, 30 fps, 30.4 seconds, H.264/AAC.
- `output/italian-game-tr-short.mp4`: 1080 × 1920, 30 fps, 26.3 seconds, H.264/AAC, Turkish text and narration; `.tr.srt` / `.tr.vtt` subtitles.
- `output/italian-game-tr-v2-short.mp4`: 1080 × 1920, 30 fps, 30.9 seconds, H.264/AAC, conversational Turkish rewrite and local Chatterbox voice; `.tr.srt` / `.tr.vtt` subtitles.
- `output/italian-game-tr-v3-short.mp4`: same 30.9-second lesson with the more playful voice direction; `.tr.srt` / `.tr.vtt` subtitles.
- `output/italian-game-tr-v4-short.mp4`: 32 seconds, continuous VoxCPM2 explanation/question and answer continuation, with a three-second countdown and descriptive answer text.
- `output/italian-game-tr-v4-voice-preview.mp3`: first 12 seconds of the newly generated lesson narration.
- Each prefix also has a `.preview.html` player, `.en.srt` and `.en.vtt` captions, `.transcript.txt` narration script, `.poster.png` still, `.contact-sheet.png` overview, `-frames/` preview images, and a `.validation.json` check report.
- The earlier Italian MP4 versions remain available for comparison.

The English speech uses Kokoro's stock American English Heart voice; Turkish version 1 uses EMA Lightning, versions 2–3 use local Chatterbox, and version 4 uses a designed VoxCPM2 voice. Move sounds are synthesized from scratch. The board, pieces, fonts, and lesson text come from this project. Nothing is uploaded to YouTube by this command.
