# Turkish local narration

`narrate-ema.mjs` adapts the documented EMA Lightning ONNX frame plan to JavaScript.

- EMA Lightning: Copyright Canberk Aslan, Apache-2.0. https://huggingface.co/canberkkkkkk/ema-lightning
- ONNX export and reference runtime: Copyright 2026 Koray Orhun, Apache-2.0. https://github.com/korayorhun/ema-lightning-dotnet
- ONNX Runtime: Copyright Microsoft Corporation, MIT; supplied by the existing Transformers.js dependency.

The model download retains the upstream `LICENSE`, `NOTICE`, and model card under `shorts/models/ema-lightning/`. Its revision and file hashes are recorded in `download-manifest.json`. The model's original voice was synthesized by its author; the renderer does not clone a person's voice. The Turkish episode labels its narration as AI-generated.

This small scripted frontend expects numbers and coordinates written out; it does not include or claim the full normalizer-tr implementation. `speechText` is pronunciation text, and `voice` remains the subtitle text.
