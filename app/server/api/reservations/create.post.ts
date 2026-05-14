import Stripe from "stripe";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { templates, sendEmail, sendToAdmins } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  // 1. Auth — token via header (Bearer) ou cookie Supabase
  let user = await serverSupabaseUser(event);
  if (!user?.id) {
    const authHeader = getHeader(event, "authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }
  }
  if (!user?.id)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  // 2. Body validation
  const body = await readBody(event);
  const { riad_id, check_in, check_out, guests, special_requests } = body as {
    riad_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    special_requests?: string;
  };

  if (!riad_id || !check_in || !check_out || !guests) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  // 3. Fetch riad
  const { data: riad, error: riadError } = await supabase
    .from("riads")
    .select("id, name, base_price_per_night")
    .eq("id", riad_id)
    .single();

  if (riadError || !riad)
    throw createError({ statusCode: 404, statusMessage: "Riad not found" });

  // 4. Check availability: blocked periods AND existing reservations
  const [{ data: blocks }, { data: existingRes }] = await Promise.all([
    supabase
      .from("availability")
      .select("start_date, end_date")
      .eq("riad_id", riad_id)
      .lte("start_date", check_out)
      .gte("end_date", check_in),
    supabase
      .from("reservations")
      .select("id, user_id, status")
      .eq("riad_id", riad_id)
      .in("status", ["pending", "confirmed"])
      .lt("check_in", check_out)
      .gt("check_out", check_in),
  ]);

  if (blocks && blocks.length > 0) {
    throw createError({ statusCode: 409, statusMessage: "Dates not available" });
  }

  if (existingRes && existingRes.length > 0) {
    // Si le conflit est une réservation pending de cet user, la réutiliser
    const ownPending = existingRes.find(r => r.user_id === user!.id && r.status === "pending");
    if (!ownPending) {
      throw createError({ statusCode: 409, statusMessage: "Dates not available" });
    }
    // Réutiliser la réservation existante — recréer le PaymentIntent si Stripe configuré
    const config = useRuntimeConfig();
    if (config.stripeSecretKey) {
      const stripe = new Stripe(config.stripeSecretKey, { apiVersion: "2025-04-30.basil" });
      const nights = Math.round((new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000);
      const total_price = riad.base_price_per_night * nights;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total_price,
        currency: "eur",
        receipt_email: user!.email ?? undefined,
        metadata: { reservation_id: ownPending.id, user_id: user!.id },
        description: `${riad.name} — ${nights} nuit${nights > 1 ? "s" : ""} · ${check_in} → ${check_out}`,
      });
      await supabase.from("reservations").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", ownPending.id);
      return { clientSecret: paymentIntent.client_secret, reservationId: ownPending.id };
    }
    return { clientSecret: null, reservationId: ownPending.id };
  }

  // 5. Calculate total (centimes)
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (nights < 1)
    throw createError({ statusCode: 400, statusMessage: "Invalid dates" });
  const total_price = riad.base_price_per_night * nights;

  // 6. Create reservation in DB (status: pending)
  const config = useRuntimeConfig();
  const initialStatus = "pending";

  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      riad_id,
      user_id: user.id,
      check_in,
      check_out,
      guests,
      total_price,
      status: initialStatus,
      special_requests: special_requests ?? null,
    })
    .select()
    .single();

  if (resError || !reservation) {
    throw createError({
      statusCode: 500,
      statusMessage: resError?.message ?? "Failed to create reservation",
    });
  }

  // 7. Stripe PaymentIntent (si clé configurée)
  if (config.stripeSecretKey) {
    try {
      const stripe = new Stripe(config.stripeSecretKey, {
        apiVersion: "2025-04-30.basil",
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: total_price,
        currency: "eur",
        receipt_email: user.email ?? undefined,
        metadata: { reservation_id: reservation.id, user_id: user.id },
        description: `${riad.name} — ${nights} nuit${nights > 1 ? "s" : ""} · ${check_in} → ${check_out}`,
      });

      await supabase
        .from("reservations")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", reservation.id);

      return { clientSecret: paymentIntent.client_secret, reservationId: reservation.id };
    } catch (stripeErr: any) {
      console.error("[create] Stripe error:", stripeErr?.message);
      // Stripe mal configuré → fallback sans paiement en ligne
    }
  }

  // Sans Stripe (ou Stripe en erreur) : email de confirmation + clientSecret null
  if (config.resendApiKey) {
    try {
      const checkInDate2 = new Date(check_in);
      const checkOutDate2 = new Date(check_out);
      const nights2 = Math.round((checkOutDate2.getTime() - checkInDate2.getTime()) / 86400000);
      const emailData = {
        clientName: user.user_metadata?.full_name ?? "",
        clientEmail: user.email!,
        riadName: riad.name,
        checkIn: check_in,
        checkOut: check_out,
        nights: nights2,
        guests,
        totalEur: (total_price / 100).toFixed(2),
        reservationId: reservation.id,
      };
      await sendEmail(config.resendApiKey, user.email!, templates.reservationRequest(emailData));
      await sendToAdmins(supabase, config.resendApiKey, templates.adminNewReservation(emailData, "later"));
    } catch (emailErr) {
      console.error("[create] Email send failed:", emailErr);
    }
  }

  return { clientSecret: null, reservationId: reservation.id };
});
