import type { GamePublic } from "./types";

/**
 * The deck's revealed cards. This is the whole data source for the site —
 * add an entry here when a card is announced. Everything not listed renders
 * as an unrevealed card in the "Upcoming" panel.
 *
 * status: "published" while applications are open, "closed" once it's done.
 * game_date is an ISO date (YYYY-MM-DD).
 */
/** Sponsor websites. A name in a game's `sponsors` links here when listed. */
export const SPONSOR_URLS: Record<string, string> = {
  "Jane Street": "https://www.janestreet.com",
  ZFellows: "https://www.zfellows.com",
  "Red Bull": "https://www.redbull.com",
  "Swan Fellows": "https://swanfellows.com",
  MATS: "https://www.matsprogram.org",
  BlueDot: "https://bluedot.org",
};

export const GAMES: GamePublic[] = [
  {
    id: "s-4",
    suit: "S",
    rank: 4,
    title: "Shadow of the Future",
    description: "",
    status: "published",
    opens_at: null,
    closes_at: null,
    game_date: "2026-11-06",
    location: "Berkeley // UC Berkeley",
    sponsors: ["Swan Fellows", "MATS", "BlueDot"],
    winner: null,
  },
  {
    id: "s-5",
    suit: "S",
    rank: 5,
    title: "Common Knowledge",
    description: "The inaugural event.",
    status: "closed",
    opens_at: null,
    closes_at: null,
    game_date: "2026-09-05",
    location: "NYC // Yale",
    apply_url: "https://partiful.com/e/j44JumdnugCLU8vgeWnJ",
    sponsors: ["Jane Street", "ZFellows", "Red Bull"],
    winner: "Habib Rahman",
    winner_url: "https://www.linkedin.com/in/habib-swe",
    photos_url: "https://photos.app.goo.gl/F8ivnuT8ofbjR2sh7",
  },
];
