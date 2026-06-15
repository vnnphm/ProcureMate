import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChatCircleTextIcon,
  XCircleIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests"
import {
  approvePurchaseRequest,
  rejectPurchaseRequest,
  requestMoreInfoPurchaseRequest,
  type PurchaseRequestListItem,
} from "@/lib/api"
import { riskColors, statusLabels } from "@/lib/constants"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function useApprovalCard(requestId: number, onActionComplete: () => void) {
  const [updating, setUpdating] = useState<"approved" | "rejected" | "needs_info" | null>(null)
  const [showInfoForm, setShowInfoForm] = useState(false)
  const [infoMessage, setInfoMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setUpdating("approved")
    setError(null)
    try {
      await approvePurchaseRequest(requestId)
      onActionComplete()
    } catch {
      setError("Couldn't approve request.")
      setUpdating(null)
    }
  }

  async function handleReject() {
    setUpdating("rejected")
    setError(null)
    try {
      await rejectPurchaseRequest(requestId)
      onActionComplete()
    } catch {
      setError("Could not reject request.")
      setUpdating(null)
    }
  }

  async function handleRequestInfo() {
    setUpdating("needs_info")
    setError(null)
    try {
      await requestMoreInfoPurchaseRequest(requestId, infoMessage.trim())
      onActionComplete()
    } catch {
      setError("Could not request more info.")
      setUpdating(null)
    }
  }

  return {
    updating,
    showInfoForm,
    setShowInfoForm,
    infoMessage,
    setInfoMessage,
    error,
    handleApprove,
    handleReject,
    handleRequestInfo,
  }
}

function ApprovalCard({
  request,
  onActionComplete,
}: {
  request: PurchaseRequestListItem
  onActionComplete: () => void
}) {
  const {
    updating,
    showInfoForm,
    setShowInfoForm,
    infoMessage,
    setInfoMessage,
    error,
    handleApprove,
    handleReject,
    handleRequestInfo,
  } = useApprovalCard(request.id, onActionComplete)

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-gray-500">REQ-{request.id}</span>
              {request.risk_level && (
                <Badge variant="outline" className={riskColors[request.risk_level]}>
                  {request.risk_level.charAt(0).toUpperCase() + request.risk_level.slice(1)} Risk
                </Badge>
              )}
              <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600">
                {statusLabels[request.status] ?? request.status}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-950">
              {request.title ?? "Untitled request"}
            </CardTitle>
          </div>
          <div className="text-left text-sm lg:text-right">
            <p className="font-semibold text-gray-950">
              {request.estimated_budget === null ? "Pending" : currency.format(request.estimated_budget)}
            </p>
            <p className="mt-1 text-gray-500">{request.department ?? "—"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Submitted by</p>
            <p className="font-medium text-gray-900">{request.requester_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Submitted</p>
            <p className="font-medium text-gray-900">
              {request.created_at
                ? new Date(request.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        <div className="border-l-4 border-l-indigo-500 bg-indigo-50 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
            AI Recommendation
          </p>
          <p className="text-sm leading-6 text-gray-500 italic">
            View request details for the full AI recommendation.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-green-700 text-white hover:bg-green-800"
              disabled={updating !== null}
              onClick={() => void handleApprove()}
            >
              <CheckCircleIcon weight="fill" />
              {updating === "approved" ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="destructive"
              disabled={updating !== null}
              onClick={() => void handleReject()}
            >
              <XCircleIcon weight="fill" />
              {updating === "rejected" ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              variant="outline"
              disabled={updating !== null}
              onClick={() => setShowInfoForm((v) => !v)}
            >
              <ChatCircleTextIcon />
              Request Info
            </Button>
          </div>
          <Button asChild variant="link" className="justify-start px-0 text-indigo-700">
            <Link to={`/requests/${request.id}`}>
              View Details
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>

        {showInfoForm && (
          <div className="space-y-3 border border-gray-200 bg-gray-50 p-3">
            <Textarea
              placeholder="What does the requester need to clarify?"
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              disabled={updating !== null}
              className="bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={updating !== null}
                onClick={() => { setShowInfoForm(false); setInfoMessage("") }}
              >
                Cancel
              </Button>
              <Button
                disabled={updating !== null || !infoMessage.trim()}
                onClick={() => void handleRequestInfo()}
              >
                {updating === "needs_info" ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  )
}

export default function ApprovalQueue() {
  const { requests: allRequests, isLoading, error, reload } = usePurchaseRequests()
  const requests = allRequests.filter((r) => r.status.startsWith("pending_"))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Approval Queue</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading ? "Loading..." : `${requests.length} requests pending your review`}
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-indigo-200 bg-indigo-50 text-indigo-700">
          Assigned to you
        </Badge>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && requests.length === 0 && (
        <p className="text-sm text-gray-500">No requests pending approval.</p>
      )}

      <div className="grid gap-4">
        {requests.map((request) => (
          <ApprovalCard
            key={request.id}
            request={request}
            onActionComplete={() => void reload()}
          />
        ))}
      </div>
    </div>
  )
}
