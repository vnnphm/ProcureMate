export const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  high: "bg-red-100 text-red-700 border-red-200",
}

export const statusColors: Record<string, string> = {
  needs_info: "bg-amber-100 text-amber-700 border-amber-300",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
}

export const statusLabels: Record<string, string> = {
  pending_finance: "Pending Finance",
  pending_manager: "Pending Manager",
  pending_department_head: "Pending Department Head",
  pending_procurement: "Pending Procurement",
  approved: "Approved",
  rejected: "Rejected",
  needs_info: "Needs Info",
  draft: "Draft",
}
