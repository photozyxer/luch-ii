/**
 * LLM-клиент с tool-calling (OpenAI-совместимый chat/completions).
 * Порядок провайдеров: DeepSeek (основной, дешевле) → OpenAI (резерв).
 * Портирован из luch/lib/llm.ts; здесь non-streaming — агентная петля
 * (модель ↔ инструменты) собирается в route.
 */

export type LlmMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type Provider = { name: string; url: string; model: string; apiKey: string };

function providers(): Provider[] {
  const out: Provider[] = [];
  if (process.env.DEEPSEEK_API_KEY) {
    out.push({
      name: "deepseek",
      url: "https://api.deepseek.com/chat/completions",
      model: "deepseek-chat",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    out.push({
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4.1",
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  if (out.length && process.env.LLM_BASE_URL) out[0].url = process.env.LLM_BASE_URL;
  if (out.length && process.env.LLM_MODEL) out[0].model = process.env.LLM_MODEL;
  return out;
}

export type LlmResult =
  | { ok: true; message: LlmMessage }
  | { ok: false; error: "not_configured" | "unavailable" };

/** Один ход диалога с инструментами. Failover по провайдерам. */
export async function llmChat(payload: {
  messages: LlmMessage[];
  tools?: unknown[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}): Promise<LlmResult> {
  const provs = providers();
  if (provs.length === 0) {
    console.error("llmChat: нет ни одного LLM API-ключа");
    return { ok: false, error: "not_configured" };
  }
  for (const p of provs) {
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({
          model: p.model,
          messages: payload.messages,
          tools: payload.tools,
          tool_choice: payload.tools ? "auto" : undefined,
          response_format: payload.response_format,
          temperature: payload.temperature ?? 0.5,
          max_tokens: payload.max_tokens ?? 900,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const message = data?.choices?.[0]?.message as LlmMessage | undefined;
        if (message) return { ok: true, message };
        console.error("llmChat: ответ без message", JSON.stringify(data).slice(0, 500));
      } else {
        console.error(`llmChat: ${p.name} failed`, res.status, (await res.text()).slice(0, 500));
      }
    } catch (e) {
      console.error(`llmChat: ${p.name} error`, e);
    }
  }
  return { ok: false, error: "unavailable" };
}
