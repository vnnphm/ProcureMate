import logging
import re

from src.infrastructure.ai.client import generate_json, generate_text

from .schemas import PurchaseRequestUpdate

logger = logging.getLogger(__name__)


async def extract_purchase_request(raw_text: str) -> PurchaseRequestUpdate:
    try:
        return await extract_purchase_request_with_ai(raw_text)
    except Exception:
        logger.warning("AI extraction failed; falling back to rules", exc_info=True)
        return extract_purchase_request_with_rules(raw_text)


async def extract_purchase_request_with_ai(raw_text: str) -> PurchaseRequestUpdate:
    data = await generate_json(
        f"""
Extract a purchase request from the text below.

Return only valid JSON with these fields:
title: string or null
category: one of Hardware, Software, Services, Office Supplies, Other, or null
item: string or null
quantity: number or null
estimated_budget: number or null
requirements: array of strings
needed_by: string or null
department: the organizational department (e.g. Engineering, Sales, Finance, Marketing, Legal,
Operations) — not a room, location, or team name. Return null if unclear.

Text:
{raw_text}
"""
    )

    return PurchaseRequestUpdate(
        title=data.get("title"),
        category=normalize_category(data.get("category")),
        item=normalize_item(data.get("item")),
        quantity=data.get("quantity") or 0,
        estimated_budget=data.get("estimated_budget"),
        requirements=data.get("requirements") or [],
        department=normalize_department(data.get("department")),
        needed_by=normalize_needed_by(data.get("needed_by")),
    )


def extract_purchase_request_with_rules(raw_text: str) -> PurchaseRequestUpdate:
    text = raw_text.lower()

    quantity = extract_quantity(text)
    estimated_budget = extract_budget(text)
    category = None
    item = None
    requirements: list[str] = []

    if "laptop" in text:
        category = "Hardware"
        item = "Laptop"
    elif "software" in text or "subscription" in text:
        category = "Software"
    elif "contractor" in text or "consultant" in text:
        category = "Services"

    if "16gb" in text:
        requirements.append("16GB RAM")
    if "512gb" in text:
        requirements.append("512GB SSD")
    if "warranty" in text:
        requirements.append("Business Warranty")

    return PurchaseRequestUpdate(
        title=build_title(quantity, item, category),
        category=normalize_category(category),
        item=item,
        quantity=quantity or 0,
        estimated_budget=estimated_budget,
        requirements=requirements,
        department=extract_department(text),
        needed_by=extract_needed_by(raw_text),
    )


def normalize_category(category: str | None) -> str | None:
    if not category:
        return None

    category_key = category.strip().lower()
    category_map = {
        "hardware": "Hardware",
        "electronics": "Hardware",
        "laptop": "Hardware",
        "laptops": "Hardware",
        "computer": "Hardware",
        "computers": "Hardware",
        "software": "Software",
        "subscription": "Software",
        "saas": "Software",
        "services": "Services",
        "service": "Services",
        "contractor": "Services",
        "consulting": "Services",
        "consultant": "Services",
        "office supplies": "Office Supplies",
        "supplies": "Office Supplies",
    }

    return category_map.get(category_key, "Other")


def extract_quantity(text: str) -> int | None:
    match = re.search(r"\b(\d+)\s+(?:laptops?|licenses?|chairs?|desks?)\b", text)
    if not match:
        return None
    return int(match.group(1))


def extract_budget(text: str) -> float | None:
    match = re.search(r"\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?", text)
    if not match:
        match = re.search(r"budget(?:\s+is|\s+around)?\s+(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?", text)
    if not match:
        return None
    return float(match.group(1).replace(",", ""))


def extract_department(text: str) -> str | None:
    departments = ["engineering", "sales", "operations", "legal", "marketing"]
    for department in departments:
        if department in text:
            return department.title()
    return None


def extract_needed_by(text: str) -> str | None:
    match = re.search(
        r"(?:before|by|needed by|delivery before)\s+([A-Z][a-z]+ \d{1,2})",
        text,
    )
    if not match:
        return None
    return match.group(1)


def build_title(quantity: int | None, item: str | None, category: str | None) -> str | None:
    if quantity and item:
        return f"{item} Request ({quantity})"
    if item:
        return f"{item} Request"
    if category:
        return f"{category} Purchase Request"
    return "New Purchase Request"


def normalize_item(item: str | None) -> str | None:
    if not item:
        return None
    return item.strip().title()


def normalize_department(department: str | None) -> str | None:
    if not department:
        return None
    return department.strip().title()


def normalize_needed_by(needed_by: str | None) -> str | None:
    if not needed_by:
        return None

    value = needed_by.strip()
    value_lower = value.lower()
    for prefix in ("before ", "by "):
        if value_lower.startswith(prefix):
            return value[len(prefix):].strip()

    return value


async def generate_recommendation(raw_text: str, assessed: PurchaseRequestUpdate) -> str:
    prompt = f"""
You are a procurement analyst. Review this purchase request and give a concise recommendation.

Request: {raw_text}

Extracted details:
- Title: {assessed.title}
- Category: {assessed.category}
- Item: {assessed.item}, Qty: {assessed.quantity}
- Budget: ${assessed.estimated_budget}
- Department: {assessed.department}
- Needed By: {assessed.needed_by}
- Requirements: {', '.join(assessed.requirements or [])}
- Risk Level: {assessed.risk_level}, Score: {assessed.risk_score}
- Policy Flags: {', '.join(assessed.policy_flags or [])}

Write 2-3 sentences. Cover: approve/reject/needs more info, key risks, and any conditions or
actions needed. Be direct and professional.
"""
    try:
        return await generate_text(prompt)
    except Exception:
        logger.warning("Failed to generate AI recommendation", exc_info=True)
        return assessed.recommendation or "Analysis pending."
