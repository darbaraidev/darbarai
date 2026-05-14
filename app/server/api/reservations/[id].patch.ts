import { serverSupabaseClient } from "#supabase/server";
import { templates, sendEmail, sendToAdmins } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const id = getRouterParam(event, "id");
  const config = useRuntimeConfig();

  // Auth
  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) throw createError({ statusCode: 401 });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id) throw createError({ statusCode: 401 });

  const body = await readBody(event) as { status: string };
  if (body.status !== "cancelled") {
    throw createError({ statusCode: 400, statusMessage: "Only cancellation is supported" });
  }

  // Fetch reservation + riad + profile before updating
  const { data: reservation, error } = await (supabase as any)
    .from("reservations")
    .select("*, riad:riads(name), profile:profiles(full_name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .single();

  if (error || !reservation) {
    throw createError({ statusCode: 404, statusMessage: "Reservation not found" });
  }

  await (supabase as any)
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", id);

  // Emails
  if (config.resendApiKey) {
    const riad = reservation.riad as { name: string };
    const profile = reservation.profile as { full_name: string; email: string };
    const nights = Math.round(
      (new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / 86400000
    );
    const emailData = {
      clientName: profile.full_name ?? "",
      clientEmail: profile.email,
      riadName: riad.name,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      nights,
      guests: reservation.guests,
      totalEur: (reservation.total_price / 100).toFixed(2),
      reservationId: reservation.id,
    };

    try {
      // Email client
      await sendEmail(config.resendApiKey, profile.email, templates.reservationCancelled(emailData));
    } catch (e) { console.error("[patch] client email failed", e); }

    try {
      await sendToAdmins(supabase, config.resendApiKey, templates.adminReservationCancelled(emailData));
    } catch (e) { console.error("[patch] admin email failed", e); }
  }

  return { ok: true };
});
