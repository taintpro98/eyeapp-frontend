import { convertToModelMessages, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream } from "ai";
import type { UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { BackendError, checkAccess } from "./_agent/backend.js";
import { buildSystemPrompt } from "./_agent/system-prompt.js";
import { createAgentTools } from "./_agent/tools.js";

/**
 * POST /api/agent — the Lumi chat (Vercel Function, deployed with the frontend).
 *
 * The browser sends the eyeapp access token; before spending any LLM tokens the
 * function asks eyeapp-backend whether that user's plan includes AI chat, and the
 * tools read data through the backend with the same token.
 *
 * Env: LLM_ROUTER_BASE_URL + LLM_ROUTER_API_KEY (OpenAI-compatible router),
 * LLM_MODEL (default model), BACKEND_URL (eyeapp-backend origin).
 */

const DEFAULT_MODEL = "ep/gemini-3.5-flash-lite";
/** Keep requests bounded: the UI never sends more, and the model only needs recent turns. */
const MAX_MESSAGES = 40;

function json(status: number, error: string, code?: string): Response {
  return new Response(JSON.stringify({ error: { code: code ?? "error", message: error } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function routerModel() {
  const base = (process.env.LLM_ROUTER_BASE_URL || "").replace(/\/+$/, "");
  const provider = createOpenAICompatible({
    name: "llm-router",
    baseURL: base.endsWith("/v1") ? base : `${base}/v1`,
    apiKey: process.env.LLM_ROUTER_API_KEY || "",
  });
  return provider.chatModel(process.env.LLM_MODEL || DEFAULT_MODEL);
}

export async function POST(req: Request): Promise<Response> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return json(401, "Missing authorization header", "unauthorized");

  try {
    await checkAccess(token);
  } catch (err) {
    if (err instanceof BackendError) return json(err.status, err.message, err.code);
    console.error("[agent] access check failed:", err);
    return json(502, "Backend unavailable", "upstream_error");
  }

  if (!process.env.LLM_ROUTER_BASE_URL) {
    return json(503, "AI chat is not configured (LLM_ROUTER_BASE_URL)", "service_unavailable");
  }

  let body: { messages?: UIMessage[]; ticker?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, "Body must be JSON", "validation_error");
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(400, "messages is required", "validation_error");
  }

  try {
    const tools = createAgentTools(token);
    const messages = await convertToModelMessages(body.messages.slice(-MAX_MESSAGES), { tools });

    const result = streamText({
      model: routerModel(),
      system: buildSystemPrompt(body.ticker),
      messages,
      tools,
      stopWhen: isStepCount(5),
      onError: ({ error }) => console.error("[agent] streamText error:", error),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        // Shown in the chat bubble: keep it short, never leak upstream internals.
        onError: (error) => {
          console.error("[agent] stream error:", error);
          const text = error instanceof Error ? error.message : String(error);
          return /429|rate|quota|limit/i.test(text) ? "rate_limited" : "generation_failed";
        },
      }),
    });
  } catch (err) {
    console.error("[agent] handler error:", err);
    return json(500, "Chat failed", "internal_error");
  }
}
