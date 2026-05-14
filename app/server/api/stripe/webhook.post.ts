import Stripe from "stripe";
import { serverSupabaseServiceRole } from "#supabase/server";
import { templates, sendEmail, sendToAdmins } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    throw createError({ statusCode: 503, statusMessage: "Stripe not configured" });
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2026-04-22.dahlia",
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

    if (config.resendApiKey) {
      try {
        const { email, full_name } = reservation.profile as { email: string; full_name: string };
        const riad = reservation.riad as { name: string };
        const nights = Math.round(
          (new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / 86400000,
        );
        const emailData = {
          clientName: full_name ?? "",
          clientEmail: email,
          riadName: riad.name,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          nights,
          guests: reservation.guests,
          totalEur: (reservation.total_price / 100).toFixed(2),
          reservationId: reservation.id,
        };
        await sendEmail(config.resendApiKey, email, templates.reservationConfirmed(emailData));
        await sendToAdmins(supabase, config.resendApiKey, templates.adminNewReservation(emailData, "stripe"));
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
