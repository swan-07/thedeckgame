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
    id: "d-5",
    suit: "D",
    rank: 5,
    title: "Technical Gauntlet",
    description: "The inaugural event.",
    status: "published",
    opens_at: null,
    closes_at: null,
    game_date: "2026-09-01",
  },
];
