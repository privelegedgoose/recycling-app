"""
model_utils.py
Loads the fine-tuned image classification model from the recycling-model/
folder and identifies what material a photo shows.
"""

from pathlib import Path
import threading

import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

MODEL_DIR = Path(__file__).resolve().parent / "recycling-model"

_processor = None
_model = None
_lock = threading.Lock()


class ModelNotReady(Exception):
    """Raised when the model files are missing or cannot be loaded."""


def _find_model_folder() -> Path:
    """Find the folder that contains config.json.

    If the model was ever re-unzipped into a subfolder, we accept that too,
    so the app still works.
    """
    if (MODEL_DIR / "config.json").exists():
        return MODEL_DIR
    for sub in sorted(p for p in MODEL_DIR.iterdir() if p.is_dir()) if MODEL_DIR.exists() else []:
        if (sub / "config.json").exists():
            return sub
    raise ModelNotReady(
        "No model found. Put config.json, model.safetensors and "
        "preprocessor_config.json directly inside the recycling-model/ folder."
    )


def load_model():
    """Load the model once; later calls reuse it."""
    global _processor, _model
    if _model is not None:
        return
    with _lock:
        if _model is not None:
            return
        folder = _find_model_folder()
        try:
            processor = AutoImageProcessor.from_pretrained(folder)
            model = AutoModelForImageClassification.from_pretrained(folder)
        except Exception as error:
            raise ModelNotReady(f"The model files could not be loaded: {error}") from error
        model.eval()  # inference mode: no training
        _processor, _model = processor, model
        print("Model loaded.")
        print(f"Materials: {list(model.config.id2label.values())}")


def predict(image: Image.Image) -> dict:
    """Classify one photo into a material."""
    load_model()
    inputs = _processor(images=image.convert("RGB"), return_tensors="pt")
    with torch.no_grad():
        logits = _model(**inputs).logits
    probabilities = torch.softmax(logits, dim=-1)[0]

    id2label = _model.config.id2label  # material names saved during training
    scores = sorted(
        (
            {"material": id2label[i], "confidence": round(p.item() * 100, 1)}
            for i, p in enumerate(probabilities)
        ),
        key=lambda s: s["confidence"],
        reverse=True,
    )
    return {
        "material": scores[0]["material"],
        "confidence": scores[0]["confidence"],
        "all_scores": scores,
    }
