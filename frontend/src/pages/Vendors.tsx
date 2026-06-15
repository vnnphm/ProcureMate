import { CheckIcon, PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVendors } from "@/hooks/useVendors"

const CATEGORIES = ["Hardware", "Software", "Services", "Office Supplies", "Other"]
const STATUSES = ["approved", "pending", "inactive"]

const statusColors: Record<string, string> = {
  approved: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
}

export default function Vendors() {
  const {
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
  } = useVendors()

  const approvedCount = vendors.filter((v) => v.status === "approved").length

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Loading vendors...</div>

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">{approvedCount} approved vendors</p>
        </div>
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={startAdd}
        >
          <PlusIcon /> Add Vendor
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {isAdding && (
        <Card className="border-indigo-200 bg-indigo-50/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">New Vendor</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Name"
              value={newDraft.name}
              onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
            />
            <Select value={newDraft.category} onValueChange={(v) => setNewDraft((d) => ({ ...d, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newDraft.status} onValueChange={(v) => setNewDraft((d) => ({ ...d, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Contact email"
              value={newDraft.contact_email}
              onChange={(e) => setNewDraft((d) => ({ ...d, contact_email: e.target.value }))}
            />
            <Input
              placeholder="Website"
              value={newDraft.website}
              onChange={(e) => setNewDraft((d) => ({ ...d, website: e.target.value }))}
            />
            <Input
              placeholder="Notes"
              value={newDraft.notes}
              onChange={(e) => setNewDraft((d) => ({ ...d, notes: e.target.value }))}
            />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <Button onClick={() => void handleCreate()}><CheckIcon /> Save</Button>
              <Button variant="ghost" onClick={cancelAdd}><XIcon /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {vendors.length === 0 && !isAdding && (
        <p className="py-10 text-center text-sm text-gray-500">No vendors yet. Add one to get started.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendors.map((vendor) =>
          editingId === vendor.id ? (
            <Card key={vendor.id} className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-700">Editing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Input
                  value={editDraft.name ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                />
                <Select
                  value={editDraft.category ?? vendor.category}
                  onValueChange={(v) => setEditDraft((d) => ({ ...d, category: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={editDraft.status ?? vendor.status}
                  onValueChange={(v) => setEditDraft((d) => ({ ...d, status: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Contact email"
                  value={editDraft.contact_email ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, contact_email: e.target.value }))}
                />
                <Input
                  placeholder="Website"
                  value={editDraft.website ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, website: e.target.value }))}
                />
                <Input
                  placeholder="Notes"
                  value={editDraft.notes ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void handleSave(vendor.id)}><CheckIcon /> Save</Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}><XIcon /> Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={vendor.id} className="bg-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg font-semibold text-gray-950">
                      {vendor.name}
                    </CardTitle>
                    <p className="mt-1 text-xs text-gray-500">{vendor.category}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[vendor.status] ?? ""}>
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {vendor.contact_email && (
                    <p className="truncate text-gray-600">{vendor.contact_email}</p>
                  )}
                  {vendor.website && (
                    <p className="truncate text-gray-600">{vendor.website}</p>
                  )}
                  {vendor.notes && (
                    <p className="italic text-gray-500">{vendor.notes}</p>
                  )}
                </div>
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(vendor)}
                  >
                    <PencilSimpleIcon /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => void handleDelete(vendor.id)}
                  >
                    <TrashIcon /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
