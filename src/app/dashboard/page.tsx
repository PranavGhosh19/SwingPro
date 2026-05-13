
"use client"

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { UserProfile } from "@/lib/db"
import { DashboardLayout } from "@/components/DashboardLayout"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { Trophy, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  if (!userProfile) return null;

  const isClub = userProfile.role === 'club';

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {isClub ? (
          <div className="space-y-10">
            <div className="glass-panel p-10 rounded-[2.5rem] space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{userProfile.clubName} <span className="text-primary text-xl">Operations Hub</span></h2>
              <p className="text-muted-foreground">Manage tournaments, member rosters, and scoring approvals.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardMetric icon={Trophy} label="Active Events" value="2" />
              <DashboardMetric icon={Users} label="Total Members" value="482" />
              <DashboardMetric icon={Activity} label="Pending Scores" value="12" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <OperationsCard 
                title="Tournament Management" 
                desc="Create formats, set tee times, and publish live results."
                action="Open Manager"
              />
              <OperationsCard 
                title="Member CRM" 
                desc="Audit handicaps, manage tiers, and view history."
                action="View Roster"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <HandicapDisplay />
            <StatsGrid />
            <HandicapChart />
            <RecentRounds refreshTrigger={0} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function DashboardMetric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-2 border-white/5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-black italic">{value}</p>
    </div>
  )
}

function OperationsCard({ title, desc, action }: { title: string, desc: string, action: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6 group hover:border-primary/20 transition-all">
      <div className="space-y-2">
        <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Button className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
        {action}
      </Button>
    </div>
  )
}
