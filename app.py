"""
app.py
One FastAPI application that serves both:
  - the web page (http://localhost:8000)
  - the prediction API (POST /predict)
Start it with:  python -m uvicorn app:app --reload
"""

from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

from model_utils import ModelNotReady, load_model, predict
from recycling_guide import build_result

BASE_DIR = Path(__file__).resolve().parent
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


@asynccontextmanager
async def lifespan(app):
    # Load the model when the server starts, so the first request is fast.
    # If the files are missing, the server still starts and the page still
    # loads; only /predict will report the problem.
    try:
        load_model()
    except ModelNotReady as problem:
        print(f"\n*** {problem}\n")
    yield


app = FastAPI(title="Barcelona Recycling Helper", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


@app.get("/")
def serve_page():
    return FileResponse(BASE_DIR / "static" / "index.html")


@app.post("/predict")
async def classify_image(photo: UploadFile = File(...)):
    if not photo.content_type or not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="Please upload a photo (JPEG or PNG).")

    data = await photo.read()
    if not data:
        raise HTTPException(status_code=422, detail="That photo looks empty. Try another one.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=422, detail="That photo is too large. Try a smaller one.")

    try:
        image = Image.open(BytesIO(data))
        image.load()
    except Exception as error:
        raise HTTPException(status_code=422, detail="That doesn't look like a valid photo.") from error

    try:
        raw = predict(image)
    except ModelNotReady as problem:
        raise HTTPException(status_code=503, detail=str(problem))

    return build_result(raw)
