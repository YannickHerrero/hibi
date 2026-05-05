import { serve } from "@hono/node-server";
import { app } from "./app.ts";

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Hibi API listening on http://localhost:${info.port}`);
  console.log(`Docs:    http://localhost:${info.port}/docs`);
  console.log(`OpenAPI: http://localhost:${info.port}/openapi.json`);
});
