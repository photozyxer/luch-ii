/**
 * ВРЕМЕННЫЙ роут: генерация фонов для SMM-демо через OpenAI Images.
 * Нужен, потому что api.openai.com недоступен из локальной сети, а Vercel — в US.
 * Защищён одноразовым токеном. Удаляется сразу после скачивания фонов.
 */

export const maxDuration = 300;

const TOKEN = "a25d28d671b220a246d2b1df5acf1dcc742c173095de9e3c";

export async function POST(req: Request) {
  const { token, prompt } = await req.json().catch(() => ({}));
  if (token !== TOKEN) return new Response("forbidden", { status: 403 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "not configured" }, { status: 500 });

  // основной путь — gpt-image-1; фолбэк — dall-e-3 (если org не верифицирована)
  let r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
      quality: "medium",
      n: 1,
    }),
  });

  if (!r.ok) {
    const err1 = await r.text();
    r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        size: "1024x1792",
        quality: "standard",
        response_format: "b64_json",
        n: 1,
      }),
    });
    if (!r.ok) {
      return Response.json(
        { error: "both failed", gptImage: err1.slice(0, 300), dalle: (await r.text()).slice(0, 300) },
        { status: 502 },
      );
    }
  }

  const data = await r.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return Response.json({ error: "no image in response" }, { status: 502 });

  return new Response(Buffer.from(b64, "base64"), {
    headers: { "Content-Type": "image/png" },
  });
}
