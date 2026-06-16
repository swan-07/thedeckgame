import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { CardTile } from "../components/CardTile";
import { SuitGrid } from "../components/SuitGrid";
import { api } from "../lib/api";
import { classifyGames, gameDate } from "../lib/games";
import type { GamePublic } from "../lib/types";
import "./home.css";

type View = "center" | "left" | "right";

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

/** Header bar with a hover/click control to slide back to the center. */
function PanelBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="panel-bar">
      <button className="panel-back" onClick={onBack}>
        ← Open games
      </button>
      <span className="panel-title">{title}</span>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("center");
  // Bumped each time a side opens so its grid replays the dealing animation.
  const [leftDeal, setLeftDeal] = useState(0);
  const [rightDeal, setRightDeal] = useState(0);

  const openLeft = () => {
    setView("left");
    setLeftDeal((n) => n + 1);
  };
  const openRight = () => {
    setView("right");
    setRightDeal((n) => n + 1);
  };

  const { data: games, isLoading } = useQuery({
    queryKey: ["games", "public"],
    queryFn: () => api<GamePublic[]>("/games", { auth: false }),
  });

  if (isLoading) return <div className="spinner" />;

  const { active, completed, unused } = classifyGames(games ?? []);
  const offset = view === "left" ? "0%" : view === "right" ? "-200%" : "-100%";

  return (
    <div className="deck-stage">
      <div className="deck-track" style={{ transform: `translateX(${offset})` }}>
        {/* LEFT — completed games */}
        <section className="deck-panel">
          <PanelBar title="Completed games" onBack={() => setView("center")} />
          <SuitGrid cells={completed} dealToken={leftDeal} />
        </section>

        {/* CENTER — face-down cards flanking the open games */}
        <section className="deck-panel center-panel">
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
        </section>

        {/* RIGHT — upcoming / unrevealed cards */}
        <section className="deck-panel">
          <PanelBar title="Upcoming cards" onBack={() => setView("center")} />
          <SuitGrid cells={unused} dealToken={rightDeal} origin="left" />
        </section>
      </div>
    </div>
  );
}
