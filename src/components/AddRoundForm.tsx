"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { saveRound, type Round } from "@/lib/db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Calendar as CalendarIcon, Flag, Target, Crosshair, TrendingUp } from "lucide-react"

export function AddRoundForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState<Partial<Round>>({
    date: new Date().toISOString().split('T')[0],
    courseName: '',
    courseRating: 72.0,
    slopeRating: 113,
    par: 72,
    grossScore: 72,
    missDirection: 'N/A'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const round: Round = {
      ...formData,
      id: crypto.randomUUID(),
    } as Round;
    saveRound(round);
    onComplete();
  };

  const handleChange = (field: keyof Round, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-bold">New Round</CardTitle>
        <CardDescription>Log your performance metrics for detailed analysis.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="basic">Core</TabsTrigger>
              <TabsTrigger value="driving">Driving</TabsTrigger>
              <TabsTrigger value="approach">Approach</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input required value={formData.courseName} onChange={e => handleChange('courseName', e.target.value)} placeholder="e.g. Pebble Beach" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input required type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Score (Gross)</Label>
                  <Input required type="number" value={formData.grossScore} onChange={e => handleChange('grossScore', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Par</Label>
                  <Input required type="number" value={formData.par} onChange={e => handleChange('par', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input required type="number" step="0.1" value={formData.courseRating} onChange={e => handleChange('courseRating', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Slope</Label>
                  <Input required type="number" value={formData.slopeRating} onChange={e => handleChange('slopeRating', Number(e.target.value))} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="driving" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Driving Distance (Avg Yards)</Label>
                  <Input type="number" value={formData.averageDrivingDistance || ''} onChange={e => handleChange('averageDrivingDistance', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Fairways Hit (%)</Label>
                  <Input type="number" value={formData.fairwaysHitPercentage || ''} onChange={e => handleChange('fairwaysHitPercentage', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Common Miss Direction</Label>
                  <Select value={formData.missDirection} onValueChange={v => handleChange('missDirection', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approach" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GIR %</Label>
                  <Input type="number" value={formData.girPercentage || ''} onChange={e => handleChange('girPercentage', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Putts Per Round</Label>
                  <Input type="number" value={formData.puttsPerRound || ''} onChange={e => handleChange('puttsPerRound', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>3-Putt %</Label>
                  <Input type="number" value={formData.threePuttPercentage || ''} onChange={e => handleChange('threePuttPercentage', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Scrambling %</Label>
                  <Input type="number" value={formData.scramblingPercentage || ''} onChange={e => handleChange('scramblingPercentage', Number(e.target.value))} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
            Save Round Data
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}