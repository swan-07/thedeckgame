import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { DeckGrid } from "../components/DeckGrid";
import { api } from "../lib/api";
import { rankLabel, SUITS, SUIT_NAME, type GamePublic } from "../lib/types";

function nextEventLine(games: GamePublic[]) {
  const published = games
    .filter((g) => g.status === "published")
    .sort((a, b) => (a.opens_at ?? "").localeCompare(b.opens_at ?? ""));
  const next = published[0];
  if (!next) return null;
  const suit = SUITS.find((s) => s.code === next.suit)!;
  return (
    <div className="next-event">
      Next event:{" "}
      <Link to={`/card/${SUIT_NAME[next.suit]}/${next.rank}`}>
        {rankLabel(next.rank)} <span className="glyph-inline">{suit.glyph}</span>
      </Link>{" "}
      — {next.title}
    </div>
  );
}

export default function Home() {
  const { data: games, isLoading } = useQuery({
    queryKey: ["games", "public"],
    queryFn: () => api<GamePublic[]>("/games", { auth: false }),
  });

  return (
    <>
      <div className="center" style={{ padding: "0 1rem 1rem" }}>
        {isLoading ? null : nextEventLine(games ?? [])}
      </div>
      {isLoading ? <div className="spinner" /> : <DeckGrid games={games ?? []} />}
    </>
  );
}
