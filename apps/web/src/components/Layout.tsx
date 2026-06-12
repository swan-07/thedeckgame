import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { signOut } from "../lib/supabase";

export function Layout({ children }: { children: ReactNode }) {
  const { session, user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <>
      <header className="site-header">
        <h1>
          <Link to="/">The Deck Game</Link>
        </h1>
        <nav className="site-nav">
          <Link to="/about">What is this?</Link>
          {session ? (
            <>
              <Link to="/applications">My Applications</Link>
              <Link to="/profile">Profile</Link>
              {user?.role === "admin" && <Link to="/admin">Admin</Link>}
              <button onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      {children}
    </>
  );
}
