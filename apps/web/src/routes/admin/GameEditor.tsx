import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { QuestionBuilder } from "../../components/QuestionBuilder";
import { api, ApiError } from "../../lib/api";
import { rankLabel, type GameDetail, type Question, type Suit } from "../../lib/types";

interface FormState {
  suit: Suit;
  rank: number;
  title: string;
  description: string;
  opens_at: string;
  closes_at: string;
  question_schema: Question[];
}

const EMPTY: FormState = {
  suit: "D",
  rank: 5,
  title: "",
  description: "",
  opens_at: "",
  closes_at: "",
  question_schema: [],
};

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function localInputToIso(local: string): string | null {
  return local ? new Date(local).toISOString() : null;
}

export default function GameEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = !!id;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<GameDetail["status"]>("draft");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const gameQuery = useQuery({
    queryKey: ["admin", "game", id],
    queryFn: () => api<GameDetail>(`/admin/games/${id}`),
    enabled: editing,
  });

  useEffect(() => {
    if (gameQuery.data) {
      const g = gameQuery.data;
      setStatus(g.status);
      setForm({
        suit: g.suit,
        rank: g.rank,
        title: g.title,
        description: g.description,
        opens_at: isoToLocalInput(g.opens_at),
        closes_at: isoToLocalInput(g.closes_at),
        question_schema: g.question_schema,
      });
    }
  }, [gameQuery.data]);

  const locked = editing && status !== "draft";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const base = {
      title: form.title,
      description: form.description,
      opens_at: localInputToIso(form.opens_at),
      closes_at: localInputToIso(form.closes_at),
    };
    const structural = {
      suit: form.suit,
      rank: form.rank,
      question_schema: form.question_schema,
    };

    try {
      if (editing) {
        const body = locked ? base : { ...base, ...structural };
        await api<GameDetail>(`/admin/games/${id}`, { method: "PATCH", body });
      } else {
        await api<GameDetail>("/admin/games", {
          method: "POST",
          body: { ...base, ...structural },
        });
      }
      navigate("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save game");
      setSaving(false);
    }
  }

  if (editing && gameQuery.isLoading) return <div className="spinner" />;

  return (
    <main className="narrow">
      <h2>{editing ? "Edit game" : "New game"}</h2>
      {locked && (
        <p className="notice">
          This game is {status}. The card and questions are locked to protect existing
          applications — you can still edit the title, description, and dates.
        </p>
      )}

      <form onSubmit={handleSave} style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <label className="field" style={{ flex: 1 }}>
            <span>Suit</span>
            <select
              value={form.suit}
              disabled={locked}
              onChange={(e) => set("suit", e.target.value as Suit)}
            >
              <option value="S">♠ Spades</option>
              <option value="C">♣ Clubs</option>
              <option value="D">♦ Diamonds</option>
              <option value="H">♥ Hearts</option>
            </select>
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span>Rank</span>
            <select
              value={form.rank}
              disabled={locked}
              onChange={(e) => set("rank", Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1].map((r) => (
                <option key={r} value={r}>
                  {rankLabel(r)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <label className="field" style={{ flex: 1 }}>
            <span>Opens at</span>
            <input
              type="datetime-local"
              value={form.opens_at}
              onChange={(e) => set("opens_at", e.target.value)}
            />
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span>Closes at</span>
            <input
              type="datetime-local"
              value={form.closes_at}
              onChange={(e) => set("closes_at", e.target.value)}
            />
          </label>
        </div>

        <h3 style={{ marginTop: "2rem", fontSize: "1rem" }}>Application questions</h3>
        <QuestionBuilder
          value={form.question_schema}
          disabled={locked}
          onChange={(qs) => set("question_schema", qs)}
        />

        {error && <div className="error">{error}</div>}
        <button className="btn btn-solid" disabled={saving} style={{ marginTop: "1.5rem" }}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create game"}
        </button>
      </form>
    </main>
  );
}
