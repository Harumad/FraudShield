import re
import csv
import sys
from pathlib import Path
from datetime import datetime

SRC = Path(r"C:\Users\HP\Downloads\finance_rag_raw_messy_dataset_1000_rows.csv")
DST = Path(__file__).parent / "finance_rag_clean.csv"

CATEGORY_MAP = {
    "budget": "Budgeting",
    "budgeting": "Budgeting",
    "budge": "Budgeting",
    "savings": "Savings",
    "saving": "Savings",
    "savings": "Savings",
    "profit margin": "Profit Margin",
    "profit margin": "Profit Margin",
    "mobile money fraud": "Mobile Money Fraud",
    "momo fraud": "Mobile Money Fraud",
}

BUSINESS_TYPE_MAP = {
    "trader": "Trader",
    "salon": "Salon",
    "bakery": "Bakery",
    "boutique": "Boutique",
    "restaurant": "Restaurant",
    "food vendor": "Food Vendor",
    "farmer": "Farmer",
    "retail shop": "Retail Shop",
    "pharmacy": "Pharmacy",
}

NETWORK_MAP = {
    "mtn": "MTN",
    "telecel": "Telecel",
    "airteltigo": "AirtelTigo",
}

RISK_MAP = {
    "high": "High",
    "medium": "Medium",
    "low": "Low",
}

TEXT_NUMBERS = {
    "five thousand": 5000.0,
    "five thousand ": 5000.0,
    "thirty": 30.0,
}

DATE_FORMATS = [
    "%Y-%m-%d",
    "%m-%d-%Y",
    "%Y/%m/%d",
    "%d-%b-%y",
    "%d/%m/%Y",
    "%Y-%d-%m",
]


def clean_value(val: str) -> str:
    if val is None:
        return ""
    val = str(val).strip().strip('"').strip()
    if val.lower() in ("", "unknown", "n/a", "na", "none"):
        return ""
    return val


def parse_currency(val: str):
    val = clean_value(val)
    if not val:
        return None
    # "GH₵5,000" or "GH₵ 5,000"
    val = val.replace("GH₵", "").replace("GHs", "").replace("GHS", "").strip()
    # Check textual numbers first
    vl = val.lower().strip()
    if vl in TEXT_NUMBERS:
        return TEXT_NUMBERS[vl]
    # Remove commas and try numeric
    val = val.replace(",", "")
    try:
        return float(val)
    except ValueError:
        return None


def parse_number(val: str):
    val = clean_value(val)
    if not val:
        return None
    # Check textual numbers
    vl = val.lower().strip()
    if vl in TEXT_NUMBERS:
        return TEXT_NUMBERS[vl]
    val = val.replace(",", "")
    try:
        return float(val)
    except ValueError:
        return None


def parse_profit_margin(val: str):
    val = clean_value(val)
    if not val:
        return None
    # Textual
    vl = val.lower().strip()
    if vl in TEXT_NUMBERS:
        return TEXT_NUMBERS[vl]
    # "25%" → 25.0, "-79.8%" → -79.8
    val = val.replace("%", "").strip()
    try:
        return float(val)
    except ValueError:
        return None


