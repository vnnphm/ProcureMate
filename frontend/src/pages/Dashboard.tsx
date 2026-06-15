import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests"
import { type PurchaseRequestListItem } from "@/lib/api"
import { riskColors, statusColors, statusLabels } from "@/lib/constants"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function deriveStats(requests: PurchaseRequestListItem[]) {
  const pending = requests.filter((r) => r.status.startsWith("pending_")).length
  const highRisk = requests.filter((r) => r.risk_level === "high").length
  const totalSpend = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.estimated_budget ?? 0), 0)

  return [
    { label: "Total Requests", value: requests.length, format: "number" },
    { label: "Pending Approval", value: pending, format: "number" },
    { label: "High Risk", value: highRisk, format: "number" },
    { label: "Approved Spend", value: totalSpend, format: "currency" },
  ] as const
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { requests, isLoading, error } = usePurchaseRequests()

  const stats = deriveStats(requests)
  const recent = [...requests]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to ProcureMate</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "—" : stat.format === "currency" ? currency.format(stat.value) : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Recent Purchase Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 py-4">{error}</p>}
          {!error && isLoading && <p className="text-sm text-gray-500 py-4">Loading...</p>}
          {!error && !isLoading && requests.length === 0 && (
            <p className="text-sm text-gray-500 py-4">No requests yet.</p>
          )}
          {!error && !isLoading && requests.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="text-gray-500">
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((req) => (
                  <TableRow
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-mono text-xs text-gray-400">
                      REQ-{req.id}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {req.title ?? "Untitled request"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {req.department ?? "Pending"}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {req.estimated_budget === null ? "Pending" : currency.format(req.estimated_budget)}
                    </TableCell>
                    <TableCell>
                      {req.risk_level ? (
                        <Badge variant="outline" className={riskColors[req.risk_level]}>
                          {req.risk_level.charAt(0).toUpperCase() + req.risk_level.slice(1)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[req.status] ?? "border-gray-200 bg-gray-50 text-gray-600"}>
                        {statusLabels[req.status] ?? req.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
