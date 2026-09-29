import json
import os
import time
from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from main import SYSTEM_PROMPT, get_openai_client, get_model

app = FastAPI(title="FraudShield AI API", description="FraudShield AI Backend")

# Localhost is always allowed so the Vite dev server keeps working. For a
# split deployment (frontend and API on different domains) list the frontend
# origins in ALLOWED_ORIGINS, e.g. "https://my-app.vercel.app,https://my.site".
# A same-origin single-container deployment needs no CORS at all.
ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatPayload(BaseModel):
    messages: List[Message]


class ContactPayload(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str


# Simple in-memory rate limiter
request_counts: Dict[str, list] = {}


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(ip: str) -> bool:
    now = time.time()
    if ip not in request_counts:
        request_counts[ip] = []
    request_counts[ip] = [t for t in request_counts[ip] if now - t < 60]
    if len(request_counts[ip]) >= 20:
        return False
    request_counts[ip].append(now)
    return True


router = APIRouter()


@router.get("/health")
def health_check():
    try:
        # Simple health check, also confirms if OpenAI client can be initialized
        get_openai_client()
        return {"status": "ok", "bot": "FinBot", "message": "Ready to help with finance!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/chat")
def chat_endpoint(payload: ChatPayload, request: Request):
    ip = client_ip(request)
    if not rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")

    try:
        client = get_openai_client()
        model = get_model()
    except Exception as e:
        error_message = str(e)
        fallback_message = (
            "The assistant is currently unavailable. Please make sure the AI service is configured correctly."
        )

        def error_generator():
            yield f"data: {json.dumps({'error': error_message, 'content': fallback_message})}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(error_generator(), media_type="text/event-stream")

    # Prepend the system prompt if not already present
    messages = []
    has_system = any(m.role == "system" for m in payload.messages)

    if not has_system:
        messages.append({"role": "system", "content": SYSTEM_PROMPT})

    for msg in payload.messages:
        messages.append({"role": msg.role, "content": msg.content})

    def event_generator():
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )
            for chunk in response:
                if len(chunk.choices) > 0:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield f"data: {json.dumps({'content': content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/contact")
def contact_endpoint(payload: ContactPayload):
    if not payload.name or not payload.email or not payload.message:
        raise HTTPException(status_code=400, detail="Name, email, and message are required")
    return {"status": "ok", "message": "Message received. We will get back to you soon."}


# Every route is mounted twice so the API answers on "/api/..." (plain hosts,
# Docker, single container) and on "/..." (Vercel, which strips the prefix).
# That keeps the frontend working unchanged on any platform.
app.include_router(router, prefix="/api")
app.include_router(router)


def resolve_static_dir() -> Path | None:
    """Locate a built frontend so one process can serve the whole app."""
    here = Path(__file__).resolve().parent
    candidates = []
    if os.getenv("STATIC_DIR", "").strip():
        candidates.append(Path(os.environ["STATIC_DIR"]))
    candidates.append(here / "static")
    candidates.append(here.parent / "frontend" / "dist")
    for candidate in candidates:
        if (candidate / "index.html").is_file():
            return candidate
    return None


STATIC_DIR = resolve_static_dir()

# Registered after the API routes so it only catches what the API did not match.
# Skipped entirely when no frontend build is present (e.g. the Vercel backend
# service, which has no frontend inside its own root).
if STATIC_DIR is not None:
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        root = STATIC_DIR.resolve()
        if full_path == "api" or full_path.startswith("api/"):
            # Never let the SPA fallback answer API paths: a 200 of HTML would
            # look like a successful API call to the frontend.
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = (root / full_path).resolve()
        if candidate.is_file() and candidate.is_relative_to(root):
            return FileResponse(candidate)
        return FileResponse(root / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
    )
