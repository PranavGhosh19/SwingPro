
"use client"

import { calculateHandicap, getRounds } from "@/lib/db"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function HandicapDisplay() {
  const [handicap, setHandicap] = useState<number | null>(null);

  useEffect(() => {
    const rounds = getRounds();
    setHandicap(calculateHandicap(rounds));
  }, []);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group overflow-hidden rounded-[2rem] p-[1px] futuristic-gradient"
    >
      <div className="glass-panel rounded-[2rem] p-8 h-full relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Core Handicap Index</p>
            <motion.h2 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-7xl font-black text-foreground leading-none tracking-tighter italic"
            >
              {handicap !== null ? handicap : "--.-"}
            </motion.h2>
          </div>
          <motion.div 
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="bg-primary/20 p-5 rounded-2xl border border-primary/30 neon-glow"
          >
            <Trophy className="w-10 h-10 text-primary" />
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
    </motion.div>
  )
}
