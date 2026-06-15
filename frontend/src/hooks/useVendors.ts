import { useEffect, useState } from "react"

import { createVendor, deleteVendor, listVendors, updateVendor, type Vendor } from "@/lib/api"

const emptyDraft = {
  name: "",
  category: "Hardware",
  status: "pending",
  contact_email: "",
  website: "",
  notes: "",
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Vendor>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newDraft, setNewDraft] = useState({ ...emptyDraft })

  async function load() {
    try {
      setVendors(await listVendors())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function handleSave(id: number) {
    try {
      await updateVendor(id, editDraft)
      setEditingId(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save vendor")
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteVendor(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete vendor")
    }
  }

  async function handleCreate() {
    try {
      await createVendor({
        ...newDraft,
        contact_email: newDraft.contact_email || null,
        website: newDraft.website || null,
        notes: newDraft.notes || null,
      })
      setIsAdding(false)
      setNewDraft({ ...emptyDraft })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create vendor")
    }
  }

  function startEdit(vendor: Vendor) {
    setEditingId(vendor.id)
    setEditDraft({ ...vendor })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function startAdd() {
    setIsAdding(true)
  }

  function cancelAdd() {
    setIsAdding(false)
    setNewDraft({ ...emptyDraft })
  }

  return {
    vendors,
    isLoading,
    error,
    editingId,
    editDraft,
    setEditDraft,
    isAdding,
    newDraft,
    setNewDraft,
    handleSave,
    handleDelete,
    handleCreate,
    startEdit,
    cancelEdit,
    startAdd,
    cancelAdd,
  }
}
