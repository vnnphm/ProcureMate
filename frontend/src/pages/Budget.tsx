import { CheckIcon, PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useBudgets } from "@/hooks/useBudgets"
import { useState } from "react"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function utilizationColor(pct: number) {
  if (pct >= 90) return "bg-red-500"
  if (pct >= 75) return "bg-orange-500"
  return "bg-green-600"
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-gray-950">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function Budget() {
  const {
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
  } = useBudgets()

  const [showCreateForm, setShowCreateForm] = useState(false)

  const totalBudget = budgets.reduce((s, b) => s + b.total_budget, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const totalRemaining = budgets.reduce((s, b) => s + b.remaining, 0)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Department budget utilization across committed and pending spend.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm((v) => !v)}>
          <PlusIcon />
          Add Budget
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && (
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total Budget" value={currency.format(totalBudget)} />
          <SummaryCard label="Total Spent" value={currency.format(totalSpent)} />
          <SummaryCard label="Total Remaining" value={currency.format(totalRemaining)} />
        </section>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Department Budgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-4 flex flex-wrap gap-2 border border-gray-200 bg-gray-50 p-3">
              <Input
                placeholder="Department"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-40 bg-white"
              />
              <Input
                type="number"
                placeholder="Year"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                className="w-24 bg-white"
              />
              <Input
                type="number"
                placeholder="Total budget"
                value={newTotal}
                onChange={(e) => setNewTotal(e.target.value)}
                className="w-40 bg-white"
              />
              <Button
                disabled={creating || !newDept.trim() || !newTotal}
                onClick={async () => {
                  const ok = await handleCreate()
                  if (ok) setShowCreateForm(false)
                }}
              >
                {creating ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          )}

          {isLoading && <p className="py-4 text-sm text-gray-500">Loading...</p>}
          {!isLoading && budgets.length === 0 && (
            <p className="py-4 text-sm text-gray-500">No budgets set. Add one above.</p>
          )}

          <div className="divide-y divide-gray-200">
            {budgets.map((budget) => (
              <div key={budget.id} className="py-5 first:pt-0 last:pb-0">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-950">{budget.department}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {budget.utilization_pct}% utilized · {budget.fiscal_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === budget.id ? (
                      <>
                        <Input
                          type="number"
                          value={editTotal}
                          onChange={(e) => setEditTotal(e.target.value)}
                          className="w-36 bg-white"
                          autoFocus
                        />
                        <Button size="sm" disabled={saving} onClick={() => void handleSave(budget.id)}>
                          <CheckIcon />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <XIcon />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-950">
                          {currency.format(budget.remaining)} remaining
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(budget.id, budget.total_budget)}
                        >
                          <PencilSimpleIcon />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => void handleDelete(budget.id)}
                        >
                          <TrashIcon />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden bg-gray-100">
                  <div
                    className={`h-2 ${utilizationColor(budget.utilization_pct)}`}
                    style={{ width: `${Math.min(budget.utilization_pct, 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                  <span>Total {currency.format(budget.total_budget)}</span>
                  <span>Spent {currency.format(budget.spent)}</span>
                  <span>Reserved {currency.format(budget.reserved)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
