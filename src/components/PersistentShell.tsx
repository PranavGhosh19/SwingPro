"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navigation } from "@/components/Navigation"
import { useUser } from "@/firebase"
import { useState, useEffect } from "react"

export function PersistentShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If there's no user or not mounted yet, we render children directly to avoid hydration mismatch
  // Navigation elements only appear once client-side mounting is confirmed and session is valid
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
        {mounted && user && <AppSidebar />}
        <div className="relative flex flex-col flex-1 min-w-0 bg-transparent">
          {children}
          {mounted && user && <Navigation />}
        </div>
      </div>
    </SidebarProvider>
  );
}
