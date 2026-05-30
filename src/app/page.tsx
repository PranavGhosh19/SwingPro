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
  Calculator,
  Activity,
  Cpu,
  Database,
  LineChart,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Globe
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

export default function LandingPage() {
  const { user, loading: authLoading } = useUser();
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'onboarding' | null>(null);
  const [authRole, setAuthRole] = useState<'golfer' | 'club'>('golfer');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clubName, setClubName] = useState('');
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (user && userProfile) {
      router.push('/dashboard');
    }
  }, [user, userProfile, router]);

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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (authView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
        <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <AnimatePresence mode="wait">
          {authView === 'signin' ? (
            <motion.div key="in" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8 relative z-10 border-white/5 shadow-2xl">
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
             <motion.div key="up" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8 relative z-10 border-white/5 shadow-2xl">
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
            <motion.div key="on" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8 relative z-10 border-white/5 shadow-2xl">
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
    <div className="min-h-screen bg-[#07080a] text-[#f8f9fa] selection:bg-primary selection:text-white font-body">
      <header className="fixed top-0 w-full z-50 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-4 rounded-full border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <span className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavAnchor href="#solutions">Solutions</NavAnchor>
            <NavAnchor href="#intel">Intelligence</NavAnchor>
            <NavAnchor href="#vision">Vision</NavAnchor>
          </div>
          <Button variant="outline" className="rounded-full px-8 border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-primary/20 hover:text-primary transition-all" onClick={() => setAuthView('signin')}>Enter Platform</Button>
        </nav>
      </header>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-[#07080a]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(74,222,128,0.05)_0%,transparent_50%)]" />
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

          {/* Cinematic 3D Visualization Section */}
          <motion.div 
            initial={{ opacity: 0, rotateX: 20, y: 50 }} 
            animate={{ opacity: 1, rotateX: 0, y: 0 }} 
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }} 
            className="relative py-12"
            style={{ perspective: 1500, transformStyle: "preserve-3d" }}
          >
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-0">
              <VisualizationStep icon={Trophy} label="Tournament" delay={0.1} />
              <VisualizationConnector delay={0.2} />
              <VisualizationStep icon={UserIcon} label="Profile" delay={0.3} />
              <VisualizationConnector delay={0.4} />
              <VisualizationStep icon={BarChart3} label="Analytics" delay={0.5} />
              <VisualizationConnector delay={0.6} className="hidden md:flex" />
              <VisualizationStep icon={Cpu} label="AI Coaching" delay={0.7} />
              <VisualizationConnector delay={0.8} className="hidden md:flex" />
              <VisualizationStep icon={ShieldCheck} label="Handicap" delay={0.9} />
              <VisualizationConnector delay={1.0} className="hidden md:flex" />
              <VisualizationStep icon={Globe} label="Rankings" delay={1.1} />
            </div>
            <div className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-primary neon-text">Every Shot Becomes Intelligence.</div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all group border-none" onClick={() => setAuthView('signin')}>
              Book a Demo <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="ghost" className="h-16 px-12 rounded-2xl text-white border border-white/10 font-black uppercase tracking-[0.2em] hover:bg-white/5">
              Watch 2-Minute Tour
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-y border-white/5 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-muted-foreground mb-12">Trusted By Elite Organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="font-black italic text-xl uppercase tracking-tighter">Elite Academies</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Tour Directors</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Performance Coaches</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Junior Programs</div>
            <div className="font-black italic text-xl uppercase tracking-tighter">Pro Leagues</div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6" id="solutions">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">The Industry Pain</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Golf Runs on <span className="text-destructive">Excel.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProblemCard title="Academies" issues={["Student records scattered", "Attendance tracking manual", "Progress reports inconsistent"]} />
            <ProblemCard title="Tournaments" issues={["Excel leaderboards", "Delayed scoring", "Manual calculations"]} />
            <ProblemCard title="Coaches" issues={["Hours spent reviewing video", "No centralized player history", "Manual drill assignments"]} />
            <ProblemCard title="Players" issues={["No improvement roadmap", "No performance analytics", "Disconnected data"]} />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Unified Ecosystem</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">One Platform. Every Stakeholder.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SolutionModule 
              icon={Building2} 
              title="Academy OS" 
              desc="Manage students, schedules, payments, attendance, memberships, and performance."
              color="primary"
            />
            <SolutionModule 
              icon={Trophy} 
              title="Tournament OS" 
              desc="Create tournaments, generate tee sheets, capture scores, and run live leaderboards."
              color="accent"
            />
            <SolutionModule 
              icon={UserIcon} 
              title="Player Intelligence" 
              desc="Track every round, every lesson, every practice session."
              color="primary"
            />
            <SolutionModule 
              icon={Smartphone} 
              title="Coach Portal" 
              desc="Deliver video feedback, assign drills, and monitor progress."
              color="accent"
            />
            <SolutionModule 
              icon={Cpu} 
              title="AI Insights" 
              desc="Identify weaknesses and recommend what to practice next."
              color="primary"
            />
             <SolutionModule 
              icon={Database} 
              title="Intelligence Layer" 
              desc="The central hub connecting coaching, events, and player growth."
              color="accent"
            />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 overflow-hidden relative" id="intel">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Real-Time Telemetry</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Watch a Tournament Update <br /> in Real Time</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">No spreadsheets. No manual updates. No waiting.</p>
            <div className="space-y-4 pt-8">
              <CheckItem text="Automated Flight Ranking" />
              <CheckItem text="Live WHS Index Synchronization" />
              <CheckItem text="Instant Result Publishing" />
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel rounded-[2.5rem] p-8 space-y-6 border-white/10 shadow-2xl relative z-10 vigilant-scan overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Feed</span>
                 </div>
                 <span className="text-[10px] font-black text-muted-foreground uppercase">Hole 14 • Stroke Play</span>
               </div>
               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-3">
                 <LiveUpdateRow name="R. Singh" score="-4" status="Score Submitted" active />
                 <LiveUpdateRow name="A. Kumar" score="-2" status="On Tee" />
                 <LiveUpdateRow name="M. Peterson" score="+1" status="In Fairway" />
               </motion.div>
            </div>
            <div className="absolute -inset-20 bg-primary/10 blur-[100px] -z-10" />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-y border-white/5 bg-[#0a0c10]">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h3 className="text-sm font-black text-accent uppercase tracking-[0.5em]">The Data Moat</h3>
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter">The More Golf You Play, <br /> <span className="text-accent">The Smarter It Gets</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
            <DataPoint icon={Smartphone} label="Lessons" />
            <DataPoint icon={Activity} label="Practice" />
            <DataPoint icon={Trophy} label="Tournaments" />
            <DataPoint icon={CheckCircle2} label="Rounds" />
          </div>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Resulting in better coaching, better player development, and better tournament management.</p>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="glass-panel rounded-[2.5rem] p-10 space-y-8 border-white/10 shadow-2xl relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Report</h4>
                <span className="text-[8px] font-black uppercase text-muted-foreground">Week 14 Analysis</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <AIStat label="Driving Accuracy" value="42%" color="destructive" />
                <AIStat label="Putting Cost" value="+3.1 strokes" color="destructive" />
                <AIStat label="Tournament Readiness" value="74%" color="accent" />
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Recommended Practice</p>
                <div className="space-y-2">
                  <PracticeProtocol text="Lag Putting Drills" />
                  <PracticeProtocol text="Fairway Accuracy Session" />
                  <PracticeProtocol text="Bunker Recovery" />
                </div>
              </div>
            </div>
            <div className="absolute -inset-10 bg-accent/5 blur-[80px] -z-10" />
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Personal Golf Analyst</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Every Shot <br /> is a Data Point.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">Our system tells golfers exactly where their improvement comes from, identifying weaknesses before they become patterns.</p>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-white/2 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Executive Efficiency</h3>
             <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Grow Your Academy Without <br /> Growing Admin Work</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="glass-panel p-10 rounded-[2.5rem] border-destructive/10 space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Traditional Workflow</p>
              <div className="space-y-3 opacity-50">
                <LegacyItem text="Scattered Excel Sheets" />
                <LegacyItem text="Fragmented WhatsApp Groups" />
                <LegacyItem text="Manual PDF Reports" />
                <LegacyItem text="Paper Scoring & Attendance" />
              </div>
            </div>
            <div className="glass-panel p-10 rounded-[2.5rem] border-primary/20 bg-primary/5 space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Hub Workflow</p>
              <div className="space-y-3">
                <HubItem text="Single Integrated Platform" />
                <HubItem text="Real-Time Performance Tracking" />
                <HubItem text="Automated Member Reporting" />
                <HubItem text="Unified Tournament Engine" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Global Registry</h3>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Build Your Golf Resume <br /> Automatically.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">Think LinkedIn for golfers. Every tournament, every lesson, and every handicap revision is stored in a permanent, verified identity protocol.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <ResumeTag text="Tournament History" />
              <ResumeTag text="Ranking History" />
              <ResumeTag text="Performance Trends" />
              <ResumeTag text="Achievement Timeline" />
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel rounded-[2.5rem] p-1 border-white/10 overflow-hidden shadow-2xl">
              <img src="https://picsum.photos/seed/golfresume/800/600" alt="Golf Resume" className="w-full rounded-[2.4rem] opacity-40 hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-40 px-6 text-center bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.05)_0%,transparent_70%)]" id="vision">
        <div className="max-w-4xl mx-auto space-y-12">
          <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">The Long Game</h3>
          <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85]">We're Not Building Software. <br /> <span className="text-primary">We're Building Golf Infrastructure.</span></h2>
          <p className="text-2xl text-muted-foreground font-medium leading-relaxed italic">
            "Today's golf ecosystem is fragmented. Our mission is to create the intelligence layer connecting academies, coaches, players, parents, and tournaments into one connected network."
          </p>
        </div>
      </section>

      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto glass-panel rounded-[3rem] p-16 md:p-24 text-center space-y-12 border-white/10 relative z-10 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">The Future of Golf Development <br /> Starts Here.</h2>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Whether you're training champions, running tournaments, or improving your game, this is the platform built for the next generation of golf.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all border-none" onClick={() => setAuthView('signup')}>
              Request Demo
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/20 text-white font-black uppercase tracking-[0.2em] hover:bg-white/5" onClick={() => setAuthView('signin')}>
              Join Early Access
            </Button>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] -z-0" />
      </section>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
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
        className="w-8 lg:w-12 h-[1px] bg-gradient-to-r from-white/10 via-primary/30 to-white/10 origin-left mx-2"
      />
    </div>
  )
}

