"""Align continuous lesson audio locally; keep authored captions in the video builder."""
import json
import os
from pathlib import Path
import socket

os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_HUB_DISABLE_TELEMETRY="1",
                  HF_HUB_DISABLE_PROGRESS_BARS="1")
ROOT = Path(__file__).resolve().parents[3]


def no_network(*args, **kwargs):
    raise RuntimeError("Word alignment must stay offline.")


socket.socket.connect = no_network
import soundfile as sf
from transformers import pipeline
from transformers.utils import logging
logging.disable_progress_bar()
logging.set_verbosity_error()
recognizer = pipeline("automatic-speech-recognition", model=str(ROOT / "shorts/models/whisper-small"),
                      device=0, model_kwargs={"attn_implementation": "eager"})
plan = json.loads((ROOT / "shorts/italian-game-tr-flow.json").read_text(encoding="utf-8"))
results = []
for clip in plan["clips"]:
    audio, rate = sf.read(ROOT / clip["path"])
    result = recognizer({"array": audio, "sampling_rate": rate}, return_timestamps="word",
                        generate_kwargs={"language": "turkish", "task": "transcribe", "num_beams": 5})
    result.update(expected=clip["text"], duration=len(audio) / rate)
    results.append(result)
    print(result["text"], flush=True)
(ROOT / "shorts/output/italian-game-tr-v4.alignment.json").write_text(
    json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
