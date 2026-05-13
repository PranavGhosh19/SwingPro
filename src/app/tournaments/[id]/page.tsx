"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase"
import { doc, updateDoc, collection, query, where } from "firebase/firestore"
import { useParams, useRouter } from "next/navigation"
import { Tournament, Round, UserProfile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Calendar, ArrowLeft, Activity, Flag, Target, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState('overview');

  const tournamentRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'tournaments', id as string);
  }, [db, id]);

  const { data: tournament, loading } = useDoc<Tournament>(tournamentRef);

  // Fetch all rounds associated with this tournament for live scoring
  const roundsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    // In a real app, we'd query across all users or a dedicated tournament_rounds collection
    // For MVP, we'll simulate or track them in a specific path
    return query(collection(db, 'rounds'), where('tournamentId', '==', id));
  }, [db, id]);

  const { data: rounds } = useCollection<Round>(roundsQuery);

  if (loading) return <div className="p-20 text-center"><Activity className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  if (!tournament) return <div className="p-20 text-center">Protocol Not Found</div>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-xl">
              <Link href="/tournaments"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{tournament.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{tournament.format.replace('_', ' ')}</span>
                <span className="text-muted-foreground opacity-20">•</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{tournament.status}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest px-4 hover:bg-primary hover:text-white transition-all">
              Live Feed
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/5 rounded-2xl p-1 h-14 border border-white/5">
            <TabsTrigger value="overview" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Overview</TabsTrigger>
            <TabsTrigger value="roster" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Roster</TabsTrigger>
            <TabsTrigger value="pairings" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Pairings</TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Leaderboard</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent key={activeTab} value={activeTab} className="pt-8 focus-visible:outline-none">
              {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
              {activeTab === 'roster' && <RosterTab tournament={tournament} />}
              {activeTab === 'pairings' && <PairingsTab tournament={tournament} />}
              {activeTab === 'leaderboard' && <LeaderboardTab tournament={tournament} rounds={rounds || []} />}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function OverviewTab({ tournament }: { tournament: Tournament }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <div className="glass-panel rounded-[2.5rem] p-10 space-y-6 border-white/5">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Event Protocol</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {tournament.description || "No official protocol description provided for this event."}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={Target} label="Format" value={tournament.format.toUpperCase()} />
          <InfoCard icon={Flag} label="Tees" value={tournament.teeSelection} />
          <InfoCard icon={Users} label="Field Size" value={`${tournament.participants.length} / ${tournament.maxPlayers}`} />
          <InfoCard icon={Trophy} label="Allowance" value={`${(tournament.allowance * 100).toFixed(0)}%`} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-8 space-y-6 border-white/5 bg-primary/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Timing</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[8px] font-bold text-muted-foreground uppercase">Start Protocol</p>
                <p className="text-sm font-black italic uppercase">{tournament.startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[8px] font-bold text-muted-foreground uppercase">End Protocol</p>
                <p className="text-sm font-black italic uppercase">{tournament.endDate}</p>
              </div>
            </div>
          </div>
          <Button className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest">Update Schedule</Button>
        </div>
      </div>
    </motion.div>
  );
}

function RosterTab({ tournament }: { tournament: Tournament }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">Combatant Roster</h3>
        <Button variant="outline" className="rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest">Export Field</Button>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Player Identity</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Handicap</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tournament.participants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic uppercase text-xs font-bold">Field remains vacant. Awaiting signups.</td>
              </tr>
            ) : (
              tournament.participants.map(p => (
                <tr key={p} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black">PL</div>
                      <div>
                        <p className="text-xs font-bold uppercase">{p.substring(0, 8)}...</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase">Verified ID</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-xs font-black italic text-primary">4.2</td>
                  <td className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase">Registered</td>
                  <td className="px-8 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:text-primary transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function PairingsTab({ tournament }: { tournament: Tournament }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <div className="flex items-center justify-between">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">Battle Pairings</h3>
        <Button className="rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6">Auto-Generate Groups</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { time: "08:00", players: ["A. Smith", "B. Johnson", "C. Davis"] },
          { time: "08:12", players: ["D. Wilson", "E. Brown", "F. Garcia"] }
        ].map((p, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-xl font-black italic text-primary">{p.time}</span>
              <div className="space-y-1">
                {p.players.map(player => (
                  <p key={player} className="text-xs font-bold uppercase">{player}</p>
                ))}
              </div>
            </div>
            <Button variant="ghost" className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary">Edit</Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function LeaderboardTab({ tournament, rounds }: { tournament: Tournament, rounds: Round[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">Live Intelligence Hub</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Real-Time Sync Active</span>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-16">POS</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Player</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">THRU</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">SCORE</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { rank: 1, name: "Jordan Spieth", thru: 14, today: -4, total: -8 },
              { rank: 2, name: "Collin Morikawa", thru: 12, today: -3, total: -5 },
              { rank: 3, name: "Dustin Johnson", thru: 18, today: "E", total: -4 }
            ].map(entry => (
              <tr key={entry.name} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6 font-black italic text-lg text-primary">{entry.rank}</td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black uppercase">{entry.name}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">PRO FLIGHT</p>
                </td>
                <td className="px-8 py-6 text-xs font-bold text-muted-foreground">{entry.thru}</td>
                <td className="px-8 py-6 text-center text-xs font-black">{entry.today}</td>
                <td className="px-8 py-6 text-right font-black italic text-lg text-primary">{entry.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-black italic uppercase tracking-tighter">{value}</p>
    </div>
  );
}
