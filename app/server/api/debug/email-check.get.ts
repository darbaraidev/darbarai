import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";
import { getAdminEmails } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  // Admin only
  const supabase = await serverSupabaseClient(event);
  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) throw createError({ statusCode: 401 });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id) throw createError({ statusCode: 401 });

  const { data: profile } = await (supabase as any)
    .from("profiles").select("role").eq("id", user.id).single();
  if ((profile as any)?.role !== "admin") throw createError({ statusCode: 403 });

  const config = useRuntimeConfig();
  const admin = serverSupabaseServiceRole(event);

  // Vérifs config
  const hasResend = !!config.resendApiKey;
  const hasStripe = !!config.stripeSecretKey;

  // Email du user connecté (depuis profiles + auth fallback)
  const profileRow = profile as { role: string; email?: string };
  let callerEmail: string | null = (profileRow as any).email ?? null;
  if (!callerEmail) {
    const { data: authData } = await (admin as any).auth.admin.getUserById(user.id);
    callerEmail = authData?.user?.email ?? null;
  }

  // Profils admin dans la table profiles
  const { data: adminProfiles } = await (admin as any)
    .from("profiles").select("id, email, full_name").eq("role", "admin");

  // Emails admin résolus (avec fallback auth)
  const adminEmails = await getAdminEmails(admin);

  return {
    config: {
      resend: hasResend ? "✓ configured" : "✗ RESEND_API_KEY missing",
      stripe: hasStripe ? "✓ configured" : "✗ STRIPE_SECRET_KEY missing",
      fromEmail: process.env.RESEND_FROM_EMAIL ?? "(not set)",
      siteUrl: config.public.siteUrl,
    },
    caller: { id: user.id, email: callerEmail },
    adminProfiles: (adminProfiles ?? []).map((p: any) => ({
      id: p.id,
      profileEmail: p.email,
      fullName: p.full_name,
    })),
    resolvedAdminEmails: adminEmails,
  };
});
