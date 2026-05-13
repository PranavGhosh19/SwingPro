
"use client"

export interface UserProfile {
  role: 'club' | 'golfer';
  fullName: string;
  email: string;
  clubName?: string;
  xp: number;
  level: number;
  badges: string[];
  metrics?: {
    longestDrive: number;
    totalBirdies: number;
    bestRound: number;
  }
}

export interface Tee {
  color: string;
  rating: number;
  slope: number;
  par: number;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  tees: Tee[];
}

export interface Tournament {
  id: string;
  clubId: string;
  title: string;
  format: 'stroke' | 'stableford' | 'match' | 'scramble';
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  participants: string[];
}

export interface Round {
  id: string;
  userId: string;
  tournamentId?: string;
  date: string;
  courseName: string;
  grossScore: number;
  courseRating: number;
  slopeRating: number;
  par: number;
  puttsPerRound?: number;
  girPercentage?: number;
  fairwaysHitPercentage?: number;
  averageDrivingDistance?: number;
  threePuttPercentage?: number;
  scramblingPercentage?: number;
  missDirection?: string;
}

export function calculateDifferential(round: Round): number {
  return (113 / round.slopeRating) * (round.grossScore - round.courseRating);
}

export function calculateHandicap(rounds: Round[]): number | null {
  if (rounds.length < 3) return null;
  const differentials = rounds
    .map(r => calculateDifferential(r))
    .sort((a, b) => a - b);
  const recentRounds = Math.min(rounds.length, 20);
  const diffsToUse = recentRounds <= 3 ? 1 : 
                    recentRounds <= 5 ? 1 : 
                    recentRounds <= 10 ? 3 : 
                    recentRounds <= 15 ? 5 : 8;
  const sum = differentials.slice(0, diffsToUse).reduce((acc, curr) => acc + curr, 0);
  return Number((sum / diffsToUse).toFixed(1));
}

export function calculateCourseHandicap(index: number, slope: number, rating: number, par: number): number {
  return Math.round((index * (slope / 113)) + (rating - par));
}
