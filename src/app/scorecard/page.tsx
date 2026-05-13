"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { useState } from "react"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, doc, setDoc, query, where } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"
import { Round, Tournament } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Activity,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DigitalScorecard() {
  const { user } = useUser();
  const db = useFirestore();
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  
  // Simulated tournament context - in real app would come from active session
  const activeTournamentId = "temp-tourney-123";
  
  const handleScoreChange = (val: number) => {
    setScores({ ...scores, [currentHole]: val });
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 pb-32">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Live <span className="text-primary">Scorecard</span></h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Tournament Sync Active</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-center">
            <p className="text-[8px] font-black text-muted-foreground uppercase">Total</p>
            <p className="text-xl font-black italic text-primary">{totalScore || "--"}</p>
          </div>
        </div>

        {/* Hole Navigation Protocol */}
        <div className="glass-panel rounded-[2.5rem] p-8 space-y-10 relative overflow-hidden vigilant-scan">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentHole(h => Math.max(1, h - 1))}
              disabled={currentHole === 1}
              className="w-12 h-12 rounded-2xl bg-white/5"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">Hole Status</p>
              <h3 className="text-6xl font-black italic tracking-tighter">{currentHole}</h3>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentHole(h => Math.min(18, h + 1))}
              disabled={currentHole === 18}
              className="w-12 h-12 rounded-2xl bg-white/5"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Par</p>
              <p className="text-lg font-black italic">4</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Index</p>
              <p className="text-lg font-black italic">7</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Log Gross Score</p>
            <div className="flex items-center justify-center gap-4">
              {[3, 4, 5, 6, 7].map(num => (
                <button
                  key={num}
                  onClick={() => handleScoreChange(num)}
                  className={`w-14 h-14 rounded-2xl font-black italic text-xl transition-all ${
                    scores[currentHole] === num 
                    ? 'bg-primary text-white neon-glow' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent" />
              <span className="text-[9px] font-black uppercase text-accent">Marker Required</span>
            </div>
            <Button size="sm" className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest h-8 px-4">
              Verify
            </Button>
          </div>
        </div>

        <Button className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20">
          <Save className="w-5 h-5 mr-2" /> Finalize Card
        </Button>
      </div>
    </DashboardLayout>
  )
}
