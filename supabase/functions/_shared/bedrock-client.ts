import { AnthropicBedrock } from "npm:@anthropic-ai/bedrock-sdk";

/**
 * Strip markdown code fences from AI response text before JSON.parse.
 * Handles ```json ... ``` with optional trailing prose after the fence.
 */
export function parseJsonResponse(text: string): Record<string, unknown> {
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1]);
  }
  return JSON.parse(text.trim());
}

let client: AnthropicBedrock | null = null;

export function getBedrockClient(): AnthropicBedrock {
  if (!client) {
    client = new AnthropicBedrock({
      awsRegion: Deno.env.get("AWS_REGION") || "eu-central-1",
      awsAccessKey: Deno.env.get("AWS_ACCESS_KEY_ID")!,
      awsSecretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
    });
  }
  return client;
}

export async function callBedrock(
  modelId: string,
  system: string,
  userMessage: string,
  maxTokens: number
): Promise<{
  text: string;
  tokensInput: number;
  tokensOutput: number;
}> {
  const bedrock = getBedrockClient();

  const response = await bedrock.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return {
    text,
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
  };
}
