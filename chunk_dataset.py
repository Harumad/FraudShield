import csv
import json
from pathlib import Path


def load_clean_csv(path: str | Path) -> list[dict]:
    rows = []
    with open(path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            r = {}
            for k, v in row.items():
                k = k.strip().lower().replace(" ", "_")
                r[k] = v.strip() if v else ""
            rows.append(r)
    return rows


def build_chunk_text(row: dict) -> str:
    parts = []

    if row.get("question"):
        parts.append(f"Question: {row['question']}")
    if row.get("answer"):
        parts.append(f"Answer: {row['answer']}")

    context_bits = []
    if row.get("category"):
        context_bits.append(f"Category: {row['category']}")
    if row.get("business_type"):
        context_bits.append(f"Business: {row['business_type']}")
    if row.get("monthly_income"):
        context_bits.append(f"Monthly Income: GHS {row['monthly_income']}")
    if row.get("monthly_expense"):
        context_bits.append(f"Monthly Expense: GHS {row['monthly_expense']}")
    if row.get("profit"):
        context_bits.append(f"Profit: GHS {row['profit']}")
    if row.get("profit_margin"):
        context_bits.append(f"Profit Margin: {row['profit_margin']}%")
    if row.get("network"):
        context_bits.append(f"Network: {row['network']}")
    if row.get("location"):
        context_bits.append(f"Location: {row['location']}")
    if row.get("risk_level"):
        context_bits.append(f"Risk Level: {row['risk_level']}")

    if context_bits:
        parts.append(" | ".join(context_bits))

    return "\n\n".join(parts)


def chunk_by_row(
    rows: list[dict],
    include_metadata: bool = True,
) -> list[dict]:
    chunks = []
    for row in rows:
        text = build_chunk_text(row)
        if not text.strip():
            continue

        chunk = {
            "id": f"row_{row['id']}",
            "text": text,
            "n_tokens": _estimate_tokens(text),
        }

        if include_metadata:
            chunk["metadata"] = {
                "source_id": row["id"],
                "category": row.get("category", ""),
                "business_type": row.get("business_type", ""),
                "question": row.get("question", ""),
                "answer": row.get("answer", ""),
                "network": row.get("network", ""),
                "location": row.get("location", ""),
                "risk_level": row.get("risk_level", ""),
                "chunk_type": "qa_pair",
            }

        chunks.append(chunk)

    return chunks


def chunk_sliding_window(
    rows: list[dict],
    window: int = 3,
    stride: int = 1,
    include_metadata: bool = True,
) -> list[dict]:
    chunks = []
    chunk_index = 0
    n = len(rows)
    i = 0
    while i < n:
        group = rows[i:i + window]
        texts = []
        ids = []
        cats = set()
        btypes = set()
        for r in group:
            q = r.get("question", "")
            a = r.get("answer", "")
            cat = r.get("category", "")
            bt = r.get("business_type", "")
            parts = []
            if q:
                parts.append(f"Q: {q}")
            if a:
                parts.append(f"A: {a}")
            if parts:
                texts.append("\n".join(parts))
            ids.append(r["id"])
            if cat:
                cats.add(cat)
            if bt:
                btypes.add(bt)

        text = "\n\n---\n\n".join(texts)

        chunk = {
            "id": f"window_{chunk_index}",
            "text": text,
            "n_tokens": _estimate_tokens(text),
            "n_rows": len(group),
        }

        if include_metadata:
            chunk["metadata"] = {
                "chunk_type": "sliding_window",
                "chunk_index": chunk_index,
                "window": window,
                "stride": stride,
                "row_start": i,
                "row_end": min(i + window, n) - 1,
                "row_ids": ids,
                "categories": list(cats),
                "business_types": list(btypes),
            }

        chunks.append(chunk)
        chunk_index += 1
        i += stride

    return chunks


def chunk_fixed_size(
    rows: list[dict],
    chunk_size: int = 512,
    overlap: int = 64,
    include_metadata: bool = True,
) -> list[dict]:
    chunks = []
    chunk_index = 0

    for row in rows:
        text = build_chunk_text(row)

        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            if end < len(text):
                end = _find_break(text, start, end)

            segment = text[start:end].strip()
            if segment:
                chunk = {
                    "id": f"chunk_{chunk_index}",
                    "text": segment,
                    "n_tokens": _estimate_tokens(segment),
                }

                if include_metadata:
                    chunk["metadata"] = {
                        "source_id": row["id"],
                        "chunk_type": "fixed_size",
                        "chunk_index": chunk_index,
                        "char_start": start,
                        "char_end": end,
                        "category": row.get("category", ""),
                        "business_type": row.get("business_type", ""),
                    }

                chunks.append(chunk)
                chunk_index += 1

            start = end - overlap if end < len(text) else len(text)

    return chunks


def chunk_semantic(
    rows: list[dict],
    group_by: str = "category",
    include_metadata: bool = True,
) -> list[dict]:
    groups: dict[str, list[dict]] = {}
    for row in rows:
        key = row.get(group_by, "Unknown")
        groups.setdefault(key, []).append(row)

    chunks = []
    chunk_index = 0

    for group_key, group_rows in groups.items():
        combined = []
        for r in group_rows:
            q = r.get("question", "")
            a = r.get("answer", "")
            combined.append(f"Q: {q}\nA: {a}")

        text = "\n\n---\n\n".join(combined)

        chunk = {
            "id": f"semantic_{group_key.lower().replace(' ', '_')}",
            "text": text,
            "n_tokens": _estimate_tokens(text),
            "n_rows": len(group_rows),
        }

        if include_metadata:
            chunk["metadata"] = {
                "group_key": group_key,
                "group_by": group_by,
                "chunk_type": "semantic_group",
                "row_count": len(group_rows),
                "row_ids": [r["id"] for r in group_rows],
            }

        chunks.append(chunk)
        chunk_index += 1

    return chunks


def _estimate_tokens(text: str) -> int:
    return len(text) // 4


def _find_break(text: str, start: int, end: int) -> int:
    window = text[start:end]
    for sep in ("\n\n", "\n", ". ", "? ", "! "):
        idx = window.rfind(sep)
        if idx != -1:
            return start + idx + len(sep)
    idx = window.rfind(" ")
    if idx != -1:
        return start + idx + 1
    return end


def chunk_dataset(
    csv_path: str | Path = "finance_rag_clean.csv",
    strategy: str = "row",
    chunk_size: int = 512,
    overlap: int = 64,
    group_by: str = "category",
    window: int = 3,
    stride: int = 1,
    include_metadata: bool = True,
    output_path: str | None = None,
) -> list[dict]:
    rows = load_clean_csv(csv_path)

    if strategy == "row":
        chunks = chunk_by_row(rows, include_metadata=include_metadata)
    elif strategy == "fixed":
        chunks = chunk_fixed_size(
            rows, chunk_size=chunk_size, overlap=overlap, include_metadata=include_metadata
        )
    elif strategy == "semantic":
        chunks = chunk_semantic(rows, group_by=group_by, include_metadata=include_metadata)
    elif strategy == "sliding_window":
        chunks = chunk_sliding_window(
            rows, window=window, stride=stride, include_metadata=include_metadata
        )
    else:
        raise ValueError(f"Unknown strategy: {strategy}")

    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, indent=2, ensure_ascii=False)

    return chunks


if __name__ == "__main__":
    import sys

    strategy = sys.argv[1] if len(sys.argv) > 1 else "row"
    window = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    stride = int(sys.argv[3]) if len(sys.argv) > 3 else 1

    base = Path(__file__).parent
    clean_csv = base / "finance_rag_clean.csv"

    kwargs = dict(csv_path=clean_csv, strategy=strategy)
    if strategy in ("sliding_window",):
        kwargs["window"] = window
        kwargs["stride"] = stride
        kwargs["output_path"] = base / f"finance_rag_chunks_{strategy}_w{window}_s{stride}.json"
    else:
        kwargs["output_path"] = base / f"finance_rag_chunks_{strategy}.json"

    details = f"strategy={strategy}"
    if strategy == "sliding_window":
        details += f", window={window}, stride={stride}"
    print(f"Chunking with {details}")

    chunks = chunk_dataset(**kwargs)

    print(f"Generated {len(chunks)} chunks")
    print(f"\nSample chunk:\n{json.dumps(chunks[0], indent=2, ensure_ascii=False)}")
