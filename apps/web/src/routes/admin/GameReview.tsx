import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../lib/api";
import {
  rankLabel,
  SUITS,
  type ApplicationReview,
  type ApplicationStatus,
  type GameDetail,
} from "../../lib/types";

const BUCKETS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "denied", label: "Denied" },
];

const DECISIONS: { status: ApplicationStatus; label: string; cls: string }[] = [
  { status: "accepted", label: "Accept", cls: "btn-solid" },
  { status: "waitlisted", label: "Waitlist", cls: "btn" },
  { status: "denied", label: "Deny", cls: "btn-danger" },
];

function renderAnswer(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function GameReview() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  const gameQuery = useQuery({
    queryKey: ["admin", "game", id],
    queryFn: () => api<GameDetail>(`/admin/games/${id}`),
    enabled: !!id,
  });

  const appsQuery = useQuery({
    queryKey: ["admin", "applications", id],
    queryFn: () => api<ApplicationReview[]>(`/admin/games/${id}/applications`),
    enabled: !!id,
  });

  const decide = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: ApplicationStatus }) =>
      api<ApplicationReview>(`/admin/applications/${appId}/decision`, {
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "applications", id] }),
  });

  if (gameQuery.isLoading || appsQuery.isLoading) return <div className="spinner" />;

  const game = gameQuery.data;
  const apps = appsQuery.data ?? [];
  const suit = game ? SUITS.find((s) => s.code === game.suit) : undefined;
  const schema = game?.question_schema ?? [];

  const counts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <main>
      <Link className="back-link" to="/admin">
        ← All games
      </Link>
      <h2 style={{ marginTop: "1rem" }}>
        {game?.title}{" "}
        {game && suit && (
          <span className="muted" style={{ fontSize: "0.7em" }}>
            ({rankLabel(game.rank)} {suit.glyph})
          </span>
        )}
      </h2>

      <div className="bucket-tabs">
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            className={"bucket-tab" + (filter === b.key ? " active" : "")}
            onClick={() => setFilter(b.key)}
          >
            {b.label}{" "}
            <span className="muted">
              {b.key === "all" ? apps.length : counts[b.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="notice">No applications in this bucket.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
        {filtered.map((a) => (
          <div key={a.id} className="review-card">
            <div className="review-head">
              <div>
                <strong>
                  {a.applicant_name || (a.profile_snapshot.full_name as string) || "Applicant"}
                </strong>
                <div className="muted" style={{ fontSize: "0.75rem" }}>
                  {a.applicant_email}
                </div>
              </div>
              <span className={`badge ${a.status}`}>{a.status}</span>
            </div>

            <details>
              <summary className="muted" style={{ fontSize: "0.8rem", cursor: "pointer" }}>
                View application
              </summary>
              <div style={{ marginTop: "0.75rem" }}>
                {schema.map((q) => {
                  const file = a.files.find((f) => f.question_id === q.id);
                  return (
                    <div className="answer-block" key={q.id}>
                      <div className="q">{q.label}</div>
                      <div className="a">
                        {q.type === "file" ? (
                          file?.download_url ? (
                            <a href={file.download_url} target="_blank" rel="noreferrer">
                              {file.filename}
                            </a>
                          ) : (
                            "—"
                          )
                        ) : (
                          renderAnswer(a.answers[q.id])
                        )}
                      </div>
                    </div>
                  );
                })}
                {Object.entries(a.profile_snapshot)
                  .filter(([, v]) => v != null && v !== "")
                  .map(([k, v]) => (
                    <div className="answer-block" key={k}>
                      <div className="q">{k.replace(/_/g, " ")}</div>
                      <div className="a">{renderAnswer(v)}</div>
                    </div>
                  ))}
                {a.files
                  .filter((f) => f.question_id == null)
                  .map((f) => (
                    <div className="answer-block" key={f.id}>
                      <div className="q">Resume</div>
                      <div className="a">
                        {f.download_url ? (
                          <a href={f.download_url} target="_blank" rel="noreferrer">
                            {f.filename}
                          </a>
                        ) : (
                          f.filename
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </details>

            <div className="review-actions">
              {DECISIONS.map((d) => (
                <button
                  key={d.status}
                  className={`btn btn-sm ${d.cls}`}
                  disabled={decide.isPending || a.status === d.status}
                  onClick={() => decide.mutate({ appId: a.id, status: d.status })}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
