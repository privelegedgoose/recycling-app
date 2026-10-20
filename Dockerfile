FROM python:3.11-slim

RUN useradd -m -u 1000 appuser
WORKDIR /app

COPY --chown=appuser requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser app.py model_utils.py recycling_guide.py ./
COPY --chown=appuser static/ ./static/
COPY --chown=appuser recycling-model/config.json recycling-model/model.safetensors recycling-model/preprocessor_config.json ./recycling-model/

ENV HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/home/appuser

USER appuser
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
