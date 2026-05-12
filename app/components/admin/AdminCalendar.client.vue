<template>
  <div class="p-6">
    <!-- Légende -->
    <div class="flex flex-wrap gap-x-5 gap-y-2 mb-4">
      <div
        v-for="item in legend"
        :key="item.key"
        class="flex items-center gap-2 text-xs text-stone-600"
      >
        <span
          class="w-3 h-3 rounded-sm flex-shrink-0"
          :style="{ backgroundColor: item.color }"
        />
        {{ item.label }}
      </div>
    </div>

    <!-- Note Booking.com -->
    <p class="text-xs text-stone-400 mt-2 mb-4">
      <span class="inline-block w-2 h-2 rounded-full bg-[#003580] mr-1.5 align-middle"></span>
      Booking.com exporte tous ses événements avec le même label — la distinction réservation / indisponible n'est pas possible depuis le iCal.
    </p>

    <!-- Filtre riad -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="opt in riadOptions"
        :key="opt.value"
        class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
        :class="
          activeRiad === opt.value
            ? 'bg-stone-800 text-white'
            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
        "
        @click="activeRiad = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Calendrier -->
    <FullCalendar :options="calendarOptions" />

    <!-- Modal détail -->
    <Transition name="fade">
      <div
        v-if="selectedEvent"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="selectedEvent = null"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs">
          <!-- Réservation directe (notre site) -->
          <template v-if="selectedEvent.type === 'reservation'">
            <div class="flex items-start justify-between mb-4">
              <span
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="statusClass(selectedEvent.data.status)"
              >
                {{ t("reservation.status_" + selectedEvent.data.status) }}
              </span>
              <button
                class="text-stone-400 hover:text-stone-700 ml-2 text-lg leading-none"
                @click="selectedEvent = null"
              >
                ✕
              </button>
            </div>
            <p class="font-semibold text-stone-800 mb-0.5">
              {{ selectedEvent.data.profile?.full_name ?? "—" }}
            </p>
            <p class="text-xs text-stone-500 mb-4">
              {{ selectedEvent.data.riad?.name }}
            </p>
            <div class="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p class="text-xs text-stone-400 mb-0.5">{{ t("booking.check_in") }}</p>
                <p class="font-medium">{{ formatDate(selectedEvent.data.check_in) }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-400 mb-0.5">{{ t("booking.check_out") }}</p>
                <p class="font-medium">{{ formatDate(selectedEvent.data.check_out) }}</p>
              </div>
            </div>
            <div class="flex justify-between text-sm border-t border-stone-100 pt-3">
              <span class="text-stone-500">{{ t("booking.guests") }}</span>
              <span class="font-medium">{{ selectedEvent.data.guests }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1.5">
              <span class="text-stone-500">Total</span>
              <span class="font-semibold text-stone-800">{{ formatPrice(selectedEvent.data.total_price) }}</span>
            </div>
          </template>

          <!-- Bloc externe Airbnb / Booking.com -->
          <template v-else>
            <div class="flex items-start justify-between mb-4">
              <span
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="
                  selectedEvent.data.source === 'airbnb'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-blue-50 text-blue-700'
                "
              >
                {{ selectedEvent.data.source === "airbnb" ? "Airbnb" : "Booking.com" }}
              </span>
              <button
                class="text-stone-400 hover:text-stone-700 ml-2 text-lg leading-none"
                @click="selectedEvent = null"
              >
                ✕
              </button>
            </div>
            <p class="font-medium text-stone-700 mb-0.5">
              {{ isBlockedPeriod(selectedEvent.data.label) ? "Indisponible" : "Réservation" }}
            </p>
            <p class="text-xs text-stone-500 mb-4">
              {{ selectedEvent.data.riad?.name }}
            </p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs text-stone-400 mb-0.5">{{ t("booking.check_in") }}</p>
                <p class="font-medium">{{ formatDate(selectedEvent.data.start_date) }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-400 mb-0.5">{{ t("booking.check_out") }}</p>
                <p class="font-medium">{{ formatDate(selectedEvent.data.end_date) }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3"
import dayGridPlugin from "@fullcalendar/daygrid"
import type { CalendarOptions, EventInput } from "@fullcalendar/core"
import frLocale from "@fullcalendar/core/locales/fr"
import { format, parseISO } from "date-fns"
import { fr, enUS } from "date-fns/locale"

const { t, locale } = useI18n()
const supabase = useSupabaseClient()

type RiadFilter = "all" | "dar-barai" | "dar-tanawi"

const activeRiad = ref<RiadFilter>("all")

const riadOptions = computed(() => [
  { value: "all" as RiadFilter, label: t("admin.filter_all") },
  { value: "dar-barai" as RiadFilter, label: "Dar Baraï" },
  { value: "dar-tanawi" as RiadFilter, label: "Dar Tanawi" },
])


const { data: reservationsData } = await useAsyncData("calendar:reservations", async () => {
  const { data } = await (supabase as any)
    .from("reservations")
    .select(
      "id, check_in, check_out, guests, total_price, status, riad:riads(name, slug), profile:profiles(full_name)"
    )
    .in("status", ["confirmed", "pending"])
  return data ?? []
})

function isBlockedPeriod(label: string | null): boolean {
  if (!label) return false
  const l = label.toLowerCase()
  return (
    l.includes("not available") ||
    l.includes("closed") ||
    l.includes("unavailable") ||
    l.includes("blocked") ||
    l.includes("indisponible")
  )
}

const { data: availabilityData } = await useAsyncData("calendar:availability", async () => {
  const { data } = await (supabase as any)
    .from("availability")
    .select("id, riad_id, start_date, end_date, source, label, riad:riads(name, slug)")
    .in("source", ["airbnb", "booking"])
  return data ?? []
})

const COLORS: Record<string, string> = {
  "dar-barai-confirmed":  "#ce4123", // terracotta-600
  "dar-barai-pending":    "#efa484", // terracotta-300
  "dar-tanawi-confirmed": "#677439", // olive-600
  "dar-tanawi-pending":   "#b8c28c", // olive-300
  "airbnb-reservation":   "#FF5A5F",
  "airbnb-blocked":       "#a8a29e", // stone-400
  "booking":              "#003580",
}

const legend = computed(() => [
  { key: "bc", color: COLORS["dar-barai-confirmed"], label: "Dar Baraï – " + t("reservation.status_confirmed") },
  { key: "bp", color: COLORS["dar-barai-pending"],   label: "Dar Baraï – " + t("reservation.status_pending") },
  { key: "tc", color: COLORS["dar-tanawi-confirmed"],label: "Dar Tanawi – " + t("reservation.status_confirmed") },
  { key: "tp", color: COLORS["dar-tanawi-pending"],  label: "Dar Tanawi – " + t("reservation.status_pending") },
  { key: "ar", color: COLORS["airbnb-reservation"],  label: "Airbnb – Réservation" },
  { key: "ab", color: COLORS["airbnb-blocked"],      label: "Airbnb – Indisponible" },
  { key: "bk", color: COLORS["booking"],             label: "Booking.com" },
])

const events = computed<EventInput[]>(() => {
  const result: EventInput[] = []

  for (const r of reservationsData.value ?? []) {
    const slug: string = r.riad?.slug ?? ""
    if (activeRiad.value !== "all" && slug !== activeRiad.value) continue
    const colorKey = slug + "-" + r.status
    const riadPrefix = activeRiad.value === "all" && r.riad?.name ? r.riad.name + " · " : ""
    result.push({
      id: r.id,
      title: riadPrefix + (r.profile?.full_name ?? "—"),
      start: r.check_in,
      end: r.check_out,
      allDay: true,
      backgroundColor: COLORS[colorKey] ?? "#9ca3af",
      borderColor: "transparent",
      textColor: "#ffffff",
      extendedProps: { type: "reservation", data: r },
    })
  }

  for (const a of availabilityData.value ?? []) {
    const slug: string = a.riad?.slug ?? ""
    if (activeRiad.value !== "all" && slug !== activeRiad.value) continue
    let colorKey: string
    let title: string
    const riadPrefix = activeRiad.value === "all" && a.riad?.name ? a.riad.name + " · " : ""
    if (a.source === "booking") {
      colorKey = "booking"
      title = riadPrefix + "Booking.com"
    } else {
      const blocked = isBlockedPeriod(a.label)
      colorKey = blocked ? "airbnb-blocked" : "airbnb-reservation"
      title = riadPrefix + (blocked ? "Airbnb – Indisponible" : "Airbnb – Réservation")
    }
    result.push({
      id: "avail-" + a.id,
      title,
      start: a.start_date,
      end: a.end_date,
      allDay: true,
      backgroundColor: COLORS[colorKey] ?? "#9ca3af",
      borderColor: "transparent",
      textColor: colorKey === "airbnb-blocked" ? "#44403c" : "#ffffff",
      extendedProps: { type: "availability", data: a },
    })
  }

  return result
})

interface SelectedEvent {
  type: "reservation" | "availability"
  data: any
}

const selectedEvent = ref<SelectedEvent | null>(null)

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  locale: locale.value === "fr" ? frLocale : undefined,
  events: events.value,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
  },
  height: "auto",
  dayMaxEvents: 3,
  eventClick: (info) => {
    selectedEvent.value = {
      type: info.event.extendedProps.type,
      data: info.event.extendedProps.data,
    }
  },
}))

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", {
      locale: locale.value === "fr" ? fr : enUS,
    })
  } catch {
    return dateStr
  }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100)
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending:   "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    refunded:  "bg-stone-100 text-stone-600",
  }
  return map[status] ?? "bg-stone-100 text-stone-600"
}
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

:deep(.fc-event) {
  border-radius: 3px !important;
  font-size: 0.7rem !important;
  cursor: pointer;
}

:deep(.fc-more-link) {
  font-size: 0.7rem;
  color: #78716c;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
