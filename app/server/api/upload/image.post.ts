import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const supabase = serverSupabaseServiceRole(event);

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");
  const folder =
    form?.find((f) => f.name === "folder")?.data?.toString() ?? "misc";

  if (!file || !file.data)
    throw createError({ statusCode: 400, statusMessage: "No file provided" });

  // Validate MIME type (images only)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const contentType = file.type ?? "image/jpeg";
  if (!allowedTypes.includes(contentType)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid file type. Only images are allowed.",
    });
  }

  const ext = file.filename?.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("riads")
    .upload(safeName, file.data, { contentType, upsert: false });

  if (uploadError)
    throw createError({ statusCode: 500, statusMessage: uploadError.message });

  const {
    data: { publicUrl },
  } = supabase.storage.from("riads").getPublicUrl(safeName);

  return { url: publicUrl };
});
