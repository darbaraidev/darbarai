import { serverSupabaseServiceRole } from "#supabase/server";

const STATIC_PAGES = [
  { path: "", changefreq: "weekly", priority: "1.0" },
  { path: "/riads", changefreq: "weekly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/gallery", changefreq: "monthly", priority: "0.7" },
  { path: "/boutique", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, "");

  const supabase = serverSupabaseServiceRole(event);
  const { data: riads } = await (supabase as any)
    .from("riads")
    .select("slug")
    .eq("active", true);

  const riadPages = (riads ?? []).map((r: any) => ({
    path: `/riads/${r.slug}`,
    changefreq: "weekly",
    priority: "0.9",
  }));

  const allPages = [...STATIC_PAGES, ...riadPages];

  const urlEntries = allPages
    .map((page) => {
      const frUrl = `${siteUrl}${page.path}`;
      const enUrl = `${siteUrl}/en${page.path}`;
      return `  <url>
    <loc>${frUrl}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>
  </url>
  <url>
    <loc>${enUrl}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return xml;
});
