<template>
  <div class="card p-6 sticky top-24">
    <h2 class="font-serif text-2xl text-stone-800 mb-6">
      {{ t("booking.title") }}
    </h2>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Dates -->
      <ClientOnly>
        <BookingCalendarPicker
          :riad-id="riad.id"
          :check-in="form.checkIn"
          :check-out="form.checkOut"
          :min-nights="riad.min_nights"
          @update:check-in="onPickerCheckIn"
          @update:check-out="onPickerCheckOut"
        />
        <template #fallback>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label
                class="block text-xs font-medium text-stone-600 mb-1 uppercase tracking-wide"
              >
                {{ t("booking.check_in") }}
              </label>
              <input
                v-model="form.checkIn"
                type="date"
                required
                :min="today"
                class="input-field text-sm"
                @change="onDateChange"
              />
            </div>
            <div>
              <label
                class="block text-xs font-medium text-stone-600 mb-1 uppercase tracking-wide"
              >
                {{ t("booking.check_out") }}
              </label>
              <input
                v-model="form.checkOut"
                type="date"
                required
                :min="minCheckOut"
                class="input-field text-sm"
                @change="onDateChange"
              />
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Voyageurs -->
      <div>
        <label
          class="block text-xs font-medium text-stone-600 mb-1 uppercase tracking-wide"
        >
          {{ t("booking.guests") }}
        </label>
        <select v-model="form.guests" class="input-field text-sm">
          <option v-for="n in riad.max_guests" :key="n" :value="n">
            {{ t("riads.guests", n) }}
          </option>
        </select>
      </div>

      <!-- Demandes particulières -->
      <div>
        <label
          class="block text-xs font-medium text-stone-600 mb-1 uppercase tracking-wide"
        >
          {{ t("booking.special_requests") }}
        </label>
        <textarea
          v-model="form.specialRequests"
          rows="3"
          :placeholder="t('booking.special_requests_placeholder')"
          class="input-field text-sm resize-none"
        />
      </div>

      <!-- Récap prix -->
      <div
        v-if="nights > 0"
        class="bg-sand-50 rounded-xl p-4 space-y-2 text-sm"
      >
        <div class="flex justify-between text-stone-600">
          <span
            >{{ formatPrice(riad.base_price_per_night) }} ×
            {{ t("booking.nights", nights) }}</span
          >
          <span>{{ formatPrice(totalPrice) }}</span>
        </div>
        <div
          class="flex justify-between font-semibold text-stone-800 pt-2 border-t border-sand-200"
        >
          <span>{{ t("booking.total") }}</span>
          <span>{{ formatPrice(totalPrice) }}</span>
        </div>
      </div>

      <!-- Erreur disponibilité -->
      <p v-if="unavailable" class="text-red-600 text-sm">
        {{ t("booking.unavailable") }}
      </p>

      <!-- CTA -->
      <button
        type="submit"
        class="btn-primary w-full text-base py-4"
        :disabled="unavailable || nights === 0 || (riad.min_nights > 1 && nights > 0 && nights < riad.min_nights)"
      >
        {{ t("booking.confirm") }}
      </button>
    </form>

    <p class="text-center text-xs text-stone-400 mt-3">
      {{ t("booking.no_charge_yet") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Riad } from "~/types";
import { addDays, format } from "date-fns";


const props = defineProps<{ riad: Riad }>();
const { t } = useI18n();
const { formatPrice } = useRiad();
const { calcNights, calcTotal, checkAvailability } = useBooking();
const user = useSupabaseUser();
const localePath = useLocalePath();

const today = format(new Date(), "yyyy-MM-dd");
const form = reactive({
  checkIn: "",
  checkOut: "",
  guests: 2,
  specialRequests: "",
});

const nights = computed(() =>
  form.checkIn && form.checkOut ? calcNights(form.checkIn, form.checkOut) : 0,
);
const totalPrice = computed(() =>
  calcTotal(nights.value, props.riad.base_price_per_night),
);
const minCheckOut = computed(() =>
  form.checkIn
    ? format(addDays(new Date(form.checkIn), 1), "yyyy-MM-dd")
    : today,
);

const unavailable = ref(false);

const onDateChange = async () => {
  if (!form.checkIn || !form.checkOut || nights.value <= 0) return;
  unavailable.value = !(await checkAvailability(
    props.riad.id,
    form.checkIn,
    form.checkOut,
  ));
};

const onPickerCheckIn = async (date: string) => {
  form.checkIn = date;
  form.checkOut = "";
  unavailable.value = false;
};

const onPickerCheckOut = async (date: string) => {
  form.checkOut = date;
  if (form.checkIn && date) await onDateChange();
};

const onSubmit = async () => {
  const bookingQuery = new URLSearchParams({
    riadId: props.riad.id,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guests: String(form.guests),
    ...(form.specialRequests ? { specialRequests: form.specialRequests } : {}),
  }).toString()
  const bookingPath = localePath("/booking") + "?" + bookingQuery

  if (!user.value) {
    await navigateTo(
      localePath("/auth/login") + "?redirect=" + encodeURIComponent(bookingPath)
    )
    return
  }

  await navigateTo(bookingPath)
};
</script>
