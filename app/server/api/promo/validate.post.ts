import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event);
  const { code, total, email } = await readBody(event) as { code: string; total: number; email?: string };

  if (!code) throw createError({ statusCode: 400, statusMessage: "Missing code" });

  const normalizedCode = code.trim().toUpperCase();

  const { data: promo, error } = await (admin as any)
    .from("promo_codes")
    .select("*")
    .eq("code", normalizedCode)
    .eq("active", true)
    .single();

  if (!error && promo) {
    const today = new Date().toISOString().slice(0, 10);
    if (promo.valid_from && promo.valid_from > today) throw createError({ statusCode: 400, statusMessage: "Code pas encore actif" });
    if (promo.valid_until && promo.valid_until < today) throw createError({ statusCode: 400, statusMessage: "Code expiré" });
    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) throw createError({ statusCode: 400, statusMessage: "Code épuisé" });

    const discount = promo.type === "percentage"
      ? Math.round(total * promo.value / 100)
      : Math.min(promo.value, total);

    return { id: promo.id, code: promo.code, type: promo.type, value: promo.value, discount, finalTotal: total - discount };
  }

  // Fallback: newsletter subscriber personal code
  const { data: subscriber } = await (admin as any)
    .from("newsletter_subscribers")
    .select("id, email, promo_used")
    .eq("promo_code", normalizedCode)
    .maybeSingle();

  if (!subscriber) throw createError({ statusCode: 404, statusMessage: "Code invalide" });
  if (subscriber.promo_used) throw createError({ statusCode: 400, statusMessage: "Code déjà utilisé" });
  if (email && subscriber.email !== email.toLowerCase().trim()) {
    throw createError({ statusCode: 403, statusMessage: "Ce code est lié à un autre email" });
  }

  const discount = Math.round(total * 10 / 100);
  return {
    id: subscriber.id,
    code: normalizedCode,
    type: "percentage",
    value: 10,
    discount,
    finalTotal: total - discount,
    source: "newsletter",
  };
});
