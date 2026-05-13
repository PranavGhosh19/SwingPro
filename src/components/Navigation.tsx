"use client"

import { Home, Settings, Plus, Trophy, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

export function Navigation({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="max-w-md mx-auto glass-panel rounded-[2rem] p-3 flex items-center justify-around relative vigilant-scan shadow-[0_-8px_32px_0_rgba(0,0,0,0.4)]"
      >
        <NavButton active={activeTab === 'dashboard'} icon={Home} label="Home" onClick={() => onTabChange('dashboard')} />
        <NavButton active={activeTab === 'performance'} icon={BarChart3} label="Stats" onClick={() => onTabChange('performance')} />
        
        <div className="relative -top-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary blur-xl opacity-30 animate-pulse" />
            <Button 
              className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 border-4 border-background relative z-10"
              size="icon"
              onClick={() => onTabChange('add')}
            >
              <Plus className="w-7 h-7 text-white" />
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
      className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300"
    >
      <div className="relative z-20 flex flex-col items-center">
        <Icon className={`w-6 h-6 transition-all duration-500 ${active ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
        <AnimatePresence>
          {active && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 text-primary"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      {active && (
        <motion.div 
          layoutId="nav-glow-active"
          className="absolute inset-0 bg-primary/10 rounded-2xl z-10 border border-primary/20 neon-glow"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  )
}