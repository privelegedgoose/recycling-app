BARCELONA RECYCLING HELPER
==========================

Take or upload a photo of an item and the app tells you what material it
is and which Barcelona bin (contenidor) it belongs in.

Folder contents
  app.py              FastAPI server: serves the web page AND the /predict API
  model_utils.py      Loads the fine-tuned image model and identifies the material
  recycling_guide.py  Maps a material to Barcelona's bin system (and Punts Verds)
  requirements.txt    The Python libraries this project needs
  static/             The web page (index.html + style.css)
  recycling-model/    The fine-tuned Vision Transformer (config.json, model.safetensors,
                       preprocessor_config.json) - already in place in this folder

Needs Python 3.10 or newer (tested with Python 3.14).

---------------------------------------------------------------
macOS (Terminal)
---------------------------------------------------------------
  python3.14 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  python -m uvicorn app:app --reload

---------------------------------------------------------------
Windows (PowerShell)
---------------------------------------------------------------
  py -3.14 -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python -m uvicorn app:app --reload

Then open http://localhost:8000 in your browser.
Stop the server with Ctrl + C in the terminal.
Next time, you only need the "activate" line and the "uvicorn" line.

---------------------------------------------------------------
Notes
---------------------------------------------------------------
- The camera option needs browser permission, and works best over
  localhost or https. If it's blocked, use "Upload a photo" instead.
- The model recognises 6 materials: cardboard, paper, glass, metal,
  plastic, trash. It can't detect special items like electronics or
  batteries by itself - the app's tips mention Green Points (Punts
  Verds) for those cases.
- If the model is less than 55% confident, the app says it isn't sure
  instead of guessing, and suggests the trash bin or looking it up.
