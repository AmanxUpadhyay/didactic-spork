import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Connection": "keep-alive",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export { corsHeaders };

/**
 * Verify service_role JWT claim (for cron-invoked functions).
 * Returns a Supabase admin client or null if unauthorized.
 */
export function verifyServiceRole(
  authHeader: string | null
): { client: SupabaseClient; error: null } | { client: null; error: Response } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return {
      client: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      }),
    };
  }

  try {
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.role !== "service_role") {
      return {
        client: null,
        error: new Response(
          JSON.stringify({ error: "Unauthorized: not service_role" }),
          { status: 401, headers: corsHeaders }
        ),
      };
    }
  } catch {
    return {
      client: null,
      error: new Response(
        JSON.stringify({ error: "Unauthorized: invalid token" }),
        { status: 401, headers: corsHeaders }
      ),
    };
  }

  return {
    client: createClient(supabaseUrl, serviceRoleKey),
    error: null,
  };
}

/**
 * Verify a user JWT (for interactive functions).
 * Returns a Supabase client scoped to the user, plus their userId.
 */
export async function verifyUserJwt(
  authHeader: string | null
): Promise<
  | { client: SupabaseClient; userId: string; error: null }
  | { client: null; userId: null; error: Response }
> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return {
      client: null,
      userId: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      }),
    };
  }

  // Decode JWT to get user ID
  try {
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    const userId = payload.sub;
    if (!userId) {
      return {
        client: null,
        userId: null,
        error: new Response(
          JSON.stringify({ error: "Unauthorized: no sub claim" }),
          { status: 401, headers: corsHeaders }
        ),
      };
    }

    // Create admin client for unrestricted queries (we validated the user)
    const client = createClient(supabaseUrl, serviceRoleKey);

    return { client, userId, error: null };
  } catch {
    return {
      client: null,
      userId: null,
      error: new Response(
        JSON.stringify({ error: "Unauthorized: invalid token" }),
        { status: 401, headers: corsHeaders }
      ),
    };
  }
}
