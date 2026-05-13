
"use client"

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { UserProfile } from "@/lib/db"
import { DashboardLayout } from "@/components/DashboardLayout"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { 
  Trophy, 
  Users, 
  Activity, 
  CloudSun, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Eye, 
  ArrowUpRight,
  Flag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

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
          <div className="space-y-8">
            {/* Command Center Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {userProfile.clubName || "Elite Club"} <span className="text-primary text-xl ml-2">Ops Hub</span>
                </h2>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-primary" /> System Active</span>
                  <span className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-primary" /> 142 Active Members</span>
                </div>
              </div>
              <div className="flex gap-3">
                <WeatherWidget />
              </div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <OpsMetric icon={Flag} label="On Course" value="32" sub="8 Groups" />
              <OpsMetric icon={Clock} label="Pending Approval" value="12" sub="Scorecards" color="accent" />
              <OpsMetric icon={TrendingUp} label="Daily Occupancy" value="84%" sub="+12% vs LW" />
              <OpsMetric icon={Users} label="Check-ins" value="158" sub="Today" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tee Sheet Protocol */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel rounded-[2.5rem] p-8 space-y-6 border-white/5 relative overflow-hidden vigilant-scan">
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Tee Sheet Snapshot</h3>
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:text-primary">Full Schedule</Button>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <TeeTimeRow time="08:30" players={["R. Singh", "A. Kumar"]} status="Checked In" />
                    <TeeTimeRow time="08:42" players={["V. Sharma", "J. Doe", "S. Gupta"]} status="On Tee" highlight />
                    <TeeTimeRow time="08:54" players={["M. Peterson", "K. Lee"]} status="Confirmed" />
                    <TeeTimeRow time="09:06" players={["T. Woods", "R. McIlroy"]} status="Arriving" />
                  </div>
                </div>

                {/* Revenue Snapshot */}
                <div className="glass-panel rounded-[2.5rem] p-8 space-y-4 border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Operations Revenue</h3>
                    <span className="text-primary font-black text-xl">$4,250.00</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="h-full bg-primary neon-glow" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase text-right">Daily Target: $6,000</p>
                </div>
              </div>

              {/* Tournament & Events Column */}
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl p-6 space-y-6 border-white/5 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Active Tournament</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black italic tracking-tighter leading-tight uppercase">Spring Invitational</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stroke Play • Day 2/3</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Leaders</span>
                      <span className="text-xs font-black text-primary">-4</span>
                    </div>
                    <Button className="w-full h-10 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest">
                      Live Results
                    </Button>
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-6 space-y-4 border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Upcoming</h4>
                  </div>
                  <EventItem date="MAR 12" title="Pro-Am Qualifier" />
                  <EventItem date="MAR 15" title="Junior Skills Challenge" />
                </div>
              </div>
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

function OpsMetric({ icon: Icon, label, value, sub, color = "primary" }: { icon: any, label: string, value: string, sub: string, color?: string }) {
  const colorClass = color === "primary" ? "text-primary" : "text-accent";
  const bgClass = color === "primary" ? "bg-primary/10" : "bg-accent/10";

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-2 border-white/5 hover:border-white/20 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bgClass} group-hover:neon-glow transition-all`}>
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black italic">{value}</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{sub}</p>
      </div>
    </div>
  )
}

function TeeTimeRow({ time, players, status, highlight = false }: { time: string, players: string[], status: string, highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent'} transition-all`}>
      <div className="flex items-center gap-6">
        <span className="text-sm font-black italic text-primary">{time}</span>
        <div className="space-y-0.5">
          <p className="text-xs font-bold">{players.join(" • ")}</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{status}</p>
        </div>
      </div>
      <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8 hover:bg-white/10">
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  )
}

function EventItem({ date, title }: { date: string, title: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/10 text-center min-w-[50px]">
        <p className="text-[10px] font-black leading-none">{date.split(' ')[0]}</p>
        <p className="text-sm font-black italic text-primary">{date.split(' ')[1]}</p>
      </div>
      <p className="text-xs font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{title}</p>
    </div>
  )
}

function WeatherWidget() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-4">
      <CloudSun className="w-6 h-6 text-accent" />
      <div>
        <p className="text-xs font-black italic">72°F <span className="text-[8px] text-muted-foreground uppercase ml-1">Mostly Clear</span></p>
        <p className="text-[8px] font-black uppercase tracking-widest text-primary">Wind: 4mph NW</p>
      </div>
    </div>
  )
}
