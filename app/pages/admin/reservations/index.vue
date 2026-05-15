<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-stone-800">
        {{ t("admin.reservations") }}
      </h1>
      <!-- Toggle vue -->
      <div class="flex gap-1 rounded-lg border border-stone-200 bg-white p-1">
        <button
          class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          :class="
            view === 'table'
              ? 'bg-stone-800 text-white'
              : 'text-stone-600 hover:bg-stone-50'
          "
          @click="view = 'table'"
        >
          {{ t("admin.table_view") }}
        </button>
        <button
          class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          :class="
            view === 'calendar'
              ? 'bg-stone-800 text-white'
              : 'text-stone-600 hover:bg-stone-50'
          "
          @click="view = 'calendar'"
        >
          {{ t("admin.calendar_view") }}
        </button>
      </div>
    </div>

    <!-- Encart synchronisation iCal -->
    <div class="flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-5 py-3.5 mb-5">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-stone-700">{{ t("admin.ical_sync_title") }}</p>
        <p class="text-xs text-stone-400 mt-0.5">{{ t("admin.ical_sync_description") }}</p>
      </div>
      <!-- Statut -->
      <span
        v-if="syncing"
        class="flex items-center gap-1.5 text-xs text-stone-500 shrink-0"
      >
        <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        {{ t("admin.ical_syncing") }}
      </span>
      <span
        v-else-if="syncMessage"
        class="text-xs text-emerald-600 shrink-0"
      >
        ✓ {{ syncMessage }}
      </span>
      <span
        v-else-if="syncError"
        class="text-xs text-red-500 shrink-0"
        :title="syncError"
      >
        ✕ {{ t("admin.ical_sync_error") }}
      </span>
      <!-- Bouton -->
      <button
        class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="syncing"
        @click="syncIcal"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ t("admin.sync_ical") }}
      </button>
    </div>

    <!-- Vue tableau -->
    <template v-if="view === 'table'">
      <div class="flex gap-2 mb-4">
        <button
          v-for="s in ['all', 'pending', 'confirmed', 'cancelled']"
          :key="s"
          class="px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="
            status === s
              ? 'bg-terracotta-600 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100'
          "
          @click="
            status = s;
            page = 1;
          "
        >
          {{ s === "all" ? t("admin.filter_all") : t("reservation.status_" + s) }}
        </button>
      </div>
      <div class="card">
        <AdminReservationsTable
          :reservations="reservationsData"
          :external-blocks="status === 'all' ? (externalBlocks ?? []) : []"
          :loading="reservationsLoading"
          @refresh="fetchReservations"
        />
      </div>
    </template>

    <!-- Vue calendrier -->
    <div v-else class="card">
      <ClientOnly>
        <AdminCalendar />
        <template #fallback>
          <div class="py-20 text-center text-stone-400 text-sm">
            {{ t("common.loading") }}
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const supabase = useSupabaseClient();
const { t } = useI18n();

type View = "table" | "calendar";
const view = ref<View>("table");

const page = ref(1);
const pageSize = 20;
const status = ref<string>("all");

const syncing = ref(false);
const syncMessage = ref<string | null>(null);
const syncError = ref<string | null>(null);

const reservationsData = ref<any[]>([]);
const reservationsLoading = ref(false);

const fetchReservations = async () => {
  reservationsLoading.value = true;
  let query = (supabase as any)
    .from("reservations")
    .select("*, riad:riads(name, slug), profile:profiles(full_name, email, phone, birth_date)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page.value - 1) * pageSize, page.value * pageSize - 1);

  if (status.value !== "all") {
    query = query.eq("status", status.value);
  }
  const { data } = await query;
  reservationsData.value = data ?? [];
  reservationsLoading.value = false;
};

watch([page, status], fetchReservations);
await fetchReservations();

const { data: externalBlocks, refresh: refreshBlocks } = await useAsyncData(
  "admin:blocks",
  async () => {
    const { data } = await (supabase as any)
      .from("availability")
      .select("id, riad_id, start_date, end_date, source, label, riad:riads(name, slug)")
      .in("source", ["airbnb", "booking"])
      .order("start_date", { ascending: false });
    return data ?? [];
  }
);

const syncIcal = async () => {
  syncing.value = true;
  syncMessage.value = null;
  syncError.value = null;
  try {
    const result = await $fetch<{ synced: { imported: number; error?: string }[] }>(
      "/api/ical/sync",
      { method: "POST" }
    );
    const total = result.synced.reduce((s, r) => s + r.imported, 0);
    syncMessage.value = t("admin.ical_synced", { n: total });
    await refreshBlocks();
  } catch (err: any) {
    syncError.value = err?.message ?? "unknown";
  } finally {
    syncing.value = false;
  }
};

onMounted(() => {
  syncIcal();
});

useSeoMeta({ title: t("admin.seo_reservations_title") });
</script>
