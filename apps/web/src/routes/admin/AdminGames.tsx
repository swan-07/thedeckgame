import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../lib/api";
import { rankLabel, SUITS, type GameDetail, type GameSummary } from "../../lib/types";

type TransitionAction = "publish" | "close" | "reopen";

export default function AdminGames() {
  const qc = useQueryClient();
  const [showDeleted, setShowDeleted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "games"],
    queryFn: () => api<GameSummary[]>("/admin/games"),
  });

  const { data: deleted } = useQuery({
    queryKey: ["admin", "games", "deleted"],
    queryFn: () => api<GameSummary[]>("/admin/games/deleted"),
  });

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["admin", "games"] });
    qc.invalidateQueries({ queryKey: ["games", "public"] });
  }

  const transition = useMutation({
    mutationFn: ({ id, action }: { id: string; action: TransitionAction }) =>
      api<GameDetail>(`/admin/games/${id}/${action}`, { method: "POST" }),
    onSuccess: invalidateAll,
  });

  const softDelete = useMutation({
    mutationFn: (id: string) => api<GameDetail>(`/admin/games/${id}`, { method: "DELETE" }),
    onSuccess: invalidateAll,
  });

  const restore = useMutation({
    mutationFn: (id: string) =>
      api<GameDetail>(`/admin/games/${id}/restore`, { method: "POST" }),
    onSuccess: invalidateAll,
  });

  const busy = transition.isPending || softDelete.isPending || restore.isPending;

  if (isLoading) return <div className="spinner" />;

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
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
                    disabled={busy}
                    onClick={() => transition.mutate({ id: g.id, action: "publish" })}
                  >
                    Publish
                  </button>
                )}
                {g.status === "published" && (
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={busy}
                    onClick={() => transition.mutate({ id: g.id, action: "close" })}
                  >
                    Close
                  </button>
                )}
                {g.status === "closed" && (
                  <button
                    className="btn btn-sm"
                    disabled={busy}
                    onClick={() => transition.mutate({ id: g.id, action: "reopen" })}
                  >
                    Reopen
                  </button>
                )}
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this game? It moves to the Deleted section and can be restored later.",
                      )
                    )
                      softDelete.mutate(g.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deleted games — admin-only, never shown to applicants */}
      {deleted && deleted.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowDeleted((v) => !v)}
          >
            {showDeleted ? "▾" : "▸"} Deleted ({deleted.length})
          </button>

          {showDeleted && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}
            >
              {deleted.map((g) => {
                const suit = SUITS.find((s) => s.code === g.suit);
                return (
                  <div key={g.id} className="list-row" style={{ opacity: 0.7 }}>
                    <div>
                      <strong>{g.title}</strong>{" "}
                      <span className="muted">
                        {rankLabel(g.rank)} {suit?.glyph}
                      </span>
                      <div className="muted" style={{ fontSize: "0.72rem", marginTop: "0.2rem" }}>
                        was {g.status}
                        {g.deleted_at &&
                          ` · deleted ${new Date(g.deleted_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm"
                      disabled={busy}
                      onClick={() => restore.mutate(g.id)}
                    >
                      Restore
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
