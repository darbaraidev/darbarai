import { serverSupabaseServiceRole } from "#supabase/server";

const BOT_RE = /bot|crawler|spider|slurp|mediapartners|headless|python|curl|wget|scrapy|phantom|selenium|monitor|uptimerobot|pingdom|facebookexternalhit|whatsapp/i;
const SKIP_PREFIXES = ["/api/", "/_nuxt/", "/__nuxt/", "/_ipx/", "/_i18n/", "/favicon", "/admin"];
const SKIP_PATTERNS = [
  /\.(php|xml|txt|env|sql|bak|zip|gz|asp|aspx|jsp|cgi)$/i,
  /wp-admin|wp-login|wordpress|xmlrpc/i,
  /^\/__(nuxt_error|error)/,
];

const geoCache = new Map<string, { country: string | null; countryCode: string | null; city: string | null; ts: number }>();
const GEO_TTL = 3_600_000;

async function getGeo(ip: string) {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.")) {
    return { country: null, countryCode: null, city: null };
  }
  const hit = geoCache.get(ip);
  if (hit && Date.now() - hit.ts < GEO_TTL) return hit;
  try {
    const data = await $fetch<any>(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`, { timeout: 2500 });
    if (data?.status !== "success") return { country: null, countryCode: null, city: null };
    const result = { country: data.country ?? null, countryCode: data.countryCode ?? null, city: data.city ?? null, ts: Date.now() };
    geoCache.set(ip, result);
    return result;
  } catch {
    return { country: null, countryCode: null, city: null };
  }
}

async function trackVisit(event: any) {
  const path = getRequestURL(event).pathname;
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return;
  if (SKIP_PATTERNS.some((r) => r.test(path))) return;
  if (event.method !== "GET") return;

  const ua = getRequestHeader(event, "user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return;

  // Seuls les vrais navigateurs envoient sec-fetch-dest: document lors d'une navigation
  const fetchDest = getRequestHeader(event, "sec-fetch-dest");
  if (fetchDest && fetchDest !== "document") return;

  // Visitor ID cookie — anonymous, no personal data
  let visitorId = getCookie(event, "vid");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setCookie(event, "vid", visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "";
  const refererHeader = getRequestHeader(event, "referer") ?? null;
  let referrer: string | null = null;
  if (refererHeader) {
    try { referrer = new URL(refererHeader).hostname; } catch {}
  }

  const geo = await getGeo(ip);

  try {
    const supabase = serverSupabaseServiceRole(event);
    await (supabase as any).from("page_visits").insert({
      page: path,
      visitor_id: visitorId,
      country: geo.country,
      country_code: geo.countryCode,
      city: geo.city,
      referrer,
    });
  } catch {}
}

export default defineEventHandler((event) => {
  trackVisit(event).catch(() => {});
});
