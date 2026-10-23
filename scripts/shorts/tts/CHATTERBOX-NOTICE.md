# Local conversational Turkish voice

- Chatterbox Multilingual V3: Copyright Resemble AI, MIT. https://github.com/resemble-ai/chatterbox
- Source revision: `5de7a54aa4e5e2baadb0182dde554908b48b85c2`.
- Model revision: `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` of https://huggingface.co/ResembleAI/chatterbox.
- Local runtime: Python 3.12, PyTorch / torchaudio 2.7.1 with CUDA 12.8, isolated under `shorts/models/chatterbox-runtime/`.
- The voice reference is generated with the existing local stock EMA Lightning voice, whose Apache-2.0 attribution is in `EMA-NOTICE.md`. It is not a recording of a real person.

The model's MIT license and model card are saved beside the downloaded weights. `download-manifest.json` records file hashes; narration verifies them before inference, requires local files and blocks network connections. The upstream tokenizer eagerly initializes an unrelated Chinese segmenter; the Turkish-only runner skips that initialization and reads the already downloaded Cangjie map locally. Turkish tokenization and the model weights are unchanged. The generated audio retains Chatterbox's built-in PerTh watermark.

The source package is installed with `--no-deps` after explicitly installing the narration dependencies in `requirements-chatterbox.txt`. This profile uses the 2.7.1 CUDA runtime for the local RTX 5070 rather than the source package's generic torch 2.6 pin, and does not install the unused Gradio UI. It has been verified by producing the episode locally.

The on-screen disclosure identifies the synthetic narration. Whisper is used only as an optional local pronunciation check; its recognizer output does not measure warmth or guarantee human judgments of naturalness.
