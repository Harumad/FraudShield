import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

DEFAULT_MODEL = "text-embedding-3-small"
BATCH_SIZE = 32


def get_client() -> OpenAI:
    return OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )


def load_chunks(path: str | Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def embed_texts(
    client: OpenAI,
    texts: list[str],
    model: str = DEFAULT_MODEL,
) -> list[list[float]]:
    all_embeddings = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i:i + BATCH_SIZE]
        resp = client.embeddings.create(input=batch, model=model)
        all_embeddings.extend([d.embedding for d in resp.data])
        print(f"  embedded {min(i + BATCH_SIZE, len(texts))}/{len(texts)}")
    return all_embeddings


def main():
    base = Path(__file__).parent
    source = sys.argv[1] if len(sys.argv) > 1 else "finance_rag_chunks_row.json"
    source_path = base / source

    if not source_path.exists():
        print(f"Chunk file not found: {source_path}")
        sys.exit(1)

    model = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_MODEL

    print(f"Loading chunks from: {source_path}")
    chunks = load_chunks(source_path)
    print(f"Loaded {len(chunks)} chunks")

    texts = [c["text"] for c in chunks]
    client = get_client()

    print(f"Embedding with model: {model}")
    embeddings = embed_texts(client, texts, model=model)

    embedded = []
    for chunk, emb in zip(chunks, embeddings):
        entry = {
            "id": chunk["id"],
            "text": chunk["text"],
            "embedding": emb,
            "n_tokens": chunk["n_tokens"],
        }
        if "metadata" in chunk:
            entry["metadata"] = chunk["metadata"]
        if "n_rows" in chunk:
            entry["n_rows"] = chunk["n_rows"]
        embedded.append(entry)

    stem = source_path.stem
    dst = base / f"{stem}_embedded.json"
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(embedded, f, ensure_ascii=False)

    print(f"Saved {len(embedded)} embedded chunks to {dst}")
    print(f"Embedding dimension: {len(embeddings[0])}")


if __name__ == "__main__":
    main()
