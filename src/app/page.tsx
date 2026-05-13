"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { AppSidebar } from "@/components/AppSidebar"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { AddRoundForm } from "@/components/AddRoundForm"
import { CompeteView } from "@/components/CompeteView"
import { PerformanceView } from "@/components/PerformanceView"
import { CourseCalculator } from "@/components/CourseCalculator"
import { UserProfile } from "@/lib/db"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { 
  LogOut, 
  User, 
  Mail, 
  Lock, 
  ChevronRight, 
  Trophy, 
  Building2, 
  Users2, 
  Briefcase,
  ArrowRight,
  Sparkles,
  Loader2,
  Activity,
  ShieldCheck,
  Calculator
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from "@/components/ui/sidebar"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { useToast } from "@/hooks/use-toast"

export default function App() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [view, setView] = useState<'signin' | 'signup' | 'onboarding'>('signin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoize the document reference
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

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
        description: error.code === 'auth/invalid-credential' 
          ? "Incorrect email or password."
          : (error.message || "An unexpected error occurred."),
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
      setView('onboarding');
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
      .finally(() => setLoading(false));
  };

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('dashboard');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: -20, 
      transition: { duration: 0.3 } 
    }
  };

  const handleSwipe = (event: any, info: any) => {
    // Swipe gestures can be updated or removed if they depended on feeds
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,128,0.05),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <AnimatePresence mode="wait">
          {view === 'signin' ? (
            <motion.div 
              key="signin"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              className="w-full max-w-sm space-y-8 glass-panel p-10 rounded-[2.5rem] relative vigilant-scan"
            >
              <div className="text-center space-y-3">
                <motion.div 
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30 neon-glow"
                >
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </motion.div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">SwingStats <span className="text-primary neon-text">Pro</span></h1>
                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.4em] font-black">Elite Performance Entry</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground block ml-1">Network ID</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input type="email" required className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/50 transition-all text-sm font-bold" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground block ml-1">Access Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input type="password" required className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/50 transition-all text-sm font-bold" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 group">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Authorize Protocol <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>}
                </Button>
              </form>
              <div className="text-center">
                <button onClick={() => setView('signup')} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all underline underline-offset-8 decoration-white/10 hover:decoration-primary/40">Initialize New Profile</button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="signup"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              className="w-full max-w-sm space-y-8 glass-panel p-10 rounded-[2.5rem] relative vigilant-scan"
            >
              <div className="text-center space-y-3">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Join <span className="text-primary neon-text">Elite</span></h1>
                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.4em] font-black">Register Player Identity</p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground block ml-1">Designated Email</Label>
                  <Input type="email" required className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/50 text-sm font-bold" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground block ml-1">Security Key</Label>
                  <Input type="password" required className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/50 text-sm font-bold" placeholder="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Identity"}
                </Button>
              </form>
              <div className="text-center">
                <button onClick={() => setView('signin')} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all underline underline-offset-8">Return to Portal</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!userProfile && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8 glass-panel p-10 rounded-[2.5rem] relative overflow-hidden vigilant-scan">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-glow border border-primary/30">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Identity Protocol</h1>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.4em] font-black">Set Signature Name</p>
          </div>
          <form onSubmit={handleCompleteOnboarding} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-left block ml-1">Full Name</Label>
              <Input required className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-black italic tracking-tight" placeholder="TIGER WOODS" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 group">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalize Deployment <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground font-body selection:bg-primary/30 overflow-x-hidden relative">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,128,0.02),rgba(0,192,255,0.02))] bg-[length:100%_4px,4px_100%]" />

        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <SidebarInset className="flex-1 bg-transparent relative z-10">
          <header className="p-6 sticky top-0 bg-background/60 backdrop-blur-xl z-50 border-b border-white/5 md:hidden">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">
                  SwingStats <span className="text-primary neon-text">Pro</span>
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Hello, {userProfile?.fullName?.split(' ')[0]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                  <LogOut className="w-5 h-5" />
                </Button>
                <SidebarTrigger className="md:hidden" />
              </div>
            </div>
          </header>

          <main className={`max-w-4xl mx-auto px-6 py-10 ${isMobile ? 'pb-32' : 'pb-16'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {activeTab === 'dashboard' && (
                  <motion.div className="space-y-10" onPanEnd={handleSwipe}>
                    <HandicapDisplay />
                    <StatsGrid />
                    <div className="grid grid-cols-1 gap-8">
                      <HandicapChart />
                    </div>
                    <RecentRounds refreshTrigger={refreshKey} />
                  </motion.div>
                )}

                {activeTab === 'performance' && <PerformanceView />}
                {activeTab === 'add' && <AddRoundForm onComplete={refreshData} />}
                {activeTab === 'compete' && <CompeteView />}
                {activeTab === 'calculator' && <CourseCalculator />}

                {activeTab === 'settings' && (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black tracking-tight uppercase italic">Player Protocol</h2>
                      <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-full border border-primary/30 neon-glow">
                        <Activity className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Telemetry Active</span>
                      </div>
                    </div>

                    <div className="glass-panel rounded-[2.5rem] p-10 space-y-8 relative vigilant-scan">
                      <div className="flex items-center gap-8">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                          className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center neon-glow border border-primary/30"
                        >
                          <User className="w-12 h-12 text-primary" />
                        </motion.div>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-black uppercase tracking-tighter italic">{userProfile?.fullName}</h3>
                          <p className="text-sm text-muted-foreground font-black tracking-widest">{userProfile?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Network Rank</p>
                          <p className="font-black text-xl text-primary flex items-center gap-2 italic uppercase tracking-tight">
                            <Trophy className="w-5 h-5" /> Elite Member
                          </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-accent/20 transition-all">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Sync Status</p>
                          <p className="font-black text-xl italic uppercase tracking-tight">Cloud-Link 1.0</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Business & Strategic Networking</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <motion.button 
                              whileHover={{ y: -4 }}
                              className="glass-panel rounded-[2rem] p-8 text-left group hover:bg-primary/5 transition-all duration-300 border-white/5 hover:border-primary/20 relative overflow-hidden"
                            >
                              <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-4">
                                  <div className="bg-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:neon-glow transition-all border border-primary/20">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                  </div>
                                  <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Corporate<br/>Events</h4>
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest max-w-[180px]">Bespoke Elite Tournament Protocol</p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                              </div>
                              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -z-0" />
                            </motion.button>
                          </DialogTrigger>
                          <DialogContent className="glass-panel border-white/10 rounded-[2.5rem] max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Event Protocol</DialogTitle>
                              <DialogDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                B2B Bespoke Tournament Logistics
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-6">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em]">Expected Delegates</Label>
                                <Input placeholder="E.G. 24 PLAYERS" className="h-14 bg-white/5 rounded-2xl border-white/10 font-bold uppercase" />
                              </div>
                              <Button className="w-full h-14 rounded-2xl bg-primary font-black uppercase tracking-[0.2em] text-xs">Initialize Proposal</Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <motion.button 
                          whileHover={{ y: -4 }}
                          className="glass-panel rounded-[2rem] p-8 text-left group hover:bg-accent/5 transition-all duration-300 border-white/5 hover:border-accent/20 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-4">
                              <div className="bg-accent/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:shadow-[0_0_20px_-3px_rgba(var(--accent),0.5)] transition-all border border-accent/20">
                                <Users2 className="w-6 h-6 text-accent" />
                              </div>
                              <h4 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2 leading-none">
                                Connect<br/>over Tee <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest max-w-[180px]">Network with Industry Leaders</p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-2 transition-all" />
                          </div>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl -z-0" />
                        </motion.button>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase tracking-[0.3em] text-[10px] transition-all" onClick={handleSignOut}>
                      Terminate Security Session
                    </Button>
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