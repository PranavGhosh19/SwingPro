"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_CHALLENGES, MOCK_LEAGUES, getUser } from "@/lib/db"
import { Trophy, Target, Users, Zap, Calendar, ChevronRight, Award, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function CompeteView() {
  const user = getUser();
  const [activeSubTab, setActiveSubTab] = useState('challenges');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight uppercase italic">Compete</h2>
        <div className="flex items-center gap-2 bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30 neon-glow">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">LVL {user?.level || 1}</span>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 flex items-center justify-between relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Season Experience</p>
          <h4 className="text-2xl font-black italic uppercase">{user?.xp || 0} XP</h4>
          <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
              className="h-full bg-primary neon-glow"
            />
          </div>
        </div>
        <div className="flex gap-4 relative z-10">
          <StatMini icon={Flame} value={user?.streaks?.weeksActive || 0} label="Streak" />
          <StatMini icon={Award} value={user?.badges?.length || 0} label="Badges" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
      </div>

      <Tabs defaultValue="challenges" className="w-full" onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-2xl p-1 h-14 border border-white/5">
          <TabsTrigger value="challenges" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">Challenges</TabsTrigger>
          <TabsTrigger value="leagues" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">Leagues</TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">Rankings</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeSubTab === 'challenges' && (
            <TabsContent key="tab-challenges" value="challenges" className="space-y-6 pt-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-4">
                {MOCK_CHALLENGES.map((challenge, i) => (
                  <motion.div
                    key={`challenge-${challenge.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel rounded-3xl p-6 border-white/5 hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {challenge.type === 'score' ? <Trophy className="w-4 h-4 text-primary" /> : <Target className="w-4 h-4 text-accent" />}
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{challenge.type} challenge</span>
                        </div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter">{challenge.title}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {challenge.participants.map((p, idx) => (
                              <div key={`${challenge.id}-p-${idx}`} className="w-6 h-6 rounded-full bg-white/10 border-2 border-background flex items-center justify-center text-[8px] font-bold">
                                {p[0]}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{challenge.participants.length} Active</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Ends in 3 days</span>
                      </div>
                      <Button className="h-8 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 text-[9px] font-black uppercase tracking-widest px-4">Join Hub</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Smart Suggestion</p>
                  <h5 className="text-sm font-bold">Rahul S. has a similar handicap.</h5>
                  <p className="text-xs text-muted-foreground font-medium">Start a 1v1 match today?</p>
                </div>
                <Button size="sm" className="bg-primary text-white rounded-xl text-[10px] font-black uppercase">Invite</Button>
              </div>
            </TabsContent>
          )}

          {activeSubTab === 'leagues' && (
            <TabsContent key="tab-leagues" value="leagues" className="space-y-6 pt-6 focus-visible:outline-none">
              {MOCK_LEAGUES.map((league, i) => (
                <motion.div
                  key={`league-${league.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel rounded-3xl p-6 relative overflow-hidden group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:neon-glow transition-all">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase italic tracking-tighter leading-none">{league.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{league.city || 'Private League'} • Week {league.week}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Rank</p>
                      <p className="text-xl font-black italic text-primary">#{league.rank}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Performance Standings</span>
                      <span>Top 30%</span>
                    </div>
                    <Progress value={(1 - league.rank/league.totalPlayers) * 100} className="h-2 bg-white/5" />
                  </div>
                  <Button variant="link" className="w-full mt-4 text-primary text-[10px] font-black uppercase tracking-widest">View Full Table</Button>
                </motion.div>
              ))}
              <Button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                Create New League
              </Button>
            </TabsContent>
          )}

          {activeSubTab === 'leaderboard' && (
            <TabsContent key="tab-leaderboard" value="leaderboard" className="pt-6 focus-visible:outline-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-[2rem] overflow-hidden border-white/5"
              >
                <div className="p-6 bg-primary/5 border-b border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Global Leaderboard</h4>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { id: 'rank-1', name: 'Tiger Woods', hcp: '+4.2', rounds: 890, rank: 1 },
                    { id: 'rank-2', name: 'Rory McIlroy', hcp: '+3.1', rounds: 412, rank: 2 },
                    { id: 'rank-3', name: 'Jon Rahm', hcp: '+2.8', rounds: 356, rank: 3 },
                    { id: 'rank-self', name: 'You', hcp: '4.5', rounds: 24, rank: 142, isSelf: true },
                  ].map((entry) => (
                    <div key={entry.id} className={`p-4 flex items-center gap-4 ${entry.isSelf ? 'bg-primary/10' : ''}`}>
                      <span className={`w-6 text-xs font-black italic ${entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>{entry.rank}</span>
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">{entry.name}</p>
                        <p className="text-[8px] text-muted-foreground font-black uppercase">{entry.rounds} Rounds Recorded</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black italic text-primary">{entry.hcp}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">HCP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

function StatMini({ icon: Icon, value, label }: { icon: any, value: any, label: string }) {
  return (
    <div className="text-center">
      <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-1 mx-auto border border-white/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-xs font-black">{value}</p>
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">{label}</p>
    </div>
  )
}
