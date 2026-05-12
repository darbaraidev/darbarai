import Stripe from "stripe";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  // 1. Auth
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
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
      .select("id")
      .eq("riad_id", riad_id)
      .in("status", ["pending", "confirmed"])
      .lt("check_in", check_out)
      .gt("check_out", check_in),
  ]);

  if ((blocks && blocks.length > 0) || (existingRes && existingRes.length > 0)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Dates not available",
    });
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
  const initialStatus = config.stripeSecretKey ? "pending" : "confirmed";

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
  }

  // Sans Stripe (dev) : clientSecret null, le frontend redirige directement
  return { clientSecret: null, reservationId: reservation.id };
});
