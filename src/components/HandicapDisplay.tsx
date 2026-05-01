"use client"

import { Card, CardContent } from "@/components/ui/card"
import { calculateHandicap, getRounds } from "@/lib/db"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"

export function HandicapDisplay() {
  const [handicap, setHandicap] = useState<number | null>(null);

  useEffect(() => {
    const rounds = getRounds();
    setHandicap(calculateHandicap(rounds));
  }, []);

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Handicap Index</p>
            <h2 className="text-4xl font-bold text-foreground mt-1">
              {handicap !== null ? handicap : "--.-"}
            </h2>
          </div>
          <div className="bg-primary/20 p-3 rounded-full">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}