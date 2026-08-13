import { RANK_ORDER, SUITS, type GamePublic, type Suit } from "./types";

export interface Cell {
  suit: Suit;
  rank: number;
  game: GamePublic | null;
}

/** Display date for a game — the date it's hosted (its game date). */
export function gameDate(g: GamePublic): string {
  const iso = g.game_date ?? g.opens_at ?? g.closes_at;
  if (!iso) return "Date TBA";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A game is "completed" once it's closed or its close date has passed. */
export function isCompleted(g: GamePublic): boolean {
  if (g.status === "closed") return true;
  if (g.closes_at && new Date(g.closes_at).getTime() < Date.now()) return true;
  return false;
}

/**
 * Split public games (already excluding deleted/draft) into the three buckets
 * the home page shows: currently-open games, completed games, and the unused
 * card slots that have no game yet.
 */
export function classifyGames(games: GamePublic[]) {
  const active: GamePublic[] = [];
  const completed: Cell[] = [];
  const used = new Set<string>();

  for (const g of games) {
    used.add(`${g.suit}-${g.rank}`);
    if (isCompleted(g)) completed.push({ suit: g.suit, rank: g.rank, game: g });
    else active.push(g);
  }

  const unused: Cell[] = [];
  for (const s of SUITS) {
    for (const r of RANK_ORDER) {
      if (!used.has(`${s.code}-${r}`)) unused.push({ suit: s.code, rank: r, game: null });
    }
  }

  return { active, completed, unused };
}
