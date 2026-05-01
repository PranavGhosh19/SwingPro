"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getRounds, calculateHandicap, Round } from "@/lib/db"
import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

export function HandicapChart() {
  const [chartData, setChartData] = useState<{ date: string; handicap: number }[]>([]);

  useEffect(() => {
    const rounds = getRounds().reverse(); // Chronological order
    const data: { date: string; handicap: number }[] = [];
    
    for (let i = 0; i < rounds.length; i++) {
      const currentRounds = rounds.slice(0, i + 1).reverse(); // Most recent first for calculator
      const hcp = calculateHandicap(currentRounds);
      if (hcp !== null) {
        data.push({
          date: new Date(rounds[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          handicap: hcp
        });
      }
    }
    setChartData(data);
  }, []);

  if (chartData.length < 2) return null;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Handicap Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ChartContainer config={{
            handicap: {
              label: "Handicap Index",
              color: "hsl(var(--primary))",
            }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['auto', 'auto']}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="handicap"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}