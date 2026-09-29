import json
import os
import sys
from pathlib import Path

import chromadb
from chromadb.config import Settings
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from dotenv import load_dotenv

load_dotenv()

COLLECTION_NAME = "finance_qa"
EMBED_MODEL = "text-embedding-3-small"
PERSIST_DIR = Path(__file__).parent / "chroma_db"


def get_embedding_function() -> OpenAIEmbeddingFunction:
    return OpenAIEmbeddingFunction(
        api_key=os.environ["OPENAI_API_KEY"],
        model_name=EMBED_MODEL,
        api_base=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )


def get_client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(
        path=str(PERSIST_DIR),
        settings=Settings(anonymized_telemetry=False),
    )


def load_embedded_chunks(path: str | Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def store_chunks(chunks: list[dict], collection_name: str = COLLECTION_NAME):
    client = get_client()
    embed_fn = get_embedding_function()

    existing = [c.name for c in client.list_collections()]
    if collection_name in existing:
        client.delete_collection(collection_name)

    collection = client.create_collection(
        name=collection_name,
        embedding_function=embed_fn,
        metadata={"description": "Finance RAG Q&A chunks", "embedding_model": EMBED_MODEL},
    )

    ids = [c["id"] for c in chunks]
    embeddings = [c["embedding"] for c in chunks]
    documents = [c["text"] for c in chunks]

    metadatas = []
    for c in chunks:
        md = {}
        if "metadata" in c and c["metadata"]:
            for k, v in c["metadata"].items():
                if isinstance(v, list):
                    md[k] = json.dumps(v)
                elif v is not None:
                    md[k] = str(v)
        if "n_tokens" in c:
            md["n_tokens"] = str(c["n_tokens"])
        if "n_rows" in c:
            md["n_rows"] = str(c["n_rows"])
        metadatas.append(md)

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )

    return collection


def query(
    collection_name: str = COLLECTION_NAME,
    query_text: str = "",
    n_results: int = 5,
    where: dict | None = None,
) -> list[dict]:
    client = get_client()
    embed_fn = get_embedding_function()
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=embed_fn,
    )

    kwargs = dict(
        query_texts=[query_text],
        n_results=n_results,
    )
    if where:
        kwargs["where"] = where

    results = collection.query(**kwargs)

    output = []
    for i in range(len(results["ids"][0])):
        output.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i],
        })
    return output


def main():
    base = Path(__file__).parent
    source = sys.argv[1] if len(sys.argv) > 1 else "finance_rag_chunks_row_embedded.json"
    source_path = base / source

    if not source_path.exists():
        print(f"Embedded chunks file not found: {source_path}")
        print("Run embed_chunks.py first to generate it.")
        sys.exit(1)

    print(f"Loading embedded chunks from: {source_path}")
    chunks = load_embedded_chunks(source_path)
    print(f"Loaded {len(chunks)} chunks")

    print(f"Storing in ChromaDB collection '{COLLECTION_NAME}' at {PERSIST_DIR}")
    collection = store_chunks(chunks)
    count = collection.count()
    print(f"Stored {count} chunks in collection '{COLLECTION_NAME}'")

    print("\n--- Query test ---")
    test_queries = [
        "How do I calculate profit margin?",
        "Someone asked for my PIN, what should I do?",
        "How can I save money as a trader?",
    ]
    for test_q in test_queries:
        print(f"\nQuery: {test_q}")
        results = query(query_text=test_q, n_results=2)
        for r in results:
            meta = r["metadata"]
            cat = meta.get("category", meta.get("categories", "?"))
            print(f"  [{r['id']}] (dist: {r['distance']:.4f}) [{cat}] {r['text'][:100]}...")


if __name__ == "__main__":
    main()
