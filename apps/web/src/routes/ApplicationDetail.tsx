import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { api } from "../lib/api";
import {
  rankLabel,
  SUITS,
  type ApplicationDetail as AppDetail,
  type GamePublic,
} from "../lib/types";

function renderAnswer(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function ApplicationDetail() {
  const { id } = useParams();

  const appQuery = useQuery({
    queryKey: ["application", id],
    queryFn: () => api<AppDetail>(`/applications/${id}`),
    enabled: !!id,
  });

  const gameQuery = useQuery({
    queryKey: ["game", appQuery.data?.game_id],
    queryFn: () => api<GamePublic>(`/games/${appQuery.data!.game_id}`, { auth: false }),
    enabled: !!appQuery.data?.game_id,
  });

  if (appQuery.isLoading) return <div className="spinner" />;
  if (!appQuery.data)
    return (
      <main className="narrow center">
        <p className="notice">Application not found.</p>
      </main>
    );

  const app = appQuery.data;
  const game = gameQuery.data;
  const suit = game ? SUITS.find((s) => s.code === game.suit) : undefined;
  const fileByQuestion = new Map(app.files.map((f) => [f.question_id, f]));

  return (
    <main className="narrow">
      <Link className="back-link" to="/applications">
        ← My applications
      </Link>
      <h2 style={{ marginTop: "1rem" }}>
        {game ? game.title : "Application"}{" "}
        {game && suit && (
          <span className="muted" style={{ fontSize: "0.7em" }}>
            ({rankLabel(game.rank)} {suit.glyph})
          </span>
        )}
      </h2>

      <div style={{ margin: "0.5rem 0 1.5rem" }}>
        <span className={`badge ${app.status}`}>{app.status}</span>{" "}
        <span className="muted" style={{ fontSize: "0.78rem" }}>
          Submitted {new Date(app.submitted_at).toLocaleString()}
          {app.decided_at && ` · Decided ${new Date(app.decided_at).toLocaleDateString()}`}
        </span>
      </div>

      {app.status !== "submitted" && (
        <div className={`notice`} style={{ borderColor: "var(--gold)" }}>
          Decision: <strong>{app.status}</strong>
        </div>
      )}

      <h3 style={{ marginTop: "2rem", fontSize: "1rem" }}>Your answers</h3>
      {game?.question_schema.map((q) => {
        const file = fileByQuestion.get(q.id);
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
                renderAnswer(app.answers[q.id])
              )}
            </div>
          </div>
        );
      })}

      <h3 style={{ marginTop: "2rem", fontSize: "1rem" }}>Profile snapshot</h3>
      {Object.entries(app.profile_snapshot)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => (
          <div className="answer-block" key={k}>
            <div className="q">{k.replace(/_/g, " ")}</div>
            <div className="a">{renderAnswer(v)}</div>
          </div>
        ))}

      {app.files.filter((f) => f.question_id == null).map((f) => (
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
    </main>
  );
}
