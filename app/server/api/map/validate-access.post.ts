import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const { password } = await readBody(event) as { password: string };

  if (!password?.trim()) {
    return { valid: false };
  }

  const admin = serverSupabaseServiceRole(event);
  const { data } = await (admin as any)
    .from("site_settings")
    .select("value")
    .eq("key", "map_password")
    .single();

  if (!data?.value) {
    return { valid: false };
  }

  return { valid: data.value === password.trim() };
});
