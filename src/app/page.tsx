"use client"

import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { HandicapDisplay } from "@/components/HandicapDisplay"
import { StatsGrid } from "@/components/StatsGrid"
import { HandicapChart } from "@/components/HandicapChart"
import { RecentRounds } from "@/components/RecentRounds"
import { AIInsights } from "@/components/AIInsights"
import { AddRoundForm } from "@/components/AddRoundForm"
import { CourseCalculator } from "@/components/CourseCalculator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-body">
      <header className="p-6 sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter uppercase italic">
          SwingStats <span className="text-primary">Pro</span>
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <HandicapDisplay key={`hcp-${refreshKey}`} />
            <StatsGrid key={`stats-${refreshKey}`} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HandicapChart key={`chart-${refreshKey}`} />
              <AIInsights key={`ai-${refreshKey}`} />
            </div>
            <RecentRounds refreshTrigger={refreshKey} />
          </div>
        )}

        {activeTab === 'add' && (
          <AddRoundForm onComplete={refreshData} />
        )}

        {activeTab === 'rounds' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Round History</h2>
            <RecentRounds refreshTrigger={refreshKey} />
          </div>
        )}

        {activeTab === 'calc' && (
          <CourseCalculator />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
             <h2 className="text-2xl font-bold">App Settings</h2>
             <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                <p className="text-muted-foreground">Profile and sync settings coming soon.</p>
                <p className="text-xs mt-2 opacity-50 uppercase font-bold">Version 1.0.0-PRO</p>
             </div>
          </div>
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}