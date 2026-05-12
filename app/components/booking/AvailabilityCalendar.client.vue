<template>
  <div>
    <!-- Légende -->
    <div class="flex items-center gap-6 mb-4 text-sm">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded border border-stone-200 bg-white inline-block shrink-0"></span>
        <span class="text-stone-600">{{ t("booking.calendar_available") }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-terracotta-100 border border-terracotta-200 inline-block shrink-0"></span>
        <span class="text-stone-600">{{ t("booking.calendar_unavailable") }}</span>
      </div>
    </div>

    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3"
import dayGridPlugin from "@fullcalendar/daygrid"
import type { CalendarOptions, EventInput } from "@fullcalendar/core"
import frLocale from "@fullcalendar/core/locales/fr"

const props = defineProps<{ riadId: string }>()
const { t, locale } = useI18n()
const supabase = useSupabaseClient()

const { data: blockedEvents } = await useAsyncData(
  "availability:" + props.riadId,
  async () => {
    const [{ data: avail }, { data: reservations }] = await Promise.all([
      (supabase as any)
        .from("availability")
        .select("start_date, end_date")
        .eq("riad_id", props.riadId),
      (supabase as any)
        .from("reservations")
        .select("check_in, check_out")
        .eq("riad_id", props.riadId)
        .in("status", ["confirmed", "pending"]),
    ])

    const events: EventInput[] = []
    for (const b of avail ?? []) {
      events.push({
        start: b.start_date,
        end: b.end_date,
        display: "background",
        backgroundColor: "#fbe5da",
      })
    }
    for (const r of reservations ?? []) {
      events.push({
        start: r.check_in,
        end: r.check_out,
        display: "background",
        backgroundColor: "#fbe5da",
      })
    }
    return events
  }
)

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  locale: locale.value === "fr" ? frLocale : undefined,
  events: blockedEvents.value ?? [],
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
  },
  height: "auto",
  selectable: false,
  editable: false,
}))
</script>

<style scoped>
:deep(.fc) {
  --fc-border-color: #e7e5e4;
  --fc-button-bg-color: #44403c;
  --fc-button-active-bg-color: #292524;
  --fc-button-border-color: transparent;
  --fc-today-bg-color: #fdf4f0;
  --fc-button-hover-bg-color: #292524;
  --fc-button-hover-border-color: transparent;
  --fc-button-active-border-color: transparent;
  font-family: inherit;
  font-size: 0.875rem;
}

:deep(.fc-button) {
  border-radius: 0.375rem !important;
  font-weight: 500;
  box-shadow: none !important;
}

:deep(.fc-toolbar-title) {
  font-size: 1rem !important;
  font-weight: 600;
  color: #1c1917;
  text-transform: capitalize;
}

:deep(.fc-col-header-cell-cushion) {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a8a29e;
  padding: 6px 4px;
  text-decoration: none;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.8rem;
  color: #78716c;
  padding: 4px 6px;
  text-decoration: none;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #ce4123;
  font-weight: 700;
}

:deep(.fc-day-past) {
  opacity: 0.45;
}

:deep(.fc-bg-event) {
  opacity: 0.55 !important;
}
</style>
