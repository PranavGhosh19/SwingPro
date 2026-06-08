"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navigation } from "@/components/Navigation"
import { useUser } from "@/firebase"

export function PersistentShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  // If there's no user, we render children directly (Landing Page mode)
  // Sidebar and Navigation stay mounted but invisible/null until needed
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
        {user && <AppSidebar />}
        <div className="relative flex flex-col flex-1 min-w-0 bg-transparent">
          {children}
          {user && <Navigation />}
        </div>
      </div>
    </SidebarProvider>
  );
}
