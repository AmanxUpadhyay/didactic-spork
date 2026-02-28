import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { KiraFunctionType, PersonalityMode } from "./types.ts";

/**
 * Store a Kira AI response in the ai_responses table.
 */
export async function storeResponse(
  supabase: SupabaseClient,
  opts: {
    functionType: KiraFunctionType;
    responseText: string;
    structuredData?: Record<string, unknown>;
    modelUsed: string;
    personalityMode: PersonalityMode;
    tokensInput: number;
    tokensOutput: number;
    userId?: string | null;
    sprintId?: string | null;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from("ai_responses")
    .insert({
      function_type: opts.functionType,
      response_text: opts.responseText,
      structured_data: opts.structuredData ?? null,
      model_used: opts.modelUsed,
      personality_mode: opts.personalityMode,
      tokens_input: opts.tokensInput,
      tokens_output: opts.tokensOutput,
      user_id: opts.userId ?? null,
      sprint_id: opts.sprintId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to store AI response:", error.message);
    return null;
  }

  return data.id;
}
