import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { RedirectIfAuthed, RequireAuth } from "./lib/auth.tsx";
import { Account } from "./routes/Account.tsx";
import { Landing } from "./routes/Landing.tsx";
import { Login } from "./routes/Login.tsx";
import { Stats } from "./routes/Stats.tsx";
import "./styles/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      {
        path: "login",
        element: (
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        ),
      },
      {
        path: "stats",
        element: (
          <RequireAuth>
            <Stats />
          </RequireAuth>
        ),
      },
      {
        path: "account",
        element: (
          <RequireAuth>
            <Account />
          </RequireAuth>
        ),
      },
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
