import { Link, useParams } from "react-router-dom";

import { NotifySignup } from "../components/NotifySignup";
import { GAMES } from "../lib/deckData";
import { PLAYED_GAMES } from "../lib/gamesPlayed";
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
  const cardSlug = `${suitName}/${rank}`;
  const cardGames = PLAYED_GAMES.filter((g) => g.instances.some((inst) => inst.card === cardSlug));

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
              <div className="label">Title</div>
              <div>{game.title}</div>
            </div>
            {cardGames.length ? (
              <div className="row">
                <div className="label">Games</div>
                <div>
                  {cardGames.map((g, i) => (
                    <span key={g.slug}>
                      {i > 0 ? " · " : ""}
                      <Link to={`/games/${g.slug}`}>{g.name}</Link>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="row">
              <div className="label">Date</div>
              <div>{gameDate(game)}</div>
            </div>
            {game.location ? (
              <div className="row">
                <div className="label">Location</div>
                <div>{game.location}</div>
              </div>
            ) : null}
            <div className="row">
              <div className="label">Status</div>
              <div>
                <span className={`badge ${game.status}`}>{game.status}</span>
              </div>
            </div>
            {game.sponsors?.length ? (
              <div className="row">
                <div className="label">Sponsor</div>
                <div>{game.sponsors.join(" · ")}</div>
              </div>
            ) : null}
            <div className="row">
              <div className="label">Winner</div>
              <div>
                {game.winner ? (
                  game.winner_url ? (
                    <a href={game.winner_url} target="_blank" rel="noopener noreferrer">
                      {game.winner}
                    </a>
                  ) : (
                    game.winner
                  )
                ) : (
                  <span className="muted">TBD</span>
                )}
              </div>
            </div>
            {game.description && (
              <div className="row">
                <div className="label">About</div>
                <div>{game.description}</div>
              </div>
            )}
            {game.apply_url && (
              <div className="row">
                <div className="label">Link</div>
                <div>
                  <a href={game.apply_url} target="_blank" rel="noopener noreferrer">
                    Partiful
                  </a>
                </div>
              </div>
            )}
            {game.photos_url && (
              <div className="row">
                <div className="label">Photos</div>
                <div>
                  <a href={game.photos_url} target="_blank" rel="noopener noreferrer">
                    Google Photos
                  </a>
                </div>
              </div>
            )}
            <div style={{ marginTop: "2rem" }}>
              {game.status === "published" && game.apply_url ? (
                <a
                  className="btn btn-solid"
                  href={game.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply
                </a>
              ) : game.status === "published" ? (
                // Grayed out until the card has its application link.
                <button className="btn btn-ghost" type="button" disabled>
                  Apply
                </button>
              ) : (
                <span className="muted">Applications are closed.</span>
              )}
            </div>
            <div className="card-notify">
              <div className="label">Get notified about future games</div>
              <NotifySignup source={`card:${cardSlug}`} />
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
