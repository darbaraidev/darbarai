import { Resend } from "resend";
import { createHmac } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getAdminEmails = async (
  supabase: SupabaseClient,
): Promise<string[]> => {
  const { data } = await (supabase as any)
    .from("profiles")
    .select("id, email")
    .eq("role", "admin");
  const profiles: { id: string; email: string | null }[] = data ?? [];

  const emails: string[] = [];
  for (const p of profiles) {
    if (p.email) {
      emails.push(p.email);
    } else {
      // profiles.email peut être null si le trigger ne le copie pas — fallback auth
      try {
        const { data: authData } = await (
          supabase as any
        ).auth.admin.getUserById(p.id);
        if (authData?.user?.email) emails.push(authData.user.email);
      } catch {}
    }
  }
  return emails;
};

export const sendToAdmins = async (
  supabase: SupabaseClient,
  apiKey: string,
  template: { subject: string; html: string },
) => {
  const emails = await getAdminEmails(supabase);
  await Promise.all(emails.map((email) => sendEmail(apiKey, email, template)));
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReservationEmailData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  contactPhone?: string;
  riadName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalEur: string;
  reservationId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FROM = `${process.env.RESEND_FROM_NAME ?? "Dar Barai"} <${process.env.RESEND_FROM_EMAIL ?? "contact@darbarai.com"}>`;
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? "https://www.darbarai.com";
const LOGO_URL = `${SITE_URL}/images/logo_app.jpg`;
const WHATSAPP_FALLBACK = process.env.NUXT_PUBLIC_CONTACT_WHATSAPP ?? "";

const resolveWhatsapp = (phone?: string | null) => {
  const num = phone ?? WHATSAPP_FALLBACK;
  if (!num) return { link: null, display: null };
  const digits = num.replace(/[^0-9]/g, "");
  const display = num.startsWith("+") ? num : `+${num}`;
  return { link: `https://wa.me/${digits}`, display };
};

export const getContactPhone = async (supabase: SupabaseClient): Promise<string> => {
  try {
    const { data } = await (supabase as any)
      .from("site_settings")
      .select("contact_phone")
      .eq("id", 1)
      .maybeSingle();
    return data?.contact_phone ?? WHATSAPP_FALLBACK ?? "+33750996975";
  } catch {
    return WHATSAPP_FALLBACK ?? "+33750996975";
  }
};

// Token HMAC pour unsubscribe sans connexion
export const unsubscribeToken = (email: string, secret: string) =>
  createHmac("sha256", secret).update(email).digest("hex");

export const unsubscribeUrl = (email: string, secret: string) =>
  `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email, secret)}`;

const reservationTable = (d: ReservationEmailData) => `
  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px">
    <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#78716c">Riad</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;font-weight:600">${d.riadName}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#78716c">Arrivée</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${d.checkIn}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#78716c">Départ</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${d.checkOut}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#78716c">Durée</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${d.nights} nuit${d.nights > 1 ? "s" : ""}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#78716c">Voyageurs</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${d.guests}</td></tr>
    <tr><td style="padding:8px 0;color:#78716c">Total</td><td style="padding:8px 0;font-weight:700;font-size:17px">${d.totalEur} €</td></tr>
  </table>
`;

const layout = (content: string, opts?: { unsubscribeUrl?: string; contactPhone?: string }) => {
  const wa = resolveWhatsapp(opts?.contactPhone);
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
  <body style="margin:0;padding:0;background:#fafaf9">
    <div style="font-family:Georgia,serif;max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">

      <!-- Header -->
      <div style="background:#1c1917;padding:24px 36px;display:flex;align-items:center;gap:16px">
        <img src="${LOGO_URL}" alt="Dar Baraï" width="48" height="48"
             style="width:48px;height:48px;border-radius:8px;object-fit:cover;display:block"/>
        <div>
          <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#ffffff;letter-spacing:0.02em">Dar Baraï</p>
          <p style="margin:3px 0 0;font-size:11px;color:#a8a29e;letter-spacing:0.06em;text-transform:uppercase">Marrakech</p>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:36px;color:#1c1917;line-height:1.7;font-size:15px">
        ${content}
      </div>

      <!-- Footer -->
      <div style="padding:20px 36px;background:#f5f5f4;border-top:1px solid #e7e5e4">
        <p style="margin:0 0 6px;font-size:12px;color:#a8a29e;text-align:center">
          Dar Baraï · Marrakech, Maroc ·
          <a href="mailto:contact@darbarai.com" style="color:#a8a29e;text-decoration:none">contact@darbarai.com</a>
          ${wa.link ? `· <a href="${wa.link}" style="color:#a8a29e;text-decoration:none">WhatsApp ${wa.display}</a>` : ""}
        </p>
        <p style="margin:0 0 6px;font-size:11px;color:#c7c3be;text-align:center">
          Cet email est envoyé automatiquement, merci de ne pas y répondre directement.
        </p>
        ${
          opts?.unsubscribeUrl
            ? `
        <p style="margin:6px 0 0;font-size:11px;color:#c7c3be;text-align:center">
          <a href="${opts.unsubscribeUrl}" style="color:#c7c3be">Se désabonner de la newsletter</a>
        </p>`
            : ""
        }
      </div>

    </div>
  </body>
  </html>
`;
};

// ─── Templates ────────────────────────────────────────────────────────────────

export const templates = {
  reservationConfirmed: (d: ReservationEmailData) => {
    const wa = resolveWhatsapp(d.contactPhone);
    return {
      subject: `Réservation confirmée – ${d.riadName}`,
      html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#15803d">Réservation confirmée ✓</h1>
      <p>Bonjour ${d.clientName},</p>
      <p>Votre paiement a bien été reçu. Votre réservation au <strong>${d.riadName}</strong> est confirmée.</p>
      ${reservationTable(d)}
      <p>Nous avons hâte de vous accueillir à Marrakech. N'hésitez pas à nous contacter à <a href="mailto:contact@darbarai.com" style="color:#b45309">contact@darbarai.com</a>${wa.link ? ` ou sur <a href="${wa.link}" style="color:#b45309">WhatsApp (${wa.display})</a>` : ""}.</p>
    `, { contactPhone: d.contactPhone }),
    };
  },

  reservationRequest: (d: ReservationEmailData) => {
    const wa = resolveWhatsapp(d.contactPhone);
    return {
      subject: `Demande de réservation reçue – ${d.riadName}`,
      html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#b45309">Demande reçue</h1>
      <p>Bonjour ${d.clientName},</p>
      <p>Nous avons bien reçu votre demande de réservation au <strong>${d.riadName}</strong>.</p>
      ${reservationTable(d)}
      <p>Nous allons vous contacter prochainement ${wa.link ? `par <a href="${wa.link}" style="color:#b45309">WhatsApp (${wa.display})</a> ou` : "par"} email pour convenir du règlement.</p>
      <p style="font-size:13px;color:#78716c">Réf. ${d.reservationId.slice(0, 8)}</p>
    `, { contactPhone: d.contactPhone }),
    };
  },

  adminNewReservation: (d: ReservationEmailData, mode: "stripe" | "later") => ({
    subject:
      mode === "later"
        ? `Demande de réservation – ${d.riadName}`
        : `Nouvelle réservation payée – ${d.riadName}`,
    html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#1c1917">${mode === "later" ? "Demande de réservation" : "Nouvelle réservation"}</h1>
      <p>Mode de paiement : <strong>${mode === "later" ? "à convenir" : "carte bancaire"}</strong></p>
      ${reservationTable(d)}
      <p><strong>Client :</strong> ${d.clientName}</p>
      <p style="margin:4px 0">
        📧 <a href="mailto:${d.clientEmail}" style="color:#b45309">${d.clientEmail}</a>
        ${d.clientPhone ? `&nbsp;·&nbsp; 📞 <a href="tel:${d.clientPhone}" style="color:#b45309">${d.clientPhone}</a>` : ""}
      </p>
      ${mode === "later" ? `<p style="margin:16px 0 4px;padding:12px 16px;background:#fef3c7;border-left:3px solid #f59e0b;border-radius:4px;font-size:14px">Merci de contacter le client par email ou téléphone pour convenir du règlement.</p>` : ""}
      <p style="font-size:13px;color:#78716c;margin-top:16px">Réf. ${d.reservationId}</p>
    `),
  }),

  confirmSignup: (data: { email: string; confirmUrl: string }) => ({
    subject: "Confirmez votre adresse email – Dar Baraï",
    html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#1c1917">Bienvenue chez Dar Baraï</h1>
      <p>Merci de créer un compte. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${data.confirmUrl}"
           style="display:inline-block;background:#b45309;color:#ffffff;font-family:Georgia,serif;font-size:16px;padding:14px 32px;border-radius:8px;text-decoration:none">
          Confirmer mon adresse
        </a>
      </div>
      <p style="font-size:13px;color:#78716c">Si vous n'avez pas créé de compte, ignorez cet email.</p>
      <p style="font-size:13px;color:#a8a29e;word-break:break-all">Ou copiez ce lien : <a href="${data.confirmUrl}" style="color:#a8a29e">${data.confirmUrl}</a></p>
    `),
  }),

  resetPassword: (data: { email: string; resetUrl: string }) => ({
    subject: "Réinitialisation de votre mot de passe – Dar Baraï",
    html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#1c1917">Nouveau mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe pour <strong>${data.email}</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${data.resetUrl}"
           style="display:inline-block;background:#b45309;color:#ffffff;font-family:Georgia,serif;font-size:16px;padding:14px 32px;border-radius:8px;text-decoration:none">
          Choisir un nouveau mot de passe
        </a>
      </div>
      <p style="font-size:13px;color:#78716c">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p style="font-size:13px;color:#a8a29e;word-break:break-all">Ou copiez ce lien : <a href="${data.resetUrl}" style="color:#a8a29e">${data.resetUrl}</a></p>
    `),
  }),

  reservationCancelled: (
    d: Pick<
      ReservationEmailData,
      "clientName" | "riadName" | "checkIn" | "checkOut" | "reservationId" | "contactPhone"
    >,
  ) => {
    const wa = resolveWhatsapp(d.contactPhone);
    return {
      subject: `Annulation de votre réservation – ${d.riadName}`,
      html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#dc2626">Réservation annulée</h1>
      <p>Bonjour ${d.clientName},</p>
      <p>Votre réservation au <strong>${d.riadName}</strong> (${d.checkIn} → ${d.checkOut}) a bien été annulée.</p>
      <p>Si vous avez des questions, contactez-nous à <a href="mailto:contact@darbarai.com" style="color:#b45309">contact@darbarai.com</a>${wa.link ? ` ou sur <a href="${wa.link}" style="color:#b45309">WhatsApp (${wa.display})</a>` : ""}.</p>
      <p style="font-size:13px;color:#78716c">Réf. ${d.reservationId.slice(0, 8)}</p>
    `, { contactPhone: d.contactPhone }),
    };
  },

  reservationCancelledByAdmin: (
    d: Pick<
      ReservationEmailData,
      "clientName" | "riadName" | "checkIn" | "checkOut" | "reservationId" | "contactPhone"
    >,
  ) => {
    const wa = resolveWhatsapp(d.contactPhone);
    return {
      subject: `Annulation de votre réservation – ${d.riadName}`,
      html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#dc2626">Réservation annulée</h1>
      <p>Bonjour ${d.clientName},</p>
      <p><strong>${d.riadName}</strong> a annulé votre réservation du ${d.checkIn} au ${d.checkOut}.</p>
      <p>Nous sommes désolés pour la gêne occasionnée. N'hésitez pas à nous contacter à <a href="mailto:contact@darbarai.com" style="color:#b45309">contact@darbarai.com</a>${wa.link ? ` ou sur <a href="${wa.link}" style="color:#b45309">WhatsApp (${wa.display})</a>` : ""}.</p>
      <p style="font-size:13px;color:#78716c">Réf. ${d.reservationId.slice(0, 8)}</p>
    `, { contactPhone: d.contactPhone }),
    };
  },

  adminReservationCancelled: (d: ReservationEmailData) => ({
    subject: `Annulation – ${d.clientName} · ${d.riadName}`,
    html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#dc2626">Réservation annulée</h1>
      <p>Un client a annulé sa réservation.</p>
      ${reservationTable(d)}
      <p><strong>Client :</strong> ${d.clientName}</p>
      <p style="margin:4px 0">
        📧 <a href="mailto:${d.clientEmail}" style="color:#b45309">${d.clientEmail}</a>
        ${d.clientPhone ? `&nbsp;·&nbsp; 📞 <a href="tel:${d.clientPhone}" style="color:#b45309">${d.clientPhone}</a>` : ""}
      </p>
      <p style="font-size:13px;color:#78716c;margin-top:16px">Réf. ${d.reservationId}</p>
    `),
  }),

  newsletter: (contentFr: string, unsubUrl: string, contentEn?: string) => ({
    html: layout(
      contentFr +
        (contentEn
          ? `
        <hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0"/>
        <p style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px">English version</p>
        ${contentEn}
      `
          : ""),
      { unsubscribeUrl: unsubUrl },
    ),
  }),
};

// ─── Sender ───────────────────────────────────────────────────────────────────

export const sendEmail = async (
  apiKey: string,
  to: string,
  template: { subject: string; html: string },
) => {
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: template.subject,
    html: template.html,
  });
  if (error) {
    console.error(
      `[sendEmail] Resend error → to=${to} subject="${template.subject}":`,
      JSON.stringify(error),
    );
    throw new Error(`Resend: ${JSON.stringify(error)}`);
  }
  console.log(`[sendEmail] OK → id=${data?.id} to=${to}`);
};
