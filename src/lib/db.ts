"use client"

export interface Round {
  id: string;
  date: string;
  courseName: string;
  courseRating: number;
  slopeRating: number;
  par: number;
  grossScore: number;
  netScore?: number;
  strokesGainedOffTheTee?: number;
  strokesGainedApproach?: number;
  strokesGainedShortGame?: number;
  strokesGainedPutting?: number;
  puttsPerRound?: number;
  threePuttPercentage?: number;
  onePuttPercentage?: number;
  fairwaysHitPercentage?: number;
  averageDrivingDistance?: number;
  missDirection?: 'left' | 'right' | 'straight' | 'N/A';
  girPercentage?: number;
  upAndDownPercentage?: number;
  scramblingPercentage?: number;
}

const STORAGE_KEY = 'swingstats_rounds';

export function saveRound(round: Round): void {
  const rounds = getRounds();
  rounds.unshift(round);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

export function getRounds(): Round[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteRound(id: string): void {
  const rounds = getRounds().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
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
                    recentRounds <= 6 ? 2 : 
                    recentRounds <= 8 ? 2 : 
                    recentRounds <= 10 ? 3 : 
                    recentRounds <= 12 ? 4 : 
                    recentRounds <= 14 ? 5 : 
                    recentRounds <= 16 ? 5 : 
                    recentRounds <= 18 ? 6 : 
                    recentRounds <= 19 ? 7 : 8;

  const sum = differentials.slice(0, diffsToUse).reduce((acc, curr) => acc + curr, 0);
  return Number((sum / diffsToUse).toFixed(1));
}