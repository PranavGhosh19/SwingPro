"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"
import { UserProfile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  ShieldCheck, 
  Activity,
  History,
  MoreVertical,
  Mail
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { useState } from "react"

export default function MembersCRM() {
  const { user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'users'),
      orderBy('fullName', 'asc')
    );
  }, [db]);

  const { data: members, loading } = useCollection<UserProfile>(membersQuery);

  const filteredMembers = members?.filter(m => 
    m.role === 'golfer' && 
    (m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Member <span className="text-primary">CRM</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Club Identity & Performance Registry</p>
          </div>
          <Button className="rounded-xl h-12 bg-primary text-white font-black uppercase text-xs tracking-widest px-8 shadow-xl shadow-primary/20">
            <UserPlus className="w-4 h-4 mr-2" /> Provision Member
          </Button>
        </div>

        {/* Tactical Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or GHIN ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-primary/30"
            />
          </div>
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">WHS Index</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tier</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center"><Activity className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : !filteredMembers || filteredMembers.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-muted-foreground uppercase text-[10px] font-black">No matching records in registry</td></tr>
                ) : (
                  filteredMembers.map((member, i) => (
                    <motion.tr 
                      key={member.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic">
                            {member.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase italic tracking-tighter">{member.fullName}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span className="text-sm font-black italic">4.2</span>
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Verified</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                          PLATINUM
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white/10">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-white/10 rounded-xl">
                              <DropdownMenuItem className="text-[10px] font-black uppercase p-3"><Activity className="w-3 h-3 mr-2" /> Full Analytics</DropdownMenuItem>
                              <DropdownMenuItem className="text-[10px] font-black uppercase p-3"><History className="w-3 h-3 mr-2" /> Match History</DropdownMenuItem>
                              <DropdownMenuItem className="text-[10px] font-black uppercase p-3 text-destructive"><Users className="w-3 h-3 mr-2" /> Revoke Access</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
