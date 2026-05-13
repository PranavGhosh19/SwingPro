"use client"

import { calculateHandicap, type Round } from "@/lib/db"
import { Trophy, Activity } from "lucide-react"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"

export function HandicapDisplay() {
  const { user } = useUser();
  const db = useFirestore();

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

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative group overflow-hidden rounded-[2.5rem] p-[1px] futuristic-gradient vigilant-scan"
    >
      <div className="glass-panel rounded-[2.5rem] p-10 h-full relative z-10 overflow-hidden">
        {/* Animated background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />
        
        <div className="flex items-center justify-between relative z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-primary animate-pulse" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Live Intelligence Index</p>
            </div>
            <div className="flex items-baseline gap-1">
              <motion.h2 
                key={handicap}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-8xl font-black text-foreground leading-none tracking-tighter italic"
              >
                {handicap !== null ? handicap : "--.-"}
              </motion.h2>
              <span className="text-primary text-xl font-black italic">HCP</span>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            animate={{ 
              boxShadow: ["0 0 20px hsla(var(--primary), 0.2)", "0 0 40px hsla(var(--primary), 0.4)", "0 0 20px hsla(var(--primary), 0.2)"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="bg-primary/20 p-6 rounded-3xl border border-primary/30 backdrop-blur-md relative"
          >
            <Trophy className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          </motion.div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-white/5 relative overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Sync Status: Active</span>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10" />
    </motion.div>
  )
}