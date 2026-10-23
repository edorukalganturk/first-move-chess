"""One-time download of the pinned local voice-design model."""
import hashlib
import json
import sys
from pathlib import Path
from urllib.request import urlopen
from huggingface_hub import snapshot_download

ROOT = Path(__file__).resolve().parents[3]
FOLDER = ROOT / "shorts/models/voxcpm2"
REVISION = "32279effe8c19989596f05d353d1447f51d9e915"
CODE = "cce58a5b59303c9bd63d12f23afe6a49a4a80c59"
snapshot_download("openbmb/VoxCPM2", revision=REVISION, local_dir=FOLDER,
                  allow_patterns=["*.json", "*.py", "model.safetensors", "audiovae.pth", "README.md"])
with urlopen(f"https://raw.githubusercontent.com/OpenBMB/VoxCPM/{CODE}/LICENSE") as response:
    (FOLDER / "LICENSE").write_bytes(response.read())
files = []
for path in FOLDER.iterdir():
    if not path.is_file() or path.name == "download-manifest.json":
        continue
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(8 * 1024 * 1024), b""):
            result.update(block)
    files.append(dict(name=path.name, bytes=path.stat().st_size, sha256=result.hexdigest()))
(FOLDER / "download-manifest.json").write_text(json.dumps(dict(
    repository="openbmb/VoxCPM2", revision=REVISION, codeRevision=CODE,
    license="Apache-2.0", files=files,
), indent=2), encoding="utf-8")
print("Pinned VoxCPM2 model is ready for offline generation.")
if "--alignment" in sys.argv:
    snapshot_download("openai/whisper-small", revision="973afd24965f72e36ca33b3055d56a652f456b4d",
                      local_dir=ROOT / "shorts/models/whisper-small",
                      allow_patterns=["*.json", "merges.txt", "model.safetensors", "README.md"])
    print("Local word alignment model is ready.")
