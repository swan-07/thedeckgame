import type { Question, QuestionType } from "../lib/types";
import "./builder.css";

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  single_choice: "Single choice",
  multi_choice: "Multiple choice",
  file: "File upload",
  number: "Number",
  date: "Date",
  url: "URL",
};

const CHOICE_TYPES: QuestionType[] = ["single_choice", "multi_choice"];

function newId() {
  return "q_" + Math.random().toString(36).slice(2, 10);
}

interface Props {
  value: Question[];
  onChange: (questions: Question[]) => void;
  disabled?: boolean;
}

export function QuestionBuilder({ value, onChange, disabled }: Props) {
  function update(i: number, patch: Partial<Question>) {
    onChange(value.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    onChange([
      ...value,
      { id: newId(), type: "short_text", label: "", required: false },
    ]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="builder">
      {value.length === 0 && (
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          No questions yet. Add the questions applicants will answer for this game.
        </p>
      )}
      {value.map((q, i) => (
        <div className="builder-row" key={q.id}>
          <div className="builder-head">
            <span className="builder-num">{i + 1}</span>
            <div className="builder-actions">
              <button type="button" disabled={disabled || i === 0} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button
                type="button"
                disabled={disabled || i === value.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
              <button type="button" disabled={disabled} onClick={() => remove(i)}>
                ✕
              </button>
            </div>
          </div>

          <label className="field">
            <span>Question label</span>
            <input
              type="text"
              value={q.label}
              disabled={disabled}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </label>

          <div className="builder-controls">
            <label className="field" style={{ marginBottom: 0 }}>
              <span>Type</span>
              <select
                value={q.type}
                disabled={disabled}
                onChange={(e) => {
                  const type = e.target.value as QuestionType;
                  update(i, {
                    type,
                    options: CHOICE_TYPES.includes(type) ? q.options ?? [""] : undefined,
                  });
                }}
              >
                {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="choice" style={{ marginTop: "1.6rem" }}>
              <input
                type="checkbox"
                checked={q.required}
                disabled={disabled}
                onChange={(e) => update(i, { required: e.target.checked })}
              />
              Required
            </label>
          </div>

          {CHOICE_TYPES.includes(q.type) && (
            <div className="builder-options">
              <span className="opt-label">Options</span>
              {(q.options ?? []).map((opt, oi) => (
                <div className="opt-row" key={oi}>
                  <input
                    type="text"
                    value={opt}
                    disabled={disabled}
                    onChange={(e) =>
                      update(i, {
                        options: (q.options ?? []).map((o, idx) =>
                          idx === oi ? e.target.value : o,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      update(i, { options: (q.options ?? []).filter((_, idx) => idx !== oi) })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={disabled}
                onClick={() => update(i, { options: [...(q.options ?? []), ""] })}
              >
                + Option
              </button>
            </div>
          )}
        </div>
      ))}

      <button type="button" className="btn btn-ghost" disabled={disabled} onClick={addQuestion}>
        + Add question
      </button>
    </div>
  );
}
