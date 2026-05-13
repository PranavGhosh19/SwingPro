"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"
import { calculateHandicap, type Round } from "@/lib/db"
import { Calculator, Target, Info, ShieldCheck, Activity } from "lucide-react"

export function CourseCalculator() {
  const { user } = useUser()
  const db = useFirestore()

  // Input states
  const [handicapIndex, setHandicapIndex] = useState<number>(0)
  const [slope, setSlope] = useState<number>(113)
  const [courseRating, setCourseRating] = useState<number>(72.0)
  const [par, setPar] = useState<number>(72)
  const [courseHandicap, setCourseHandicap] = useState<number>(0)

  // Fetch rounds to calculate current index automatically
  const roundsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'rounds'),
      orderBy('date', 'desc'),
      limit(20)
    )
  }, [db, user])

  const { data: roundsData } = useCollection(roundsQuery)
  
  useEffect(() => {
    if (roundsData) {
      const hcp = calculateHandicap(roundsData as Round[])
      if (hcp !== null) setHandicapIndex(hcp)
    }
  }, [roundsData])

  useEffect(() => {
    // Formula: (Handicap Index * (Slope Rating / 113)) + (Course Rating - Par)
    const result = (handicapIndex * (slope / 113)) + (courseRating - par)
    setCourseHandicap(Math.round(result))
  }, [handicapIndex, slope, courseRating, par])

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-foreground">Stroke Calculator</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Handicap Optimization Protocol</p>
        </div>
        <div className="bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30 neon-glow flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Calculator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden vigilant-scan"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground leading-none">Handicap Index</Label>
                </div>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={handicapIndex} 
                  onChange={e => setHandicapIndex(Number(e.target.value))}
                  className="h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-black italic tracking-tighter focus:ring-primary/50 transition-all"
                />
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest italic ml-1">Auto-sync with history</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground leading-none">Course Slope</Label>
                </div>
                <Input 
                  type="number" 
                  value={slope} 
                  onChange={e => setSlope(Number(e.target.value))}
                  className="h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-black italic tracking-tighter transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground leading-none">Course Rating</Label>
                </div>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={courseRating} 
                  onChange={e => setCourseRating(Number(e.target.value))}
                  className="h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-black italic tracking-tighter transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-accent" />
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground leading-none">Course Par</Label>
                </div>
                <Input 
                  type="number" 
                  value={par} 
                  onChange={e => setPar(Number(e.target.value))}
                  className="h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-black italic tracking-tighter transition-all"
                />
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
          </motion.div>

          <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-primary shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-tight">Calculation Protocol</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Playing strokes are determined using standard WHS formulas: Index × (Slope / 113) + (Rating - Par).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-center text-center relative vigilant-scan group border-primary/20"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-20 group-hover:opacity-40 transition-opacity" />
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Target Strokes</p>
            
            <div className="relative">
              <motion.h1 
                key={courseHandicap}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[10rem] font-black text-foreground leading-none tracking-tighter italic drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              >
                {courseHandicap}
              </motion.h1>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-2 h-0.5 bg-primary/40 rounded-full" />
                ))}
              </div>
            </div>
            
            <p className="text-sm font-black italic uppercase text-muted-foreground mt-8">Allowed on Course</p>
            
            <div className="mt-10 pt-10 border-t border-white/5 w-full space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Precision Rating</span>
                <span className="text-primary">99.9%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '99.9%' }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}