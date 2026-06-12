import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../../lib/api";
import { rankLabel, SUITS, type GameDetail, type GameSummary } from "../../lib/types";

export default function AdminGames() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "games"],
    queryFn: () => api<GameSummary[]>("/admin/games"),
  });

  const transition = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "publish" | "close" }) =>
      api<GameDetail>(`/admin/games/${id}/${action}`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "games"] });
      qc.invalidateQueries({ queryKey: ["games", "public"] });
    },
  });

  if (isLoading) return <div className="spinner" />;

  return (
    <main>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2>Games</h2>
        <Link className="btn btn-solid" to="/admin/games/new">
          + New game
        </Link>
      </div>

      {(!data || data.length === 0) && (
        <p className="notice">No games yet. Create your first one.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
        {data?.map((g) => {
          const suit = SUITS.find((s) => s.code === g.suit);
          return (
            <div key={g.id} className="list-row">
              <div>
                <strong>{g.title}</strong>{" "}
                <span className="muted">
                  {rankLabel(g.rank)} {suit?.glyph}
                </span>
                <div className="muted" style={{ fontSize: "0.72rem", marginTop: "0.2rem" }}>
                  {g.application_count} application{g.application_count === 1 ? "" : "s"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className={`badge ${g.status}`}>{g.status}</span>
                <Link className="btn btn-ghost btn-sm" to={`/admin/games/${g.id}/review`}>
                  Review
                </Link>
                <Link className="btn btn-ghost btn-sm" to={`/admin/games/${g.id}/edit`}>
                  Edit
                </Link>
                {g.status === "draft" && (
                  <button
                    className="btn btn-sm"
                    disabled={transition.isPending}
                    onClick={() => transition.mutate({ id: g.id, action: "publish" })}
                  >
                    Publish
                  </button>
                )}
                {g.status === "published" && (
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={transition.isPending}
                    onClick={() => transition.mutate({ id: g.id, action: "close" })}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
