// app.js
// Runs the fine-tuned ViT model fully in the browser (ONNX + Transformers.js).
// No server involved: the photo never leaves the device.

import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
import { buildResult } from "./recycling_guide.js";

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = "./model/";

const MODEL_ID = "recycling-vit";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const cameraBtn = document.getElementById("cameraBtn");
const captureButtons = document.getElementById("captureButtons");
const cameraPanel = document.getElementById("cameraPanel");
const cameraVideo = document.getElementById("cameraVideo");
const captureBtn = document.getElementById("captureBtn");
const cancelCameraBtn = document.getElementById("cancelCameraBtn");
const captureCanvas = document.getElementById("captureCanvas");
const previewWrap = document.getElementById("previewWrap");
const previewImg = document.getElementById("previewImg");
const resetBtn = document.getElementById("resetBtn");
const cameraError = document.getElementById("cameraError");
const modelNote = document.getElementById("modelNote");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const resultState = document.getElementById("resultState");
const binCard = document.getElementById("binCard");
const unsureCard = document.getElementById("unsureCard");

let activeStream = null;
let previewUrl = null;
let classifierPromise = null;

function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = pipeline("image-classification", MODEL_ID, {
      dtype: "q8",
    });
  }
  return classifierPromise;
}

// Start loading the model as soon as the page opens, so it's likely
// ready by the time the user picks a photo.
getClassifier()
  .then(() => {
    modelNote.textContent = "Ready — take or upload a photo to begin.";
  })
  .catch((e) => {
    console.error(e);
    modelNote.textContent =
      "The model is taking a moment to load — it'll still work once you pick a photo.";
  });

uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) handleImage(file);
});

cameraBtn.addEventListener("click", openCamera);
cancelCameraBtn.addEventListener("click", closeCamera);
captureBtn.addEventListener("click", capturePhoto);
resetBtn.addEventListener("click", resetAll);

async function openCamera() {
  cameraError.hidden = true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError();
    return;
  }
  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    cameraVideo.srcObject = activeStream;
    cameraPanel.hidden = false;
  } catch (e) {
    showCameraError();
  }
}

function showCameraError() {
  cameraError.textContent =
    "Camera isn't available here. Try uploading a photo instead.";
  cameraError.hidden = false;
}

function closeCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }
  cameraPanel.hidden = true;
}

function capturePhoto() {
  const width = cameraVideo.videoWidth;
  const height = cameraVideo.videoHeight;
  if (!width || !height) return;
  captureCanvas.width = width;
  captureCanvas.height = height;
  captureCanvas.getContext("2d").drawImage(cameraVideo, 0, 0, width, height);
  captureCanvas.toBlob(
    (blob) => {
      if (blob) handleImage(blob);
    },
    "image/jpeg",
    0.9
  );
  closeCamera();
}

function resetAll() {
  fileInput.value = "";
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  previewWrap.hidden = true;
  captureButtons.hidden = false;
  emptyState.hidden = false;
  errorState.hidden = true;
  resultState.hidden = true;
  loadingState.hidden = true;
}

async function handleImage(fileOrBlob) {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(fileOrBlob);
  previewImg.src = previewUrl;
  previewWrap.hidden = false;
  captureButtons.hidden = true;

  emptyState.hidden = true;
  errorState.hidden = true;
  resultState.hidden = true;
  loadingState.hidden = false;

  try {
    const classifier = await getClassifier();
    const scores = await classifier(fileOrBlob, { top_k: null });
    // scores: [{ label, score }, ...] sorted descending, score in [0, 1]
    const top = scores[0];
    const result = buildResult({
      material: top.label,
      confidence: Math.round(top.score * 1000) / 10,
      allScores: scores.map((s) => ({
        material: s.label,
        confidence: Math.round(s.score * 1000) / 10,
      })),
    });
    showResult(result);
  } catch (e) {
    console.error(e);
    showError();
  }
}

function showError() {
  loadingState.hidden = true;
  resultState.hidden = true;
  emptyState.hidden = true;
  errorState.textContent =
    "Oops! That didn't work. We are fixing it asap, come back soon";
  errorState.hidden = false;
}

function showResult(data) {
  loadingState.hidden = true;
  errorState.hidden = true;
  emptyState.hidden = true;

  document.getElementById("materialName").textContent = data.material;
  document.getElementById("confidenceNote").textContent =
    data.confidence + "% confident" + (data.unsure ? " — that's a bit low" : "");

  if (data.unsure) {
    binCard.hidden = true;
    unsureCard.hidden = false;
    unsureCard.textContent = data.message;
  } else {
    unsureCard.hidden = true;
    binCard.hidden = false;
    binCard.style.borderLeftColor = data.color;
    document.getElementById("binName").textContent = data.bin;
    document.getElementById("binCatalan").textContent = data.catalan;
    document.getElementById("binTip").textContent = data.tip;
  }

  resultState.hidden = false;
}