function ProblemCard({ title, issues }: { title: string, issues: string[] }) {
  return (
    <div className="glass-panel p-8 rounded-[2rem] border-white/5 hover:border-destructive/20 transition-all space-y-6">
      <h4 className="text-xl font-black uppercase italic tracking-tighter text-destructive">{title}</h4>
      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
            <p className="text-xs font-bold text-muted-foreground uppercase">{issue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SolutionModule({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: 'primary' | 'accent' }) {
  const colorClass = color === 'primary' ? 'text-primary' : 'text-accent';
  const bgClass = color === 'primary' ? 'bg-primary/10' : 'bg-accent/10';
  const borderClass = color === 'primary' ? 'border-primary/20' : 'border-accent/20';

  return (
    <div className="glass-panel p-8 rounded-[2rem] border-white/5 hover:border-white/20 transition-all space-y-6 group relative overflow-hidden">
      <div className={`w-12 h-12 rounded-xl ${bgClass} border ${borderClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-primary" />
      <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">{text}</span>
    </div>
  )
}

function LiveUpdateRow({ name, score, status, active = false }: { name: string, score: string, status: string, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${active ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent'} transition-all`}>
      <div className="flex items-center gap-6">
        <span className="text-sm font-black italic text-primary w-8">{score}</span>
        <div>
          <p className="text-xs font-black uppercase">{name}</p>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{status}</p>
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => <div key={i} className={`w-1 h-3 rounded-full ${active ? 'bg-primary/40' : 'bg-white/10'}`} />)}
      </div>
    </div>
  )
}

function DataPoint({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="space-y-4 group cursor-default">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:border-accent group-hover:bg-accent/10 transition-all">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent transition-colors">{label}</p>
    </div>
  )
}

function AIStat({ label, value, color }: { label: string, value: string, color: 'destructive' | 'accent' }) {
  const colorClass = color === 'destructive' ? 'text-destructive' : 'text-accent';
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`text-sm font-black italic ${colorClass}`}>{value}</span>
    </div>
  )
}

function PracticeProtocol({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer">
      <span className="text-xs font-bold uppercase">{text}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
    </div>
  )
}

function LegacyItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 line-through text-muted-foreground">
      <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center">
        <div className="w-2 h-[1px] bg-muted-foreground rotate-45" />
      </div>
      <span className="text-[10px] font-bold uppercase">{text}</span>
    </div>
  )
}

function HubItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
        <CheckCircle2 className="w-3 h-3 text-primary" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{text}</span>
    </div>
  )
}

function ResumeTag({ text }: { text: string }) {
  return (
    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary transition-all cursor-default">
      {text}
    </span>
  )
}
