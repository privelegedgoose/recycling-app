# Barcelona Recycling Helper

**Live:** https://privelegedgoose.github.io/recycling-app/

Take or upload a photo of an item and this app tells you what material it
is and which Barcelona bin (contenidor) it belongs in. Powered by a
fine-tuned Vision Transformer (cardboard, glass, metal, paper, plastic,
trash) plus Barcelona-specific bin guidance, including Punts Verds for
items the model can't classify on its own.

## Two versions in this repo

- **`docs/`** — the deployed version. Fully static: the model runs
  entirely in the browser via ONNX + [Transformers.js](https://huggingface.co/docs/transformers.js),
  so there's no server and photos never leave the device. This is what's
  live on GitHub Pages above.
- **Root (`app.py`, `model_utils.py`, `recycling_guide.py`, `static/`)** —
  the original FastAPI + PyTorch backend version. Needs a real Python host
  to run (see `README.txt` for local setup, or `Dockerfile` for container
  hosting — e.g. Hugging Face Spaces with a PRO plan, Render, Fly.io).
  Kept for local development and as a reference implementation.

See `README.txt` for how to run the backend version locally.
