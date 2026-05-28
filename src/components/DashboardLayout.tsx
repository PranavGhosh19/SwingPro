
"use client"

import { useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { UserProfile } from "@/lib/db"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navigation } from "@/components/Navigation"
import { Loader2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { useAuth } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative flex flex-col min-h-svh w-full overflow-hidden bg-transparent">
        {/* Tactical Mobile Header */}
        <header className="p-6 sticky top-0 bg-background/60 backdrop-blur-xl z-50 border-b border-white/5 md:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></h1>
            <Button variant="ghost" size="icon" onClick={() => signOut(auth!)}><Flag className="w-5 h-5 text-muted-foreground" /></Button>
          </div>
        </header>

        {/* Global Tactical Grid Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Main Content Hub */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 pb-40 relative z-10">
          {children}
        </main>

        <Navigation />
      </SidebarInset>
    </SidebarProvider>
  );
}
