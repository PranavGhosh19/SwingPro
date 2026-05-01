"use client"

import { useEffect, useState } from "react"
import { personalizedGolfInsights, type PersonalizedGolfInsightsOutput } from "@/ai/flows/personalized-golf-insights"
import { getRounds, calculateHandicap } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, BrainCircuit, Target, Lightbulb } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function AIInsights() {
  const [insights, setInsights] = useState<PersonalizedGolfInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      const rounds = getRounds();
      if (rounds.length < 3) return;
      
      setLoading(true);
      try {
        const hcp = calculateHandicap(rounds) || 0;
        const result = await personalizedGolfInsights({
          currentHandicapIndex: hcp,
          historicalRounds: rounds.map(r => ({
            ...r,
            missDirection: r.missDirection || 'N/A'
          })),
        });
        setInsights(result);
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (!loading && !insights) return null;

  return (
    <Card className="bg-accent/5 border-accent/20">
      <CardHeader className="flex flex-row items-center space-x-2">
        <BrainCircuit className="w-5 h-5 text-accent" />
        <CardTitle className="text-sm font-bold text-accent uppercase tracking-wider">AI Coaching Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold">Weakest Areas</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                {insights?.weakestAreas.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold">Actionable Suggestions</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                {insights?.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 text-sm leading-relaxed italic text-muted-foreground border-t border-accent/10">
              {insights?.overallAnalysis}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}