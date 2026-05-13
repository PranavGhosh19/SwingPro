
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, 
  Target, 
  Users, 
  Activity, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Flag, 
  Loader2,
  Building2,
  User as UserIcon,
  LayoutDashboard,
  Settings,
  Plus,
  Calendar,
  Calculator,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navigation } from "@/components/Navigation"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { CourseCalculator } from "@/components/CourseCalculator"
import { AddRoundForm } from "@/components/AddRoundForm"
import { PerformanceView } from "@/components/PerformanceView"
import { CompeteView } from "@/components/CompeteView"
import { UserProfile } from "@/lib/db"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function App() {
  const { user, loading: authLoading } = useUser();
  const [showApp, setShowApp] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'onboarding'>('signin');
  const [authRole, setAuthRole] = useState<'golfer' | 'club'>('golfer');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clubName, setClubName] = useState('');
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
      .then(() => setShowApp(true))
      .finally(() => setLoading(false));
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (showApp && user && userProfile) {
    const isClub = userProfile.role === 'club';

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
                      {isClub ? (
                        <div className="space-y-10">
                          <div className="glass-panel p-10 rounded-[2.5rem] space-y-4">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{userProfile.clubName} <span className="text-primary text-xl">Operations Hub</span></h2>
                            <p className="text-muted-foreground">Manage tournaments, member rosters, and scoring approvals.</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DashboardMetric icon={Trophy} label="Active Events" value="2" />
                            <DashboardMetric icon={Users} label="Total Members" value="482" />
                            <DashboardMetric icon={Activity} label="Pending Scores" value="12" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <OperationsCard 
                              title="Tournament Management" 
                              desc="Create formats, set tee times, and publish live results."
                              action="Open Manager"
                            />
                            <OperationsCard 
                              title="Member CRM" 
                              desc="Audit handicaps, manage tiers, and view history."
                              action="View Roster"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-10">
                          <HandicapDisplay />
                          <StatsGrid />
                          <HandicapChart />
                          <RecentRounds refreshTrigger={0} />
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'performance' && <PerformanceView />}
                  {activeTab === 'compete' && <CompeteView />}
                  {activeTab === 'calculator' && <CourseCalculator />}
                  {activeTab === 'add' && <AddRoundForm onComplete={() => setActiveTab('dashboard')} />}
                  {activeTab === 'settings' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter">System Protocol</h2>
                      <div className="glass-panel rounded-[2rem] p-10 space-y-4">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Identity</p>
                        <h3 className="text-4xl font-black italic">{isClub ? userProfile.clubName : userProfile.fullName}</h3>
                        <p className="text-primary font-bold">{userProfile.email} • {userProfile.role.toUpperCase()}</p>
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

  // Landing Page
  if (!user && !showApp) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-[#f8f9fa] selection:bg-primary selection:text-white">
        <header className="fixed top-0 w-full z-50 p-6">
          <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-4 rounded-full border-white/5">
            <div className="flex items-center gap-2">
              <Flag className="w-6 h-6 text-primary" />
              <span className="text-xl font-black tracking-tighter uppercase italic">SwingStats <span className="text-primary">Pro</span></span>
            </div>
            <Button variant="outline" className="rounded-full px-8 border-white/10 bg-white/5 font-bold uppercase text-[10px] tracking-widest" onClick={() => setShowApp(true)}>Enter Platform</Button>
          </nav>
        </header>

        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
            <img src="https://picsum.photos/seed/golfhero/1920/1080" alt="Golf course" className="w-full h-full object-cover opacity-20" />
          </div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
                Tournament Logistics <br />
                <span className="text-primary italic">Redefined.</span>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                One core engine. Two elite interfaces. Built for modern clubs and serious golfers.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all group" onClick={() => setShowApp(true)}>
                Launch Platform <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-10">
              <h3 className="text-sm font-black text-primary uppercase tracking-[0.5em]">Operations Platform</h3>
              <h4 className="text-4xl font-black uppercase italic tracking-tighter">B2B: Built for Clubs</h4>
              <div className="space-y-6">
                <FeatureItem icon={Trophy} title="Tournament Hosting" desc="Manage formats, flights, and live leaderboards from a single command hub." />
                <FeatureItem icon={Users} title="Member Management" desc="A Golf CRM to track handicaps, history, and tournament participation." />
                <FeatureItem icon={Calculator} title="Handicap Auditing" desc="WHS compliant automatic indexing and course handicap conversion." />
              </div>
            </div>
            <div className="space-y-10">
              <h3 className="text-sm font-black text-accent uppercase tracking-[0.5em]">Experience Platform</h3>
              <h4 className="text-4xl font-black uppercase italic tracking-tighter">B2C: Built for Golfers</h4>
              <div className="space-y-6">
                <FeatureItem icon={Zap} title="Live Scoring" desc="Hole-by-hole digital scorecards with instant net/gross calculations." />
                <FeatureItem icon={BarChart3} title="Performance Stats" desc="Deep-dive analytics on FIR, GIR, and Strokes Gained logic." />
                <FeatureItem icon={Target} title="WHS Identity" desc="Official handicap tracking and historical performance trends." />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Auth Overlay
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
      <AnimatePresence mode="wait">
        {authView === 'signin' ? (
          <motion.div key="in" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8">
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
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-xl bg-white/5" />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-xl bg-white/5" />
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest">{loading ? <Loader2 className="animate-spin" /> : "Access System"}</Button>
            </form>
            <button onClick={() => setAuthView('signup')} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Create New Identity</button>
          </motion.div>
        ) : authView === 'signup' ? (
           <motion.div key="up" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8">
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
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-xl bg-white/5" />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-xl bg-white/5" />
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest">Initialize Profile</Button>
            </form>
            <button onClick={() => setAuthView('signin')} className="w-full text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Return to Access Portal</button>
          </motion.div>
        ) : (
          <motion.div key="on" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Final <span className="text-primary">Signature</span></h1>
            </div>
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              {authRole === 'golfer' ? (
                <Input placeholder="Full Legal Name" value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 rounded-xl bg-white/5" />
              ) : (
                <Input placeholder="Official Club Name" value={clubName} onChange={e => setClubName(e.target.value)} className="h-14 rounded-xl bg-white/5" />
              )}
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest">Finalize Deployment</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardMetric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-2 border-white/5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-black italic">{value}</p>
    </div>
  )
}

function OperationsCard({ title, desc, action }: { title: string, desc: string, action: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6 group hover:border-primary/20 transition-all">
      <div className="space-y-2">
        <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Button className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
        {action}
      </Button>
    </div>
  )
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h5 className="font-black uppercase italic text-sm">{title}</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
