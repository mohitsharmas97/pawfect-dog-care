
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pathlib import Path
import io
import os

# Load environment variables before importing PawPal
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

from .inference import registry, MODEL_DIR
from .pawpal_rag import answer


app = FastAPI(
    title="PAWFECT API",
    version="2.0.0",
    description="Dog care companion and trained EfficientNet-B0 screening API"
)

# CORS configuration
origins = os.getenv(
    "PAWFECT_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in origins if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
def startup():
    registry.load()


@app.get("/")
def root():
    return {
        "name": "PAWFECT API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/api/health")
def health():
    models = registry.status()
    ready = all(v["status"] == "loaded" for v in models.values())

    return {
        "status": "ok" if ready else "degraded",
        "models": models,
        "models_directory": str(MODEL_DIR),
        "torch_available": registry._torch is not None
    }


@app.post("/api/reload-models")
def reload_models():
    registry.load()
    return health()


@app.get("/api/stickers")
def stickers():
    return {
        "items": [
            {
                "id": 1,
                "name": "Corgi Cloud Nine",
                "breed": "Corgi",
                "mood": "Happy"
            },
            {
                "id": 2,
                "name": "Sleepy Shiba",
                "breed": "Shiba Inu",
                "mood": "Sleepy"
            },
            {
                "id": 3,
                "name": "Golden Hour",
                "breed": "Golden Retriever",
                "mood": "Love"
            },
            {
                "id": 4,
                "name": "Tiny Woof Energy",
                "breed": "Frenchie",
                "mood": "Sassy"
            }
        ]
    }


# Chat request models
class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=2000)


class PawPalRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(
        default_factory=list,
        max_length=12
    )


# PawPal Grok health
@app.get("/api/pawpal/health")
def pawpal_health():
    return {
        "status": "configured" if os.getenv("GROQ_API_KEY") else "needs_api_key",
        "provider": "Groq",
        "retrieval": "Local keyword-based retrieval",
        "knowledge_base": str(
            BASE_DIR / "knowledge" / "dog_care_knowledge.md"
        )
    }


# PawPal chat
@app.post("/api/pawpal/chat")
def pawpal_chat(payload: PawPalRequest):
    try:
        return answer(
            payload.message.strip(),
            [item.model_dump() for item in payload.history]
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"PawPal error: {type(e).__name__}: {e}"
        )


# Dog eye and skin prediction
@app.post("/api/predict/{kind}")
async def predict(kind: str, file: UploadFile = File(...)):

    if kind not in {"eye", "skin"}:
        raise HTTPException(
            status_code=404,
            detail="Use eye or skin."
        )

    if not file.content_type or not file.content_type.lower().startswith("image/"):
        raise HTTPException(
            status_code=415,
            detail="Upload an image file."
        )

    data = await file.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be 10 MB or smaller."
        )

    try:
        with Image.open(io.BytesIO(data)) as im:
            im.verify()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    try:
        return registry.predict(kind, data)

    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {type(e).__name__}: {e}"
        )
