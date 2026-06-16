import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SUIT_NAME, type GamePublic, type Suit } from "../lib/types";

interface Props {
  suit: Suit;
  rank: number;
  game: GamePublic | null;
}

/**
 * A single deck card. Cards with a game are clickable (open the game/apply
 * page) and reveal the game title on hover; empty card slots flip to
 * "Coming Soon" on click.
 */
export function CardTile({ suit, rank, game }: Props) {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);

  function handleClick() {
    if (game) {
      navigate(`/card/${SUIT_NAME[suit]}/${rank}`);
      return;
    }
    setFlipped((f) => !f);
  }

  return (
    <div
      className={"flip" + (game ? " unlocked" : "") + (flipped ? " flipped" : "")}
      onClick={handleClick}
    >
      <div className="flip-inner">
        <div className="flip-face flip-front">
          <img loading="lazy" src={`/cards/${suit}-${rank}.png`} alt={game ? game.title : ""} />
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
}
