import { useRef, useState } from "react";

import { uploadFile } from "../lib/api";

interface Props {
  purpose: string;
  currentName?: string | null;
  onUploaded: (f: {
    storage_path: string;
    filename: string;
    content_type: string;
    size: number;
  }) => void;
}

export function FileUpload({ purpose, currentName, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(currentName ?? null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await uploadFile(file, purpose);
      setName(result.filename);
      onUploaded(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn btn-ghost"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : name ? "Replace file" : "Upload file"}
      </button>
      {name && <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem" }}>{name}</span>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
