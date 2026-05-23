import Stripe from "stripe";
import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from "#supabase/server";
import { getTotalPrice } from "~/server/utils/pricing";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  // 1. Auth — token via header (Bearer) ou cookie Supabase
  let user = await serverSupabaseUser(event);
  if (!user?.id) {
    const authHeader = getHeader(event, "authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      user = data.user as any;
    }
  }
  if (!user?.id)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  // 2. Body validation
  const body = await readBody(event);
  const { riad_id, check_in, check_out, guests, special_requests, promo_code } = body as {
    riad_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    special_requests?: string;
    promo_code?: string;
  };

  if (!riad_id || !check_in || !check_out || !guests) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  // 3. Fetch riad
  const { data: riad, error: riadError } = await (supabase as any)
    .from("riads")
    .select("id, name, base_price_per_night")
    .eq("id", riad_id)
    .single();

  if (riadError || !riad)
    throw createError({ statusCode: 404, statusMessage: "Riad not found" });

  // 4. Check availability: blocked periods AND existing reservations
  const [{ data: blocks }, { data: existingRes }] = await Promise.all([
    (supabase as any)
      .from("availability")
      .select("start_date, end_date")
      .eq("riad_id", riad_id)
      .lte("start_date", check_out)
      .gte("end_date", check_in),
    (supabase as any)
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
    const ownPending = existingRes.find((r: any) => r.user_id === user!.id && r.status === "pending");
    if (!ownPending) {
      throw createError({ statusCode: 409, statusMessage: "Dates not available" });
    }
    // Réutiliser la réservation existante — recréer le PaymentIntent si Stripe configuré
    const config = useRuntimeConfig();
    if (config.stripeSecretKey) {
      const stripe = new Stripe(config.stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });
      const nights = Math.round((new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000);
      const total_price = riad.base_price_per_night * nights;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total_price,
        currency: "eur",
        payment_method_types: ["card"],
        receipt_email: user!.email ?? undefined,
        metadata: { reservation_id: ownPending.id, user_id: user!.id },
        description: `${riad.name} — ${nights} nuit${nights > 1 ? "s" : ""} · ${check_in} → ${check_out}`,
      });
      await (supabase as any).from("reservations").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", ownPending.id);
      return { clientSecret: paymentIntent.client_secret, reservationId: ownPending.id };
    }
    return { clientSecret: null, reservationId: ownPending.id };
  }

  // 5. Calculate total (centimes) avec prix dynamique
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (nights < 1)
    throw createError({ statusCode: 400, statusMessage: "Invalid dates" });

  const { total: total_price, breakdown: priceBreakdown } = await getTotalPrice(
    supabase,
    riad_id,
    check_in,
    check_out,
    riad.base_price_per_night,
  );

  // 6. Appliquer le code promo si fourni
  const admin = serverSupabaseServiceRole(event);
  let finalPrice = total_price;
  let discountAmount = 0;
  let promoCodeId: string | null = null;
  let newsletterSubscriberId: string | null = null;

  if (promo_code) {
    const normalizedCode = promo_code.trim().toUpperCase();
    const today = new Date().toISOString().slice(0, 10);
    const { data: promo } = await (admin as any)
      .from("promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("active", true)
      .single();

    if (
      promo &&
      (!promo.valid_from || promo.valid_from <= today) &&
      (!promo.valid_until || promo.valid_until >= today) &&
      (promo.max_uses === null || promo.uses_count < promo.max_uses)
    ) {
      discountAmount = promo.type === "percentage"
        ? Math.round(total_price * promo.value / 100)
        : Math.min(promo.value, total_price);
      finalPrice = total_price - discountAmount;
      promoCodeId = promo.id;
    } else {
      // Check newsletter subscriber personal code
      const { data: subscriber } = await (admin as any)
        .from("newsletter_subscribers")
        .select("id, email, promo_used, promo_expires_at")
        .eq("promo_code", normalizedCode)
        .maybeSingle();

      const notExpired = !subscriber?.promo_expires_at || new Date(subscriber.promo_expires_at) >= new Date();
      if (subscriber && !subscriber.promo_used && notExpired && subscriber.email === user.email) {
        discountAmount = Math.round(total_price * 10 / 100);
        finalPrice = total_price - discountAmount;
        newsletterSubscriberId = subscriber.id;
      }
    }
  }

  // 7. Create reservation in DB (status: pending)
  const config = useRuntimeConfig();
  const initialStatus = "pending";

  const { data: reservation, error: resError } = await (supabase as any)
    .from("reservations")
    .insert({
      riad_id,
      user_id: user.id,
      check_in,
      check_out,
      guests,
      total_price: finalPrice,
      discount_amount: discountAmount,
      promo_code_id: promoCodeId,
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

  // Incrémenter uses_count du code promo
  if (promoCodeId) {
    await (admin as any).rpc("increment_promo_uses", { promo_id: promoCodeId });
  }
  if (newsletterSubscriberId) {
    await (admin as any).from("newsletter_subscribers").update({ promo_used: true }).eq("id", newsletterSubscriberId);
  }

  // 8. Stripe PaymentIntent (si clé configurée)
  if (config.stripeSecretKey) {
    try {
      const stripe = new Stripe(config.stripeSecretKey, {
        apiVersion: "2026-04-22.dahlia",
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalPrice,
        currency: "eur",
        payment_method_types: ["card"],
        receipt_email: user.email ?? undefined,
        metadata: { reservation_id: reservation.id, user_id: user.id },
        description: `${riad.name} — ${nights} nuit${nights > 1 ? "s" : ""} · ${check_in} → ${check_out}`,
      });

      await (supabase as any)
        .from("reservations")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", reservation.id);

      return { clientSecret: paymentIntent.client_secret, reservationId: reservation.id, priceBreakdown };
    } catch (stripeErr: any) {
      console.error("[create] Stripe error:", stripeErr?.message);
    }
  }

  return { clientSecret: null, reservationId: reservation.id, priceBreakdown };
});
