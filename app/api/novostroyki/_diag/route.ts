/**
 * ВРЕМЕННЫЙ диагностический эндпоинт — выяснить, почему заявки не уходят в
 * Telegram (UND_ERR_CONNECT_TIMEOUT на api.telegram.org:443).
 *
 * Проверяет раздельно IPv4 и IPv6 TCP-достижимость Telegram с Timeweb-контейнера,
 * а также фактический порядок DNS (сработал ли instrumentation ipv4first).
 * Секреты не выводит. Защита — query-токен. УДАЛИТЬ после диагностики.
 */
import dns from "node:dns";
import { promises as dnsp } from "node:dns";
import net from "node:net";

export const dynamic = "force-dynamic";

function tcpProbe(host: string, port: number, family: 4 | 6, timeoutMs = 6000): Promise<string> {
  return new Promise((resolve) => {
    const started = Date.now();
    const sock = net.connect({ host, port, family });
    const done = (msg: string) => {
      sock.destroy();
      resolve(`${msg} (${Date.now() - started}ms)`);
    };
    sock.setTimeout(timeoutMs);
    sock.once("connect", () => done("OK connect"));
    sock.once("timeout", () => done("TIMEOUT"));
    sock.once("error", (e: NodeJS.ErrnoException) => done(`ERR ${e.code || e.message}`));
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("k") !== "tg-diag-2026") {
    return new Response("not found", { status: 404 });
  }

  const HOST = "api.telegram.org";
  const out: Record<string, unknown> = {};

  out.defaultResultOrder =
    typeof dns.getDefaultResultOrder === "function" ? dns.getDefaultResultOrder() : "n/a";

  const a = await dnsp.resolve4(HOST).catch((e) => `err ${e.code}`);
  const aaaa = await dnsp.resolve6(HOST).catch((e) => `err ${e.code}`);
  out.A = a;
  out.AAAA = aaaa;

  const v4ip = Array.isArray(a) ? a[0] : null;
  const v6ip = Array.isArray(aaaa) ? aaaa[0] : null;

  out.tcp_ipv4 = v4ip ? await tcpProbe(v4ip, 443, 4) : "no A record";
  out.tcp_ipv6 = v6ip ? await tcpProbe(v6ip, 443, 6) : "no AAAA record";

  // контрольный коннект к заведомо доступному IPv4-хосту (DeepSeek работает)
  const ds = await dnsp.resolve4("api.deepseek.com").catch(() => null);
  out.tcp_deepseek_ipv4 = ds && ds[0] ? await tcpProbe(ds[0], 443, 4) : "no A";

  return Response.json(out);
}
