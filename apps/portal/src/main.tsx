import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App.tsx";
import { Account } from "./routes/Account.tsx";
import { Keys } from "./routes/Keys.tsx";
import { Login } from "./routes/Login.tsx";
import { Stats } from "./routes/Stats.tsx";
import "./styles/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Account },
      { path: "login", Component: Login },
      { path: "account", Component: Account },
      { path: "keys", Component: Keys },
      { path: "stats", Component: Stats },
    ],
  },
]);

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element missing");

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
