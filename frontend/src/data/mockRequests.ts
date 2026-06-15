import type { PurchaseRequest } from "@/types/procurement"

export const mockRequest: PurchaseRequest = {
  id: "REQ-001",
  title: "Laptops for Engineering New Hires",
  status: "pending_finance",
  riskLevel: "medium",
  riskScore: 58,
  riskFactors: ["High Cost", "Low Remaining Budget", "Tight Deadline"],
  createdAt: "June 1, 2025",
  rawText:
    "We need 30 laptops for new engineering hires starting next month. Budget is around $42,000. Need 16GB RAM, 512GB SSD, business warranty, and delivery before July 15.",
  extractedFields: {
    category: "Hardware",
    item: "Laptops",
    quantity: 30,
    department: "Engineering",
    estimatedBudget: 42000,
    neededBy: "July 15, 2025",
    requirements: ["16GB RAM", "512GB SSD", "Business Warranty"],
  },
  budgetCheck: {
    passed: true,
    totalBudget: 120000,
    spent: 72000,
    remaining: 48000,
    remainingAfter: 6000,
    utilizationPct: 87,
  },
  policyFlags: [
    {
      code: "finance_review_required",
      message: "Finance approval required for purchases over $25,000",
      severity: "info",
    },
    {
      code: "tight_deadline",
      message: "Delivery deadline is within 14 days",
      severity: "warning",
    },
  ],
  vendors: [
    {
      name: "Lenovo Direct",
      unitPrice: 1250,
      totalPrice: 37500,
      deliveryDays: 8,
      reliability: 92,
      warrantyYears: 3,
      score: 88,
      recommended: true,
      scoreRationale:
        "Fastest delivery, 3-year warranty, and strong reliability."
    },
    {
      name: "Dell Business",
      unitPrice: 1320,
      totalPrice: 39600,
      deliveryDays: 12,
      reliability: 95,
      warrantyYears: 3,
      score: 82,
      recommended: false,
    },
    {
      name: "HP Enterprise",
      unitPrice: 1180,
      totalPrice: 35400,
      deliveryDays: 18,
      reliability: 87,
      warrantyYears: 1,
      score: 71,
      recommended: false,
    },
  ],
  approvalChain: [
    {
      role: "Department Manager",
      owner: "Maya Chen",
      status: "complete",
      note: "Confirmed headcount plan and equipment need.",
    },
    {
      role: "Finance",
      owner: "Jordan Patel",
      status: "current",
      note: "Required because request exceeds the $25,000 policy threshold.",
    },
    {
      role: "Procurement",
      owner: "Avery Brooks",
      status: "upcoming",
      note: "Will issue the purchase order after finance approval.",
    },
  ],
  auditLog: [
  { event: "Routed to Finance", actor: "system", timestamp: "June 1, 10:45am" },
  { event: "Approved by Department Head", actor: "Sarah Chen", timestamp: "June 1, 10:45am" },
  { event: "Routed to Department Head", actor: "system", timestamp: "June 1, 9:13am" },
  { event: "Budget check passed", actor: "system", timestamp: "June 1, 9:12am" },
  { event: "AI extraction completed", actor: "system", timestamp: "June 1, 9:12am" },
  { event: "Request submitted", actor: "John Smith", timestamp: "June 1, 9:12am" },
],
  recommendation: "Conditionally approve. The request fits within Engineering's remaining quarterly budget of $48,000, but will leave only $6,000 remaining. Finance approval is required as the amount exceeds the $25,000 threshold. Lenovo Direct is recommended based on delivery speed, warranty coverage, and composite score. Confirm delivery timeline before approving.",
}
