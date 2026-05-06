import { Outlet } from "react-router-dom";
import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";

export function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main className="page" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
