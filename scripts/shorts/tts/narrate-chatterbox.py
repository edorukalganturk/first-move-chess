"""Offline Turkish narration using the project's isolated Chatterbox environment."""
import hashlib
import json
import math
import os
from pathlib import Path
import random
import socket
import subprocess
import sys

os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_HUB_DISABLE_TELEMETRY="1")
ROOT = Path(__file__).resolve().parents[3]
MODEL = ROOT / "shorts/models/chatterbox"


def no_network(*args, **kwargs):
    raise RuntimeError("Network is disabled during local Chatterbox narration. Run setup separately.")


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(8 * 1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def main():
    plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    manifest = json.loads((MODEL / "download-manifest.json").read_text(encoding="utf-8"))
    settings = plan.get("voiceSettings", {})
    delivery = settings.get("delivery", {})
    filters = ["silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB",
               "areverse", "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB",
               "areverse"]
    if delivery:
        limits = {"tempo": (0.8, 1.2, 1), "pitchSemitones": (-2, 2, 0),
                  "warmthDb": (-3, 3, 0), "airDb": (-3, 3, 0)}
        values = {}
        for name, (minimum, maximum, default) in limits.items():
            value = float(delivery.get(name, default))
            if not math.isfinite(value) or not minimum <= value <= maximum:
                raise ValueError("Voice delivery setting outside supported range: " + name)
            values[name] = value
        pitch = 2 ** (values["pitchSemitones"] / 12)
        filters.extend([
            f"rubberband=tempo={values['tempo']}:pitch={pitch}:transients=smooth:detector=soft:formant=preserved:pitchq=quality",
            f"equalizer=f=180:t=q:w=0.7:g={values['warmthDb']}",
            f"highshelf=f=5500:g={values['airDb']}",
        ])
    reference = ROOT / settings["reference"] if settings.get("reference") else None
    signatures = []
    for clip in plan["clips"]:
        data = dict(text=clip["text"], settings=settings, revision=manifest["revision"],
                    reference=digest(reference) if reference else "stock", runtime=1)
        signatures.append(hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest())
    cached = [Path(c["path"]).is_file() and Path(c["path"] + ".sha256").is_file()
              and Path(c["path"] + ".sha256").read_text() == signature
              for c, signature in zip(plan["clips"], signatures)]
    if all(cached):
        print("Using cached offline Chatterbox Turkish narration.", flush=True)
        return
    for file in manifest["files"]:
        if digest(MODEL / file["name"]) != file["sha256"]:
            raise RuntimeError("Local Chatterbox checksum differs: " + file["name"])
    socket.socket.connect = no_network
    socket.create_connection = no_network
    import numpy as np
    import soundfile as sf
    import torch
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    from chatterbox.models.tokenizers import tokenizer as tokenizer_module
    # This profile only requests Turkish. The upstream constructor eagerly initializes a Chinese
    # segmenter even for Turkish; skip that unused download and use the already pinned local map.
    def local_tokenizer_file(repo_id=None, filename=None, **kwargs):
        if filename == "Cangjie5_TC.json":
            return str(MODEL / filename)
        return no_network()
    tokenizer_module.hf_hub_download = local_tokenizer_file
    tokenizer_module.ChineseCangjieConverter._init_segmenter = lambda self: None
    if not torch.cuda.is_available():
        raise RuntimeError("This narration profile requires the configured local CUDA runtime.")
    torch.set_num_threads(4)
    print("Loading local Chatterbox Multilingual V3 on " + torch.cuda.get_device_name(), flush=True)
    model = ChatterboxMultilingualTTS.from_local(MODEL, "cuda", t3_model="v3")
    for index, clip in enumerate(plan["clips"]):
        if cached[index]:
            continue
        seed = settings.get("seed", 7)
        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        print(f"Synthesizing {index + 1}/{len(plan['clips'])}: {clip['text']}", flush=True)
        audio = model.generate(
            clip["text"], language_id="tr", audio_prompt_path=str(reference) if reference else None,
            exaggeration=settings.get("exaggeration", 0.55),
            cfg_weight=settings.get("cfgWeight", 0.3),
            temperature=settings.get("temperature", 0.75),
        )
        raw = clip["path"] + ".raw.wav"
        sf.write(raw, audio.squeeze().cpu().numpy(), model.sr, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", ",".join(filters),
                        "-c:a", "pcm_s16le", clip["path"]], check=True)
        Path(clip["path"] + ".sha256").write_text(signatures[index])
    print("Turkish narration complete; model and synthesis stayed on this computer.", flush=True)


if __name__ == "__main__":
    main()
