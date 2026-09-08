// The games actually played at Deck Game events, as a catalog of game *types*.
// Each type has an explanation and a log of every event it has appeared in.

export interface GameInstance {
  /** Which card/event this instance belongs to. */
  event: string;
  /** Card page slug for a link, e.g. "spades/5". Optional. */
  card?: string;
  /** ISO date of the event. */
  date: string;
  /** Winner or outcome of this instance. Optional until known. */
  result?: string | null;
}

export interface PlayedGame {
  slug: string;
  name: string;
  tagline: string;
  /** Optional source/inspiration line. */
  origin?: string;
  /** "How it's played" — one string per paragraph. */
  how: string[];
  /** Slide/photo image paths under /public. Empty until added. */
  images?: string[];
  instances: GameInstance[];
}

export const PLAYED_GAMES: PlayedGame[] = [
  {
    slug: "contraband",
    name: "Contraband",
    tagline: "A smuggling standoff of bluffs and treasuries.",
    origin: "after Liar Game",
    how: [
      "Players are split into groups, and each group into two teams that face each other. Every team holds a treasury of chips.",
      "Each round has a strategy phase, then a smuggling phase, then an inspection. The smuggling team's representative secretly seals some number of chips (from none to the maximum) into a case and carries it to the center.",
      "The guarding team's representative then either passes, letting whatever is inside through, or doubts and names a guess for how many chips were smuggled. Guessing right or wrong swings the score, so the whole game turns on reading your opponent.",
      "Teams swap roles and play again. Any chips still sitting in a team's treasury at the end are handed to the opposing team, so hoarding is its own risk.",
    ],
    images: [],
    instances: [
      { event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: null },
    ],
  },
  {
    slug: "garden-of-eden",
    name: "Garden of Eden",
    tagline: "Everyone chooses in secret. Trust, or take.",
    how: [
      "Every player secretly presses one of three choices before the clock runs out.",
      "What happens next depends on the whole room at once. If everyone chooses to cooperate, everyone wins. But a single defection changes who wins and who loses, and the majority can tip the result on its own.",
      "No one is told what anyone else picked until it is over, so the game is pure collective trust under the temptation to betray.",
    ],
    images: [],
    instances: [
      { event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: null },
    ],
  },
  {
    slug: "restricted-rock-paper-scissors",
    name: "Restricted Rock-Paper-Scissors",
    tagline: "Twelve cards, three stars. The stars are life; the cards are opportunity.",
    origin: "after Kaiji",
    how: [
      "Each player is given twelve cards — four rock, four paper, four scissors — and three stars. Every card may be played only once, then it is surrendered, win, lose, or draw.",
      "Players freely challenge each other to matches at a host station. Both reveal a card at once; the winner takes one star from the loser. A live display tracks how many of each card remain in play, so counting cards is a real strategy.",
      "You clear the game only if you finish with four or more stars and zero cards left. Trading cards, stars, and chips is legal and encouraged, and in the final stretch a bidding market for stars opens.",
    ],
    images: [],
    instances: [
      { event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: null },
    ],
  },
  {
    slug: "modified-prisoners-dilemma",
    name: "Modified Prisoner's Dilemma",
    tagline: "The final call: cooperate, or defect.",
    how: [
      "The finale brings the top finishers together for a single decision that settles the whole night.",
      "Each finalist privately chooses to cooperate or defect, with a prize and the 5 of Spades on the line. Neither can see the other's choice, and the payoff depends on both.",
      "It is played on paper, in the open room, with the hosts marking the outcome.",
    ],
    images: [],
    instances: [
      { event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: "Won by Habib Rahman" },
    ],
  },
];

export function findGame(slug: string): PlayedGame | undefined {
  return PLAYED_GAMES.find((g) => g.slug === slug);
}
