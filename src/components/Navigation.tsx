"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, Plus, Trophy, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

export function Navigation() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 px-6 z-[100]">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="max-w-md mx-auto glass-panel rounded-[2rem] p-3 flex items-center justify-around relative shadow-[0_-8px_48px_0_rgba(0,0,0,0.5)] border border-white/5"
      >
        <NavButton active={pathname === '/dashboard'} href="/dashboard" icon={Home} label="Home" />
        <NavButton active={pathname === '/calculator'} href="/calculator" icon={Calculator} label="Calc" />
        
        {/* Primary Action Morph Hub - Elevated with overflow allowed */}
        <div className="relative -top-10 z-[110]">
          <motion.div
            whileHover={{ scale: 1.15, y: -5 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            {/* Tactical High-Intensity Glow */}
            <div className="absolute inset-0 bg-primary blur-2xl opacity-40 animate-pulse" />
            <div className="absolute -inset-1 bg-gradient-to-t from-primary/50 to-accent/50 rounded-2xl blur-md opacity-30" />
            
            <Button 
              asChild
              className="w-16 h-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary),0.5)] border-4 border-background relative z-10 group overflow-hidden"
              size="icon"
            >
              <Link href="/add-round">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="w-8 h-8 text-white relative z-20 group-hover:rotate-90 transition-transform duration-500" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <NavButton active={pathname === '/compete'} href="/compete" icon={Trophy} label="Compete" />
        <NavButton active={pathname === '/settings'} href="/settings" icon={Settings} label="More" />
      </motion.div>
    </div>
  )
}

function NavButton({ icon: Icon, label, active, href }: { icon: any, label: string, active: boolean, href: string }) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300">
      <div className="relative z-20 flex flex-col items-center">
        <Icon className={`w-6 h-6 transition-all duration-500 ${active ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
        <AnimatePresence>
          {active && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 text-primary neon-text"
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
    </Link>
  )
}
