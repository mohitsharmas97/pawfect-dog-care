# PAWFECT FastAPI backend

## Setup

Use Python 3.11 or 3.12 in a virtual environment (recommended for compatibility with PyTorch, FAISS and sentence-transformers).

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Install a PyTorch/torchvision build suitable for your machine using the official PyTorch selector, then copy your trained checkpoints into `models/`:
- `models/dog_eye_efficientnet_b0_v1.pth`
- `models/dog_skin_efficientnet_b0.pth`

## Configure PawPal Gemini access

1. Create a Gemini API key in Google AI Studio.
2. Copy `.env.example` to `.env` in this `backend` folder.
3. Put the key in `GEMINI_API_KEY`. Never put this key in the React `.env` file or commit it to Git.
4. The default text model is `gemini-2.5-flash`; override with `PAWPAL_GEMINI_MODEL` if needed.

## Build the RAG knowledge index

The initial knowledge source is `knowledge/dog_care_knowledge.md`. It is intentionally a small, clearly labelled starter guide, not a medical textbook. Review and expand it with trusted veterinary references before presenting it as authoritative.

```bash
python scripts_build_pawpal_index.py
```

This creates `pawpal_index/index.faiss` and `pawpal_index/chunks.json`. The first run downloads the sentence-transformer embedding model. If you skip this step, PawPal can build an in-memory index on its first question, but the explicit build is recommended.

## Run

From this `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

Useful endpoints:
- `GET http://localhost:8000/api/health` — eye/skin model status
- `GET http://localhost:8000/api/pawpal/health` — PawPal provider configuration
- `POST http://localhost:8000/api/pawpal/chat` — RAG + Gemini chat
- `GET http://localhost:8000/docs` — interactive API docs

Example request body:

```json
{
  "message": "My dog keeps scratching its ears. What should I watch for?",
  "history": []
}
```

## How PawPal works

1. The user sends a message from React to FastAPI.
2. SentenceTransformers embeds the question.
3. FAISS retrieves the most relevant chunks from the dog-care knowledge base.
4. FastAPI sends the question, retrieved context and a short conversation history to Gemini.
5. Gemini drafts a grounded response; the API returns the answer and source section labels.

Emergency keywords trigger a conservative immediate-vet response before calling the language model. This is a basic safeguard, not a complete emergency detector. PawPal is not a veterinarian and must not diagnose, prescribe or replace professional care.
