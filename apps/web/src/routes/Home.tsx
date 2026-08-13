import { useEffect, useState } from "react";

import { CardTile } from "../components/CardTile";
import { SuitGrid } from "../components/SuitGrid";
import { GAMES } from "../lib/deckData";
import { classifyGames, gameDate } from "../lib/games";
import { SUITS } from "../lib/types";
import "./home.css";

type View = "center" | "left" | "right";

/** Hover-dropdown legend of suits + subjects. `drop` is the open direction;
 * `align` is which edge the menu aligns to. */
function SuitKey({
  drop,
  align,
}: {
  drop: "up" | "down";
  align: "left" | "right" | "center";
}) {
  return (
    <div className={`suit-key drop-${drop} align-${align}`}>
      <button className="suit-key-trigger" type="button">
        Key {drop === "down" ? "▾" : "▴"}
      </button>
      <div className="suit-key-menu">
        {SUITS.map((s) => (
          <div key={s.code} className={"suit-key-row" + (s.red ? " red" : "")}>
            <span className="sk-glyph">{s.glyph}</span>
            <span className="sk-label">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Large always-visible suit/subject listing across the bottom of the main page. */
function SuitIndex() {
  return (
    <div className="suit-index">
      {SUITS.map((s) => (
        <div key={s.code} className={"suit" + (s.red ? " red" : "")}>
          <div className="glyph">{s.glyph}</div>
          <div className="suit-desc">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

/** A face-down card the user hovers/clicks to slide to a side panel. */
function BackCard({
  back,
  title,
  caption,
  onActivate,
}: {
  back: "B" | "R";
  title: string;
  caption: string;
  onActivate: () => void;
}) {
  return (
    <div className="back-card" onClick={onActivate}>
      <div className="bc-head" aria-hidden>
        &nbsp;
      </div>
      <div className="bc-img">
        <img src={`/cards/Back-${back}.png`} alt="" />
      </div>
      <div className="bc-title">{title}</div>
      <div className="bc-caption">{caption}</div>
    </div>
  );
}

/** Header bar with a click control to slide back to the center. `backSide`
 * is the side the open-games center sits on relative to this panel. */
function PanelBar({
  title,
  onBack,
  backSide,
}: {
  title: string;
  onBack: () => void;
  backSide: "left" | "right";
}) {
  return (
    <div className="panel-bar">
      <div className={`panel-nav ${backSide}`}>
        <button className="panel-back" onClick={onBack}>
          {backSide === "left" ? "← Open games" : "Open games →"}
        </button>
        <SuitKey drop="down" align={backSide} />
      </div>
      <span className="panel-title">{title}</span>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("center");
  const openLeft = () => setView("left");
  const openRight = () => setView("right");

  // Clicking the "The Deck Game" logo returns to the center view.
  useEffect(() => {
    const toCenter = () => setView("center");
    window.addEventListener("deck:home", toCenter);
    return () => window.removeEventListener("deck:home", toCenter);
  }, []);

  const { active, completed, unused } = classifyGames(GAMES);
  const offset = view === "left" ? "0%" : view === "right" ? "-200%" : "-100%";

  return (
    <>
      <section className="snap-page deck-page">
        <div className="deck-stage">
          <div className="deck-track" style={{ transform: `translateX(${offset})` }}>
        {/* LEFT — completed games */}
        <section className="deck-panel">
          <PanelBar title="Completed games" onBack={() => setView("center")} backSide="right" />
          <SuitGrid cells={completed} dealToken={0} />
        </section>

        {/* CENTER — face-down cards flanking the open games */}
        <section className="deck-panel center-panel">
          <div className="center-main">
            <BackCard
              back="R"
              title="Completed"
              caption="click to see past games"
              onActivate={openLeft}
            />

            <div className="center-games">
              <h2 className="center-h">Apply</h2>
              {active.length > 0 && (
                <div className="active-row">
                  {active.map((g) => (
                    <div key={g.id} className="open-card">
                      <CardTile suit={g.suit} rank={g.rank} game={g} />
                      <div className="open-date">{gameDate(g)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <BackCard
              back="B"
              title="Upcoming"
              caption="click to reveal the deck"
              onActivate={openRight}
            />
          </div>

          <SuitIndex />
        </section>

          {/* RIGHT — upcoming / unrevealed cards */}
          <section className="deck-panel">
            <PanelBar title="Upcoming cards" onBack={() => setView("center")} backSide="left" />
            <SuitGrid cells={unused} dealToken={0} origin="left" />
          </section>
        </div>
      </div>
      </section>

      <section className="snap-page partners-page">
        <div className="partners-inner">
          <h2>Partners</h2>
          <p className="muted">
            Email us if you&rsquo;re interested in sponsoring a card:
          </p>
          <a className="btn btn-solid" href="mailto:deckgamehost@gmail.com">
            deckgamehost@gmail.com
          </a>
        </div>
      </section>
    </>
  );
}
