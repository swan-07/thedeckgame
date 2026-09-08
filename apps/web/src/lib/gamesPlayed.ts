// The games actually played at Deck Game events, as a catalog of game *types*.
// Explanations come from Stephanie's own slides (image gallery), not prose.

export interface GameInstance {
  event: string;
  card?: string; // card page slug, e.g. "spades/5"
  date: string; // ISO
  result?: string | null;
}

export interface PlayedGame {
  slug: string;
  name: string;
  /** Slide/photo image paths under /public. Empty until added. */
  images?: string[];
  instances: GameInstance[];
}

export const PLAYED_GAMES: PlayedGame[] = [
  {
    slug: "contraband",
    name: "Contraband",
    images: [],
    instances: [{ event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: null }],
  },
  {
    slug: "garden-of-eden",
    name: "Garden of Eden",
    images: [],
    instances: [
      {
        event: "5 of Spades",
        card: "spades/5",
        date: "2026-09-05",
        result: "Red 1, Gold 47, Silver 2, 1 abstained. Gold and Silver win; Red loses.",
      },
    ],
  },
  {
    slug: "restricted-rock-paper-scissors",
    name: "Restricted Rock-Paper-Scissors",
    images: [],
    instances: [
      {
        event: "5 of Spades",
        card: "spades/5",
        date: "2026-09-05",
        result: "Habib Rahman cleared with 41 stars.",
      },
    ],
  },
  {
    slug: "modified-prisoners-dilemma",
    name: "Modified Prisoner's Dilemma",
    images: [],
    instances: [
      {
        event: "5 of Spades",
        card: "spades/5",
        date: "2026-09-05",
        result:
          "Won by Habib Rahman. 1st place cooperated instantly, and 2nd place (Habib) defected instantly after.",
      },
    ],
  },
];

export function findGame(slug: string): PlayedGame | undefined {
  return PLAYED_GAMES.find((g) => g.slug === slug);
}
