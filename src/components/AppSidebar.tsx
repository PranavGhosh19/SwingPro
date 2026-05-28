
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
  CheckCircle2
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
    <Sidebar className="border-r border-white/5 bg-background/40 backdrop-blur-xl">
      <SidebarHeader className="p-6 border-b border-white/5">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">
            SwingStats <span className="text-primary neon-text">Pro</span>
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">
            {isClub ? 'Club Operations' : 'Elite Analytics'} v2.5
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6 modern-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-2">Navigation Protocol</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`h-12 rounded-xl px-4 transition-all duration-300 ${
                        isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]' 
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-black uppercase text-[10px] tracking-widest ml-3">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-white/5 bg-black/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="h-12 rounded-xl px-4 text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-black uppercase text-[10px] tracking-widest ml-3">Terminate</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
