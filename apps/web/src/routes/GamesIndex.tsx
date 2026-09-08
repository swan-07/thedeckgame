import { Link } from "react-router-dom";

import { PLAYED_GAMES } from "../lib/gamesPlayed";
import "./games.css";

export default function GamesIndex() {
  return (
    <main className="games-page">
      <h2 className="games-h">The Games</h2>
      <div className="games-list">
        {PLAYED_GAMES.map((g) => (
          <Link key={g.slug} to={`/games/${g.slug}`} className="game-card">
            <div className="game-card-name">{g.name}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
