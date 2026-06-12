import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { RANK_ORDER, SUITS, SUIT_NAME, type GamePublic, type Suit } from "../lib/types";
import "./deck.css";

function key(suit: Suit, rank: number) {
  return `${suit}-${rank}`;
}

export function DeckGrid({ games }: { games: GamePublic[] }) {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  const byCard = new Map<string, GamePublic>();
  for (const g of games) byCard.set(key(g.suit, g.rank), g);

  function onCardClick(suit: Suit, rank: number) {
    const game = byCard.get(key(suit, rank));
    if (game) {
      navigate(`/card/${SUIT_NAME[suit]}/${rank}`);
      return;
    }
    const k = key(suit, rank);
    setFlipped((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  return (
    <section className="suits">
      {SUITS.map((s) => (
        <div key={s.code} className={"suit" + (s.red ? " red" : "")}>
          <div className="glyph">{s.glyph}</div>
          <div className="suit-desc">{s.desc}</div>
          <div className="cards">
            {RANK_ORDER.map((rank) => {
              const k = key(s.code, rank);
              const game = byCard.get(k);
              const isFlipped = flipped.has(k);
              return (
                <div
                  key={k}
                  className={
                    "flip" + (game ? " unlocked" : "") + (isFlipped ? " flipped" : "")
                  }
                  onClick={() => onCardClick(s.code, rank)}
                >
                  <div className="flip-inner">
                    <div className="flip-face flip-front">
                      <img loading="lazy" src={`/cards/${s.code}-${rank}.png`} alt="" />
                    </div>
                    <div className="flip-face flip-back">
                      {game ? (
                        <div className="info">
                          <span>Game</span>
                          {game.title}
                        </div>
                      ) : (
                        "Coming Soon"
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
