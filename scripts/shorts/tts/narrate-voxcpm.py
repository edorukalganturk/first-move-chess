"""Generate continuous Turkish narration with a designed synthetic VoxCPM2 voice."""
import hashlib
import json
import os
from pathlib import Path
import socket
import subprocess
import sys

os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_HUB_DISABLE_TELEMETRY="1",
                  HF_HUB_DISABLE_PROGRESS_BARS="1", TOKENIZERS_PARALLELISM="false")
ROOT = Path(__file__).resolve().parents[3]
MODEL = ROOT / "shorts/models/voxcpm2"


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(8 * 1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def block_network(*args, **kwargs):
    raise RuntimeError("Network is disabled during local VoxCPM2 narration.")


def main():
    plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    settings = plan["voiceSettings"]
    manifest = json.loads((MODEL / "download-manifest.json").read_text(encoding="utf-8"))
    for clip in plan["clips"]:
        clip["path"] = str(ROOT / clip["path"])
        Path(clip["path"]).parent.mkdir(parents=True, exist_ok=True)
    signatures = [hashlib.sha256(json.dumps(dict(
        text=clip["text"], settings=settings, revision=manifest["revision"],
        prefix=plan["clips"][0]["text"] if index else None, runtime=1,
    ), sort_keys=True).encode()).hexdigest() for index, clip in enumerate(plan["clips"])]
    cached = [Path(c["path"]).is_file() and Path(c["path"] + ".sha256").is_file()
              and Path(c["path"] + ".sha256").read_text() == signature
              for c, signature in zip(plan["clips"], signatures)]
    socket.socket.connect = block_network
    socket.create_connection = block_network
    if all(cached):
        print("Using cached continuous Turkish narration.", flush=True)
        return
    for file in manifest["files"]:
        if digest(MODEL / file["name"]) != file["sha256"]:
            raise RuntimeError("Local VoxCPM2 checksum differs: " + file["name"])
    import soundfile as sf
    import torch
    from voxcpm import VoxCPM
    from transformers.utils import logging
    logging.disable_progress_bar()
    logging.set_verbosity_error()
    torch.set_num_threads(4)
    print("Loading local VoxCPM2 voice design on " + torch.cuda.get_device_name(), flush=True)
    model = VoxCPM.from_pretrained(str(MODEL), load_denoiser=False, local_files_only=True,
                                   optimize=False, device="cuda")
    first = plan["clips"][0]
    for index, clip in enumerate(plan["clips"]):
        if cached[index]:
            continue
        kwargs = dict(cfg_value=settings.get("cfgValue", 2),
                      inference_timesteps=settings.get("inferenceSteps", 16),
                      normalize=False, denoise=False, retry_badcase=False,
                      min_len=8, max_len=400, seed=settings.get("seed", 42))
        if index:
            kwargs.update(text=clip["text"], prompt_wav_path=first["path"],
                          prompt_text=first["text"], reference_wav_path=first["path"])
        else:
            kwargs["text"] = "(" + settings["control"] + ")" + clip["text"]
        print(f"Synthesizing continuous passage {index + 1}/{len(plan['clips'])}", flush=True)
        audio = model.generate(**kwargs)
        raw = clip["path"] + ".raw.wav"
        sf.write(raw, audio, model.tts_model.sample_rate, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                        "silenceremove=start_periods=1:start_duration=0.03:start_threshold=-55dB,areverse,"
                        "silenceremove=start_periods=1:start_duration=0.03:start_threshold=-55dB,areverse",
                        "-c:a", "pcm_s16le", clip["path"]], check=True)
        Path(clip["path"] + ".sha256").write_text(signatures[index])
        print(f"Saved {Path(clip['path']).name}", flush=True)
    print("Continuous Turkish narration complete, generated entirely offline.", flush=True)


if __name__ == "__main__":
    main()
