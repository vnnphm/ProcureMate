import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import logoUrl from "@/assets/procuremate_logo.svg"
import { useAuth } from "@/contexts/AuthContext"
import {
  ClipboardTextIcon,
  CurrencyDollarIcon,
  HouseIcon,
  ListChecksIcon,
  PlusIcon,
  ShieldCheckIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"

import { listPurchaseRequests } from "@/lib/api"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const adminNav = [
  { label: "Budget", to: "/budget", icon: CurrencyDollarIcon },
  { label: "Vendors", to: "/vendors", icon: StorefrontIcon },
  { label: "Policies", to: "/policies", icon: ShieldCheckIcon },
]

function SidebarNavGroup({
  label,
  items,
}: {
  label: string
  items: Array<{
    label: string
    to: string
    icon: typeof HouseIcon
    badge?: number
  }>
}) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon
            const isActive =
              item.to === "/"
                ? pathname === "/"
                : item.to === "/requests"
                  ? pathname === "/requests" || /^\/requests\/(?!new$)/.test(pathname)
                  : pathname === item.to || pathname.startsWith(`${item.to}/`)

            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <NavLink to={item.to}>
                    <Icon weight="regular" />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
                {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    listPurchaseRequests()
      .then((requests) => setPendingCount(requests.filter((r) => r.status.startsWith("pending_")).length))
      .catch(() => {})
  }, [])

  const mainNav = [
    { label: "Dashboard", to: "/", icon: HouseIcon },
    { label: "Requests", to: "/requests", icon: ClipboardTextIcon },
    { label: "New Request", to: "/requests/new", icon: PlusIcon },
    { label: "Approvals", to: "/approvals", icon: ListChecksIcon, badge: pendingCount },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center px-3 py-3">
          <img
            src={logoUrl}
            alt="ProcureMate"
            className="w-full h-auto max-h-40 object-contain group-data-[collapsible=icon]:hidden"
          />
          <img
            src={logoUrl}
            alt="ProcureMate"
            className="h-8 w-8 hidden group-data-[collapsible=icon]:block"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavGroup label="Workspace" items={mainNav} />
        <SidebarSeparator />
        <SidebarNavGroup label="Admin" items={adminNav} />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <p className="text-xs font-medium text-sidebar-foreground">{user?.name ?? user?.username}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
          <button
            onClick={() => void logout()}
            className="mt-1 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
