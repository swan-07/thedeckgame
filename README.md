# The Deck Game

[thedeckgame.com](https://thedeckgame.com)

A year-long, 52-challenge competition based at Yale. Each event is a card in a
standard deck; winning an event wins you that card and an invitation to a
*Squid Game*–style finale once all 52 cards are claimed.

A static site: React + TypeScript + Vite, no backend.

## Adding a card

Everything the site shows comes from `apps/web/src/lib/deckData.ts`. Add an
entry to announce a card; anything not listed renders face-down under
"Upcoming".

```ts
{
  id: "d-5",
  suit: "D",              // S · C · D · H
  rank: 5,                // 1 = ace, 11–13 = J Q K
  title: "Technical Gauntlet",
  description: "The inaugural event.",
  status: "published",    // "closed" moves it to Completed
  opens_at: null,
  closes_at: null,
  game_date: "2026-09-01",
}
```

## Local development

```bash
cd apps/web
npm install
npm run dev
```

## Deployment

Push to `main`. GitHub Actions builds `apps/web` and publishes to GitHub Pages
(`.github/workflows/deploy.yml`). DNS lives at GoDaddy and points at Pages.
