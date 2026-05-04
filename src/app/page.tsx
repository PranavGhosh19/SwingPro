
"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { AddRoundForm } from "@/components/AddRoundForm"
import { CourseCalculator } from "@/components/CourseCalculator"
import { FeedsView } from "@/components/FeedsView"
import { CompeteView } from "@/components/CompeteView"
import { PerformanceView } from "@/components/PerformanceView"
import { UserProfile, getUser, saveUser, clearSession } from "@/lib/db"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Sparkles
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

export default function App() {
  const [view, setView] = useState<'signin' | 'signup' | 'onboarding' | 'home'>('signin');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const isMobile = useIsMobile();

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      setView('home');
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: UserProfile = { 
      email, 
      fullName: email.split('@')[0],
      xp: 450,
      level: 4,
      badges: ['Break 100'],
      streaks: { weeksActive: 1, challengesJoined: 0 },
      metrics: { longestDrive: 285, totalBirdies: 12 }
    };
    setUser(mockUser);
    saveUser(mockUser);
    setView('home');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setView('onboarding');
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = { 
      email, 
      fullName,
      xp: 0,
      level: 1,
      badges: [],
      streaks: { weeksActive: 0, challengesJoined: 0 },
      metrics: { longestDrive: 0, totalBirdies: 0 }
    };
    setUser(newUser);
    saveUser(newUser);
    setView('home');
  };

  const handleSignOut = () => {
    clearSession();
    setUser(null);
    setView('signin');
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const handleSwipe = (event: any, info: any) => {
    if (isMobile && activeTab === 'dashboard' && info.offset.x > 100) {
      setActiveTab('feeds');
    }
    if (isMobile && activeTab === 'feeds' && info.offset.x < -100) {
      setActiveTab('dashboard');
    }
  };

  if (view === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-8 glass-panel p-8 rounded-[2.5rem]">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">SwingStats <span className="text-primary neon-text">Pro</span></h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Elite Performance Entry</p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Network ID (Email)</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input type="email" required className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Access Key</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input type="password" required className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20">Authorize Access</Button>
          </form>
          <div className="text-center">
            <button onClick={() => setView('signup')} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">Initialize New Account</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-8 glass-panel p-8 rounded-[2.5rem]">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">Join <span className="text-primary neon-text">Elite</span></h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Create your player profile</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Email Address</Label>
              <Input type="email" required className="h-12 bg-white/5 border-white/10 rounded-xl" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Security Password</Label>
              <Input type="password" required className="h-12 bg-white/5 border-white/10 rounded-xl" placeholder="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest">Next Phase</Button>
          </form>
          <div className="text-center">
            <button onClick={() => setView('signin')} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary underline underline-offset-4">Already Registered? Log In</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8 glass-panel p-10 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-glow">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Player Identity</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">What should we call you on the leaderboard?</p>
          </div>
          <form onSubmit={handleCompleteOnboarding} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Full Name</Label>
              <Input required className="h-14 bg-white/5 border-white/10 rounded-xl text-lg font-bold" placeholder="Tiger Woods" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group">
              Complete Protocol <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-body selection:bg-primary/30 overflow-x-hidden">
      <header className="p-6 sticky top-0 bg-background/60 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">
              SwingStats <span className="text-primary neon-text">Pro</span>
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Hello, {user?.fullName?.split(' ')[0]}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard" 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              className="space-y-8"
              onPanEnd={handleSwipe}
            >
              <HandicapDisplay key={`hcp-${refreshKey}`} />
              <StatsGrid key={`stats-${refreshKey}`} />
              <div className="grid grid-cols-1 gap-6">
                <HandicapChart key={`chart-${refreshKey}`} />
              </div>
              <RecentRounds refreshTrigger={refreshKey} />
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div 
              key="performance" 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit"
            >
              <PerformanceView />
            </motion.div>
          )}

          {activeTab === 'feeds' && (
            <motion.div 
              key="feeds" 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit"
              onPanEnd={handleSwipe}
            >
              <FeedsView />
            </motion.div>
          )}

          {activeTab === 'add' && (
            <motion.div key="add" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <AddRoundForm onComplete={refreshData} />
            </motion.div>
          )}

          {activeTab === 'compete' && (
            <motion.div key="compete" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <CompeteView />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
               <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black tracking-tight uppercase italic">Player Protocol</h2>
                 <div className="bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Status</span>
                 </div>
               </div>

               <div className="glass-panel rounded-[2rem] p-8 space-y-6">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow border border-primary/30">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight italic">{user?.fullName}</h3>
                      <p className="text-sm text-muted-foreground font-bold">{user?.email}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rank</p>
                      <p className="font-bold text-primary flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Pro Member
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Telemetry</p>
                      <p className="font-bold">Sync Active</p>
                    </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="flex items-center gap-2">
                   <Building2 className="w-5 h-5 text-primary" />
                   <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Business & Networking</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                   <Dialog>
                     <DialogTrigger asChild>
                       <button className="glass-panel rounded-3xl p-6 text-left group hover:bg-primary/5 transition-all duration-300 border-white/5 hover:border-primary/20">
                         <div className="flex items-start justify-between">
                           <div className="space-y-2">
                             <div className="bg-primary/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:neon-glow transition-all">
                               <Briefcase className="w-5 h-5 text-primary" />
                             </div>
                             <h4 className="text-xl font-black uppercase italic tracking-tighter">Corporate Events</h4>
                             <p className="text-xs text-muted-foreground font-medium max-w-[200px]">Plan elite corporate tournaments and networking events with our concierge.</p>
                           </div>
                           <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                         </div>
                       </button>
                     </DialogTrigger>
                     <DialogContent className="glass-panel border-white/10 rounded-[2rem] max-w-sm">
                       <DialogHeader>
                         <DialogTitle className="text-2xl font-black uppercase italic">Event Protocol</DialogTitle>
                         <DialogDescription className="text-muted-foreground font-medium">
                           Our concierge will help you design a bespoke corporate golf experience.
                         </DialogDescription>
                       </DialogHeader>
                       <div className="space-y-4 pt-4">
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase">Expected Attendees</Label>
                           <Input placeholder="e.g. 24 Players" className="bg-white/5 rounded-xl border-white/10" />
                         </div>
                         <Button className="w-full h-12 rounded-xl bg-primary font-black uppercase tracking-widest text-xs">Request Proposal</Button>
                       </div>
                     </DialogContent>
                   </Dialog>

                   <button className="glass-panel rounded-3xl p-6 text-left group hover:bg-accent/5 transition-all duration-300 border-white/5 hover:border-accent/20">
                     <div className="flex items-start justify-between">
                       <div className="space-y-2">
                         <div className="bg-accent/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_-3px_rgba(var(--accent),0.5)] transition-all">
                           <Users2 className="w-5 h-5 text-accent" />
                         </div>
                         <h4 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                           Connect over Tee <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                         </h4>
                         <p className="text-xs text-muted-foreground font-medium max-w-[200px]">Book a course for 4 players. We'll match you with business leaders at your level.</p>
                       </div>
                       <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                     </div>
                   </button>
                 </div>
               </div>

               <Button variant="outline" className="w-full h-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[10px] transition-all" onClick={handleSignOut}>
                 Terminate Session
               </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
