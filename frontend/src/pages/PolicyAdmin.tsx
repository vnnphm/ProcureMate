import { PencilSimpleIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"

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

const approvalThresholds = [
  { condition: "Under $5,000", requirement: "Manager approval" },
  { condition: "$5,000 - $25,000", requirement: "Department head approval" },
  { condition: "Over $25,000", requirement: "Department head and finance approval" },
]

const categoryRules = [
  { condition: "Hardware", requirement: "Approved vendors only" },
  { condition: "Software", requirement: "Security review" },
  { condition: "Contractor Services", requirement: "Legal review" },
]

const vendorRules = [
  { condition: "Unapproved vendor", requirement: "Procurement review" },
]

function PolicyCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {title}
          </CardTitle>
          <Button variant="outline" size="sm">
            <PencilSimpleIcon />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function RuleList({ rules }: { rules: Array<{ condition: string; requirement: string }> }) {
  return (
    <div className="divide-y divide-gray-200">
      {rules.map((rule) => (
        <div key={rule.condition} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-2">
          <p className="font-medium text-gray-950">{rule.condition}</p>
          <p className="text-gray-600">{rule.requirement}</p>
        </div>
      ))}
    </div>
  )
}

export default function PolicyAdmin() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Policy Admin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Read-only procurement rules used for approvals, category checks, and vendor review.
        </p>
      </div>

      <PolicyCard title="Approval Thresholds">
        <Table>
          <TableHeader>
            <TableRow className="text-gray-500">
              <TableHead>Amount Range</TableHead>
              <TableHead>Required Approvers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalThresholds.map((rule) => (
              <TableRow key={rule.condition}>
                <TableCell className="font-medium text-gray-950">{rule.condition}</TableCell>
                <TableCell className="text-gray-600">{rule.requirement}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PolicyCard>

      <PolicyCard title="Category Rules">
        <RuleList rules={categoryRules} />
      </PolicyCard>

      <PolicyCard title="Vendor Rules">
        <RuleList rules={vendorRules} />
      </PolicyCard>
    </div>
  )
}
