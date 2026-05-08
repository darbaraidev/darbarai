<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const supabase = useSupabaseClient();
const { t } = useI18n();

const page = ref(1);
const pageSize = 20;
const status = ref<string>("all");

const { data: reservations, refresh } = await useAsyncData(
  "admin:reservations",
  async () => {
    let query = supabase
      .from("reservations")
      .select("*, riad:riads(name, slug), profile:profiles(full_name, email)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range((page.value - 1) * pageSize, page.value * pageSize - 1);

    if (status.value !== "all") {
      query = query.eq("status", status.value);
    }
    return query;
  },
  { watch: [page, status] },
);

useSeoMeta({ title: "Réservations – Admin" });
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-stone-800">
        {{ t("admin.reservations") }}
      </h1>
    </div>

    <!-- Filtres -->
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
        {{ s === "all" ? "Toutes" : t(`reservation.status_${s}`) }}
      </button>
    </div>

    <div class="card">
      <AdminReservationsTable
        :reservations="reservations?.data ?? []"
        :loading="!reservations"
        @refresh="refresh"
      />
    </div>
  </div>
</template>
