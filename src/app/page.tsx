
"use client"

import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { AddRoundForm } from "@/components/AddRoundForm"
import { CourseCalculator } from "@/components/CourseCalculator"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-body selection:bg-primary/30 overflow-x-hidden">
      <header className="p-6 sticky top-0 bg-background/60 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
            SwingStats <span className="text-primary neon-text">Pro</span>
          </h1>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse neon-glow" />
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
            >
              <HandicapDisplay key={`hcp-${refreshKey}`} />
              <StatsGrid key={`stats-${refreshKey}`} />
              <div className="grid grid-cols-1 gap-6">
                <HandicapChart key={`chart-${refreshKey}`} />
              </div>
              <RecentRounds refreshTrigger={refreshKey} />
            </motion.div>
          )}

          {activeTab === 'add' && (
            <motion.div 
              key="add"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AddRoundForm onComplete={refreshData} />
            </motion.div>
          )}

          {activeTab === 'rounds' && (
            <motion.div 
              key="rounds"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-3xl font-black tracking-tight uppercase italic">Round History</h2>
              <RecentRounds refreshTrigger={refreshKey} />
            </motion.div>
          )}

          {activeTab === 'calc' && (
            <motion.div 
              key="calc"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CourseCalculator />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
               <h2 className="text-3xl font-black tracking-tight uppercase italic">Settings</h2>
               <div className="p-12 glass-panel rounded-3xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 futuristic-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="text-muted-foreground relative z-10">Advanced telemetry sync coming soon.</p>
                  <p className="text-[10px] mt-4 opacity-50 uppercase font-black tracking-[0.2em] relative z-10">System Version 2.0.0-CORE</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
