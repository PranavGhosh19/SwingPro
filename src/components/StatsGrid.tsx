
"use client"

import { type Round } from "@/lib/db"
import { useEffect, useState } from "react"
import { Activity, Target, Zap, CircleDashed, Radar } from "lucide-react"
import { motion } from "framer-motion"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"

export function StatsGrid() {
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

  const [stats, setStats] = useState({
    avgGross: 0,
    avgPutts: 0,
    avgGIR: 0,
    avgFairways: 0,
    roundsCount: 0
  });

  useEffect(() => {
    if (rounds.length === 0) return;

    const sum = rounds.reduce((acc, r) => ({
      gross: acc.gross + r.grossScore,
      putts: acc.putts + (r.puttsPerRound || 0),
      gir: acc.gir + (r.girPercentage || 0),
      fwy: acc.fwy + (r.fairwaysHitPercentage || 0),
    }), { gross: 0, putts: 0, gir: 0, fwy: 0 });

    setStats({
      avgGross: Number((sum.gross / rounds.length).toFixed(1)),
      avgPutts: Number((sum.putts / rounds.length).toFixed(1)),
      avgGIR: Number((sum.gir / rounds.length).toFixed(1)),
      avgFairways: Number((sum.fwy / rounds.length).toFixed(1)),
      roundsCount: rounds.length
    });
  }, [rounds]);

  const items = [
    { label: "Avg Score", value: stats.avgGross, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Putts", value: stats.avgPutts, icon: CircleDashed, color: "text-accent", bg: "bg-accent/10" },
    { label: "GIR %", value: `${stats.avgGIR}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Fwy Hit %", value: `${stats.avgFairways}%`, icon: Zap, color: "text-accent", bg: "bg-accent/10" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {items.map((item, i) => (
        <motion.div 
          key={i}
          variants={itemAnim}
          whileHover={{ y: -5, scale: 1.02 }}
          className="glass-panel p-6 rounded-3xl relative overflow-hidden group border-white/5 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`p-2.5 rounded-xl ${item.bg} group-hover:neon-glow transition-all duration-300`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <Radar className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">L{stats.roundsCount}</span>
            </div>
          </div>
          
          <div className="space-y-1 relative z-10">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="text-3xl font-black tracking-tight italic"
            >
              {item.value}
            </motion.p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{item.label}</p>
          </div>

          <div className="absolute bottom-2 right-2 flex gap-0.5 opacity-20 group-hover:opacity-100 transition-opacity">
            {[1, 2, 3].map(j => (
              <div key={j} className="w-1 h-3 bg-white/20 rounded-full" />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </motion.div>
  )
}
