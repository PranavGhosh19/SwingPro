
"use client"

import { getRounds, type Round } from "@/lib/db"
import { useEffect, useState } from "react"
import { Activity, Target, Zap, CircleDashed } from "lucide-react"
import { motion } from "framer-motion"

export function StatsGrid() {
  const [stats, setStats] = useState({
    avgGross: 0,
    avgPutts: 0,
    avgGIR: 0,
    avgFairways: 0,
    roundsCount: 0
  });

  useEffect(() => {
    const rounds = getRounds();
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
  }, []);

  const items = [
    { label: "Avg Score", value: stats.avgGross, icon: Activity, color: "text-primary" },
    { label: "Avg Putts", value: stats.avgPutts, icon: CircleDashed, color: "text-accent" },
    { label: "GIR %", value: `${stats.avgGIR}%`, icon: Target, color: "text-primary" },
    { label: "Fwy Hit %", value: `${stats.avgFairways}%`, icon: Zap, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="glass-panel p-5 rounded-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">L{stats.roundsCount}</span>
          </div>
          <p className="text-2xl font-black tracking-tight mb-1 relative z-10">{item.value}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">{item.label}</p>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  )
}
