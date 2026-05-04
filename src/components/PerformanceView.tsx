
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getRounds, type Round, getUser } from "@/lib/db"
import { 
  Activity, 
  Target, 
  Zap, 
  CircleDashed, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  Trophy,
  History
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

export function PerformanceView() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const user = getUser();

  useEffect(() => {
    setRounds(getRounds());
  }, []);

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-black uppercase italic">No Data Protocols</h3>
        <p className="text-sm text-muted-foreground max-w-xs">Upload your first round to initialize performance analytics engine.</p>
      </div>
    );
  }

  const avgStats = rounds.reduce((acc, r) => ({
    gross: acc.gross + r.grossScore,
    putts: acc.putts + (r.puttsPerRound || 0),
    gir: acc.gir + (r.girPercentage || 0),
    fir: acc.fir + (r.fairwaysHitPercentage || 0),
    sg: {
      tee: acc.sg.tee + (r.strokesGained?.tee || 0),
      app: acc.sg.app + (r.strokesGained?.approach || 0),
      short: acc.sg.short + (r.strokesGained?.short || 0),
      putt: acc.sg.putt + (r.strokesGained?.putting || 0),
    }
  }), { gross: 0, putts: 0, gir: 0, fir: 0, sg: { tee: 0, app: 0, short: 0, putt: 0 } });

  const count = rounds.length;
  const sgData = [
    { name: 'Tee', val: avgStats.sg.tee / count },
    { name: 'App', val: avgStats.sg.app / count },
    { name: 'Short', val: avgStats.sg.short / count },
    { name: 'Putt', val: avgStats.sg.putt / count },
  ];

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight uppercase italic">Performance</h2>
        <div className="bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30 neon-glow">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Engine V2.0</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-2xl p-1 h-12 border border-white/5 mb-8">
          <TabsTrigger value="overview" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Overview</TabsTrigger>
          <TabsTrigger value="strokes" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Strokes Gained</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Insights</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="perf-overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Avg Score" value={(avgStats.gross / count).toFixed(1)} icon={Activity} color="primary" />
                <StatCard label="Best Round" value={user?.bestRound || '--'} icon={Trophy} color="accent" />
                <StatCard label="Avg Putts" value={(avgStats.putts / count).toFixed(1)} icon={CircleDashed} color="primary" />
                <StatCard label="GIR %" value={`${(avgStats.gir / count).toFixed(0)}%`} icon={Target} color="accent" />
              </div>

              <div className="glass-panel rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Improvement</h4>
                  <span className="text-primary font-black text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +3.2% vs Last Month
                  </span>
                </div>
                <div className="flex items-end gap-2 h-20">
                  {rounds.slice(0, 10).reverse().map((r, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-primary/20 rounded-t-lg hover:bg-primary/40 transition-all cursor-pointer relative group"
                      style={{ height: `${Math.max(20, (120 - r.grossScore))}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {r.grossScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'strokes' && (
            <motion.div key="perf-strokes" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              <div className="glass-panel rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-8">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Strokes Gained Engine</h3>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sgData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '12px', fontSize: '10px' }}
                      />
                      <Bar dataKey="val">
                        {sgData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.val >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Strongest Phase</p>
                    <p className="text-sm font-bold text-primary italic">Putting (+1.2)</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Growth Opportunity</p>
                    <p className="text-sm font-bold text-destructive italic">Approach (-0.8)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div key="perf-insights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <InsightRow 
                  title="Approach Alert" 
                  desc="You lose 1.8 strokes on approach shots from 150-180 yards. Your miss is 70% right."
                  icon={TrendingDown}
                  type="warning"
                />
                <InsightRow 
                  title="Clutch Putting" 
                  desc="You converted 85% of par saves inside 6 feet today. This is elite-level scrambling."
                  icon={ArrowUpRight}
                  type="success"
                />
                <InsightRow 
                  title="Coaching Tip" 
                  desc="Focus on lag putting drills. Your 3-putt percentage is slightly above league average."
                  icon={Lightbulb}
                  type="info"
                />
              </div>

              <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Social Context</p>
                    <h5 className="text-sm font-bold">You're better than 65% of local players</h5>
                    <p className="text-xs text-muted-foreground">Keep this pace to reach Scratch level by July.</p>
                  </div>
                  <Zap className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: 'primary' | 'accent' }) {
  const colorClass = color === 'primary' ? 'text-primary' : 'text-accent';
  const bgClass = color === 'primary' ? 'bg-primary/20' : 'bg-accent/20';
  
  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
      <div className={`w-8 h-8 rounded-xl ${bgClass} flex items-center justify-center mb-4 transition-all group-hover:neon-glow`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <p className="text-2xl font-black tracking-tighter mb-1 italic">{value}</p>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
    </div>
  )
}

function InsightRow({ title, desc, icon: Icon, type }: { title: string, desc: string, icon: any, type: 'warning' | 'success' | 'info' }) {
  const colors = {
    warning: 'text-destructive bg-destructive/10 border-destructive/20',
    success: 'text-primary bg-primary/10 border-primary/20',
    info: 'text-accent bg-accent/10 border-accent/20'
  };

  return (
    <div className={`p-5 rounded-3xl border ${colors[type]} flex gap-4 items-start`}>
      <div className={`p-2 rounded-xl bg-white/5`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <h5 className="text-xs font-black uppercase tracking-tight">{title}</h5>
        <p className="text-[11px] leading-relaxed font-medium opacity-80">{desc}</p>
      </div>
    </div>
  )
}
