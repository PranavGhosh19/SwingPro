"use client"

import { Home, List, Calculator, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-white/5 px-4 pb-8 pt-2 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        <NavButton active={activeTab === 'dashboard'} icon={Home} label="Home" onClick={() => onTabChange('dashboard')} />
        <NavButton active={activeTab === 'rounds'} icon={List} label="History" onClick={() => onTabChange('rounds')} />
        
        <div className="relative -top-6">
          <Button 
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 border-4 border-background"
            size="icon"
            onClick={() => onTabChange('add')}
          >
            <Plus className="w-8 h-8 text-white" />
          </Button>
        </div>

        <NavButton active={activeTab === 'calc'} icon={Calculator} label="Course" onClick={() => onTabChange('calc')} />
        <NavButton active={activeTab === 'settings'} icon={Settings} label="More" onClick={() => onTabChange('settings')} />
      </div>
    </div>
  )
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}