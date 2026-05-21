import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { v2 as cloudinary } from "cloudinary";

async function migrateUrl(url: string, folder: string, cloudName: string, apiKey: string, apiSecret: string): Promise<string> {
  if (!url || !url.includes("supabase.co")) return url;

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const res = await fetch(url);
  if (!res.ok) return url;
  const buffer = Buffer.from(await res.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `darbarai/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve(result as { secure_url: string });
      },
    ).end(buffer);
  });

  return result.secure_url;
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const supabase = serverSupabaseServiceRole(event);
  const { data: profile } = await (supabase as any).from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  const config = useRuntimeConfig();
  const { cloudinaryCloudName: cn, cloudinaryApiKey: ak, cloudinaryApiSecret: as_ } = config;

  const log: string[] = [];

  // ── Riads ──────────────────────────────────────────────────────────────────
  const { data: riads } = await (supabase as any).from("riads").select("id, slug, cover_image, gallery");

  for (const riad of riads ?? []) {
    let changed = false;

    // cover_image
    if (riad.cover_image?.includes("supabase.co")) {
      const newUrl = await migrateUrl(riad.cover_image, "riads", cn, ak, as_);
      riad.cover_image = newUrl;
      changed = true;
      log.push(`riad ${riad.slug} cover_image → ${newUrl}`);
    }

    // gallery (array of { label, photos: string[] })
    const gallery = riad.gallery ?? [];
    for (const group of gallery) {
      const newPhotos: string[] = [];
      for (const photoUrl of group.photos ?? []) {
        if (photoUrl.includes("supabase.co")) {
          const newUrl = await migrateUrl(photoUrl, "riads", cn, ak, as_);
          newPhotos.push(newUrl);
          changed = true;
          log.push(`riad ${riad.slug} gallery photo → ${newUrl}`);
        } else {
          newPhotos.push(photoUrl);
        }
      }
      group.photos = newPhotos;
    }

    if (changed) {
      await (supabase as any).from("riads").update({ cover_image: riad.cover_image, gallery }).eq("id", riad.id);
    }
  }

  // ── Services ───────────────────────────────────────────────────────────────
  const { data: services } = await (supabase as any).from("services").select("id, slug, photos");

  for (const service of services ?? []) {
    const photos: string[] = service.photos ?? [];
    const newPhotos: string[] = [];
    let changed = false;

    for (const photoUrl of photos) {
      if (photoUrl.includes("supabase.co")) {
        const newUrl = await migrateUrl(photoUrl, "services", cn, ak, as_);
        newPhotos.push(newUrl);
        changed = true;
        log.push(`service ${service.slug} photo → ${newUrl}`);
      } else {
        newPhotos.push(photoUrl);
      }
    }

    if (changed) {
      await (supabase as any).from("services").update({ photos: newPhotos }).eq("id", service.id);
    }
  }

  return { migrated: log.length, log };
});