def parse_date(val: str):
    val = clean_value(val)
    if not val:
        return None
    # Try each format
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(val, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    # Try generic month-day-year like "5-Jan-26"
    try:
        # "5-Jan-26" → "%d-%b-%y"
        return datetime.strptime(val, "%d-%b-%y").strftime("%Y-%m-%d")
    except ValueError:
        pass
    # Try "01-15-2026" (already covered above) or "01/15/2026"
    try:
        return datetime.strptime(val, "%m/%d/%Y").strftime("%Y-%m-%d")
    except ValueError:
        pass
    try:
        return datetime.strptime(val, "%d-%m-%Y").strftime("%Y-%m-%d")
    except ValueError:
        pass
    return None


def normalize_category(val: str):
    val = clean_value(val)
    if not val:
        return ""
    vl = val.lower().strip()
    if vl in CATEGORY_MAP:
        return CATEGORY_MAP[vl]
    # Fuzzy match
    for key, mapped in CATEGORY_MAP.items():
        if key in vl or vl in key:
            return mapped
    return val.title()


def normalize_business_type(val: str):
    val = clean_value(val)
    if not val:
        return "General"
    vl = val.lower().strip()
    if vl in BUSINESS_TYPE_MAP:
        return BUSINESS_TYPE_MAP[vl]
    return val.title()


def normalize_network(val: str):
    val = clean_value(val)
    if not val:
        return ""
    vl = val.strip().lower()
    if vl in NETWORK_MAP:
        return NETWORK_MAP[vl]
    return val.strip()


def normalize_risk(val: str):
    val = clean_value(val)
    if not val:
        return ""
    vl = val.strip().lower()
    if vl in RISK_MAP:
        return RISK_MAP[vl]
    return val.strip().title()


def normalize_location(val: str):
    val = clean_value(val)
    if not val:
        return ""
    return val.strip().title()


def is_empty_row(row: dict) -> bool:
    return all(
        not clean_value(row.get(col, ""))
        for col in ["category", "question", "answer", "business_type",
                     "monthly_income", "monthly_expense", "profit",
                     "profit_margin", "date", "network", "location", "risk_level"]
    )


def main():
    if not SRC.exists():
        print(f"Source file not found: {SRC}")
        sys.exit(1)

    rows = []
    with open(SRC, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    print(f"Read {len(rows)} raw rows")

    cleaned = []
    empty_count = 0
    next_id = 1

    for row in rows:
        # Skip completely empty rows
        if is_empty_row(row):
            empty_count += 1
            continue

        category = normalize_category(row.get("category", ""))
        question = clean_value(row.get("question", "")) or ""
        answer = clean_value(row.get("answer", "")) or ""
        business_type = normalize_business_type(row.get("business_type", ""))
        monthly_income = parse_currency(row.get("monthly_income", ""))
        monthly_expense = parse_currency(row.get("monthly_expense", ""))
        profit = parse_number(row.get("profit", ""))
        profit_margin = parse_profit_margin(row.get("profit_margin", ""))
        date = parse_date(row.get("date", "")) or ""
        network = normalize_network(row.get("network", ""))
        location = normalize_location(row.get("location", ""))
        risk_level = normalize_risk(row.get("risk_level", ""))

        # Business logic: derive profit if missing but income & expense available
        if profit is None and monthly_income is not None and monthly_expense is not None:
            profit = round(monthly_income - monthly_expense, 2)

        # Derive profit_margin if missing but profit & income available
        if profit_margin is None and profit is not None and monthly_income is not None and monthly_income != 0:
            profit_margin = round((profit / monthly_income) * 100, 1)

        cleaned.append({
            "id": next_id,
            "category": category,
            "question": question,
            "answer": answer,
            "business_type": business_type,
            "monthly_income": monthly_income,
            "monthly_expense": monthly_expense,
            "profit": profit,
            "profit_margin": profit_margin,
            "date": date,
            "network": network,
            "location": location,
            "risk_level": risk_level,
        })
        next_id += 1

    print(f"Removed {empty_count} empty rows")
    print(f"Reassigned sequential IDs")
    print(f"{len(cleaned)} clean rows ready")

    fieldnames = [
        "id", "category", "question", "answer", "business_type",
        "monthly_income", "monthly_expense", "profit", "profit_margin",
        "date", "network", "location", "risk_level",
    ]

    with open(DST, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned)

    print(f"Saved to {DST}")

    # Quick summary
    cats = {}
    btypes = {}
    for r in cleaned:
        cats[r["category"]] = cats.get(r["category"], 0) + 1
        btypes[r["business_type"]] = btypes.get(r["business_type"], 0) + 1

    print("\nCategory breakdown:")
    for k, v in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"   {k}: {v}")

    print("\nBusiness type breakdown:")
    for k, v in sorted(btypes.items(), key=lambda x: -x[1]):
        print(f"   {k}: {v}")


if __name__ == "__main__":
    main()
