
"use client"

import { Home, List, Calculator, Settings, Plus, Users, Trophy, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Navigation({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="max-w-md mx-auto glass-panel rounded-3xl p-2 flex items-center justify-around relative"
      >
        <NavButton active={activeTab === 'dashboard'} icon={Home} label="Home" onClick={() => onTabChange('dashboard')} />
        <NavButton active={activeTab === 'performance'} icon={BarChart3} label="Stats" onClick={() => onTabChange('performance')} />
        
        <div className="relative -top-6">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 border-4 border-background"
              size="icon"
              onClick={() => onTabChange('add')}
            >
              <Plus className="w-6 h-6 text-white" />
            </Button>
          </motion.div>
        </div>

        <NavButton active={activeTab === 'compete'} icon={Trophy} label="Compete" onClick={() => onTabChange('compete')} />
        <NavButton active={activeTab === 'settings'} icon={Settings} label="More" onClick={() => onTabChange('settings')} />
      </motion.div>
    </div>
  )
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300"
    >
      <Icon className={`w-5 h-5 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`} />
      <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 transition-all duration-300 ${active ? 'opacity-100 text-primary' : 'opacity-0'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-primary/10 rounded-xl -z-10 neon-glow"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  )
}
