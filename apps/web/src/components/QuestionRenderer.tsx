import type { FileRegister, Question } from "../lib/types";
import { FileUpload } from "./FileUpload";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onFile: (register: FileRegister) => void;
  uploadedFileName?: string | null;
}

export function QuestionRenderer({ question, value, onChange, onFile, uploadedFileName }: Props) {
  const q = question;

  function render() {
    switch (q.type) {
      case "short_text":
        return (
          <input
            type="text"
            maxLength={q.maxLength ?? undefined}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "long_text":
        return (
          <textarea
            maxLength={q.maxLength ?? undefined}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "url":
        return (
          <input
            type="url"
            placeholder="https://"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "single_choice":
        return (
          <div>
            {(q.options ?? []).map((opt) => (
              <label key={opt} className="choice">
                <input
                  type="radio"
                  name={q.id}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      case "multi_choice": {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div>
            {(q.options ?? []).map((opt) => (
              <label key={opt} className="choice">
                <input
                  type="checkbox"
                  checked={arr.includes(opt)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked ? [...arr, opt] : arr.filter((v) => v !== opt),
                    )
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        );
      }
      case "file":
        return (
          <FileUpload
            purpose={q.id}
            currentName={uploadedFileName}
            onUploaded={(f) => onFile({ ...f, question_id: q.id })}
          />
        );
    }
  }

  return (
    <label className="field">
      <span>
        {q.label}
        {q.required && <span className="req">*</span>}
      </span>
      {render()}
    </label>
  );
}
