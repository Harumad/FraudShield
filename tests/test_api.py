import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import api


@pytest.fixture
def client() -> TestClient:
    return TestClient(api.app)


def test_chat_returns_fallback_when_ai_is_unavailable(client, monkeypatch):
    def raise_config_error():
        raise RuntimeError("OPENAI_API_KEY not configured")

    monkeypatch.setattr(api, "get_openai_client", raise_config_error)
    monkeypatch.setattr(api, "get_model", lambda: "gpt-4o-mini")

    response = client.post(
        "/chat",
        json={"messages": [{"role": "user", "content": "Hello"}]},
    )

    assert response.status_code == 200
    assert "not configured" in response.text.lower() or "currently unavailable" in response.text.lower()


@pytest.mark.parametrize("path", ["/chat", "/api/chat"])
def test_chat_reachable_with_and_without_api_prefix(client, monkeypatch, path):
    """Any host must work: "/api/*" for plain/Docker hosts, "/*" for Vercel."""
    def raise_config_error():
        raise RuntimeError("OPENAI_API_KEY not configured")

    monkeypatch.setattr(api, "get_openai_client", raise_config_error)
    monkeypatch.setattr(api, "get_model", lambda: "gpt-4o-mini")

    response = client.post(path, json={"messages": [{"role": "user", "content": "Hello"}]})

    assert response.status_code == 200
    assert "not configured" in response.text


@pytest.mark.parametrize("path", ["/health", "/api/health"])
def test_health_reachable_with_and_without_api_prefix(client, path):
    assert client.get(path).status_code == 200


@pytest.mark.parametrize("path", ["/contact", "/api/contact"])
def test_contact_reachable_with_and_without_api_prefix(client, path):
    response = client.post(path, json={"name": "a", "email": "b@c.d", "message": "hi"})

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.parametrize("path", ["/contact", "/api/contact"])
def test_contact_rejects_incomplete_payload(client, path):
    response = client.post(path, json={"name": "", "email": "", "message": ""})

    assert response.status_code == 400


def test_frontend_assets_are_not_shadowed_by_spa_fallback(client):
    """The catch-all frontend route must never intercept the API."""
    assert client.get("/api/does-not-exist").status_code == 404
