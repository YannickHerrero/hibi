import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { useTheme } from "../lib/theme.ts";
import { ThemeBar } from "./ThemeBar.tsx";

export function Header() {
  const { session, loading } = useAuth();
  const [theme, setTheme] = useTheme();

  return (
    <header className="masthead" style={{ gap: 16 }}>
      <Link
        to="/"
        className="display"
        style={{ fontSize: 22, color: "var(--ink)", textDecoration: "none" }}
      >
        Hibi
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
        {loading ? null : session ? (
          <>
            <ThemeBar theme={theme} onChange={setTheme} />
            <NavLink
              to="/stats"
              className={({ isActive }) => `meta${isActive ? " active" : ""}`}
              style={{ textDecoration: "none" }}
            >
              Stats
            </NavLink>
            <NavLink
              to="/account"
              className={({ isActive }) => `meta${isActive ? " active" : ""}`}
              style={{ textDecoration: "none" }}
            >
              Account
            </NavLink>
          </>
        ) : (
          <Link to="/login" className="meta" style={{ textDecoration: "none" }}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
