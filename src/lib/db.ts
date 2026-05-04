"use client"

export interface UserProfile {
  fullName: string;
  email: string;
  handicap?: number;
  homeCourse?: string;
  bestRound?: number;
  roundsCount?: number;
  xp: number;
  level: number;
  badges: string[];
  streaks: {
    weeksActive: number;
    challengesJoined: number;
  };
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

export interface Challenge {
  id: string;
  title: string;
  type: 'score' | 'skill' | 'h2h';
  metric: 'net_score' | 'gir' | 'putts';
  startDate: string;
  endDate: string;
  participants: string[]; // user full names for mock
  prizeBadge: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface League {
  id: string;
  name: string;
  type: 'friends' | 'open';
  city?: string;
  participants: number;
  scoringType: 'points' | 'net_score';
  rank: number;
  totalPlayers: number;
  week: number;
}

const STORAGE_KEY = 'swingstats_rounds';
const USER_KEY = 'swingstats_user';

export function saveUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  const user = JSON.parse(stored);
  // Migrate old users to v2.0 schema
  if (user.xp === undefined) {
    user.xp = 450;
    user.level = 4;
    user.badges = ['Break 100', 'Clutch Player'];
    user.streaks = { weeksActive: 2, challengesJoined: 1 };
    saveUser(user);
  }
  return user;
}

export function clearSession(): void {
  localStorage.removeItem(USER_KEY);
}

export function saveRound(round: Round): void {
  const rounds = getRounds();
  rounds.unshift(round);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
  
  // Award XP
  const user = getUser();
  if (user) {
    user.xp += 100;
    user.roundsCount = (user.roundsCount || 0) + 1;
    if (user.xp >= user.level * 500) {
      user.level += 1;
    }
    saveUser(user);
  }
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

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Lowest Net Score',
    type: 'score',
    metric: 'net_score',
    startDate: '2023-11-01',
    endDate: '2023-11-07',
    participants: ['Tiger W.', 'Rory M.', 'Jon R.'],
    prizeBadge: 'Under Par Hero',
    status: 'active'
  },
  {
    id: 'c2',
    title: 'GIR Mastery',
    type: 'skill',
    metric: 'gir',
    startDate: '2023-11-01',
    endDate: '2023-11-15',
    participants: ['Viktor H.', 'Scottie S.'],
    prizeBadge: 'Green Machine',
    status: 'active'
  }
];

export const MOCK_LEAGUES: League[] = [
  {
    id: 'l1',
    name: 'Gurugram Elite',
    type: 'open',
    city: 'Gurugram',
    participants: 42,
    scoringType: 'points',
    rank: 12,
    totalPlayers: 42,
    week: 3
  },
  {
    id: 'l2',
    name: 'Office Buddies',
    type: 'friends',
    participants: 8,
    scoringType: 'net_score',
    rank: 2,
    totalPlayers: 8,
    week: 12
  }
];