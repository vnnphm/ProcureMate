import { useEffect, useState } from "react"

import {
  getBudgetCheck,
  getPurchaseRequest,
  type BudgetCheck,
  type PurchaseRequestResponse,
} from "@/lib/api"

export function usePurchaseRequestDetail(id: string | undefined) {
  const [request, setRequest] = useState<PurchaseRequestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [budgetCheck, setBudgetCheck] = useState<BudgetCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      setError("Missing request ID.")
      return
    }

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPurchaseRequest(id!)
        setRequest(data)
        getBudgetCheck(Number(id)).then(setBudgetCheck).catch(() => {})
      } catch {
        setError("Could not load request!")
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [id])

  return { request, setRequest, isLoading, budgetCheck, error }
}
