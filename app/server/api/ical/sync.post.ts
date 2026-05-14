import ical from "node-ical";
import { serverSupabaseServiceRole } from "#supabase/server";

type ICalSource = "airbnb" | "booking";

interface BlockToInsert {
  riad_id: string;
  start_date: string;
  end_date: string;
  source: ICalSource;
  label: string | null;
}

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);

  // Fetch all riads with ical URLs
  const { data: riads, error: riadsError } = await (supabase as any)
    .from("riads")
    .select("id, name, ical_airbnb_url, ical_booking_url");

  if (riadsError)
    throw createError({ statusCode: 500, statusMessage: riadsError.message });

  const results: {
    riad_id: string;
    source: ICalSource;
    imported: number;
    error?: string;
  }[] = [];

  for (const riad of riads ?? []) {
    const urls: { url: string; source: ICalSource }[] = [];
    if (riad.ical_airbnb_url)
      urls.push({ url: riad.ical_airbnb_url, source: "airbnb" });
    if (riad.ical_booking_url)
      urls.push({ url: riad.ical_booking_url, source: "booking" });

    for (const { url, source } of urls) {
      try {
        const calData = await ical.async.fromURL(url);
        const blocks: BlockToInsert[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rawEvents = Object.values(calData).filter((e) => e.type === "VEVENT");
        console.log(`[iCal ${source}] ${riad.name} — ${rawEvents.length} événements bruts :`);
        for (const e of rawEvents) {
          console.log(`  summary="${(e as any).summary}" | start=${(e as any).start?.toISOString?.()?.slice(0, 10)} | end=${(e as any).end?.toISOString?.()?.slice(0, 10)}`);
        }

        for (const event of Object.values(calData)) {
          if (event.type !== "VEVENT") continue;
          const start = event.start as Date;
          const end = event.end as Date;
          if (!start || !end) continue;

          // Only future / ongoing blocks
          if (end < today) continue;

          const startStr = start.toISOString().slice(0, 10);
          const endStr = end.toISOString().slice(0, 10);

          blocks.push({
            riad_id: riad.id,
            start_date: startStr,
            end_date: endStr,
            source,
            label: (event.summary as string) ?? null,
          });
        }

        // Delete existing blocks from this source for this riad, then re-insert
        await (supabase as any)
          .from("availability")
          .delete()
          .eq("riad_id", riad.id)
          .eq("source", source);

        if (blocks.length > 0) {
          const { error: insertError } = await (supabase as any)
            .from("availability")
            .insert(blocks);
          if (insertError) throw new Error(insertError.message);
        }

        results.push({ riad_id: riad.id, source, imported: blocks.length });
      } catch (err) {
        results.push({
          riad_id: riad.id,
          source,
          imported: 0,
          error: (err as Error).message,
        });
      }
    }
  }

  return { synced: results };
});
