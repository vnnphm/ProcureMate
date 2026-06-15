const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

let csrfToken: string | null = null
export function setCsrfToken(token: string | null) { csrfToken = token }

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (csrfToken && options.method && options.method !== "GET") {
    headers["X-CSRF-Token"] = csrfToken
  }
  return fetch(url, { ...options, headers, credentials: "include" })
}

export type AuthUser = {
  id: number
  username: string
  email: string
  name: string | null
  role: string
  is_superuser: boolean
}

export async function checkAuth(): Promise<AuthUser | null> {
  const res = await apiFetch(`${API_BASE_URL}/auth/check-auth`)
  const data = await res.json() as { authenticated: boolean; user: AuthUser }
  if (!data.authenticated) return null
  return data.user
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const body = new URLSearchParams({ username, password })
  const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
  if (!res.ok) throw new Error("Invalid username or password")
  const data = await res.json() as { csrf_token: string; user: AuthUser }
  setCsrfToken(data.csrf_token)
  return data.user
}

export async function logout(): Promise<void> {
  await apiFetch(`${API_BASE_URL}/auth/logout`, { method: "POST" })
  setCsrfToken(null)
}

export type CreatePurchaseRequestPayload = {
  raw_text: string
  requester_name?: string
}

export type UpdatePurchaseRequestPayload = Partial<{
  status: string
}>

export type ApprovalStepResponse = {
  role: string
  status: "complete" | "current" | "upcoming"
}

export type PurchaseRequestResponse = {
  id: number
  raw_text: string
  title: string | null
  category: string | null
  item: string | null
  quantity: number
  estimated_budget: number | null
  requirements: string[]
  needed_by: string | null
  department: string | null
  status: string
  risk_level: string | null
  risk_score: number | null
  recommendation: string | null
  policy_flags: string[]
  info_request_message: string | null
  info_response_message: string | null
  approval_chain: ApprovalStepResponse[]
  requester_name: string | null
  created_at: string
  updated_at: string | null
  audit_log: { id: number; event: string; actor: string; created_at: string }[]
}

export type PurchaseRequestListItem = {
  id: number
  title: string | null
  department: string | null
  estimated_budget: number | null
  status: string
  risk_level: string | null
  requester_name: string | null
  created_at: string | null
}

export type BudgetCheck = {
  has_budget: boolean
  total_budget: number
  spent: number
  reserved: number
  remaining: number
  remaining_after: number
  utilization_pct: number
}

export type DepartmentBudgetSummary = {
  id: number
  department: string
  fiscal_year: number
  total_budget: number
  spent: number
  reserved: number
  remaining: number
  utilization_pct: number
}

export async function listBudgetsSummary(): Promise<DepartmentBudgetSummary[]> {
  const res = await apiFetch(`${API_BASE_URL}/budgets/summary`)
  if (!res.ok) throw new Error("Failed to fetch budgets")
  return res.json()
}

export async function createBudget(payload: { department: string; fiscal_year: number; total_budget: number }) {
  const res = await apiFetch(`${API_BASE_URL}/budgets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create budget")
  return res.json()
}

export async function updateBudget(id: number, total_budget: number) {
  const res = await apiFetch(`${API_BASE_URL}/budgets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ total_budget }),
  })
  if (!res.ok) throw new Error("Failed to update budget")
  return res.json()
}

export async function deleteBudget(id: number): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/budgets/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete budget")
}

export type Vendor = {
  id: number
  name: string
  category: string
  status: string
  contact_email: string | null
  website: string | null
  notes: string | null
}

export async function listVendors(): Promise<Vendor[]> {
  const res = await apiFetch(`${API_BASE_URL}/vendors/`)
  if (!res.ok) throw new Error("Failed to fetch vendors")
  return res.json()
}

export async function createVendor(payload: Omit<Vendor, "id">): Promise<Vendor> {
  const res = await apiFetch(`${API_BASE_URL}/vendors/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create vendor (${res.status}): ${text}`)
  }
  return res.json()
}

export async function updateVendor(id: number, payload: Partial<Omit<Vendor, "id">>): Promise<Vendor> {
  const res = await apiFetch(`${API_BASE_URL}/vendors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to update vendor")
  return res.json()
}

export async function deleteVendor(id: number): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/vendors/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete vendor")
}

export async function getBudgetCheck(requestId: number): Promise<BudgetCheck> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${requestId}/budget-check`)
  if (!res.ok) throw new Error("Failed to fetch budget check")
  return res.json()
}

export async function deletePurchaseRequest(id: number): Promise<void> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete request")
}

export async function createPurchaseRequest(payload: CreatePurchaseRequestPayload): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create purchase request.")
  return res.json()
}

export async function getPurchaseRequest(id: string | number): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}`)
  if (!res.ok) throw new Error("Failed to fetch purchase request!")
  return res.json()
}

export async function listPurchaseRequests(): Promise<PurchaseRequestListItem[]> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/`)
  if (!res.ok) throw new Error("Failed to fetch purchase requests!")
  return res.json()
}

export async function updatePurchaseRequest(
  id: string | number,
  payload: UpdatePurchaseRequestPayload,
): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to update purchase request!")
  return res.json()
}

export async function approvePurchaseRequest(id: string | number): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}/approve`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to approve purchase request!")
  return res.json()
}

export async function rejectPurchaseRequest(id: string | number): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}/reject`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to reject purchase request!")
  return res.json()
}

export async function requestMoreInfoPurchaseRequest(
  id: string | number,
  message: string,
): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}/request-more-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error("Failed to request more info for purchase request!")
  return res.json()
}

export async function respondToInfoRequest(
  id: string | number,
  message: string,
): Promise<PurchaseRequestResponse> {
  const res = await apiFetch(`${API_BASE_URL}/purchase-requests/${id}/respond-info-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error("Failed to respond to info request!")
  return res.json()
}
