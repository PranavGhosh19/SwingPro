"use client"

import { getRounds, type Round } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Activity, Target, Zap, CircleDashed } from "lucide-react"

export function StatsGrid() {
  const [stats, setStats] = useState({
    avgGross: 0,
    avgPutts: 0,
    avgGIR: 0,
    avgFairways: 0,
    roundsCount: 0
  });

  useEffect(() => {
    const rounds = getRounds();
    if (rounds.length === 0) return;

    const sum = rounds.reduce((acc, r) => ({
      gross: acc.gross + r.grossScore,
      putts: acc.putts + (r.puttsPerRound || 0),
      gir: acc.gir + (r.girPercentage || 0),
      fwy: acc.fwy + (r.fairwaysHitPercentage || 0),
    }), { gross: 0, putts: 0, gir: 0, fwy: 0 });

    setStats({
      avgGross: Number((sum.gross / rounds.length).toFixed(1)),
      avgPutts: Number((sum.putts / rounds.length).toFixed(1)),
      avgGIR: Number((sum.gir / rounds.length).toFixed(1)),
      avgFairways: Number((sum.fwy / rounds.length).toFixed(1)),
      roundsCount: rounds.length
    });
  }, []);

  const items = [
    { label: "Avg Score", value: stats.avgGross, icon: Activity, color: "text-primary" },
    { label: "Avg Putts", value: stats.avgPutts, icon: CircleDashed, color: "text-accent" },
    { label: "GIR %", value: `${stats.avgGIR}%`, icon: Target, color: "text-primary" },
    { label: "Fwy Hit %", value: `${stats.avgFairways}%`, icon: Zap, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <Card key={i} className="bg-card border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Last {stats.roundsCount}</span>
            </div>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}