# Build the Vite frontend, then serve it and the API from one container.
# Works on any Docker host: Render, Railway, Fly.io, Cloud Run, ECS, a VPS.

FROM node:22-alpine AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim AS runtime

COPY --from=ghcr.io/astral-sh/uv:0.5 /uv /uvx /usr/local/bin/

WORKDIR /app
COPY backend/ ./

# Dependencies come from backend/pyproject.toml, so there is a single
# source of truth shared with Vercel and local dev.
RUN uv pip install --system --no-cache -r pyproject.toml

COPY --from=frontend /build/dist ./static

ENV STATIC_DIR=/app/static \
    HOST=0.0.0.0 \
    PORT=8000 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
