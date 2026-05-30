"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Settings, 
  Plus, 
  LogOut,
  Calculator,
  Flag,
  Users,
  CheckCircle2,
  Activity,
  Cpu
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useAuth, useUser, useDoc } from "@/firebase"
import { signOut } from "firebase/auth"
import { UserProfile } from "@/lib/db"
import { doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"
import { ThemeToggle } from "@/components/ThemeToggle"

export function AppSidebar() {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const isClub = userProfile?.role === 'club';

  const menuItems = isClub ? [
    { href: '/dashboard', icon: Home, label: 'Ops Hub' },
    { href: '/tournaments', icon: Trophy, label: 'Tournaments' },
    { href: '/members', icon: Users, label: 'Member CRM' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ] : [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/performance', icon: BarChart3, label: 'Performance' },
    { href: '/calculator', icon: Calculator, label: 'Course HCP' },
    { href: '/scorecard', icon: CheckCircle2, label: 'Live Scoring' },
    { href: '/compete', icon: Trophy, label: 'Competition' },
    { href: '/add-round', icon: Plus, label: 'Record Round' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <Sidebar className="border-r border-white/5 bg-background/40 backdrop-blur-3xl transition-colors duration-500 overflow-hidden">
      <div className="absolute inset-0 vigilance-grid opacity-10 pointer-events-none" />
      
      <SidebarHeader className="p-8 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
              SwingStats <span className="text-primary neon-text">Pro</span>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                {isClub ? 'Club Ops' : 'Intelligence'} Hub v3.0
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-8 modern-scrollbar relative z-10">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6 px-4">Registry Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`h-12 rounded-2xl px-5 transition-all duration-500 group relative ${
                        isActive 
                        ? 'bg-primary/10 text-primary border-none shadow-[0_0_20px_rgba(var(--primary),0.15)]' 
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground border-none'
                      }`}
                    >
                      <Link href={item.href}>
                        <div className={`absolute left-0 w-1 h-6 bg-primary rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                        <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'}`} />
                        <span className="font-black uppercase text-[10px] tracking-widest ml-4">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-8 border-t border-white/5 bg-muted/20 relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="h-14 rounded-2xl px-5 text-destructive hover:bg-destructive/10 transition-all border-none group"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[10px] tracking-widest ml-4">Terminate Session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}