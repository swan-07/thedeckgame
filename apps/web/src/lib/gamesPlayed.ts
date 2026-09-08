// The games actually played at Deck Game events, as a catalog of game *types*.
// Rules text is Stephanie's own, from the 5 of Spades info doc.

export interface GameInstance {
  event: string;
  card?: string; // card page slug, e.g. "spades/5"
  date: string; // ISO
  result?: string | null;
}

export interface PlayedGame {
  slug: string;
  name: string;
  /** How it's played — one string per paragraph. */
  how: string[];
  /** Slide/photo image paths under /public. Empty until added. */
  images?: string[];
  instances: GameInstance[];
}

export const PLAYED_GAMES: PlayedGame[] = [
  {
    slug: "contraband",
    name: "Contraband",
    how: [
      "You are divided into groups of about ten, and groups are paired to compete: 1 and 2, 3 and 4, 5 and 6. In each pair, the odd team is Team A and the even team is Team B.",
      "Each team starts with a treasury of 10 chips. Ten minutes are given to discuss strategy and choose a representative.",
      "Two minutes: Team A's representative secretly puts between 0 and 10 chips (X) from the treasury into a case and brings it to the middle.",
      "Two minutes: the representatives may talk. Then Team B's representative says either \"pass\" or \"doubt\". If they doubt, they also give a guess Y for what X is.",
      "If B passes, all of Team A gain X chips. If B doubts and X = 0 (a bluff), all of B lose floor(Y/2) and all of A gain floor(Y/2). If B doubts and 0 < X ≤ Y (caught), all of B gain X. If B doubts and X > Y (slipped through), all of A bank X, all of B lose floor(Y/2), and A gains an extra floor(Y/2).",
      "Pairs reveal in order (1 and 2, then 3 and 4, then 5 and 6), then the teams swap roles and play again. Any chips left in a treasury at the end are given to the opposing team.",
    ],
    images: [],
    instances: [{ event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: null }],
  },
  {
    slug: "garden-of-eden",
    name: "Garden of Eden",
    how: [
      "There are three buttons on your phone: Red, Gold, and Silver. Over the course of the round, everyone must press one.",
      "If no one presses Red and only Gold and Silver are pressed, the majority color wins and the minority loses. An exact tie means everyone loses. If everyone presses Gold, or everyone presses Silver, everyone loses.",
      "The only way everyone can win is if everyone presses Red. But if even one player presses Gold or Silver while others press Red, then everyone who pressed Red loses, and those who pressed Gold or Silver win, regardless of color.",
      "Winners get 100 points; losers get 0.",
    ],
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
    how: [
      "Each player receives 12 cards (four rock, four paper, four scissors) and three stars.",
      "Players freely challenge each other to matches. Both choose one card and reveal at once; the winner takes one star from the loser, and ties exchange nothing. Every card is surrendered after the match, win, lose, or draw, so each card is played only once. A live display shows how many of each card remain in circulation, so counting cards is a viable strategy.",
      "After 90 minutes, a player clears if they hold four or more stars and have zero cards remaining. Clearing is worth 100 points, plus 25 points per star above four. Finishing with fewer than four stars, or with unplayed cards, scores nothing.",
      "Trading is legal and encouraged: players buy and sell cards and stars at freely negotiated prices. In the last 30 minutes, a bidding market for stars opens.",
    ],
    images: [],
    instances: [
      { event: "5 of Spades", card: "spades/5", date: "2026-09-05", result: "Five syndicates formed." },
    ],
  },
  {
    slug: "modified-prisoners-dilemma",
    name: "Modified Prisoner's Dilemma",
    how: [
      "The three players with the most points advance. Ties are broken by a Keynesian beauty contest: everyone tied submits a number from 0 to 100, and the closest to 0.8 of the average takes the spot.",
      "Call first place A, second place B, third place C. A and B play a modified Prisoner's Dilemma on a five-minute timer. Each writes \"cooperate\" or \"defect\" on paper at any time and submits it to a case, unable to see the other's choice.",
      "If both cooperate, the first to submit wins. If one cooperates and one defects, the defector wins. If both defect, C wins.",
    ],
    images: [],
    instances: [
      {
        event: "5 of Spades",
        card: "spades/5",
        date: "2026-09-05",
        result: "1st place cooperated instantly; 2nd place defected instantly after and won.",
      },
    ],
  },
];

export function findGame(slug: string): PlayedGame | undefined {
  return PLAYED_GAMES.find((g) => g.slug === slug);
}
