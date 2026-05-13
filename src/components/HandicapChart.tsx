
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { calculateHandicap, type Round } from "@/lib/db"
import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"

export function HandicapChart() {
  const { user } = useUser();
  const db = useFirestore();

  const roundsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'rounds'),
      orderBy('date', 'asc'), // Ascending for chronological trend
      limit(20)
    );
  }, [db, user]);

  const { data: roundsData } = useCollection(roundsQuery);
  const [chartData, setChartData] = useState<{ date: string; handicap: number }[]>([]);

  useEffect(() => {
    if (!roundsData) return;
    
    const rounds = roundsData as Round[];
    const data: { date: string; handicap: number }[] = [];
    
    for (let i = 0; i < rounds.length; i++) {
      // Calculate handicap using rounds up to this point in time
      const currentRoundsSnapshot = rounds.slice(0, i + 1).reverse();
      const hcp = calculateHandicap(currentRoundsSnapshot);
      if (hcp !== null) {
        data.push({
          date: new Date(rounds[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          handicap: hcp
        });
      }
    }
    setChartData(data);
  }, [roundsData]);

  if (chartData.length < 2) return null;

  return (
    <Card className="col-span-1 lg:col-span-2 bg-card border-white/5">
      <CardHeader>
        <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Handicap Protocol Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ChartContainer config={{
            handicap: {
              label: "Index",
              color: "hsl(var(--primary))",
            }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['auto', 'auto']}
                  dx={-10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="handicap"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "#000" }}
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
