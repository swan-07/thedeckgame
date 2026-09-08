import { Link } from "react-router-dom";

import { PLAYED_GAMES } from "../lib/gamesPlayed";
import "./games.css";

export default function GamesIndex() {
  return (
    <main className="games-page">
      <h2 className="games-h">The Games</h2>
      <p className="games-intro muted">
        The games played across Deck Game events — each one explained, with every time it has been run.
      </p>
      <div className="games-list">
        {PLAYED_GAMES.map((g) => (
          <Link key={g.slug} to={`/games/${g.slug}`} className="game-card">
            <div className="game-card-name">{g.name}</div>
            <div className="game-card-tag">{g.tagline}</div>
            <div className="game-card-meta">
              {g.instances.length} {g.instances.length === 1 ? "playing" : "playings"}
              {g.origin ? ` · ${g.origin}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
