<template>
  <div class="overflow-x-auto">
    <div v-if="loading" class="py-12 text-center text-stone-400">
      {{ t("common.loading") }}
    </div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b border-stone-200 text-left">
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Réf.</th>
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Client / Source</th>
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Riad</th>
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Dates</th>
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Total</th>
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Statut</th>
          <th class="px-4 pb-3 pt-1 font-medium text-stone-500">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone-100">
        <tr v-if="allRows.length === 0">
          <td colspan="6" class="py-8 text-center text-stone-400">
            Aucune réservation.
          </td>
        </tr>

        <template v-for="row in allRows" :key="row.id">
          <!-- Réservation directe -->
          <tr v-if="row.kind === 'reservation'" class="hover:bg-stone-50">
            <td class="py-3 px-4 font-mono text-xs text-stone-400">
              {{ row.data.id.slice(0, 8) }}
            </td>
            <td class="py-3 px-4">
              <p class="font-medium text-stone-700">
                {{ row.data.profile?.full_name || "—" }}
              </p>
              <p class="text-xs text-stone-400">{{ row.data.profile?.email }}</p>
            </td>
            <td class="py-3 px-4 text-stone-600">{{ row.data.riad?.name }}</td>
            <td class="py-3 px-4 text-stone-600 whitespace-nowrap">
              {{ formatDate(row.data.check_in) }} → {{ formatDate(row.data.check_out) }}
            </td>
            <td class="py-3 px-4 font-medium text-stone-800">
              {{ formatPrice(row.data.total_price) }}
            </td>
            <td class="py-3 px-4">
              <span class="badge" :class="statusClass(row.data.status)">
                {{ t("reservation.status_" + row.data.status) }}
              </span>
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <button
                  v-if="row.data.status === 'pending' || row.data.status === 'confirmed'"
                  class="text-xs px-2.5 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                  @click="cancelReservation(row.data.id)"
                >
                  {{ t("admin.reservation_cancel") }}
                </button>
                <button
                  v-if="row.data.status === 'cancelled'"
                  class="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  @click="deleteReservation(row.data.id)"
                >
                  {{ t("common.delete") }}
                </button>
              </div>
            </td>
          </tr>

          <!-- Bloc externe Airbnb / Booking.com -->
          <tr
            v-else
            class="hover:opacity-90"
            :class="isBlockedPeriod(row.data.label) ? 'bg-stone-50' : row.data.source === 'airbnb' ? 'bg-red-50/60' : 'bg-blue-50/60'"
          >
            <td class="py-3 px-4 text-xs text-stone-400">—</td>
            <td class="py-3 px-4">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-medium"
                :class="row.data.source === 'airbnb' ? 'text-red-600' : 'text-blue-700'"
              >
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :class="row.data.source === 'airbnb' ? 'bg-red-500' : 'bg-blue-600'"
                />
                {{ row.data.source === "airbnb" ? "Airbnb" : "Booking.com" }}
              </span>
            </td>
            <td class="py-3 px-4 text-stone-600">{{ row.data.riad?.name }}</td>
            <td class="py-3 px-4 text-stone-600 whitespace-nowrap">
              {{ formatDate(row.data.start_date) }} →
              {{ formatDate(row.data.end_date) }}
            </td>
            <td class="py-3 px-4 text-stone-300">—</td>
            <td class="py-3 px-4">
              <!-- Booking.com : pas de distinction possible -->
              <span v-if="row.data.source === 'booking'" class="badge badge-info">
                Booking.com
              </span>
              <!-- Airbnb : distinction fiable -->
              <template v-else>
                <span
                  v-if="isBlockedPeriod(row.data.label)"
                  class="badge bg-stone-100 text-stone-500"
                >
                  Airbnb – Indisponible
                </span>
                <span v-else class="badge badge-error">
                  Airbnb – Réservation
                </span>
              </template>
            </td>
            <td class="py-3 px-4" />
          </tr>
        </template>
      </tbody>
    </table>
    <p v-if="externalBlocks?.some(b => b.source === 'booking')" class="px-4 pt-3 pb-1 text-xs text-stone-400 border-t border-stone-100">
      ⓘ Booking.com exporte réservations et blocages avec le même label — la distinction n'est pas possible depuis le iCal.
    </p>
  </div>

  <UiConfirmModal
    v-model="cancelModal.open"
    :title="t('admin.reservation_cancel_confirm')"
    :confirm-label="t('admin.reservation_cancel')"
    :danger="false"
    @confirm="doCancel"
  />

  <UiConfirmModal
    v-model="deleteModal.open"
    :title="t('admin.reservation_delete_confirm')"
    :confirm-label="t('common.delete')"
    danger
    @confirm="doDelete"
  />
