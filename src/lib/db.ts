"use client"

export interface UserProfile {
  id?: string;
  role: 'club' | 'golfer';
  fullName: string;
  email: string;
  clubName?: string;
  xp: number;
  level: number;
  badges: string[];
  membershipStatus?: 'active' | 'inactive' | 'pending';
  membershipTier?: 'platinum' | 'gold' | 'silver' | 'guest';
  ghinId?: string;
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
  holeData?: {
    number: number;
    par: number;
    index: number;
    yardage: { [teeColor: string]: number };
  }[];
}

export type TournamentFormat = 'stroke' | 'stableford' | 'match' | 'scramble' | 'better_ball' | 'team_event';

export interface Tournament {
  id: string;
  clubId: string;
  title: string;
  description?: string;
  format: TournamentFormat;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  participants: string[]; // User IDs
  entryFee: number;
  maxPlayers: number;
  allowance: number; // e.g., 0.95 for 95%
  teeSelection: string; // "Black", "Blue", etc.
  divisions?: string[];
  pairings?: {
    groupId: string;
    players: string[];
    teeTime: string;
  }[];
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
  scores?: { [hole: number]: number }; // Hole-by-hole scores
  markerId?: string; // Verifier ID
  isVerified?: boolean;
  strokesGained?: {
    tee: number;
    approach: number;
    short: number;
    putting: number;
  }
}

/**
 * WHS Score Differential Formula:
 * (113 / Slope Rating) * (Adjusted Gross Score - Course Rating)
 */
export function calculateDifferential(round: Round): number {
  return (113 / round.slopeRating) * (round.grossScore - round.courseRating);
}

/**
 * Robust WHS Handicap Index Calculation
 * Uses the best 8 differentials out of the last 20 rounds.
 */
export function calculateHandicap(rounds: Round[]): number | null {
  if (rounds.length < 3) return null;
  
  const differentials = rounds
    .map(r => calculateDifferential(r))
    .sort((a, b) => a - b);
    
  const count = rounds.length;
  let useCount = 1;
  
  if (count >= 20) useCount = 8;
  else if (count >= 19) useCount = 7;
  else if (count >= 17) useCount = 6;
  else if (count >= 15) useCount = 5;
  else if (count >= 12) useCount = 4;
  else if (count >= 9) useCount = 3;
  else if (count >= 7) useCount = 2;
  else useCount = 1;

  const sum = differentials.slice(0, useCount).reduce((acc, curr) => acc + curr, 0);
  return Number((sum / useCount).toFixed(1));
}

/**
 * Course Handicap Formula:
 * (Handicap Index * (Slope Rating / 113)) + (Course Rating - Par)
 */
export function calculateCourseHandicap(index: number, slope: number, rating: number, par: number): number {
  return Math.round((index * (slope / 113)) + (rating - par));
}

/**
 * Playing Handicap Formula:
 * Course Handicap * Allowance (e.g., 0.95)
 */
export function calculatePlayingHandicap(courseHandicap: number, allowance: number): number {
  return Math.round(courseHandicap * allowance);
}
