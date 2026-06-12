import { useState } from "react";

import { FileUpload } from "../components/FileUpload";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { ProfileFields, UserMe } from "../lib/types";

interface FormState extends ProfileFields {
  full_name: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState<FormState>(() => ({
    full_name: user?.full_name ?? "",
    school: user?.profile.school ?? "",
    grad_year: user?.profile.grad_year ?? undefined,
    major: user?.profile.major ?? "",
    phone: user?.profile.phone ?? "",
    linkedin_url: user?.profile.linkedin_url ?? "",
    github_url: user?.profile.github_url ?? "",
    website_url: user?.profile.website_url ?? "",
    short_bio: user?.profile.short_bio ?? "",
    resume_path: user?.profile.resume_path ?? null,
    resume_filename: user?.profile.resume_filename ?? null,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api<UserMe>("/me/profile", {
        method: "PUT",
        body: {
          ...form,
          grad_year: form.grad_year ? Number(form.grad_year) : null,
        },
      });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="narrow">
      <h2>Your Profile</h2>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        These details are reused across every application. Editing them here updates future
        applications — applications you've already submitted keep their original answers.
      </p>

      <form onSubmit={handleSave} style={{ marginTop: "2rem" }}>
        <label className="field">
          <span>Email</span>
          <input type="text" value={user?.email ?? ""} disabled />
        </label>
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </label>
        <label className="field">
          <span>School</span>
          <input
            type="text"
            value={form.school ?? ""}
            onChange={(e) => set("school", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Graduation year</span>
          <input
            type="number"
            value={form.grad_year ?? ""}
            onChange={(e) => set("grad_year", e.target.value ? Number(e.target.value) : undefined)}
          />
        </label>
        <label className="field">
          <span>Major</span>
          <input
            type="text"
            value={form.major ?? ""}
            onChange={(e) => set("major", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
          />
        </label>
        <label className="field">
          <span>LinkedIn URL</span>
          <input
            type="url"
            value={form.linkedin_url ?? ""}
            onChange={(e) => set("linkedin_url", e.target.value)}
          />
        </label>
        <label className="field">
          <span>GitHub URL</span>
          <input
            type="url"
            value={form.github_url ?? ""}
            onChange={(e) => set("github_url", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Personal website</span>
          <input
            type="url"
            value={form.website_url ?? ""}
            onChange={(e) => set("website_url", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Short bio</span>
          <textarea
            maxLength={2000}
            value={form.short_bio ?? ""}
            onChange={(e) => set("short_bio", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Resume</span>
          <FileUpload
            purpose="resume"
            currentName={form.resume_filename}
            onUploaded={(f) => {
              set("resume_path", f.storage_path);
              set("resume_filename", f.filename);
            }}
          />
        </label>

        {error && <div className="error">{error}</div>}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
          <button className="btn btn-solid" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
          {saved && <span className="muted" style={{ fontSize: "0.8rem" }}>Saved ✓</span>}
        </div>
      </form>
    </main>
  );
}
