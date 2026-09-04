export type Suit = "S" | "C" | "D" | "H";

export type GameStatus = "published" | "closed";

export interface GamePublic {
  id: string;
  suit: Suit;
  rank: number;
  title: string;
  description: string;
  status: GameStatus;
  opens_at: string | null;
  closes_at: string | null;
  game_date: string | null;
  /** External application link (e.g. Partiful). Falls back to email when absent. */
  apply_url?: string | null;
  /** Event sponsors, shown on the card. */
  sponsors?: string[];
  /** Winner's name once the event is done; null while unknown. */
  winner?: string | null;
}

export const SUITS: { code: Suit; glyph: string; name: string; desc: string; red: boolean }[] = [
  { code: "S", glyph: "♠", name: "Spades", desc: "wild & everything else", red: false },
  { code: "C", glyph: "♣", name: "Clubs", desc: "cs/ai & strategy", red: false },
  { code: "D", glyph: "♦", name: "Diamonds", desc: "math & intellectual", red: true },
  { code: "H", glyph: "♥", name: "Hearts", desc: "physical & social", red: true },
];

// 2..10, J(11), Q(12), K(13), A(1)
export const RANK_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];

export function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export const SUIT_NAME: Record<Suit, string> = {
  S: "spades",
  C: "clubs",
  D: "diamonds",
  H: "hearts",
};

export const SUIT_FROM_NAME: Record<string, Suit> = {
  spades: "S",
  clubs: "C",
  diamonds: "D",
  hearts: "H",
};
