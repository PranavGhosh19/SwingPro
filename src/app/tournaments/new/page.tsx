"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { useState } from "react"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Tournament, TournamentFormat } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function NewTournamentPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Tournament>>({
    title: '',
    description: '',
    format: 'stroke',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    entryFee: 0,
    maxPlayers: 100,
    allowance: 1.0,
    teeSelection: 'Blue',
    participants: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setLoading(true);

    const tournamentData = {
      ...formData,
      clubId: user.uid,
      status: 'upcoming',
      participants: []
    };

    const tournamentsRef = collection(db, 'tournaments');
    
    addDoc(tournamentsRef, tournamentData)
      .then(() => router.push('/tournaments'))
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: tournamentsRef.path,
          operation: 'create',
          requestResourceData: tournamentData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/tournaments"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">New <span className="text-primary">Protocol</span></h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deploy Tournament Infrastructure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-[2.5rem] p-10 space-y-10 relative overflow-hidden vigilant-scan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tournament Title</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-14 rounded-xl bg-white/5 text-lg font-bold italic" placeholder="e.g. Invitational Series X" />
            </div>
            
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Format Selection</Label>
              <Select value={formData.format} onValueChange={(v: TournamentFormat) => setFormData({...formData, format: v})}>
                <SelectTrigger className="h-14 rounded-xl bg-white/5 text-lg font-bold italic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stroke">Stroke Play</SelectItem>
                  <SelectItem value="stableford">Stableford</SelectItem>
                  <SelectItem value="scramble">Scramble</SelectItem>
                  <SelectItem value="better_ball">Better Ball</SelectItem>
                  <SelectItem value="match">Match Play</SelectItem>
                  <SelectItem value="team_event">Team Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</Label>
              <Input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="h-14 rounded-xl bg-white/5 font-bold" />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Date</Label>
              <Input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="h-14 rounded-xl bg-white/5 font-bold" />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Fee ($)</Label>
              <Input type="number" value={formData.entryFee} onChange={e => setFormData({...formData, entryFee: Number(e.target.value)})} className="h-14 rounded-xl bg-white/5 font-bold" />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Field Size</Label>
              <Input type="number" value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: Number(e.target.value)})} className="h-14 rounded-xl bg-white/5 font-bold" />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">HCP Allowance (e.g. 0.95)</Label>
              <Input type="number" step="0.01" value={formData.allowance} onChange={e => setFormData({...formData, allowance: Number(e.target.value)})} className="h-14 rounded-xl bg-white/5 font-bold" />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Tee Selection</Label>
              <Select value={formData.teeSelection} onValueChange={(v) => setFormData({...formData, teeSelection: v})}>
                <SelectTrigger className="h-14 rounded-xl bg-white/5 text-lg font-bold italic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black">Black (Tournament)</SelectItem>
                  <SelectItem value="Blue">Blue (Expert)</SelectItem>
                  <SelectItem value="White">White (Member)</SelectItem>
                  <SelectItem value="Red">Red (Forward)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Protocol Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px] rounded-2xl bg-white/5" placeholder="Define tournament rules, flights, and prize distribution protocol..." />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <><Trophy className="w-5 h-5 mr-2" /> Deploy Tournament Engine</>}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
