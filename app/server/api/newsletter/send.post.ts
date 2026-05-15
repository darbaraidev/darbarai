import { Resend } from "resend";
import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";
import { unsubscribeUrl, templates } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  const supabaseUser = await serverSupabaseClient(event);
  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const { data: { user } } = await supabaseUser.auth.getUser(token);
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const supabase = serverSupabaseServiceRole(event);

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  const body = await readBody(event);
  const { from_name, subject, subject_en, content_html, content_html_en } = body as {
    from_name?: string;
    subject: string;
    subject_en?: string;
    content_html: string;
    content_html_en?: string;
  };

  if (!subject || !content_html)
    throw createError({
      statusCode: 400,
      statusMessage: "Missing subject or content",
    });

  // Fetch subscribers
  const { data: subscribers, error: subError } = await (supabase as any)
    .from("profiles")
    .select("email, full_name")
    .eq("newsletter_subscribed", true);

  if (subError)
    throw createError({ statusCode: 500, statusMessage: subError.message });
  if (!subscribers || subscribers.length === 0) return { sent: 0 };

  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const resolvedName = from_name || process.env.RESEND_FROM_NAME || "Dar Barai";
  const FROM = `${resolvedName} <${process.env.RESEND_NEWSLETTER_EMAIL || process.env.RESEND_FROM_EMAIL || "newsletter@darbarai.com"}>`;

  // Send in batches of 50 (Resend free plan limit)
  const BATCH = 50;
  let sentCount = 0;
  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    await Promise.all(
      batch.map((sub: any) => {
        const { html } = templates.newsletter(
          content_html,
          unsubscribeUrl(sub.email, config.resendApiKey ?? "fallback"),
          content_html_en || undefined,
        );
        const combinedSubject = subject_en ? `${subject} | ${subject_en}` : subject;
        return resend.emails.send({ from: FROM, to: sub.email, subject: combinedSubject, html });
      }),
    );
    sentCount += batch.length;
  }

  // Log to newsletters_sent
  await (supabase as any).from("newsletters_sent").insert({
    subject,
    subject_en: subject_en ?? null,
    content_html,
    content_html_en: content_html_en ?? null,
    recipients_count: sentCount,
    sent_by: user.id,
  });

  return { sent: sentCount };
});
