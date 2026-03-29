export interface TournamentItem {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
}

export interface Match {
  id: string;
  item1: TournamentItem;
  item2: TournamentItem;
  winnerId: string | null;
}

export interface Round {
  roundNumber: number;
  roundName: string;
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  items: TournamentItem[];
}

export interface TournamentState {
  tournament: Tournament | null;
  rounds: Round[];
  currentRoundIndex: number;
  currentMatchIndex: number;
  status: 'idle' | 'playing' | 'finished';
  winner: TournamentItem | null;
}

export type TournamentAction =
  | { type: 'START_TOURNAMENT'; tournament: Tournament; size: number }
  | { type: 'PICK_WINNER'; winnerId: string }
  | { type: 'RESET' };
