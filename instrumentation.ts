/**
 * Код старта сервера (Next вызывает register() один раз при инициализации инстанса).
 *
 * Зачем: у Timeweb App Platform НЕТ исходящего IPv6. Node с v17 резолвит DNS в
 * порядке `verbatim` и при наличии AAAA часто пробует IPv6-адрес первым. Для
 * хостов с AAAA (например api.telegram.org → 2001:67c:...) undici коннектится на
 * IPv6, у которого нет маршрута, и висит до таймаута — UND_ERR_CONNECT_TIMEOUT.
 * Из-за этого заявки в Telegram не доходили (см. wiki: новостройки-екб-сервис,
 * критичный баг #4). Хосты без AAAA (api.deepseek.com) работали случайно.
 *
 * Фикс: принудительно ставим порядок ipv4first — все исходящие fetch сначала
 * пробуют IPv4. Глобально и безопасно (IPv4-only хосты не затрагиваются).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
