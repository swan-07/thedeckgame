import type { GamePublic } from "./types";

/**
 * The deck's revealed cards. This is the whole data source for the site —
 * add an entry here when a card is announced. Everything not listed renders
 * as an unrevealed card in the "Upcoming" panel.
 *
 * status: "published" while applications are open, "closed" once it's done.
 * game_date is an ISO date (YYYY-MM-DD).
 */
export const GAMES: GamePublic[] = [
  {
    id: "s-5",
    suit: "S",
    rank: 5,
    title: "Common Knowledge",
    description: "The inaugural event.",
    status: "published",
    opens_at: null,
    closes_at: null,
    game_date: null,
    apply_url: "https://partiful.com/e/j44JumdnugCLU8vgeWnJ",
  },
];
