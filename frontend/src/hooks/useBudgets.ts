import { useEffect, useState } from "react"

import {
  createBudget,
  deleteBudget,
  listBudgetsSummary,
  updateBudget,
  type DepartmentBudgetSummary,
} from "@/lib/api"

export function useBudgets() {
  const [budgets, setBudgets] = useState<DepartmentBudgetSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newDept, setNewDept] = useState("")
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [newTotal, setNewTotal] = useState("")
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTotal, setEditTotal] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      setBudgets(await listBudgetsSummary())
    } catch {
      setError("Could not load budgets.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function handleCreate() {
    setCreating(true)
    setError(null)
    try {
      await createBudget({ department: newDept.trim(), fiscal_year: newYear, total_budget: Number(newTotal) })
      setNewDept("")
      setNewTotal("")
      await load()
      return true
    } catch {
      setError("Could not create budget.")
      return false
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteBudget(id)
      await load()
    } catch {
      setError("Could not delete budget.")
    }
  }

  async function handleSave(id: number) {
    setSaving(true)
    setError(null)
    try {
      await updateBudget(id, Number(editTotal))
      setEditingId(null)
      await load()
    } catch {
      setError("Could not update budget.")
    } finally {
      setSaving(false)
    }
  }

  function startEdit(id: number, currentTotal: number) {
    setEditingId(id)
    setEditTotal(String(currentTotal))
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return {
    budgets,
    isLoading,
    error,
    newDept,
    setNewDept,
    newYear,
    setNewYear,
    newTotal,
    setNewTotal,
    creating,
    editingId,
    editTotal,
    setEditTotal,
    saving,
    handleCreate,
    handleDelete,
    handleSave,
    startEdit,
    cancelEdit,
  }
}
