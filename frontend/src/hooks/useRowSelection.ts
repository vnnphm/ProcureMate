import { useState } from "react"

export function useRowSelection<T extends { id: number }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelectedIds(
      selectedIds.size === items.length ? new Set() : new Set(items.map((item) => item.id))
    )
  }

  function clear() {
    setSelectedIds(new Set())
  }

  return {
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isAllSelected: items.length > 0 && selectedIds.size === items.length,
  }
}
