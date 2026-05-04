
"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Heart, MessageSquare, Share2, MapPin, Flag } from "lucide-react"

const MOCK_FEED = [
  {
    id: '1',
    user: { name: 'Rehan', avatar: 'https://picsum.photos/seed/rehan/100' },
    action: 'shot 81 at DLF Golf and Country Club 🔥',
    stats: { score: 81, par: '+9', fir: '57%', gir: '44%', putts: 31 },
    time: '2h ago',
    likes: 24,
    comments: 5
  },
  {
    id: '2',
    user: { name: 'Ananya', avatar: 'https://picsum.photos/seed/ananya/100' },
    action: 'unlocked "Break 90" Achievement! 🏆',
    description: 'First time breaking 90 at Boulder Hills.',
    time: '5h ago',
    likes: 42,
    comments: 12
  },
  {
    id: '3',
    user: { name: 'Vikram', avatar: 'https://picsum.photos/seed/vikram/100' },
    action: 'is playing 9 holes at Karma Lakelands 🤝',
    description: '2 slots open for Saturday 7 AM. Skill level: Beginners welcome!',
    time: '1h ago',
    likes: 8,
    comments: 2,
    type: 'meetup'
  }
];

export function FeedsView() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight uppercase italic">Social Feed</h2>
        <div className="bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_FEED.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-[2rem] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white/10">
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm">{post.user.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{post.time}</p>
                </div>
              </div>
              {post.type === 'meetup' && (
                <div className="bg-accent/20 text-accent text-[9px] font-black uppercase px-2 py-1 rounded-md border border-accent/30">
                  Meet Over Tee
                </div>
              )}
            </div>

            <p className="text-sm font-medium leading-relaxed">
              <span className="font-black text-primary">{post.user.name}</span> {post.action}
            </p>

            {post.stats && (
              <div className="grid grid-cols-4 gap-2 bg-white/5 rounded-2xl p-4 border border-white/5">
                <StatItem label="Score" value={post.stats.score} />
                <StatItem label="GIR" value={post.stats.gir} />
                <StatItem label="FIR" value={post.stats.fir} />
                <StatItem label="Putts" value={post.stats.putts} />
              </div>
            )}

            {post.description && (
              <p className="text-xs text-muted-foreground italic bg-white/5 p-3 rounded-xl border border-white/5">
                "{post.description}"
              </p>
            )}

            <div className="flex items-center gap-6 pt-2">
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group">
                <Heart className="w-4 h-4 group-hover:fill-primary" />
                <span className="text-[10px] font-black">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-black">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="text-center">
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">{label}</p>
      <p className="text-xs font-black">{value}</p>
    </div>
  )
}
