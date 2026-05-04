"use client"

export interface UserProfile {
  fullName: string;
  email: string;
  handicap?: number;
  homeCourse?: string;
  bestRound?: number;
  roundsCount?: number;
}

export interface Round {
  id: string;
  date: string;
  courseName: string;
  courseRating: number;
  slopeRating: number;
  par: number;
  grossScore: number;
  netScore?: number;
  puttsPerRound?: number;
  fairwaysHitPercentage?: number;
  girPercentage?: number;
  scramblingPercentage?: number;
  missDirection?: 'left' | 'right' | 'straight' | 'N/A';
}

const STORAGE_KEY = 'swingstats_rounds';
const USER_KEY = 'swingstats_user';

export function saveUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearSession(): void {
  localStorage.removeItem(USER_KEY);
}

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
