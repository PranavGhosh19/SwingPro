"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, 
  Target, 
  Users, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Smartphone, 
  LayoutDashboard,
  Quote,
  CheckCircle2,
  Calendar,
  Flag,
  ChevronDown,
  Loader2,
  Mail,
  Lock,
  Calculator
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  SidebarProvider, 
  SidebarInset 
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navigation } from "@/components/Navigation"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { PerformanceView } from "@/components/PerformanceView"
import { CourseCalculator } from "@/components/CourseCalculator"
import { AddRoundForm } from "@/components/AddRoundForm"
import { CompeteView } from "@/components/CompeteView"
import { UserProfile } from "@/lib/db"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function App() {
  const { user, loading: authLoading } = useUser();
  const [showApp, setShowApp] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'onboarding'>('signin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (user && userProfile) setShowApp(true);
  }, [user, userProfile]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowApp(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials. Please verify your identity.",
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
      email: user.email!, 
      fullName,
      xp: 0,
      level: 1,
      badges: [],
      streaks: { weeksActive: 0, challengesJoined: 0 },
      metrics: { longestDrive: 280, totalBirdies: 0, bestRound: 0 }
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
      .then(() => setShowApp(true))
      .finally(() => setLoading(false));
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (showApp && user && userProfile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground font-body relative overflow-x-hidden">
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <SidebarInset className="flex-1 bg-transparent relative z-10">
            <header className="p-6 sticky top-0 bg-background/60 backdrop-blur-xl z-50 border-b border-white/5 md:hidden">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></h1>
                <Button variant="ghost" size="icon" onClick={() => signOut(auth!)}><Flag className="w-5 h-5 text-muted-foreground" /></Button>
              </div>
            </header>
            <main className="max-w-4xl mx-auto px-6 py-10 pb-32">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {activeTab === 'dashboard' && (
                    <div className="space-y-10">
                      <HandicapDisplay />
                      <StatsGrid />
                      <HandicapChart />
                      <RecentRounds refreshTrigger={0} />
                    </div>
                  )}
                  {activeTab === 'performance' && <PerformanceView />}
                  {activeTab === 'calculator' && <CourseCalculator />}
                  {activeTab === 'compete' && <CompeteView />}
                  {activeTab === 'add' && <AddRoundForm onComplete={() => setActiveTab('dashboard')} />}
                  {activeTab === 'settings' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Player Protocol</h2>
                      <div className="glass-panel rounded-[2rem] p-10 space-y-4">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Identity</p>
                        <h3 className="text-4xl font-black italic">{userProfile.fullName}</h3>
                        <p className="text-primary font-bold">{userProfile.email}</p>
                      </div>
                      <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 hover:bg-destructive/10 text-destructive" onClick={() => signOut(auth!)}>Terminate Session</Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </SidebarInset>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </SidebarProvider>
    );
  }

  // Auth Overlay for App
  if (showApp && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
        <AnimatePresence mode="wait">
          {authView === 'signin' ? (
            <motion.div key="in" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm glass-panel p-10 rounded-[2.5rem] space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">SwingStats <span className="text-primary">Pro</span></h1>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Authorize Entry</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-xl bg-white/5" />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-xl bg-white/5" />
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase">{loading ? <Loader2 className="animate-spin" /> : "Enter Dashboard"}</Button>
              </form>
              <button onClick={() => setAuthView('signup')} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Create Elite Profile</button>
            </motion.div>
          ) : authView === 'signup' ? (
            <motion.div key="up" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm glass-panel p-10 rounded-[2.5rem] space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Join <span className="text-primary">Elite</span></h1>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Register Identity</p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-xl bg-white/5" />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-xl bg-white/5" />
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase">Initialize Profile</Button>
              </form>
              <button onClick={() => setAuthView('signin')} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Return to Entry</button>
            </motion.div>
          ) : (
            <motion.div key="on" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm glass-panel p-10 rounded-[2.5rem] space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Signature</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Finalize Deployment</p>
              </div>
              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 rounded-xl bg-white/5" />
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase">Finalize</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f8f9fa] selection:bg-primary selection:text-white">
      {/* Landing Header */}
      <header className="fixed top-0 w-full z-50 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-4 rounded-full border-white/5">
          <div className="flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Features</a>
            <a href="#leaderboard" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Tournaments</a>
            <a href="#handicap" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Handicapping</a>
          </div>
          <Button variant="outline" className="rounded-full px-8 border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest" onClick={() => setShowApp(true)}>Launch Dashboard</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          <img src="https://picsum.photos/seed/golfhero/1920/1080" alt="Golf course" className="w-full h-full object-cover opacity-30" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
              Run Golf Tournaments <br />
              <span className="text-primary italic neon-text">Smarter.</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Manage handicaps, tournaments, live leaderboards, and golfer analytics from a single platform built for elite clubs and serious players.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-16 px-10 rounded-2xl bg-accent text-accent-foreground font-black uppercase tracking-[0.2em] shadow-xl gold-glow hover:scale-105 transition-all group" onClick={() => setShowApp(true)}>
              Launch Club Dashboard <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-[0.2em] hover:bg-white/10">
              Book a Demo
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="pt-12 relative">
            <div className="glass-panel p-4 rounded-[2.5rem] max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <img src="https://picsum.photos/seed/dashboard/1200/800" alt="Dashboard Preview" className="rounded-[2rem] border border-white/10 shadow-2xl relative z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-black text-accent uppercase tracking-[0.5em]">Executive Protocols</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Unified Operations for Clubs & Golfers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={Trophy} title="Tournament Hosting" desc="Bespoke elite tournament protocol from setup to final prize giving." />
            <FeatureCard icon={Activity} title="Live Leaderboards" desc="Real-time net and gross updates across all competitive formats." />
            <FeatureCard icon={Calculator} title="Handicap Management" desc="WHS compliant automatic indexing and course handicap conversion." />
            <FeatureCard icon={Flag} title="Tee Sheet Control" desc="Synchronized starting intervals and pace of play monitoring." />
            <FeatureCard icon={BarChart3} title="Event Analytics" desc="Deep performance insights into field trends and course difficulty." />
            <FeatureCard icon={Smartphone} title="Digital Scorecards" desc="High-precision mobile entry with marker verification protocols." />
          </div>
        </div>
      </section>

      {/* Live Leaderboard Demo */}
      <section id="leaderboard" className="py-32 px-6 bg-secondary/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Live Tournament Intelligence</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our "Vigilant" HUD provides real-time movement analysis. Watch the field shift instantly as scores are validated across the course.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest"><CheckCircle2 className="w-5 h-5 text-primary" /> Automatic Stableford Conversion</li>
              <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest"><CheckCircle2 className="w-5 h-5 text-primary" /> Flighted Score Segregation</li>
              <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest"><CheckCircle2 className="w-5 h-5 text-primary" /> Real-time "Cut Line" Logic</li>
            </ul>
          </div>

          <div className="glass-panel rounded-[2.5rem] overflow-hidden vigilant-scan border-white/10">
            <div className="bg-primary/20 p-6 flex justify-between items-center border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Leaderboard: Masters Hub</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] font-black">Syncing</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              <LeaderboardRow rank={1} name="Tiger Woods" score="-8" holes="F" pos="-" />
              <LeaderboardRow rank={2} name="Rory McIlroy" score="-6" holes="15" pos="↑2" />
              <LeaderboardRow rank={3} name="Scottie Scheffler" score="-5" holes="17" pos="↓1" />
              <LeaderboardRow rank={4} name="Viktor Hovland" score="-4" holes="12" pos="↑4" />
            </div>
          </div>
        </div>
      </section>

      {/* Handicap Engine */}
      <section id="handicap" className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="bg-accent/10 border border-accent/20 px-6 py-2 rounded-full inline-block">
             <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Infrastructure Protocol</span>
          </div>
          <h3 className="text-5xl font-black uppercase italic tracking-tighter">The World Handicap Engine</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our engine is fully WHS compliant, performing complex differential calculations in microseconds to ensure every match is played on a fair field.
          </p>
          
          <div className="bg-card rounded-[2.5rem] p-12 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
              <div className="space-y-2 text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">WHS Calculation Logic</p>
                <div className="text-3xl font-mono font-black italic text-primary bg-white/5 p-8 rounded-2xl border border-white/5">
                  Course HCP = Index × (Slope / 113) + (CR - Par)
                </div>
              </div>
              <div className="text-left space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4 text-primary" /></div>
                  <div>
                    <h5 className="font-black uppercase text-xs">Official WHS Compliance</h5>
                    <p className="text-[11px] text-muted-foreground">Certified calculations for Slope and Rating integration.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0"><Calculator className="w-4 h-4 text-accent" /></div>
                  <div>
                    <h5 className="font-black uppercase text-xs">Instant Conversion</h5>
                    <p className="text-[11px] text-muted-foreground">Automatic adjustment based on selected tournament tees.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Clubs Switch */}
      <section className="py-32 px-6 bg-secondary/10">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h3 className="text-4xl font-black uppercase italic tracking-tighter">Modernize Your Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6 text-left">
              <h4 className="text-xl font-black uppercase text-destructive italic flex items-center gap-2">Legacy Issues <TrendingDown className="w-5 h-5" /></h4>
              <div className="space-y-4">
                <PainPoint text="Chaotic Excel sheet management" />
                <PainPoint text="Paper scorecards with manual entry errors" />
                <PainPoint text="Delayed leaderboards (hours after play)" />
                <PainPoint text="Manual handicap allowance verification" />
              </div>
            </div>
            <div className="space-y-6 text-left">
              <h4 className="text-xl font-black uppercase text-primary italic flex items-center gap-2">SwingStats Pro <TrendingUp className="w-5 h-5" /></h4>
              <div className="space-y-4">
                <SolutionPoint text="Unified Cloud-Based Control Center" />
                <SolutionPoint text="Instant Digital Verification Protocol" />
                <SolutionPoint text="Real-Time Field Telemetry" />
                <SolutionPoint text="Automated WHS Compliance Logic" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <Quote className="w-16 h-16 text-primary/20 mx-auto" />
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">"The transition from paper to SwingStats Pro reduced our tournament wrap-up time by 90%. Players love the live pressure."</h3>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
            <div className="text-left">
              <p className="font-black uppercase text-xs">Alistair Graham</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tournament Director, Pine Valley</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h3 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Modernize Your Club. <br /> <span className="text-primary">Elevate the Game.</span></h3>
          <p className="text-lg text-muted-foreground font-medium uppercase tracking-widest max-w-2xl mx-auto">
            Join the network of elite clubs running high-precision tournaments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-accent text-accent-foreground font-black uppercase tracking-[0.2em] gold-glow" onClick={() => setShowApp(true)}>Get Started Now</Button>
            <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-[0.2em] hover:bg-white/10">Book Protocol Demo</Button>
          </div>
          <div className="pt-20 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
            © 2024 SwingStats Pro • Elite Tournament Logistics
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="glass-panel p-10 rounded-[2rem] space-y-6 group hover:border-primary/20 transition-all">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function LeaderboardRow({ rank, name, score, holes, pos }: { rank: number, name: string, score: string, holes: string, pos: string }) {
  return (
    <div className="flex items-center justify-between p-4 group hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <span className="w-6 text-xs font-black italic text-muted-foreground">{rank}</span>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
        <span className="text-xs font-bold uppercase">{name}</span>
      </div>
      <div className="flex items-center gap-8">
        <span className="text-[10px] font-black uppercase text-muted-foreground">Thru {holes}</span>
        <div className="text-right w-12">
          <p className={`text-sm font-black italic ${score.startsWith('-') ? 'text-primary' : 'text-foreground'}`}>{score}</p>
          <p className="text-[8px] font-black uppercase text-muted-foreground">{pos}</p>
        </div>
      </div>
    </div>
  )
}

function PainPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest">
      <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
      {text}
    </div>
  )
}

function SolutionPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-white uppercase tracking-widest">
      <CheckCircle2 className="w-4 h-4 text-primary" />
      {text}
    </div>
  )
}

function TrendingUp({ className }: { className?: string }) {
  return <ArrowRight className={`-rotate-45 ${className}`} />;
}

function TrendingDown({ className }: { className?: string }) {
  return <ArrowRight className={`rotate-45 ${className}`} />;
}
