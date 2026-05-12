<template>
  <div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          class="block text-xs font-medium text-stone-600 mb-1 uppercase tracking-wide"
        >
          {{ t("booking.check_in") }}
        </label>
        <div
          class="input-field text-sm cursor-pointer flex items-center justify-between gap-2"
          @click="open"
        >
          <span :class="checkIn ? 'text-stone-800' : 'text-stone-400'">
            {{ checkIn ? formatDate(checkIn) : "—" }}
          </span>
          <button
            v-if="checkIn"
            type="button"
            class="shrink-0 text-stone-300 hover:text-stone-500 transition-colors"
            @click.stop="clearCheckIn"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <svg
            v-else
            class="w-4 h-4 text-stone-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div>
        <label
          class="block text-xs font-medium text-stone-600 mb-1 uppercase tracking-wide"
        >
          {{ t("booking.check_out") }}
        </label>
        <div
          class="input-field text-sm cursor-pointer flex items-center justify-between gap-2"
          @click="open"
        >
          <span :class="checkOut ? 'text-stone-800' : 'text-stone-400'">
            {{ checkOut ? formatDate(checkOut) : "—" }}
          </span>
          <button
            v-if="checkOut"
            type="button"
            class="shrink-0 text-stone-300 hover:text-stone-500 transition-colors"
            @click.stop="clearCheckOut"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <svg
            v-else
            class="w-4 h-4 text-stone-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
    <p v-if="minNightsError" class="mt-2 text-xs text-red-600">
      {{ t("booking.min_stay", { n: props.minNights }) }}
    </p>
    <input ref="inputRef" class="sr-only" tabindex="-1" readonly />
  </div>
</template>

<script setup lang="ts">
import flatpickr from "flatpickr"
import type { Instance } from "flatpickr/dist/types/instance"
import { format, parseISO, differenceInCalendarDays } from "date-fns"

const props = defineProps<{
  riadId: string
  checkIn: string
  checkOut: string
  minNights?: number
}>()

const emit = defineEmits<{
  "update:checkIn": [value: string]
  "update:checkOut": [value: string]
}>()

const { t, locale } = useI18n()

const selectedNights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0
  return differenceInCalendarDays(parseISO(props.checkOut), parseISO(props.checkIn))
})

const minNightsError = computed(
  () =>
    props.minNights &&
    props.minNights > 1 &&
    selectedNights.value > 0 &&
    selectedNights.value < props.minNights
)
const supabase = useSupabaseClient()
const inputRef = ref<HTMLInputElement | null>(null)
let fp: Instance | null = null

const { data: blockedDates } = await useAsyncData(
  "picker-availability:" + props.riadId,
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
    const result: { start: string; end: string }[] = []
    for (const b of avail ?? []) result.push({ start: b.start_date, end: b.end_date })
    for (const r of reservations ?? []) result.push({ start: r.check_in, end: r.check_out })
    return result
  }
)

const isDisabled = (date: Date): boolean => {
  const d = format(date, "yyyy-MM-dd")
  return (blockedDates.value ?? []).some((b) => d >= b.start && d < b.end)
}

onMounted(async () => {
  let localeConfig: object | undefined
  if (locale.value === "fr") {
    const { fr } = await import("flatpickr/dist/l10n/fr.js")
    localeConfig = fr
  }

  fp = flatpickr(inputRef.value!, {
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    locale: localeConfig as any,
    disable: [isDisabled],
    onChange: (selectedDates) => {
      const newCheckIn = selectedDates[0] ? format(selectedDates[0], "yyyy-MM-dd") : ""
      const newCheckOut = selectedDates[1] ? format(selectedDates[1], "yyyy-MM-dd") : ""
      if (newCheckIn !== props.checkIn) emit("update:checkIn", newCheckIn)
      if (newCheckOut !== props.checkOut) emit("update:checkOut", newCheckOut)
    },
  })

  if (props.checkIn) {
    const dates = props.checkOut
      ? [parseISO(props.checkIn), parseISO(props.checkOut)]
      : [parseISO(props.checkIn)]
    fp.setDate(dates)
  }
})

onUnmounted(() => fp?.destroy())

const open = () => fp?.open()

const clearCheckIn = () => {
  fp?.clear()
  emit("update:checkIn", "")
  emit("update:checkOut", "")
}

const clearCheckOut = () => {
  fp?.setDate([parseISO(props.checkIn)])
  emit("update:checkOut", "")
}

const formatDate = (d: string) =>
  format(parseISO(d), locale.value === "fr" ? "dd MMM yyyy" : "MMM dd, yyyy")
</script>

<style>
.flatpickr-calendar {
  font-family: inherit;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid #e7e5e4;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}

.flatpickr-day.selected,
.flatpickr-day.startRange,
.flatpickr-day.endRange {
  background: #ce4123 !important;
  border-color: #ce4123 !important;
}

.flatpickr-day.selected:hover,
.flatpickr-day.startRange:hover,
.flatpickr-day.endRange:hover {
  background: #b5361d !important;
  border-color: #b5361d !important;
}

.flatpickr-day.inRange {
  background: #fbe5da !important;
  border-color: #fbe5da !important;
  box-shadow: -5px 0 0 #fbe5da, 5px 0 0 #fbe5da;
}

.flatpickr-day:hover {
  background: #fdf4f0 !important;
}

.flatpickr-day.today {
  border-color: #ce4123 !important;
  color: #ce4123;
  font-weight: 700;
}

.flatpickr-day.today.selected {
  color: #fff !important;
}

.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover {
  color: #d6d3d1 !important;
  background: #fafaf9 !important;
  cursor: not-allowed;
  text-decoration: line-through;
}

.flatpickr-months .flatpickr-month {
  color: #1c1917;
}

.flatpickr-current-month .flatpickr-monthDropdown-months,
.flatpickr-current-month input.cur-year {
  font-weight: 600;
  color: #1c1917;
}

.flatpickr-weekday {
  color: #a8a29e !important;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.flatpickr-prev-month svg,
.flatpickr-next-month svg {
  fill: #78716c;
}

.flatpickr-prev-month:hover svg,
.flatpickr-next-month:hover svg {
  fill: #1c1917;
}
</style>
