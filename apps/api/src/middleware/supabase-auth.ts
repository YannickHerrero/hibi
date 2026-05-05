import { createClient } from "@supabase/supabase-js";
import { createMiddleware } from "hono/factory";
import { getEnv } from "../env.ts";
import { unauthorized } from "../lib/errors.ts";

export interface SupabaseAuthContext {
  userId: string;
  email: string;
}

export const supabaseAuth = createMiddleware<{
  Variables: { auth: SupabaseAuthContext };
}>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw unauthorized("Missing Bearer token");
  }

  const jwt = header.slice("Bearer ".length).trim();
  const env = getEnv();
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(jwt);
  if (error || !data.user || !data.user.email) {
    throw unauthorized("Invalid session token");
  }

  c.set("auth", { userId: data.user.id, email: data.user.email });
  await next();
});
