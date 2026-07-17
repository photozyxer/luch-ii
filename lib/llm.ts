/**
 * Общий LLM-клиент демо-модулей (consult, smm).
 * Порядок провайдеров: DeepSeek (основной, дешевле) → OpenAI (резерв).
 * Каждый провайдер — своя пара URL+модель: ключ DeepSeek не полетит на
 * api.openai.com и наоборот. LLM_BASE_URL/LLM_MODEL переопределяют первый
 * доступный провайдер (аварийный ручной режим).
 */

export type LlmProvider = {
  name: string;
  url: string;
  model: string;
  apiKey: string;
};

export function llmProviders(): LlmProvider[] {
  const out: LlmProvider[] = [];
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

/**
 * Запрос с failover: идём по провайдерам, возвращаем первый успешный ответ.
 * `payload` — тело chat/completions без поля model (подставляется на каждого
 * провайдера). Если все упали — возвращается последний неуспешный Response.
 */
export async function llmFetch(
  tag: string,
  payload: Record<string, unknown>,
): Promise<Response | null> {
  const providers = llmProviders();
  if (providers.length === 0) {
    console.error(`${tag}: no LLM API key is configured`);
    return null;
  }
  let last: Response | null = null;
  for (const p of providers) {
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({ ...payload, model: p.model }),
      });
      if (res.ok) return res;
      console.error(`${tag}: ${p.name} failed`, res.status, await res.text());
      last = res;
    } catch (e) {
      console.error(`${tag}: ${p.name} error`, e);
    }
  }
  // все провайдеры недоступны (сетевые ошибки) — отдаём 502, а не «не настроено»
  return last ?? new Response("all llm providers failed", { status: 502 });
}
