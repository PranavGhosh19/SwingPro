"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, 
  Target, 
  Users, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Flag, 
  Loader2,
  Building2,
  User as UserIcon,
  Activity,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Globe,
  MessageSquare,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  LineChart,
  TrendingDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/lib/db"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { ThemeToggle } from "@/components/ThemeToggle"

export default function LandingPage() {
  const { user, loading: authLoading } = useUser();
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'onboarding' | null>(null);
  const [authRole, setAuthRole] = useState<'golfer' | 'club'>('golfer');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clubName, setClubName] = useState('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (user && userProfile && mounted) {
      router.push('/dashboard');
    }
  }, [user, userProfile, router, mounted]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials. Please verify your access key.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAuthView('onboarding');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not initialize account.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setLoading(true);
    const newUser: UserProfile = { 
      role: authRole,
      email: user.email!, 
      fullName: authRole === 'club' ? 'Club Admin' : fullName,
      clubName: authRole === 'club' ? clubName : '',
      xp: 0,
      level: 1,
      badges: [],
      metrics: { longestDrive: 0, totalBirdies: 0, bestRound: 0 }
    };
    const docRef = doc(db, 'users', user.uid);
    setDoc(docRef, newUser)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newUser,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .then(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  };

  if (!mounted || authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (authView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
        <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>
        <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(22,88,142,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(22,88,142,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <AnimatePresence mode="wait">
          {authView === 'signin' ? (
            <motion.div key="in" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">SwingStats <span className="text-primary">Pro</span></h1>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Authorize Entry</p>
              </div>
              <Tabs defaultValue="golfer" onValueChange={(v) => setAuthRole(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 h-12 rounded-xl mb-4">
                  <TabsTrigger value="golfer" className="font-bold text-[10px] uppercase tracking-widest"><UserIcon className="w-3 h-3 mr-2" /> Golfer</TabsTrigger>
                  <TabsTrigger value="club" className="font-bold text-[10px] uppercase tracking-widest"><Building2 className="w-3 h-3 mr-2" /> Club</TabsTrigger>
                </TabsList>
              </Tabs>
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-xl bg-white/5 border-white/10" />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-xl bg-white/5 border-white/10" />
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">{loading ? <Loader2 className="animate-spin" /> : "Access System"}</Button>
              </form>
              <div className="flex flex-col gap-2">
                <button onClick={() => setAuthView('signup')} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Create New Identity</button>
                <button onClick={() => setAuthView(null)} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Back to Intel Hub</button>
              </div>
            </motion.div>
          ) : authView === 'signup' ? (
             <motion.div key="up" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Deploy <span className="text-primary">Identity</span></h1>
              </div>
              <Tabs defaultValue="golfer" onValueChange={(v) => setAuthRole(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 h-12 rounded-xl mb-4">
                  <TabsTrigger value="golfer" className="font-bold text-[10px] uppercase tracking-widest">Golfer</TabsTrigger>
                  <TabsTrigger value="club" className="font-bold text-[10px] uppercase tracking-widest">Club</TabsTrigger>
                </TabsList>
              </Tabs>
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-xl bg-white/5 border-white/10" />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-xl bg-white/5 border-white/10" />
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Initialize Profile</Button>
              </form>
              <button onClick={() => setAuthView('signin')} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Return to Access Portal</button>
            </motion.div>
          ) : (
            <motion.div key="on" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Final <span className="text-primary">Signature</span></h1>
              </div>
              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                {authRole === 'golfer' ? (
                  <Input placeholder="Full Legal Name" value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 rounded-xl bg-white/5 border-white/10" />
                ) : (
                  <Input placeholder="Official Club Name" value={clubName} onChange={e => setClubName(e.target.value)} className="h-14 rounded-xl bg-white/5 border-white/10" />
                )}
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Finalize Deployment</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-body">
      <header className="fixed top-0 w-full z-50 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-4 rounded-full backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <span className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavAnchor href="#ecosystem">Ecosystem</NavAnchor>
            <NavAnchor href="#telemetry">Telemetry</NavAnchor>
            <NavAnchor href="#vision">Vision</NavAnchor>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" className="rounded-full px-8 border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-primary/20 hover:text-primary transition-all" onClick={() => setAuthView('signin')}>Enter Platform</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(129,196,255,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-8">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Layer V3.0</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] mb-8">
              The Operating System <br />
              <span className="text-primary">for Modern Golf.</span>
            </h1>
            <p className="mt-8 text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
              From academies and coaches to tournaments and players—run, track, and improve every aspect of golf from one platform.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4 perspective-1000">
             <VisualizationStep icon={Trophy} label="Tournament Score" delay={0.1} />
             <VisualizationConnector delay={0.2} />
             <VisualizationStep icon={UserIcon} label="Player Profile" delay={0.3} />
             <VisualizationConnector delay={0.4} />
             <VisualizationStep icon={BarChart3} label="Performance Analytics" delay={0.5} />
             <VisualizationConnector delay={0.6} className="hidden md:flex" />
             <VisualizationStep icon={Cpu} label="AI Coaching" delay={0.7} />
             <VisualizationConnector delay={0.8} className="hidden md:flex" />
             <VisualizationStep icon={ShieldCheck} label="Handicap Progression" delay={0.9} />
             <VisualizationConnector delay={1.0} className="hidden md:flex" />
             <VisualizationStep icon={Globe} label="National Rankings" delay={1.1} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary neon-text">Every Shot Becomes Intelligence.</div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all group border-none" onClick={() => setAuthView('signup')}>
              Book a Demo <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="ghost" className="h-16 px-12 rounded-2xl border border-border font-black uppercase tracking-[0.2em] hover:bg-muted transition-colors">
              Watch 2-Minute Tour
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-y border-border bg-muted/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-muted-foreground mb-12">Trusted By Elite Organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="font-black italic text-xl uppercase tracking-tighter">Academies</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Coaches</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Tournament Directors</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Junior Programs</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Golfers</div>
          </div>
        </div>
      </section>

      {/* Unified Ecosystem */}
      <section className="py-32 px-6" id="ecosystem">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Unified Ecosystem</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">One Platform. <br /> <span className="text-primary">Every Stakeholder.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <EcosystemCard icon={Building2} title="Academy OS" desc="Manage students, schedules, payments, attendance, memberships, and performance." />
            <EcosystemCard icon={Trophy} title="Tournament OS" desc="Create tournaments, generate tee sheets, capture scores, and run live leaderboards." />
            <EcosystemCard icon={BarChart3} title="Player Intelligence" desc="Track every round, every lesson, every practice session." />
            <EcosystemCard icon={GraduationCap} title="Coach Portal" desc="Deliver video feedback, assign drills, and monitor progress." />
            <EcosystemCard icon={Sparkles} title="AI Insights" desc="Identify weaknesses and recommend what to practice next." />
            <EcosystemCard icon={Layers} title="Intelligence Layer" desc="The central hub connecting coaching, events, and player growth." />
          </div>
        </div>
      </section>

      {/* Real-Time Telemetry */}
      <section className="py-32 px-6 bg-muted/10" id="telemetry">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Real-Time Telemetry</h3>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Watch Tournament <br /> <span className="text-primary">In Real Time.</span></h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">No spreadsheets. No manual updates. No waiting.</p>
            </div>
            <div className="space-y-4">
              <TelemetryFeature icon={CheckCircle2} label="Automated Flight Ranking" />
              <TelemetryFeature icon={CheckCircle2} label="Live WHS Index Synchronization" />
              <TelemetryFeature icon={CheckCircle2} label="Instant Result Publishing" />
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel rounded-[2.5rem] p-8 space-y-6 relative z-10 vigilant-scan overflow-hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Live Feed • Stroke Play</h4>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                   <span className="text-[8px] font-black uppercase text-primary">Syncing...</span>
                </div>
              </div>
              <div className="space-y-4">
                <FeedItem score="-4" name="R. Singh" status="Score Submitted" highlight />
                <FeedItem score="-2" name="A. Kumar" status="On Tee" />
                <FeedItem score="+1" name="M. Peterson" status="In Fairway" />
              </div>
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full scale-90" />
          </div>
        </div>
      </section>

      {/* The Data Moat */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
             <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">The Data Moat</h3>
             <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">The More Golf You Play, <br /> <span className="text-primary">The Smarter It Gets.</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
             <div className="space-y-6">
                <MoatCard icon={GraduationCap} title="Lessons" color="primary" />
                <MoatCard icon={Target} title="Practice" color="accent" />
                <MoatCard icon={Trophy} title="Tournaments" color="primary" />
                <MoatCard icon={Flag} title="Rounds" color="accent" />
             </div>
             <div className="lg:col-span-2 glass-panel rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h4 className="text-xl font-black uppercase italic tracking-tighter">Intelligence Report</h4>
                   </div>
                   <div className="grid grid-cols-3 gap-6">
                      <AnalystStat label="Driving Accuracy" val="42%" color="primary" />
                      <AnalystStat label="Putting Cost" val="+3.1" color="destructive" />
                      <AnalystStat label="Readiness" val="74%" color="accent" />
                   </div>
                   <div className="space-y-3 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommended Practice</p>
                      <ul className="space-y-2">
                         <li className="flex items-center gap-2 text-xs font-bold uppercase"><Zap className="w-3 h-3 text-primary" /> Lag Putting Drills</li>
                         <li className="flex items-center gap-2 text-xs font-bold uppercase"><Zap className="w-3 h-3 text-primary" /> Fairway Accuracy Session</li>
                         <li className="flex items-center gap-2 text-xs font-bold uppercase"><Zap className="w-3 h-3 text-primary" /> Bunker Recovery</li>
                      </ul>
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-0" />
             </div>
          </div>
          <p className="text-center text-lg text-muted-foreground font-medium max-w-3xl mx-auto">
             Resulting in better coaching, better player development, and better tournament management.
          </p>
        </div>
      </section>

      {/* Executive Efficiency */}
      <section className="py-32 px-6 border-y border-border">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-4">
               <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Executive Efficiency</h3>
               <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Grow Your Academy Without <br /> <span className="text-primary">Growing Admin Work.</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="glass-panel rounded-[2.5rem] p-10 space-y-8 bg-destructive/5">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter text-destructive">Traditional Workflow</h4>
                  <div className="space-y-4">
                     <WorkflowItem icon={ClipboardList} label="Scattered Excel Sheets" />
                     <WorkflowItem icon={MessageSquare} label="Fragmented WhatsApp Groups" />
                     <WorkflowItem icon={Flag} label="Manual PDF Reports" />
                     <WorkflowItem icon={CheckCircle2} label="Paper Scoring & Attendance" />
                  </div>
               </div>
               <div className="glass-panel rounded-[2.5rem] p-10 space-y-8 bg-primary/5 relative vigilant-scan overflow-hidden">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter text-primary">Intelligence Hub Workflow</h4>
                  <div className="space-y-4">
                     <WorkflowItem icon={Layers} label="Single Integrated Platform" />
                     <WorkflowItem icon={LineChart} label="Real-Time Performance Tracking" />
                     <WorkflowItem icon={Users} label="Automated Member Reporting" />
                     <WorkflowItem icon={Trophy} label="Unified Tournament Engine" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Global Registry */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="space-y-4">
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Global Registry</h3>
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Build Your Golf Resume <br /> <span className="text-primary">Automatically.</span></h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                     Think LinkedIn for golfers. Every tournament, every lesson, and every handicap revision is stored in a permanent, verified identity protocol.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <ResumeTag label="Tournament History" />
                  <ResumeTag label="Ranking History" />
                  <ResumeTag label="Performance Trends" />
                  <ResumeTag label="Achievement Timeline" />
               </div>
            </div>
            <div className="relative">
               <div className="glass-panel rounded-[2.5rem] p-10 space-y-8 relative z-10">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                     <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-black italic text-primary">JD</div>
                     <div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">John Doe</h4>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">WHS Index: 4.2 • Verified Identity</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Accomplishment</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">MAR 2024</span>
                     </div>
                     <p className="text-lg font-black italic uppercase tracking-tight">Won Spring Invitational • Flight A</p>
                  </div>
               </div>
               <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 rounded-full scale-110" />
            </div>
         </div>
      </section>

      {/* The Long Game */}
      <section className="py-32 px-6 border-t border-border bg-muted/20" id="vision">
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">The Long Game</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight">We're Not Building Software. <br /> <span className="text-primary">We're Building Golf Infrastructure.</span></h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed italic">
               "Today's golf ecosystem is fragmented. Our mission is to create the intelligence layer connecting academies, coaches, players, parents, and tournaments into one connected network."
            </p>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(129,196,255,0.1)_0%,transparent_50%)]" />
         <div className="max-w-4xl mx-auto relative z-10 space-y-12">
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">The Future of Golf Development <br /> <span className="text-primary">Starts Here.</span></h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
               Whether you're training champions, running tournaments, or improving your game, this is the platform built for the next generation of golf.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all group" onClick={() => setAuthView('signup')}>
                  Request Demo
               </Button>
               <Button size="lg" variant="ghost" className="h-16 px-12 rounded-2xl border border-border font-black uppercase tracking-[0.2em] hover:bg-muted transition-colors">
                  Join Early Access
               </Button>
            </div>
         </div>
      </section>

      <footer className="py-12 px-6 border-t border-border text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-sm font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© 2024 SWINGSTATS PRO INTELLIGENCE LAYER. ALL PROTOCOLS RESERVED.</p>
          <div className="flex gap-6">
            <NavAnchor href="#">Legal</NavAnchor>
            <NavAnchor href="#">Privacy</NavAnchor>
            <NavAnchor href="#">Security</NavAnchor>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavAnchor({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a href={href} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer">
      {children}
    </a>
  );
}

function VisualizationStep({ icon: Icon, label, delay }: { icon: any, label: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, z: -50, rotateY: -30 }}
      animate={{ opacity: 1, z: 0, rotateY: 0 }}
      whileHover={{ 
        z: 60, 
        rotateY: 15, 
        rotateX: -10,
        transition: { type: "spring", stiffness: 300, damping: 20 } 
      }}
      transition={{ delay, duration: 0.8 }}
      className="flex flex-col items-center gap-3 group cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all shadow-2xl relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-6 h-6 text-primary relative z-10" />
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{label}</span>
    </motion.div>
  )
}

function VisualizationConnector({ delay, className = "" }: { delay: number, className?: string }) {
  return (
    <div className={`items-center justify-center h-14 flex ${className}`}>
      <motion.div 
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay, duration: 0.6 }}
        className="w-8 lg:w-12 h-[1px] bg-gradient-to-r from-border via-primary/30 to-border origin-left mx-2"
      />
    </div>
  )
}

function EcosystemCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border-border hover:border-primary/20 transition-all space-y-4 group">
       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:neon-glow transition-all">
          <Icon className="w-6 h-6 text-primary" />
       </div>
       <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
       <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">{desc}</p>
    </div>
  )
}

function TelemetryFeature({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3">
       <Icon className="w-5 h-5 text-primary" />
       <span className="text-sm font-black uppercase italic tracking-tight">{label}</span>
    </div>
  )
}

function FeedItem({ score, name, status, highlight = false }: { score: string, name: string, status: string, highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent'} transition-all`}>
      <div className="flex items-center gap-4">
        <span className={`text-xl font-black italic ${score.startsWith('-') ? 'text-primary' : 'text-foreground'}`}>{score}</span>
        <div>
          <p className="text-xs font-black uppercase">{name}</p>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{status}</p>
        </div>
      </div>
      <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
         <motion.div initial={{ x: -48 }} animate={{ x: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="h-full bg-primary/40 w-full" />
      </div>
    </div>
  )
}

function MoatCard({ icon: Icon, title, color }: { icon: any, title: string, color: 'primary' | 'accent' }) {
  const colorClass = color === 'primary' ? 'text-primary' : 'text-accent';
  return (
    <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all cursor-pointer group">
       <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center group-hover:neon-glow transition-all`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
       </div>
       <span className="text-sm font-black uppercase italic">{title}</span>
    </div>
  )
}

function AnalystStat({ label, val, color }: { label: string, val: string, color: 'primary' | 'accent' | 'destructive' }) {
  const colorClass = {
    primary: 'text-primary',
    accent: 'text-accent',
    destructive: 'text-destructive'
  }[color];
  
  return (
    <div className="text-center">
       <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-xl font-black italic ${colorClass}`}>{val}</p>
    </div>
  )
}

function WorkflowItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 opacity-50" />
       </div>
       <span className="text-xs font-bold uppercase">{label}</span>
    </div>
  )
}

function ResumeTag({ label }: { label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground">
       {label}
    </div>
  )
}
