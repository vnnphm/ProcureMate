from .enums import PurchaseRequestStatus, RiskLevel
from .schemas import PurchaseRequestUpdate


def assess_purchase_request(extracted: PurchaseRequestUpdate) -> PurchaseRequestUpdate:
    risk_score = 0
    notes: list[str] = []


    if extracted.estimated_budget is None:
        risk_score += 20
        notes.append("Budget is missing and should be confirmed!")
    elif extracted.estimated_budget > 50000:
        risk_score += 40
        notes.append("Request exceeds $50,000 and should have in depth review.")
    elif extracted.estimated_budget > 25000:
        risk_score += 25
        notes.append("Finance approval is required for purchases over $25000.")

    if not extracted.department:
        risk_score += 10
        notes.append("Department cannot be identified properly.")

    if not extracted.needed_by:
        risk_score += 10
        notes.append("Needed-by date could not be identified properly.")

    if not extracted.requirements:
        risk_score += 5
        notes.append("Requirements could not be identified properly.")

    if risk_score >= 50:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 20:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW


    recommendation = " ".join(notes) or "Approve. No major policy or risk concerns have been detected."


    return extracted.model_copy(
        update={
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "policy_flags": notes,
            "status": PurchaseRequestStatus.PENDING_MANAGER,
        }
    )
