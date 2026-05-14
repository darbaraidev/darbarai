<template>
  <div class="card p-5 flex flex-col sm:flex-row gap-4">
    <!-- Cover riad -->
    <div
      class="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0"
    >
      <img
        v-if="reservation.riad?.cover_image"
        :src="reservation.riad.cover_image"
        :alt="reservation.riad.name"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Infos -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p class="font-serif text-lg text-stone-800">
            {{ reservation.riad?.name }}
          </p>
          <p class="text-xs text-stone-400 font-mono">
            {{
              t("account.reservation_ref", { id: reservation.id.slice(0, 8) })
            }}
          </p>
        </div>
        <span class="badge" :class="statusClass">{{
          t(`reservation.status_${reservation.status}`)
        }}</span>
      </div>

      <div class="mt-3 flex flex-wrap gap-4 text-sm text-stone-600">
        <span class="flex items-center gap-1.5">
          <svg
            class="w-4 h-4 text-stone-400"
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
          {{ formatDate(reservation.check_in) }} →
          {{ formatDate(reservation.check_out) }}
        </span>
        <span class="flex items-center gap-1.5">
          <svg
            class="w-4 h-4 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {{ t("riads.guests", reservation.guests) }}
        </span>
        <span class="font-semibold text-stone-800">{{
          formatPrice(reservation.total_price)
        }}</span>
      </div>

      <div v-if="reservation.status === 'pending'" class="mt-4">
        <button
          class="text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
          @click="confirmModal = true"
        >
          {{ t("account.cancel_reservation") }}
        </button>
      </div>
    </div>
  </div>

  <UiConfirmModal
    v-model="confirmModal"
    :title="t('account.cancel_confirm')"
    :confirm-label="t('common.confirm')"
    :danger="true"
    @confirm="doCancel"
  />
</template>

<script setup lang="ts">
import type { Reservation } from "~/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const props = defineProps<{ reservation: Reservation }>();
const emit = defineEmits<{ cancelled: [] }>();
const { t } = useI18n();
const { formatPrice } = useRiad();
const supabase = useSupabaseClient();

const confirmModal = ref(false);

const doCancel = async () => {
  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", props.reservation.id);
  emit("cancelled");
};

const formatDate = (d: string) =>
  format(parseISO(d), "dd MMM yyyy", { locale: fr });

const statusClass = computed(
  () =>
    ({
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
      refunded: "badge-info",
    })[props.reservation.status] ?? "badge-info",
);
</script>
