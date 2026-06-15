import {
  ArrowRightIcon,
  CheckCircleIcon,
  InfoIcon,
  TrashIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { mockRequest } from "@/data/mockRequests"
import { usePurchaseRequestDetail } from "@/hooks/usePurchaseRequestDetail"
import { useRequestDecisionActions } from "@/hooks/useRequestDecisionActions"
import type { PolicyFlag } from "@/types/procurement"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const cardClass = "bg-white"
const sectionTitleClass = "text-sm font-medium uppercase tracking-wide text-gray-500"

const policyStyles: Record<
  PolicyFlag["severity"],
  { icon: typeof InfoIcon; className: string }
> = {
  info: {
    icon: InfoIcon,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  warning: {
    icon: WarningCircleIcon,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  blocker: {
    icon: XCircleIcon,
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

const approvalStyles = {
  complete: "border-green-200 bg-green-50 text-green-700",
  current: "border-amber-200 bg-amber-50 text-amber-700",
  upcoming: "border-gray-200 bg-gray-50 text-gray-600",
}

type ApprovalStatus = keyof typeof approvalStyles

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <CardTitle className={`${sectionTitleClass} ${className}`}>{children}</CardTitle>
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-950">{value}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function isHumanAuditEntry(entry: { actor: string }) {
  return entry.actor.toLowerCase() !== "system"
}

function labelize(value: string | null | undefined, fallback = "Not set") {
  if (!value) return fallback
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { request, setRequest, isLoading, budgetCheck, error } = usePurchaseRequestDetail(id)
  const {
    updatingStatus,
    isDeleting,
    isRequestingInfo,
    infoRequestMessage,
    setInfoRequestMessage,
    infoResponseMessage,
    setInfoResponseMessage,
    statusError,
    handleStatusUpdate,
    handleRequestMoreInfo,
    handleInfoResponse,
    handleDelete,
    toggleRequestingInfo,
    cancelRequestingInfo,
  } = useRequestDecisionActions(request, setRequest)

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">Loading request...</div>
  }

  if (error) {
    return <div className="p-8 text-sm text-red-600">{error}</div>
  }

  if (!request) {
    return <div className="p-8 text-sm text-gray-500">Request not found.</div>
  }

  const recommendedVendor = mockRequest.vendors.find((vendor) => vendor.recommended)
  const requestTitle = request.title ?? "Untitled purchase request"
  const requestStatus = labelize(request.status)
  const requestRisk = labelize(request.risk_level, "Risk pending")
  const requestCreatedAt = new Date(request.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const extractedFields: Array<[string, ReactNode]> = [
    ["Category", request.category ?? "Pending extraction"],
    ["Item", request.item ?? "Pending extraction"],
    ["Quantity", request.quantity],
    ["Department", request.department ?? "Pending extraction"],
    [
      "Budget",
      request.estimated_budget === null
        ? "Pending extraction"
        : currency.format(request.estimated_budget),
    ],
    ["Needed By", request.needed_by ?? "Pending extraction"],
  ]
  const budgetRows: Array<[string, ReactNode]> = budgetCheck?.has_budget
    ? [
        ["Total Budget", currency.format(budgetCheck.total_budget)],
        ["Spent", currency.format(budgetCheck.spent)],
        ["Reserved", currency.format(budgetCheck.reserved)],
        ["Remaining", currency.format(budgetCheck.remaining)],
        ["After This Request", currency.format(budgetCheck.remaining_after)],
      ]
    : []
  const approvalChain: Array<{ role: string; status: ApprovalStatus; note: string }> = request.approval_chain.map((step) => ({
    ...step,
    note:
      step.status === "complete"
        ? "Approval completed for this step."
        : step.status === "current"
          ? "Current approval step for this request."
          : "Required after prior approvals are completed.",
  }))
  const currentApprover = request.approval_chain.find((step) => step.status === "current")

  return (
    <main className="min-h-screen bg-gray-50 text-left text-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">REQ-{request.id}</span>
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                      {requestStatus}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
                      {requestRisk}
                    </Badge>
                  </div>
                  <h1 className="!m-0 !text-2xl !font-semibold !tracking-normal text-gray-950 sm:!text-3xl">
                    {requestTitle}
                  </h1>
                </div>
                <span className="shrink-0 text-sm text-gray-500">{requestCreatedAt}</span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Original Request
                </p>
                <p className="max-w-3xl text-sm leading-6 text-gray-700">{request.raw_text}</p>
              </div>
              <div className="grid gap-3 rounded-none border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                {extractedFields.map(([label, value]) => (
                  <DetailField key={label} label={label} value={value} />
                ))}
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs text-gray-500">Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {(request.requirements.length ? request.requirements : mockRequest.extractedFields.requirements).map((req) => (
                      <Badge key={req} variant="secondary">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <SectionTitle>Current Status</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Next approver</p>
                <p className="text-lg font-semibold text-gray-950">
                  {currentApprover ? labelize(currentApprover.role) : "No pending approvals"}
                </p>
              </div>
              <div className="space-y-3">
                <MetricRow
                  label="Request total"
                  value={
                    request.estimated_budget === null
                      ? "Pending extraction"
                      : currency.format(request.estimated_budget)
                  }
                />
                <MetricRow label="Recommended vendor" value={recommendedVendor?.name} />
                <MetricRow
                  label="Remaining after approval"
                  value={budgetCheck?.has_budget ? currency.format(budgetCheck.remaining_after) : "—"}
                />
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Decision Priority
                </p>
                <p className="text-sm leading-6 text-gray-700">
                  Finance should verify budget impact before Procurement issues the purchase order.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className={cardClass}>
            <CardHeader>
              <SectionTitle>Budget Check</SectionTitle>
            </CardHeader>
            <CardContent>
              {!budgetCheck?.has_budget ? (
                <p className="text-sm text-gray-500">No budget set for this department.</p>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    {budgetCheck.remaining_after >= 0
                      ? <CheckCircleIcon className="size-5 text-green-600" weight="fill" />
                      : <WarningCircleIcon className="size-5 text-red-500" weight="fill" />
                    }
                    <span className={`font-medium ${budgetCheck.remaining_after >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {budgetCheck.remaining_after >= 0 ? "Passed" : "Over Budget"}
                    </span>
                  </div>
                  <div className="mb-4 space-y-2 text-sm">
                    {budgetRows.map(([label, value]) => (
                      <MetricRow key={label} label={label} value={value} />
                    ))}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-none bg-gray-100">
                    <div className="h-2 bg-amber-500" style={{ width: `${budgetCheck.utilization_pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{budgetCheck.utilization_pct}% utilized</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <SectionTitle>Policy Flags</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {request.policy_flags.map((flag) => {
                  const style = policyStyles["warning"]
                  const Icon = style.icon
                  return (
                    <div key={flag} className={`flex gap-3 border p-3 text-sm ${style.className}`}>
                      <Icon className="mt-0.5 size-4 shrink-0" weight="fill" />
                      <p className="leading-5">{flag}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <SectionTitle>Risk Score</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <span className="text-5xl font-bold leading-none text-orange-500">
                    {request.risk_score ?? mockRequest.riskScore}
                  </span>
                  <p className="mt-1 font-medium text-orange-700">{requestRisk}</p>
                </div>
                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                  Review
                </Badge>
              </div>
              <div className="space-y-2">
                {request.policy_flags.map((factor) => (
                  <div key={factor} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                    {factor}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className={cardClass}>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle>Vendor Comparison</SectionTitle>
              {recommendedVendor && (
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  Recommended: {recommendedVendor.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="text-gray-500">
                  <TableHead>Vendor</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequest.vendors.map((vendor) => (
                  <TableRow
                    key={vendor.name}
                    className={vendor.recommended ? "bg-green-50/70 hover:bg-green-50" : ""}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {vendor.recommended && (
                          <CheckCircleIcon className="size-4 shrink-0 text-green-600" weight="fill" />
                        )}
                        <div>
                          <p className="font-medium text-gray-950">{vendor.name}</p>
                          {vendor.scoreRationale && (
                            <p className="mt-1 max-w-md text-xs leading-5 text-green-700">
                              {vendor.scoreRationale}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{currency.format(vendor.unitPrice)}</TableCell>
                    <TableCell className="font-medium">{currency.format(vendor.totalPrice)}</TableCell>
                    <TableCell>{vendor.deliveryDays} days</TableCell>
                    <TableCell>{vendor.reliability}%</TableCell>
                    <TableCell>{vendor.warrantyYears} yr</TableCell>
                    <TableCell>
                      <span className={vendor.recommended ? "font-semibold text-green-700" : "font-medium"}>
                        {vendor.score}/100
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card className={cardClass}>
            <CardHeader>
              <SectionTitle>Approval Chain</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {approvalChain.map((step, index) => (
                  <div key={step.role} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex size-8 items-center justify-center border ${approvalStyles[step.status]}`}>
                        {step.status === "complete" ? (
                          <CheckCircleIcon className="size-4" weight="fill" />
                        ) : (
                          <span className="size-2 rounded-full bg-current" />
                        )}
                      </span>
                      {index < approvalChain.length - 1 && (
                        <span className="hidden h-full min-h-8 w-px bg-gray-200 md:block" />
                      )}
                    </div>
                    <div className="min-w-0 pb-2">
                      <p className="font-medium text-gray-950">{step.role}</p>
                      <p className="mt-2 text-sm leading-5 text-gray-600">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <SectionTitle>Audit Log</SectionTitle>
            </CardHeader>
            <CardContent>
              <ol>
                {request.audit_log.map((entry, index) => {
                  const isHuman = isHumanAuditEntry(entry)
                  return (
                    <li key={entry.id} className="relative pb-5 last:pb-0">
                      {index < request.audit_log.length - 1 && (
                        <span className="absolute bottom-0 left-[5px] top-3 w-px bg-gray-200" />
                      )}
                      <span
                        className={`absolute left-0 top-1.5 size-2.5 rounded-full ring-4 ring-white ${
                          isHuman ? "bg-indigo-500" : "bg-gray-400"
                        }`}
                      />
                      <div className="pl-7">
                        <p className="text-sm font-medium leading-5 text-gray-950">{entry.event}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {entry.actor} - {new Date(entry.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <Card className={`border-l-4 border-l-indigo-500  bg-indigo-50`}>
            <CardHeader>
              <SectionTitle className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-indigo-500" />
                AI Recommendation
              </SectionTitle>
            </CardHeader>
            <CardContent>
              <p className="max-w-5xl text-sm leading-6 text-gray-700">
                {request.recommendation ?? "Analysis pending — check back once AI extraction is complete."}
              </p>
            </CardContent>
          </Card>

          <Card className={`${cardClass} lg:w-[340px]`}>
            <CardHeader>
              <SectionTitle>Decision</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <Button
                  className="bg-green-700 text-white hover:bg-green-800"
                  disabled={updatingStatus !== null || request.status === "approved"}
                  onClick={() => void handleStatusUpdate("approved")}
                >
                  <CheckCircleIcon weight="fill" />
                  {updatingStatus === "approved" ? "Approving..." : "Approve"}
                </Button>
                <Button
                  className="bg-red-700 text-white hover:bg-red-800"
                  disabled={updatingStatus !== null || request.status === "rejected"}
                  onClick={() => void handleStatusUpdate("rejected")}
                  variant="destructive"
                >
                  <XCircleIcon weight="fill" />
                  {updatingStatus === "rejected" ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  disabled={updatingStatus !== null || request.status === "needs_info"}
                  onClick={toggleRequestingInfo}
                  variant="outline"
                >
                  Request More Info
                  <ArrowRightIcon />
                </Button>
              </div>
              {isRequestingInfo && (
                <div className="mt-4 space-y-3 border border-gray-200 bg-gray-50 p-3">
                  <Textarea
                    className="bg-white"
                    disabled={updatingStatus !== null}
                    onChange={(event) => setInfoRequestMessage(event.target.value)}
                    placeholder="What does the requester need to clarify?"
                    value={infoRequestMessage}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      disabled={updatingStatus !== null}
                      onClick={cancelRequestingInfo}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={updatingStatus !== null || !infoRequestMessage.trim()}
                      onClick={() => void handleRequestMoreInfo()}
                      type="button"
                    >
                      {updatingStatus === "needs_info" ? "Sending..." : "Send Request"}
                    </Button>
                  </div>
                </div>
              )}
              {request.info_request_message && (
                <div className="mt-4 space-y-3 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="mb-1 font-medium">More info requested</p>
                  <p className="leading-5">{request.info_request_message}</p>
                  {request.info_response_message ? (
                    <div className="border-t border-amber-200 pt-3">
                      <p className="mb-1 font-medium">Requester response</p>
                      <p className="leading-5">{request.info_response_message}</p>
                    </div>
                  ) : (
                    request.status === "needs_info" && (
                      <div className="space-y-3 border-t border-amber-200 pt-3">
                        <Textarea
                          className="bg-white text-gray-900"
                          disabled={updatingStatus !== null}
                          onChange={(event) => setInfoResponseMessage(event.target.value)}
                          placeholder="Respond with the requested clarification"
                          value={infoResponseMessage}
                        />
                        <div className="flex justify-end">
                          <Button
                            disabled={updatingStatus !== null || !infoResponseMessage.trim()}
                            onClick={() => void handleInfoResponse()}
                            type="button"
                          >
                            {updatingStatus === "info_response" ? "Submitting..." : "Submit Response"}
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              {statusError && <p className="mt-3 text-sm text-red-600">{statusError}</p>}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Button
                  variant="ghost"
                  className="w-full text-red-500 hover:text-red-700"
                  disabled={isDeleting || updatingStatus !== null}
                  onClick={() => void handleDelete(() => navigate("/requests"))}
                >
                  <TrashIcon />
                  {isDeleting ? "Deleting..." : "Delete Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
