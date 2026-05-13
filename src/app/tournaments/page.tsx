"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"
import { Tournament } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus, Trophy, Calendar, Users, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TournamentsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'tournaments'),
      where('clubId', '==', user.uid),
      orderBy('startDate', 'desc')
    );
  }, [db, user]);

  const { data: tournaments, loading } = useCollection<Tournament>(tournamentsQuery);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Tournament <span className="text-primary">Ops</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Strategic Event Management Hub</p>
          </div>
          <Button asChild className="rounded-xl h-12 bg-primary text-white font-black uppercase text-xs tracking-widest px-8 shadow-xl shadow-primary/20">
            <Link href="/tournaments/new"><Plus className="w-4 h-4 mr-2" /> Create Protocol</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Activity className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !tournaments || tournaments.length === 0 ? (
          <div className="glass-panel rounded-[2.5rem] p-20 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-primary opacity-50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase">No Active Protocols</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">Deploy your first tournament to initialize member competition telemetry.</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-white/10 text-xs font-black uppercase tracking-widest">
              <Link href="/tournaments/new">Initialize New Event</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tournaments.map((t, i) => (
              <TournamentCard key={t.id} tournament={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function TournamentCard({ tournament, index }: { tournament: Tournament, index: number }) {
  const statusColors = {
    upcoming: 'bg-accent/20 text-accent border-accent/30',
    active: 'bg-primary/20 text-primary border-primary/30',
    completed: 'bg-white/5 text-muted-foreground border-white/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-panel rounded-[2rem] p-6 border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${statusColors[tournament.status]}`}>
              {tournament.status}
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              {tournament.format.replace('_', ' ')}
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">
              {tournament.title}
            </h4>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{tournament.startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{tournament.participants.length} Players</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
          <Link href={`/tournaments/${tournament.id}`}>
            <ChevronRight className="w-6 h-6" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-7 h-7 rounded-full bg-white/5 border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
              ID
            </div>
          ))}
          {tournament.participants.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-white/5 border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
              +{tournament.participants.length - 3}
            </div>
          )}
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entry Fee: <span className="text-primary">${tournament.entryFee}</span></p>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  );
}
