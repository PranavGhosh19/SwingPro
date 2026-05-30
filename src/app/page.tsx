
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
        <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-body">
      <header className="fixed top-0 w-full z-50 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-4 rounded-full backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <span className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavAnchor href="#solutions">Solutions</NavAnchor>
            <NavAnchor href="#intel">Intelligence</NavAnchor>
            <NavAnchor href="#vision">Vision</NavAnchor>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" className="rounded-full px-8 border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-primary/20 hover:text-primary transition-all" onClick={() => setAuthView('signin')}>Enter Platform</Button>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
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
            <div className="flex flex-wrap items-center justify-center">
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
            <Button size="lg" variant="ghost" className="h-16 px-12 rounded-2xl border border-border font-black uppercase tracking-[0.2em] hover:bg-muted transition-colors">
              Watch 2-Minute Tour
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-y border-border bg-muted/20 backdrop-blur-sm">
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

      {/* Remaining sections adapted with background/foreground variables */}
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
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all shadow-2xl relative">
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

function ProblemCard({ title, issues }: { title: string, issues: string[] }) {
  return (
    <div className="glass-panel p-8 rounded-[2rem] border-border hover:border-destructive/20 transition-all space-y-6">
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
