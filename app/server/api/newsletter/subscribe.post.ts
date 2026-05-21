import { serverSupabaseServiceRole } from "#supabase/server";
import { sendEmail } from "~/server/utils/emailTemplates";

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

  // Génère un code unique
  let promoCode = generatePromoCode();
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

  // Insère l'abonné
  const { error } = await (supabase as any)
    .from("newsletter_subscribers")
    .insert({ email: clean, source: "popup", promo_code: promoCode });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Envoie l'email avec le code
  const config = useRuntimeConfig();
  if (config.resendApiKey) {
    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1c1917">
        <h1 style="font-size:24px;margin-bottom:8px">Bienvenue chez Dar Baraï & Dar Tanawi 🌿</h1>
        <p style="color:#78716c;font-size:15px;line-height:1.6;margin-bottom:24px">
          Merci de vous être inscrit(e) à notre newsletter. Voici votre code de réduction exclusif de <strong>10%</strong> sur votre première réservation.
        </p>
        <div style="background:#fdf6f0;border:1.5px solid #e07040;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="font-size:13px;color:#a16207;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:.08em">Votre code</p>
          <p style="font-family:monospace;font-size:28px;font-weight:700;color:#c2410c;letter-spacing:.15em;margin:0">${promoCode}</p>
        </div>
        <p style="color:#78716c;font-size:13px;line-height:1.6">
          Ce code est personnel et utilisable une seule fois. Saisissez-le lors de votre réservation sur <a href="https://darbarai.com" style="color:#c2410c">darbarai.com</a>.
        </p>
        <hr style="border:none;border-top:1px solid #e7e5e4;margin:28px 0" />
        <p style="font-size:12px;color:#a8a29e">Dar Baraï & Dar Tanawi — Marrakech, Maroc</p>
      </div>
    `;
    await sendEmail(config.resendApiKey, clean, {
      subject: "Votre code de réduction -10% – Dar Baraï & Dar Tanawi",
      html,
    }).catch(() => {});
  }

  return { success: true };
});
