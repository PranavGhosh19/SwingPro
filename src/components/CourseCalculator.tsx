"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRounds, calculateHandicap } from "@/lib/db"
import { Calculator } from "lucide-react"

export function CourseCalculator() {
  const [handicapIndex, setHandicapIndex] = useState<number>(0);
  const [slope, setSlope] = useState<number>(113);
  const [courseRating, setCourseRating] = useState<number>(72.0);
  const [par, setPar] = useState<number>(72);
  const [courseHandicap, setCourseHandicap] = useState<number>(0);

  useEffect(() => {
    const rounds = getRounds();
    const hcp = calculateHandicap(rounds);
    if (hcp !== null) setHandicapIndex(hcp);
  }, []);

  useEffect(() => {
    // Formula: (Handicap Index * (Slope Rating / 113)) + (Course Rating - Par)
    const result = (handicapIndex * (slope / 113)) + (courseRating - par);
    setCourseHandicap(Math.round(result));
  }, [handicapIndex, slope, courseRating, par]);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Course Handicap</h2>
        <p className="text-sm text-muted-foreground">Calculate your playing strokes for today.</p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Playing Strokes</p>
        <h1 className="text-6xl font-black">{courseHandicap}</h1>
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Your Handicap Index</Label>
            <Input type="number" step="0.1" value={handicapIndex} onChange={e => setHandicapIndex(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slope Rating</Label>
              <Input type="number" value={slope} onChange={e => setSlope(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Course Par</Label>
              <Input type="number" value={par} onChange={e => setPar(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Course Rating</Label>
            <Input type="number" step="0.1" value={courseRating} onChange={e => setCourseRating(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}