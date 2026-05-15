import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";
import { templates, sendEmail, sendToAdmins, getAdminEmails } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const tag = "[notify]";
  const supabase = await serverSupabaseClient(event);
  const id = getRouterParam(event, "id");
  console.log(`${tag} START reservationId=${id}`);

  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) { console.log(`${tag} 401 no token`); throw createError({ statusCode: 401 }); }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id) { console.log(`${tag} 401 invalid token`); throw createError({ statusCode: 401 }); }
  console.log(`${tag} user=${user.id}`);

  const admin = serverSupabaseServiceRole(event);

  const { data: reservation, error: resErr } = await (admin as any)
    .from("reservations")
    .select("*, riad:riads(name), profile:profiles(full_name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (resErr) console.log(`${tag} reservation fetch error:`, resErr.message);
  if (!reservation) { console.log(`${tag} 404 reservation not found`); throw createError({ statusCode: 404 }); }
  console.log(`${tag} reservation found, riad=${reservation.riad?.name}`);

  const config = useRuntimeConfig();
  if (!config.resendApiKey) {
    console.log(`${tag} RESEND_API_KEY not configured — skip emails`);
    return { ok: true, debug: "no_resend_key" };
  }

  const riad = reservation.riad as { name: string };
  const profile = reservation.profile as { full_name: string; email: string | null };
  console.log(`${tag} profile.email from DB=${profile.email}`);

  // Fallback : récupère l'email depuis auth si profiles.email est null
  let clientEmail = profile.email;
  if (!clientEmail) {
    console.log(`${tag} profiles.email is null — fetching from auth.users`);
    const { data: authData } = await (admin as any).auth.admin.getUserById(user.id);
    clientEmail = authData?.user?.email ?? null;
    console.log(`${tag} auth.users email=${clientEmail}`);
  }
  if (!clientEmail) {
    console.log(`${tag} no client email found — skip client email`);
    return { ok: true, debug: "no_client_email" };
  }

  const nights = Math.round(
    (new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / 86400000
  );
  const emailData = {
    clientName: profile.full_name ?? "",
    clientEmail,
    riadName: riad.name,
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    nights,
    guests: reservation.guests,
    totalEur: (reservation.total_price / 100).toFixed(2),
    reservationId: reservation.id,
  };

  // Admin emails
  const adminEmails = await getAdminEmails(admin);
  console.log(`${tag} admin emails found: [${adminEmails.join(", ")}]`);

  const [clientResult, adminResult] = await Promise.allSettled([
    sendEmail(config.resendApiKey, clientEmail, templates.reservationRequest(emailData)),
    sendToAdmins(admin, config.resendApiKey, templates.adminNewReservation(emailData, "later")),
  ]);

  console.log(`${tag} client email: ${clientResult.status}`, clientResult.status === "rejected" ? (clientResult as any).reason : "");
  console.log(`${tag} admin email: ${adminResult.status}`, adminResult.status === "rejected" ? (adminResult as any).reason : "");
  console.log(`${tag} DONE`);

  return { ok: true };
});
