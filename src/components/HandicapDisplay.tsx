"use client"

import { calculateHandicap, type Round } from "@/lib/db"
import { Trophy, Activity, Target, Zap } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"

export function HandicapDisplay() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roundsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'rounds'),
      orderBy('date', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: roundsData } = useCollection(roundsQuery);
  const rounds = (roundsData || []) as Round[];

  const handicap = useMemo(() => {
    return calculateHandicap(rounds);
  }, [rounds]);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="relative group overflow-hidden rounded-[2.5rem] p-[2px] bg-gradient-to-br from-primary/30 via-transparent to-accent/30 vigilant-scan shadow-2xl"
    >
      <div className="glass-panel rounded-[2.5rem] p-6 md:p-10 h-full relative z-10 overflow-hidden">
        {/* Holographic background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-1000" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 blur-2xl rounded-full opacity-50" />
        
        {/* Tactical HUD accents */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-1 h-3 md:h-4 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 relative z-20">
          <div className="space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3 text-primary animate-pulse" />
              <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.4em]">Live Intelligence Index</p>
            </div>
            
            <div className="flex items-baseline gap-3">
              <motion.h2 
                key={handicap}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black text-foreground leading-none tracking-tighter italic drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              >
                {handicap !== null ? handicap : "--.-"}
              </motion.h2>
              <div className="flex flex-col">
                <span className="text-primary text-xl md:text-2xl font-black italic">HCP</span>
                <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Global Rank: #142</span>
              </div>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5, z: 50 }}
            animate={{ 
              boxShadow: ["0 0 20px hsla(var(--primary), 0.2)", "0 0 40px hsla(var(--primary), 0.5)", "0 0 20px hsla(var(--primary), 0.2)"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-primary/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-primary/30 backdrop-blur-xl relative perspective-1000 self-start md:self-auto"
          >
            <Trophy className="w-10 h-10 md:w-16 md:h-16 text-primary neon-text" />
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-accent p-1.5 md:p-2 rounded-lg md:rounded-xl">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-black" />
            </div>
          </motion.div>
        </div>

        {/* HUD Telemetry Footer */}
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/5">
          <HUDMetric label="Rounds" value={rounds.length} />
          <HUDMetric label="Trend" value="+2.4%" color="text-primary" />
          <HUDMetric label="Status" value="Verified" color="text-accent" />
          <HUDMetric label="Protocol" value="WHS v3.0" />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 -z-10" />
    </motion.div>
  )
}

function HUDMetric({ label, value, color = "text-foreground" }: { label: string, value: any, color?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">{label}</p>
      <p className={`text-xs md:text-sm font-black italic ${color}`}>{value}</p>
    </div>
  )
}