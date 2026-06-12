import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { QuestionRenderer } from "../components/QuestionRenderer";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import {
  rankLabel,
  SUITS,
  type ApplicationDetail,
  type ApplicationSummary,
  type FileRegister,
  type GamePublic,
} from "../lib/types";

export default function Apply() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, FileRegister>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gameQuery = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => api<GamePublic>(`/games/${gameId}`, { auth: false }),
    enabled: !!gameId,
  });

  const existingQuery = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => api<ApplicationSummary[]>("/applications"),
  });

  if (gameQuery.isLoading || existingQuery.isLoading) return <div className="spinner" />;
  if (gameQuery.isError || !gameQuery.data)
    return (
      <main className="narrow center">
        <p className="notice">Game not found.</p>
      </main>
    );

  const game = gameQuery.data;
  const already = existingQuery.data?.find((a) => a.game_id === game.id);
  if (already) {
    return (
      <main className="narrow center">
        <p className="notice">
          You've already applied to this game. You can review your submission but can't change it.
        </p>
        <Link className="btn" to={`/applications/${already.id}`}>
          View my application
        </Link>
      </main>
    );
  }

  const suitMeta = SUITS.find((s) => s.code === game.suit)!;

  function validate(): string | null {
    for (const q of game.question_schema) {
      const filled =
        q.type === "file"
          ? !!files[q.id]
          : answers[q.id] !== undefined &&
            answers[q.id] !== "" &&
            !(Array.isArray(answers[q.id]) && (answers[q.id] as unknown[]).length === 0);
      if (q.required && !filled) return `"${q.label}" is required`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await api<ApplicationDetail>("/applications", {
        method: "POST",
        body: { game_id: game.id, answers, files: Object.values(files) },
      });
      navigate(`/applications/${result.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit application");
      setSubmitting(false);
    }
  }

  const hasResume = !!user?.profile.resume_path;

  return (
    <main className="narrow">
      <h2>
        {game.title}{" "}
        <span className="muted" style={{ fontSize: "0.7em" }}>
          ({rankLabel(game.rank)} {suitMeta.glyph})
        </span>
      </h2>
      {game.description && <p className="muted">{game.description}</p>}

      <div className="notice">
        Your profile details ({user?.full_name || user?.email}
        {hasResume ? ", incl. your resume" : ""}) will be attached automatically. Once submitted,
        answers can't be changed.
        {!hasResume && (
          <>
            {" "}
            <Link to="/profile">Add a resume to your profile</Link> first if this game expects
            one.
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
        {game.question_schema.map((q) => (
          <QuestionRenderer
            key={q.id}
            question={q}
            value={answers[q.id]}
            uploadedFileName={files[q.id]?.filename}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
            onFile={(reg) => setFiles((f) => ({ ...f, [q.id]: reg }))}
          />
        ))}

        {error && <div className="error">{error}</div>}
        <button className="btn btn-solid" disabled={submitting} style={{ marginTop: "1rem" }}>
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </main>
  );
}
