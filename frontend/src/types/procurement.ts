export type Severity = "info" | "warning" | "blocker"
export type RiskLevel = "low" | "medium" | "high"
export type RequestStatus =
  | "draft"
  | "pending_manager"
  | "pending_department_head"
  | "pending_finance"
  | "pending_procurement"
  | "approved"
  | "rejected"

export interface PolicyFlag {
  code: string
  message: string
  severity: Severity
}

export interface VendorQuote {
  name: string
  unitPrice: number
  totalPrice: number
  deliveryDays: number
  reliability: number
  warrantyYears: number
  score: number
  recommended: boolean
  scoreRationale?: string
}

export interface ApprovalStep {
  role: string
  owner: string
  status: "complete" | "current" | "upcoming"
  note: string
}

export interface AuditEntry {
  event: string
  actor: string
  timestamp: string
}

export interface PurchaseRequest {
  id: string
  title: string
  status: RequestStatus
  riskLevel: RiskLevel
  riskScore: number
  riskFactors: string[]
  createdAt: string
  rawText: string
  extractedFields: {
    category: string
    item: string
    quantity: number
    department: string
    estimatedBudget: number
    neededBy: string
    requirements: string[]
  }
  budgetCheck: {
    passed: boolean
    totalBudget: number
    spent: number
    remaining: number
    remainingAfter: number
    utilizationPct: number
  }
  policyFlags: PolicyFlag[]
  vendors: VendorQuote[]
  approvalChain: ApprovalStep[]
  recommendation: string
  auditLog: AuditEntry[]
}
