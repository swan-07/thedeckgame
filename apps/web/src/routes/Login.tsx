import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { signInWithGoogle } from "../lib/supabase";

export default function Login() {
  const { session } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (session) return <Navigate to={from} replace />;

  return (
    <main className="narrow center">
      <p className="muted" style={{ margin: "3rem 0 2rem" }}>
        Sign in to apply to events and track your applications.
      </p>
      <button className="btn btn-solid" onClick={() => signInWithGoogle()}>
        Continue with Google
      </button>
    </main>
  );
}
