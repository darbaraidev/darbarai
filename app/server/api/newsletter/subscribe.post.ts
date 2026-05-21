import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const { email } = await readBody<{ email: string }>(event);

  const clean = email?.toLowerCase().trim();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw createError({ statusCode: 400, statusMessage: "invalid_email" });
  }

  const supabase = serverSupabaseServiceRole(event);

  // Vérifie dans newsletter_subscribers
  const { data: existing } = await (supabase as any)
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", clean)
    .maybeSingle();

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "already_subscribed" });
  }

  // Vérifie dans profiles (utilisateurs déjà inscrits à la newsletter)
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("id")
    .eq("email", clean)
    .eq("newsletter_subscribed", true)
    .maybeSingle();

  if (profile) {
    throw createError({ statusCode: 409, statusMessage: "already_subscribed" });
  }

  const { error } = await (supabase as any)
    .from("newsletter_subscribers")
    .insert({ email: clean, source: "popup" });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return { success: true };
});
