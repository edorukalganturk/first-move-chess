# Continuous Turkish narration

VoxCPM2: Copyright 2026 OpenBMB, Apache-2.0. https://github.com/OpenBMB/VoxCPM

- Source revision: `cce58a5b59303c9bd63d12f23afe6a49a4a80c59`.
- Model: https://huggingface.co/openbmb/VoxCPM2, revision `32279effe8c19989596f05d353d1447f51d9e915`.
- Voice is created from a text description. No real person's recording, external speech API or earlier EMA voice is used.
- The answer continues from the newly generated lesson audio and its transcript, preserving the same synthetic speaker and conversational context.
- `narrate-voxcpm.py` loads pinned local files, verifies their hashes, and blocks network connections during generation. Text normalization, denoising and compilation are disabled for this Windows runtime. The required stock 48 kHz output is used directly, with only edge silence trimming and the existing final loudness mix.
- Runtime uses the existing isolated Python 3.12 / CUDA 12.8 environment. Only the core inference dependencies are installed; unused UI, denoising, training, and external normalization packages are omitted.

Version 4 changes the production structure: the explanation and question are generated together, and the answer is a continuation. Visual scenes follow locally aligned word times. The full three-second recall interval remains explicit. Captions keep the authored text, rather than substituting recognizer spelling. The recognizer's output checks words and timing; it does not establish subjective naturalness.

The archived “40%” direction in version 3 was a creative interpretation and did not establish a measured change in flirtation. Version 4 responds to the user's complaint about fluency and artificial reactions by removing the effect pass and scripted praise.
