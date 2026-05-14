import { serverSupabaseServiceRole } from "#supabase/server";
import { unsubscribeToken } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { email, token } = getQuery(event) as { email?: string; token?: string };

  if (!email || !token) {
    throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });
  }

  const expected = unsubscribeToken(email, config.resendApiKey ?? "fallback");
  if (token !== expected) {
    throw createError({ statusCode: 401, statusMessage: "Lien invalide" });
  }

  const supabase = serverSupabaseServiceRole(event);
  await (supabase as any)
    .from("profiles")
    .update({ newsletter_subscribed: false })
    .eq("email", email);

  const siteUrl = config.public.siteUrl ?? "https://www.darbarai.com";
  return sendRedirect(event, `${siteUrl}/?unsubscribed=1`);
});
