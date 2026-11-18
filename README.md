# PAWFECT — The Good Dog Club

Responsive React + FastAPI dog-lover website: sticker discovery/editor, saved collection, floating PawPal care chatbot and two trained EfficientNet-B0 image-screening models.

## Included features
- Responsive Home, Explore, Sticker Studio, Collection and Dog Health views.
- Sticker search/filters, browser favourites and PNG export.
- PawPal local rule-based dog-care guide: routines, enrichment, grooming, feeding basics and safe next steps. It is not an LLM or veterinary professional.
- Eye/skin screening calls the real trained checkpoints. Random demo predictions have been removed; API errors are shown clearly.
- Detailed per-model health status and reload endpoint.

## Trained checkpoints
Copy your notebook exports to exactly:
```
backend/models/dog_eye_efficientnet_b0_v1.pth
backend/models/dog_skin_efficientnet_b0.pth
```
The expected export dictionary contains `model_state`, `class_names`, `img_size`, `mean`, `std`, and `arch='efficientnet_b0'`. These match the final export cells in your supplied notebooks. The weight files are not included in this ZIP because they were not present in the build environment.

Notebook preprocessing is RGB, resize 224x224 (or checkpoint size), ToTensor, ImageNet normalization mean `[0.485,0.456,0.406]`, std `[0.229,0.224,0.225]`. Eye labels: blepharitis, entropion, eyelid_tumor, mastopathy, pigmented_keratitis. Skin labels: bacterial dermatosis, fungal infection, healthy, hypersensitivity dermatitis. Notebook thresholds: eye 0.70; skin 0.60.

## Backend setup
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```
Install torch and torchvision for your OS/CUDA from https://pytorch.org/get-started/locally/ then run:
```bash
uvicorn app.main:app --reload --port 8000
```
Check `http://localhost:8000/api/health`. Each model reports `loaded` or `error` with the exact reason. To reload after replacing weights, POST `http://localhost:8000/api/reload-models`. API docs: `http://localhost:8000/docs`.

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. Optional `frontend/.env`: `VITE_API_URL=http://localhost:8000`.

## Safety
These classifiers are experimental screening aids, not diagnostic tools. Softmax confidence is not clinical certainty. PawPal provides general education only and cannot diagnose or prescribe. Breathing difficulty, collapse, seizures, major bleeding, suspected poisoning, severe pain, eye injury or rapid deterioration needs urgent veterinary care.

## PawPal AI upgrade (RAG + Gemini)

PawPal now calls the FastAPI backend instead of matching hard-coded keywords in the browser. It uses SentenceTransformers embeddings + FAISS retrieval over `backend/knowledge/dog_care_knowledge.md`, then sends the retrieved passages and recent chat context to Google Gemini. The Gemini key stays on the backend.

Follow `backend/README.md` to install the added dependencies, create `backend/.env` from `.env.example`, add `GEMINI_API_KEY`, and build the FAISS index. The knowledge base is starter educational content and should be expanded with reviewed veterinary references. PawPal is not a diagnostic or treatment service.
