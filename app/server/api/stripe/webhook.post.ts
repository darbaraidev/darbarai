import Stripe from "stripe";
import { serverSupabaseServiceRole } from "#supabase/server";
import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    throw createError({ statusCode: 503, statusMessage: "Stripe not configured" });
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2025-04-30.basil",
  });

  const rawBody = await readRawBody(event);
  const sig = getHeader(event, "stripe-signature");

  if (!rawBody || !sig) {
    throw createError({ statusCode: 400, statusMessage: "Missing body or signature" });
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret);
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature invalid: ${(err as Error).message}`,
    });
  }

  const supabase = serverSupabaseServiceRole(event);

  if (stripeEvent.type === "payment_intent.succeeded") {
    const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
    const reservationId = paymentIntent.metadata?.reservation_id;
    if (!reservationId) return { received: true };

    const { data: reservation, error } = await supabase
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", reservationId)
      .select("*, riad:riads(name, slug), profile:profiles(email, full_name)")
      .single();

    if (error || !reservation) {
      console.error("[webhook] Failed to confirm reservation", error);
      throw createError({ statusCode: 500, statusMessage: "DB update failed" });
    }

    // Block the dates in availability so future bookings can't overlap
    const { error: availError } = await (supabase as any)
      .from("availability")
      .insert({
        riad_id: reservation.riad_id,
        start_date: reservation.check_in,
        end_date: reservation.check_out,
        source: "reservation",
        label: `Réservation #${reservation.id.slice(0, 8)}`,
      });
    if (availError) console.error("[webhook] Availability insert failed", availError);

    // Send confirmation email via Resend
    if (config.resendApiKey) {
      try {
        const resend = new Resend(config.resendApiKey);
        const { email, full_name } = reservation.profile as { email: string; full_name: string | null };
        const riad = reservation.riad as { name: string };
        const nights = Math.round(
          (new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const totalEur = (reservation.total_price / 100).toFixed(2);
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? "reservations@darbarai.com";
        const fromName = process.env.RESEND_FROM_NAME ?? "Dar Baraï";

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: email,
          subject: `Votre réservation est confirmée – ${riad.name}`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#1c1917">
              <h1 style="color:#b45309">Réservation confirmée ✓</h1>
              <p>Bonjour ${full_name ?? ""},</p>
              <p>Votre réservation au <strong>${riad.name}</strong> est bien confirmée.</p>
              <table style="width:100%;border-collapse:collapse;margin:24px 0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4"><strong>Arrivée</strong></td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${reservation.check_in}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4"><strong>Départ</strong></td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${reservation.check_out}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4"><strong>Durée</strong></td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${nights} nuit${nights > 1 ? "s" : ""}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4"><strong>Voyageurs</strong></td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${reservation.guests}</td></tr>
                <tr><td style="padding:8px 0"><strong>Total</strong></td><td style="padding:8px 0">${totalEur} €</td></tr>
              </table>
              <p>Nous avons hâte de vous accueillir à Marrakech.</p>
              <p style="color:#78716c;font-size:14px">Dar Baraï · Marrakech, Maroc · reservations@darbarai.com</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[webhook] Email send failed", emailErr);
      }
    }
  }

  if (stripeEvent.type === "payment_intent.payment_failed") {
    const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
    const reservationId = paymentIntent.metadata?.reservation_id;
    if (reservationId) {
      await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservationId);
    }
  }

  return { received: true };
});
