import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { AppSidebar } from "./AppSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur sm:px-6 lg:px-8">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
