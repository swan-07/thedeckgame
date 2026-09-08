import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="shell">
      <header className="site-header">
        <h1>
          <Link to="/" onClick={() => window.dispatchEvent(new Event("deck:home"))}>
            The Deck Game
          </Link>
        </h1>
        <nav className="site-nav">
          <Link to="/games" data-active={pathname.startsWith("/games")}>
            Games
          </Link>
        </nav>
      </header>
      <div className={"shell-content" + (pathname === "/" ? " snap" : "")}>{children}</div>
    </div>
  );
}
