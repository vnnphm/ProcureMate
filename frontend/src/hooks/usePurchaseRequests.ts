import { useEffect, useState } from "react"

import { listPurchaseRequests, type PurchaseRequestListItem } from "@/lib/api"

export function usePurchaseRequests() {
  const [requests, setRequests] = useState<PurchaseRequestListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    setIsLoading(true)
    setError(null)
    try {
      setRequests(await listPurchaseRequests())
    } catch {
      setError("Could not load requests.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void reload() }, [])

  return { requests, isLoading, error, reload }
}
