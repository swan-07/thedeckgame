import { Link, useParams } from "react-router-dom";

import { findGame } from "../lib/gamesPlayed";
import "./games.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function GameDetail() {
  const { slug } = useParams();
  const game = slug ? findGame(slug) : undefined;

  if (!game) {
    return (
      <main className="games-page">
        <p className="notice">
          Unknown game. <Link to="/games">Back to the games</Link>.
        </p>
      </main>
    );
  }

  return (
    <main className="games-page">
      <div className="game-head">
        <h2 className="games-h">{game.name}</h2>
        <p className="game-tag">{game.tagline}</p>
        {game.origin ? <p className="game-origin">{game.origin}</p> : null}
      </div>

      <section className="game-section">
        <h3>How it's played</h3>
        {game.how.map((p, i) => (
          <p key={i} className="game-p">
            {p}
          </p>
        ))}
      </section>

      {game.images && game.images.length > 0 ? (
        <section className="game-section">
          <h3>In the 5 of Spades</h3>
          <div className="game-gallery">
            {game.images.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="game-shot">
                <img src={src} alt={`${game.name} — how it was played, ${i + 1}`} loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="game-section">
        <h3>Playings</h3>
        <div className="game-instances">
          {game.instances.map((inst, i) => (
            <div key={i} className="game-instance">
              <div className="gi-event">
                {inst.card ? <Link to={`/card/${inst.card}`}>{inst.event}</Link> : inst.event}
              </div>
              <div className="gi-date">{fmtDate(inst.date)}</div>
              <div className="gi-result">
                {inst.result ? inst.result : <span className="muted">result to come</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link className="back-link" to="/games">
        ← All games
      </Link>
    </main>
  );
}
