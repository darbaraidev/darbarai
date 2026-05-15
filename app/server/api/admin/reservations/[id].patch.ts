import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";
import { templates, sendEmail } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) throw createError({ statusCode: 401 });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id) throw createError({ statusCode: 401 });

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as any)?.role !== "admin") throw createError({ statusCode: 403 });

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing id" });

  const body = await readBody(event) as { status: string };
  if (body.status !== "confirmed" && body.status !== "cancelled") {
    throw createError({ statusCode: 400, statusMessage: "status must be confirmed or cancelled" });
  }

  const admin = serverSupabaseServiceRole(event);
  const { data: reservation, error } = await (admin as any)
    .from("reservations")
    .update({ status: body.status })
    .eq("id", id)
    .select("*, riad:riads(name), profile:profiles(full_name, email)")
    .single();

  if (error || !reservation) throw createError({ statusCode: 500, statusMessage: error?.message ?? "Update failed" });

  const config = useRuntimeConfig();
  if (config.resendApiKey) {
    try {
      const riad = reservation.riad as { name: string };
      const clientProfile = reservation.profile as { full_name: string; email: string | null };

      let clientEmail = clientProfile.email;
      if (!clientEmail) {
        const { data: authData } = await (admin as any).auth.admin.getUserById(reservation.user_id);
        clientEmail = authData?.user?.email ?? null;
      }

      if (clientEmail) {
        const nights = Math.round(
          (new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / 86400000
        );
        const emailData = {
          clientName: clientProfile.full_name ?? "",
          clientEmail,
          riadName: riad.name,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          nights,
          guests: reservation.guests,
          totalEur: (reservation.total_price / 100).toFixed(2),
          reservationId: reservation.id,
        };

        if (body.status === "confirmed") {
          await sendEmail(config.resendApiKey, clientEmail, templates.reservationConfirmed(emailData));
        } else if (body.status === "cancelled") {
          await sendEmail(config.resendApiKey, clientEmail, templates.reservationCancelledByAdmin(emailData));
        }
      }
    } catch (e) {
      console.error("[admin patch] email failed", e);
    }
  }

  return { ok: true };
});
