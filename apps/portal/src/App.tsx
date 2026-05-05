import { NavLink, Outlet } from "react-router-dom";

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="brand">
          Hibi
        </NavLink>
        <nav>
          <NavLink to="/account">Account</NavLink>
          <NavLink to="/keys">API keys</NavLink>
          <NavLink to="/stats">Stats</NavLink>
          <NavLink to="/login">Sign in</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
