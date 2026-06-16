import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
// New-style publishable key (sb_publishable_...); safe to ship to the browser.
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  // Surfaced early in dev so a missing .env doesn't fail mysteriously later.
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
}

// Supabase is used ONLY for authentication (Google sign-in) and to obtain the
// access token. All application data flows through the FastAPI backend.
export const supabase = createClient(url ?? "", publishableKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function signInWithGoogle(next?: string) {
  // Return the user to where they were headed (e.g. the apply page) after the
  // OAuth round-trip, which otherwise loses React Router navigation state.
  const redirectTo = next ? `${window.location.origin}${next}` : window.location.origin;
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
