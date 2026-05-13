
"use client"

import * as React from "react"
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Settings, 
  Plus, 
  Users,
  LogOut,
  User,
  Activity,
  Calculator
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'performance', icon: BarChart3, label: 'Performance' },
    { id: 'calculator', icon: Calculator, label: 'Course HCP' },
    { id: 'compete', icon: Trophy, label: 'Competition' },
    { id: 'add', icon: Plus, label: 'Record Round' },
    { id: 'settings', icon: Settings, label: 'Player Protocol' },
  ];

  return (
    <Sidebar className="border-r border-white/5 bg-card/40 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">
            SwingStats <span className="text-primary neon-text">Pro</span>
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Elite Analytics v2.0</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 modern-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className={`h-12 rounded-xl px-4 transition-all duration-300 ${
                      activeTab === item.id 
                      ? 'bg-primary/10 text-primary neon-glow border border-primary/20' 
                      : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold uppercase text-xs tracking-widest ml-3">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="h-12 rounded-xl px-4 text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold uppercase text-xs tracking-widest ml-3">Terminate</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
