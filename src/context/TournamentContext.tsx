import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { TournamentState, TournamentAction, Tournament, Match, Round, TournamentItem } from '../types';

const initialState: TournamentState = {
  tournament: null,
  rounds: [],
  currentRoundIndex: 0,
  currentMatchIndex: 0,
  status: 'idle',
  winner: null,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function getRoundName(itemCount: number): string {
  const names: Record<number, string> = {
    256: 'Round of 256',
    128: 'Round of 128',
    64:  'Round of 64',
    32:  'Round of 32',
    16:  'Round of 16',
    8:   'Quarterfinals',
    4:   'Semifinals',
    2:   'Grand Final',
  };
  return names[itemCount] ?? `Round of ${itemCount}`;
}

function buildRound(items: TournamentItem[], roundNumber: number): Round {
  const matches: Match[] = [];
  for (let i = 0; i < items.length; i += 2) {
    matches.push({
      id: `r${roundNumber}-m${i / 2}`,
      item1: items[i]!,
      item2: items[i + 1]!,
      winnerId: null,
    });
  }
  return {
    roundNumber,
    roundName: getRoundName(items.length),
    matches,
  };
}

function buildNextRound(prevRound: Round): Round {
  const winners = prevRound.matches
    .map(m => (m.winnerId === m.item1.id ? m.item1 : m.item2));
  return buildRound(winners, prevRound.roundNumber + 1);
}

function reducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'START_TOURNAMENT': {
      const shuffled = shuffle(action.tournament.items).slice(0, action.size);
      const firstRound = buildRound(shuffled, 1);
      return {
        tournament: action.tournament,
        rounds: [firstRound],
        currentRoundIndex: 0,
        currentMatchIndex: 0,
        status: 'playing',
        winner: null,
      };
    }

    case 'PICK_WINNER': {
      const rounds = state.rounds.map((round, rIdx) => {
        if (rIdx !== state.currentRoundIndex) return round;
        return {
          ...round,
          matches: round.matches.map((match, mIdx) => {
            if (mIdx !== state.currentMatchIndex) return match;
            return { ...match, winnerId: action.winnerId };
          }),
        };
      });

      const currentRound = rounds[state.currentRoundIndex]!;
      const isLastMatch = state.currentMatchIndex === currentRound.matches.length - 1;

      if (!isLastMatch) {
        return { ...state, rounds, currentMatchIndex: state.currentMatchIndex + 1 };
      }

      // Round finished
      const nextRound = buildNextRound(currentRound);

      // Only one item left → winner
      if (nextRound.matches.length === 1 && nextRound.matches[0]!.item2 === undefined) {
        // Edge case: odd number — shouldn't happen with power-of-2, but guard anyway
        const w = currentRound.matches[state.currentMatchIndex]!;
        const winner = action.winnerId === w.item1.id ? w.item1 : w.item2;
        return { ...state, rounds, status: 'finished', winner };
      }

      if (nextRound.matches.length === 0) {
        // Truly finished (was a 2-item final)
        const w = currentRound.matches[state.currentMatchIndex]!;
        const winner = action.winnerId === w.item1.id ? w.item1 : w.item2;
        return { ...state, rounds, status: 'finished', winner };
      }

      return {
        ...state,
        rounds: [...rounds, nextRound],
        currentRoundIndex: state.currentRoundIndex + 1,
        currentMatchIndex: 0,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface TournamentContextValue {
  state: TournamentState;
  startTournament: (tournament: Tournament, size: number) => void;
  pickWinner: (winnerId: string) => void;
  reset: () => void;
  currentMatch: Match | null;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentMatch =
    state.status === 'playing'
      ? (state.rounds[state.currentRoundIndex]?.matches[state.currentMatchIndex] ?? null)
      : null;

  return (
    <TournamentContext.Provider
      value={{
        state,
        currentMatch,
        startTournament: (t, size) => dispatch({ type: 'START_TOURNAMENT', tournament: t, size }),
        pickWinner: (id) => dispatch({ type: 'PICK_WINNER', winnerId: id }),
        reset: () => dispatch({ type: 'RESET' }),
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
}
