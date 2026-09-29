from vector_store import query
tests = [
    "How do I calculate profit margin?",
    "Someone asked for my PIN",
    "How can I save money?",
    "I received a fake promotion SMS",
    "How do I create a business budget?",
    "What is susu advice?",
    "I sent money to the wrong number",
    "How to reduce business expenses?",
    "A scammer called me",
]
for q in tests:
    results = query(query_text=q, n_results=1)
    r = results[0]
    print("Q: " + q)
    print("A: " + r["text"][:150] + "...")
    print()
