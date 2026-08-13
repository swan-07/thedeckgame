import { Link, useParams } from "react-router-dom";

import { GAMES } from "../lib/deckData";
import { gameDate } from "../lib/games";
import { rankLabel, SUITS, SUIT_FROM_NAME, type Suit } from "../lib/types";
import "./card-detail.css";

export default function CardDetail() {
  const { suit: suitName, rank: rankStr } = useParams();
  const suit = SUIT_FROM_NAME[suitName ?? ""] as Suit | undefined;
  const rank = Number(rankStr);

  const game = GAMES.find((g) => g.suit === suit && g.rank === rank);
  const suitMeta = SUITS.find((s) => s.code === suit);

  if (!suit || !suitMeta) return <main className="narrow center"><p>Unknown card.</p></main>;

  const cardName = `${rankLabel(rank)} of ${suitMeta.name}`;

  return (
    <main className="card-detail">
      <div>
        <img className="card-img" src={`/cards/${suit}-${rank}.png`} alt={cardName} />
      </div>
      <div className="card-info">
        <h2>{cardName}</h2>
        {!game ? (
          <p className="notice">
            This card has not been revealed yet. Check back soon —{" "}
            <Link to="/">return to the deck</Link>.
          </p>
        ) : (
          <>
            <div className="row">
              <div className="label">Suit</div>
              <div>{suitMeta.name}</div>
            </div>
            <div className="row">
              <div className="label">Game</div>
              <div>{game.title}</div>
            </div>
            <div className="row">
              <div className="label">Date</div>
              <div>{gameDate(game)}</div>
            </div>
            <div className="row">
              <div className="label">Status</div>
              <div>
                <span className={`badge ${game.status}`}>{game.status}</span>
              </div>
            </div>
            {game.description && (
              <div className="row">
                <div className="label">About</div>
                <div>{game.description}</div>
              </div>
            )}
            <div style={{ marginTop: "2rem" }}>
              {game.status === "published" ? (
                <a
                  className="btn btn-solid"
                  href={`mailto:deckgamehost@gmail.com?subject=${encodeURIComponent(
                    `Applying: ${game.title}`,
                  )}`}
                >
                  Apply
                </a>
              ) : (
                <span className="muted">Applications are closed.</span>
              )}
            </div>
          </>
        )}
        <Link className="back-link" to="/">
          ← Back to deck
        </Link>
      </div>
    </main>
  );
}
