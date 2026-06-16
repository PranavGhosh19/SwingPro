"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Round } from "@/lib/db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Target, Activity, Zap, Flag, ShieldCheck } from "lucide-react"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { motion } from "framer-motion"

export function AddRoundForm({ onComplete }: { onComplete: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Round>>({
    date: '',
    courseName: '',
    courseRating: 72.0,
    slopeRating: 113,
    par: 72,
    grossScore: 72,
    missDirection: 'N/A'
  });

  useEffect(() => {
    setMounted(true);
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setLoading(true);

    const roundData = {
      ...formData,
      userId: user.uid,
      strokesGained: {
        tee: Number((Math.random() * 2 - 1).toFixed(1)),
        approach: Number((Math.random() * 2 - 1).toFixed(1)),
        short: Number((Math.random() * 2 - 1).toFixed(1)),
        putting: Number((Math.random() * 2 - 1).toFixed(1)),
      }
    };

    const roundsRef = collection(db, 'users', user.uid, 'rounds');
    
    addDoc(roundsRef, roundData)
      .then(() => {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          xp: increment(100),
          level: increment(1) // Simple level up for MVP
        });
        onComplete();
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: roundsRef.path,
          operation: 'create',
          requestResourceData: roundData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (field: keyof Round, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Log <span className="text-primary">Record</span></h2>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-primary" /> System Active</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-primary" /> Verified Protocol</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-[2.5rem] p-8 md:p-12 space-y-10 relative overflow-hidden vigilant-scan">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-2xl p-1 h-14 border border-white/5 mb-10">
            <TabsTrigger value="basic" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Core Data</TabsTrigger>
            <TabsTrigger value="driving" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Telemetry</TabsTrigger>
            <TabsTrigger value="approach" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-8 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5 text-primary" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Course Registry</Label>
                </div>
                <Input 
                  required 
                  value={formData.courseName} 
                  onChange={e => handleChange('courseName', e.target.value)} 
                  placeholder="e.g. Pebble Beach" 
                  className="h-14 rounded-xl bg-white/5 border-white/10 text-sm font-bold uppercase tracking-tighter"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Protocol</Label>
                </div>
                <Input 
                  required 
                  type="date" 
                  value={formData.date} 
                  onChange={e => handleChange('date', e.target.value)} 
                  className="h-14 rounded-xl bg-white/5 border-white/10 text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <FormMetric label="Gross Score" value={formData.grossScore} onChange={(v) => handleChange('grossScore', v)} />
              <FormMetric label="Course Par" value={formData.par} onChange={(v) => handleChange('par', v)} />
              <FormMetric label="Rating" value={formData.courseRating} onChange={(v) => handleChange('courseRating', v)} step={0.1} />
              <FormMetric label="Slope" value={formData.slopeRating} onChange={(v) => handleChange('slopeRating', v)} />
            </div>
          </TabsContent>

          <TabsContent value="driving" className="space-y-8 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Driving Distance (Yds)</Label>
                </div>
                <Input 
                  type="number" 
                  value={formData.averageDrivingDistance || ''} 
                  onChange={e => handleChange('averageDrivingDistance', Number(e.target.value))} 
                  className="h-14 rounded-xl bg-white/5 border-white/10 text-sm font-bold italic"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-accent" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fairways Hit (%)</Label>
                </div>
                <Input 
                  type="number" 
                  value={formData.fairwaysHitPercentage || ''} 
                  onChange={e => handleChange('fairwaysHitPercentage', Number(e.target.value))} 
                  className="h-14 rounded-xl bg-white/5 border-white/10 text-sm font-bold italic"
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Common Miss Direction</Label>
                </div>
                <Select value={formData.missDirection} onValueChange={v => handleChange('missDirection', v)}>
                  <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/10 font-bold uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="Select protocol direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">STRAIGHT</SelectItem>
                    <SelectItem value="left">LEFT</SelectItem>
                    <SelectItem value="right">RIGHT</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approach" className="space-y-8 focus-visible:outline-none">
            <div className="grid grid-cols-2 gap-6">
              <FormMetric label="GIR %" value={formData.girPercentage} onChange={(v) => handleChange('girPercentage', v)} />
              <FormMetric label="Putts / R" value={formData.puttsPerRound} onChange={(v) => handleChange('puttsPerRound', v)} />
              <FormMetric label="3-Putt %" value={formData.threePuttPercentage} onChange={(v) => handleChange('threePuttPercentage', v)} />
              <FormMetric label="Scramble %" value={formData.scramblingPercentage} onChange={(v) => handleChange('scramblingPercentage', v)} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-6 border-t border-white/5">
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Record Data"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function FormMetric({ label, value, onChange, step = 1 }: { label: string, value: any, onChange: (v: number) => void, step?: number }) {
  return (
    <div className="space-y-3">
      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block truncate">{label}</Label>
      <Input 
        required 
        type="number" 
        step={step}
        value={value || ''} 
        onChange={e => onChange(Number(e.target.value))} 
        className="h-12 rounded-xl bg-white/5 border-white/10 text-sm font-black italic tracking-tighter"
      />
    </div>
  )
}
