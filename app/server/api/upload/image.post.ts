import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { v2 as cloudinary } from "cloudinary";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const supabase = serverSupabaseServiceRole(event);
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  const config = useRuntimeConfig();
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");
  const folder = form?.find((f) => f.name === "folder")?.data?.toString() ?? "misc";

  if (!file?.data) throw createError({ statusCode: 400, statusMessage: "No file provided" });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const contentType = file.type ?? "image/jpeg";
  if (!allowedTypes.includes(contentType))
    throw createError({ statusCode: 400, statusMessage: "Invalid file type" });

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `darbarai/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve(result as { secure_url: string });
      },
    ).end(file.data);
  });

  return { url: result.secure_url };
});
