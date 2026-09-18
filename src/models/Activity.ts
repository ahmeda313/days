export type StreakStatus = 'completed' | 'none';

export interface Activity {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  streakEntries: StreakEntry[];
}

export interface StreakEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  status: StreakStatus;
}