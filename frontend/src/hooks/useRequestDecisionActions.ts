import { useState } from "react"

import {
  approvePurchaseRequest,
  deletePurchaseRequest,
  rejectPurchaseRequest,
  requestMoreInfoPurchaseRequest,
  respondToInfoRequest,
  type PurchaseRequestResponse,
} from "@/lib/api"

type DecisionStatus = "approved" | "rejected" | "needs_info" | "info_response"

export function useRequestDecisionActions(
  request: PurchaseRequestResponse | null,
  onUpdate: (updated: PurchaseRequestResponse) => void,
) {
  const [updatingStatus, setUpdatingStatus] = useState<DecisionStatus | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRequestingInfo, setIsRequestingInfo] = useState(false)
  const [infoRequestMessage, setInfoRequestMessage] = useState("")
  const [infoResponseMessage, setInfoResponseMessage] = useState("")
  const [statusError, setStatusError] = useState<string | null>(null)

  async function handleStatusUpdate(status: "approved" | "rejected") {
    if (!request) { setStatusError("Request is not loaded yet."); return }
    setUpdatingStatus(status)
    setStatusError(null)
    try {
      const updated = status === "approved"
        ? await approvePurchaseRequest(request.id)
        : await rejectPurchaseRequest(request.id)
      onUpdate(updated)
    } catch {
      setStatusError("Could not update request status.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  async function handleRequestMoreInfo() {
    if (!request) { setStatusError("Request is not loaded yet."); return }
    const message = infoRequestMessage.trim()
    if (!message) { setStatusError("Add a note before requesting more info."); return }
    setUpdatingStatus("needs_info")
    setStatusError(null)
    try {
      const updated = await requestMoreInfoPurchaseRequest(request.id, message)
      onUpdate(updated)
      setInfoRequestMessage("")
      setIsRequestingInfo(false)
    } catch {
      setStatusError("Could not request more info.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  async function handleInfoResponse() {
    if (!request) { setStatusError("Request is not loaded yet."); return }
    const message = infoResponseMessage.trim()
    if (!message) { setStatusError("Add a response before submitting."); return }
    setUpdatingStatus("info_response")
    setStatusError(null)
    try {
      const updated = await respondToInfoRequest(request.id, message)
      onUpdate(updated)
      setInfoResponseMessage("")
      setInfoRequestMessage("")
      setIsRequestingInfo(false)
    } catch {
      setStatusError("Could not submit response.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  async function handleDelete(onSuccess: () => void) {
    if (!request) return
    setIsDeleting(true)
    try {
      await deletePurchaseRequest(request.id)
      onSuccess()
    } catch {
      setStatusError("Could not delete request.")
      setIsDeleting(false)
    }
  }

  function toggleRequestingInfo() {
    setIsRequestingInfo((v) => !v)
    setStatusError(null)
  }

  function cancelRequestingInfo() {
    setIsRequestingInfo(false)
    setInfoRequestMessage("")
    setStatusError(null)
  }

  return {
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
  }
}
