import { serverSupabaseServiceRole } from "#supabase/server";
import { sendEmail, unsubscribeUrl } from "~/server/utils/emailTemplates";

function generatePromoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BIEN-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default defineEventHandler(async (event) => {
  const { email } = await readBody<{ email: string }>(event);

  const clean = email?.toLowerCase().trim();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw createError({ statusCode: 400, statusMessage: "invalid_email" });
  }

  const supabase = serverSupabaseServiceRole(event);
  const config = useRuntimeConfig();

  // Vérifie si les codes promo newsletter sont activés
  const { data: settings } = await (supabase as any)
    .from("site_settings")
    .select("newsletter_promo_enabled")
    .eq("id", 1)
    .maybeSingle();
  const promoEnabled = settings?.newsletter_promo_enabled !== false;

  // Vérifie les doublons
  const { data: existing } = await (supabase as any)
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", clean)
    .maybeSingle();

  if (existing) throw createError({ statusCode: 409, statusMessage: "already_subscribed" });

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("id")
    .eq("email", clean)
    .eq("newsletter_subscribed", true)
    .maybeSingle();

  if (profile) throw createError({ statusCode: 409, statusMessage: "already_subscribed" });

  // Génère un code unique si les promos sont activées
  let promoCode: string | null = null;
  let promoExpiresAt: Date | null = null;
  if (promoEnabled) {
    promoCode = generatePromoCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: conflict } = await (supabase as any)
        .from("newsletter_subscribers")
        .select("id")
        .eq("promo_code", promoCode)
        .maybeSingle();
      if (!conflict) break;
      promoCode = generatePromoCode();
      attempts++;
    }
    promoExpiresAt = new Date();
    promoExpiresAt.setDate(promoExpiresAt.getDate() + 14);
  }

  // Insère l'abonné
  const { error } = await (supabase as any)
    .from("newsletter_subscribers")
    .insert({ email: clean, source: "popup", promo_code: promoCode, promo_expires_at: promoExpiresAt?.toISOString() ?? null });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Envoie l'email de bienvenue
  if (config.resendApiKey) {
    const unsub = unsubscribeUrl(clean, config.resendApiKey);
    const expiryLabel = promoExpiresAt
      ? promoExpiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null;
    const promoBlock = promoCode && expiryLabel
      ? `
        <div style="background:#fdf6f0;border:1.5px solid #e07040;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
          <p style="font-size:13px;color:#a16207;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:.08em">Votre code exclusif</p>
          <p style="font-family:monospace;font-size:28px;font-weight:700;color:#c2410c;letter-spacing:.15em;margin:0 0 12px">${promoCode}</p>
          <p style="font-size:12px;color:#92400e;margin:0">Valable jusqu'au <strong>${expiryLabel}</strong></p>
        </div>
        <p style="color:#78716c;font-size:13px;line-height:1.6">
          Ce code est personnel et utilisable une seule fois. Saisissez-le lors de votre réservation sur
          <a href="https://darbarai.com" style="color:#c2410c">darbarai.com</a>.
        </p>`
      : "";

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1c1917">
        <h1 style="font-size:24px;margin-bottom:8px">Bienvenue chez Dar Baraï & Dar Tanawi 🌿</h1>
        <p style="color:#78716c;font-size:15px;line-height:1.6;margin-bottom:${promoCode ? "0" : "24px"}">
          Merci de vous être inscrit(e) à notre newsletter.${promoCode ? " Voici votre code de réduction exclusif de <strong>-10%</strong> sur votre première réservation." : ""}
        </p>
        ${promoBlock}
        <hr style="border:none;border-top:1px solid #e7e5e4;margin:28px 0" />
        <p style="font-size:12px;color:#a8a29e">Dar Baraï & Dar Tanawi — Marrakech, Maroc</p>
        <p style="font-size:11px;color:#c7c3be;margin-top:8px">
          <a href="${unsub}" style="color:#c7c3be">Se désabonner</a>
        </p>
      </div>
    `;
    await sendEmail(config.resendApiKey, clean, {
      subject: promoCode
        ? "Votre code de réduction -10% – Dar Baraï & Dar Tanawi"
        : "Bienvenue dans la newsletter – Dar Baraï & Dar Tanawi",
      html,
    }).catch(() => {});
  }

  return { success: true };
});