</template>

<script setup lang="ts">
import type { Reservation } from "~/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface ExternalBlock {
  id: string;
  riad_id: string;
  start_date: string;
  end_date: string;
  source: "airbnb" | "booking";
  label: string | null;
  riad?: { name: string; slug: string };
}

type ReservationRow = Reservation & {
  riad?: { name: string; slug: string };
  profile?: { full_name: string; email: string };
};

type UnifiedRow =
  | { kind: "reservation"; id: string; sortDate: string; data: ReservationRow }
  | { kind: "block"; id: string; sortDate: string; data: ExternalBlock };

const props = defineProps<{
  reservations?: ReservationRow[];
  externalBlocks?: ExternalBlock[];
  limit?: number;
  loading?: boolean;
}>();

const emit = defineEmits<{ refresh: [] }>();

const { t } = useI18n();
const { formatPrice } = useRiad();

function isBlockedPeriod(label: string | null): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return (
    l.includes("not available") ||
    l.includes("closed") ||
    l.includes("unavailable") ||
    l.includes("blocked") ||
    l.includes("indisponible")
  );
}

const supabase = useSupabaseClient();

const fetchedRows = ref<ReservationRow[]>([]);

const reservationRows = computed(() => {
  const list = props.reservations ?? fetchedRows.value;
  return props.limit ? list.slice(0, props.limit) : list;
});

const allRows = computed<UnifiedRow[]>(() => {
  const result: UnifiedRow[] = [];

  for (const r of reservationRows.value) {
    result.push({ kind: "reservation", id: r.id, sortDate: r.check_in, data: r });
  }

  for (const b of props.externalBlocks ?? []) {
    result.push({ kind: "block", id: "block-" + b.id, sortDate: b.start_date, data: b });
  }

  return result.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
});

const refetchOwn = async () => {
  if (!props.limit) return;
  console.log("[refetchOwn] re-fetching fetchedRows");
  const { data } = await (supabase as any)
    .from("reservations")
    .select("*, riad:riads(name, slug), profile:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(props.limit);
  fetchedRows.value = data ?? [];
  console.log("[refetchOwn] done, length=", fetchedRows.value.length);
};

// Chargement initial si utilisé en mode "limit" (dashboard)
if (props.limit && !props.reservations) {
  await refetchOwn();
}

const formatDate = (d: string) =>
  format(parseISO(d), "dd MMM yyyy", { locale: fr });

const cancelModal = reactive({ open: false, id: "" });
const deleteModal = reactive({ open: false, id: "" });

const cancelReservation = (id: string) => {
  cancelModal.id = id;
  cancelModal.open = true;
};

const doCancel = async () => {
  await (supabase as any)
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", cancelModal.id);
  await refetchOwn();
  emit("refresh");
};

const deleteReservation = (id: string) => {
  deleteModal.id = id;
  deleteModal.open = true;
};

const doDelete = async () => {
  await (supabase as any).from("reservations").delete().eq("id", deleteModal.id);
  await refetchOwn();
  emit("refresh");
};

const statusClass = (status: string) =>
  ({
    pending: "badge-warning",
    confirmed: "badge-success",
    cancelled: "badge-error",
    refunded: "badge-info",
  })[status] ?? "badge-info";
</script>
