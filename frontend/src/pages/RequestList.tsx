import { useNavigate } from "react-router-dom"
import { TrashIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests"
import { useRowSelection } from "@/hooks/useRowSelection"
import { deletePurchaseRequest } from "@/lib/api"
import { riskColors, statusColors, statusLabels } from "@/lib/constants"
import { useState } from "react"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export default function RequestList() {
  const navigate = useNavigate()
  const { requests, isLoading, error, reload } = usePurchaseRequests()
  const { selectedIds, toggle, toggleAll, clear, isAllSelected } = useRowSelection(requests)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleBulkDelete() {
    setIsDeleting(true)
    try {
      await Promise.all([...selectedIds].map((id) => deletePurchaseRequest(id)))
      clear()
      await reload()
    } catch {
      // error already shown via reload's error state
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Loading requests...</div>
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Requests</h1>
          <p className="mt-1 text-sm text-gray-500">All procurement requests</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleBulkDelete()}
            >
              <TrashIcon />
              {isDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
            </Button>
          )}
          <Button
            onClick={() => navigate("/requests/new")}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            + New Request
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-500">
            All Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-gray-900">No purchase requests yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Create a request to start the procurement workflow.
              </p>
              <Button
                onClick={() => navigate("/requests/new")}
                className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + New Request
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-gray-500">
                  <TableHead className="w-10 cursor-pointer" onClick={toggleAll}>
                    <Checkbox
                      checked={isAllSelected}
                      className="pointer-events-none"
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell
                      className="cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggle(req.id) }}
                    >
                      <Checkbox
                        checked={selectedIds.has(req.id)}
                        className="pointer-events-none"
                      />
                    </TableCell>
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
