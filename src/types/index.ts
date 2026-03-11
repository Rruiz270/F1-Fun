export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'player' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  balance: number;
  created_at: string;
}

export interface Event {
  id: number;
  round: number;
  name: string;
  circuit: string;
  country: string;
  qualifying_date: string;
  qualifying_time: string;
  sprint_date: string | null;
  sprint_time: string | null;
  race_date: string;
  race_time: string;
  has_sprint: number; // SQLite boolean
  allow_late_bet: number; // SQLite boolean
  season: number;
}

export interface Bet {
  id: number;
  user_id: number;
  event_id: number;
  session_type: 'qualifying' | 'sprint' | 'race';
  positions: string; // JSON string of driver codes
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: number;
  event_id: number;
  session_type: 'qualifying' | 'sprint' | 'race';
  positions: string; // JSON string of driver codes
  fetched_at: string;
}

export interface Score {
  id: number;
  user_id: number;
  event_id: number;
  session_type: 'qualifying' | 'sprint' | 'race';
  points: number;
  computed_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  event_id: number;
  amount: number;
  type: 'entry_fee' | 'winnings';
  description: string;
  created_at: string;
}

export interface Driver {
  code: string;
  name: string;
  team: string;
  teamColor: string;
  number: number;
}

export interface CalendarEvent {
  round: number;
  name: string;
  circuit: string;
  country: string;
  qualifyingDate: string;
  qualifyingTime: string;
  sprintDate: string | null;
  sprintTime: string | null;
  raceDate: string;
  raceTime: string;
  hasSprint: boolean;
  allowLateBet: boolean;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'player' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}

export interface BetFormData {
  positions: string[];
  sessionType: 'qualifying' | 'sprint' | 'race';
}

export interface StandingsEntry {
  userId: number;
  userName: string;
  scores: Record<string, number>; // eventId-sessionType -> points
  totalPoints: number;
  balance: number;
}
