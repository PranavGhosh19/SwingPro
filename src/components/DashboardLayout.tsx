"use client"

import { useUser, useDoc } from "@/firebase"
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
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router, mounted]);

  if (!mounted || authLoading || profileLoading) {
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

        {/* Main Content Hub with Morphing Transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.01 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 pb-40 relative z-10"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        <Navigation />
      </SidebarInset>
    </SidebarProvider>
  );
}
