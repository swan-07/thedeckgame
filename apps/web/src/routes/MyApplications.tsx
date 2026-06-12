import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../lib/api";
import { rankLabel, SUITS, type ApplicationSummary } from "../lib/types";

export default function MyApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => api<ApplicationSummary[]>("/applications"),
  });

  if (isLoading) return <div className="spinner" />;

  return (
    <main className="narrow">
      <h2>My Applications</h2>
      {(!data || data.length === 0) && (
        <p className="notice">
          You haven't applied to any games yet. <Link to="/">Browse the deck.</Link>
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
        {data?.map((a) => {
          const suit = SUITS.find((s) => s.code === a.game_suit);
          return (
            <Link
              key={a.id}
              to={`/applications/${a.id}`}
              className="list-row"
            >
              <div>
                <strong>{a.game_title}</strong>{" "}
                <span className="muted">
                  {rankLabel(a.game_rank)} {suit?.glyph}
                </span>
                <div className="muted" style={{ fontSize: "0.72rem", marginTop: "0.2rem" }}>
                  Submitted {new Date(a.submitted_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`badge ${a.status}`}>{a.status}</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
