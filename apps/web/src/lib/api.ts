import { supabase } from "./supabase";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach the bearer token (default true)
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, await authHeader());

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * Upload a file to Supabase Storage via a backend-issued signed URL.
 * Returns the storage path to register with the application/profile.
 */
export async function uploadFile(
  file: File,
  purpose: string,
): Promise<{ storage_path: string; filename: string; content_type: string; size: number }> {
  const signed = await api<{ path: string; token: string; signed_url: string }>(
    "/files/sign-upload",
    { method: "POST", body: { filename: file.name, purpose } },
  );

  const put = await fetch(signed.signed_url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new ApiError(put.status, "File upload failed");

  return {
    storage_path: signed.path,
    filename: file.name,
    content_type: file.type,
    size: file.size,
  };
}

export { BASE as API_BASE };
