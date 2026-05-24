import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";
import { templates, sendEmail, sendToAdmins, getContactPhone } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const admin = serverSupabaseServiceRole(event);
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

  // Use service role to bypass RLS on profile join
  const { data: reservation, error } = await (admin as any)
    .from("reservations")
    .select("*, riad:riads(name), profile:profiles(full_name, email, phone)")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .single();

  if (error || !reservation) {
    throw createError({ statusCode: 404, statusMessage: "Reservation not found" });
  }

  await (admin as any)
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", id);

  // Emails
  if (config.resendApiKey) {
    const riad = reservation.riad as { name: string };
    const profile = reservation.profile as { full_name: string; email: string | null; phone?: string | null };

    // Fallback: profiles.email may be null if trigger didn't sync it
    let clientEmail = profile.email;
    if (!clientEmail) {
      try {
        const { data: authData } = await (admin as any).auth.admin.getUserById(user.id);
        clientEmail = authData?.user?.email ?? null;
      } catch {}
    }

    if (!clientEmail) {
      console.error("[patch] cannot send emails: no client email for user", user.id);
    } else {
      const nights = Math.round(
        (new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / 86400000
      );
      const contactPhone = await getContactPhone(admin);
      const emailData = {
        clientName: profile.full_name ?? "",
        clientEmail,
        clientPhone: profile.phone ?? null,
        contactPhone,
        riadName: riad.name,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        nights,
        guests: reservation.guests,
        totalEur: (reservation.total_price / 100).toFixed(2),
        reservationId: reservation.id,
      };

      try {
        await sendEmail(config.resendApiKey, clientEmail, templates.reservationCancelled(emailData));
      } catch (e) { console.error("[patch] client email failed", e); }

      try {
        await sendToAdmins(admin, config.resendApiKey, templates.adminReservationCancelled(emailData));
      } catch (e) { console.error("[patch] admin email failed", e); }
    }
  }

  return { ok: true };
});
