<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const supabase = useSupabaseClient();
const { t } = useI18n();

// Stats rapides
const [
  { count: totalReservations },
  { count: pendingCount },
  { count: totalClients },
] = await Promise.all([
  supabase.from("reservations").select("*", { count: "exact", head: true }),
  supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending"),
  supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client"),
]);

useSeoMeta({ title: "Administration – Dar Baraï" });
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-stone-800 mb-8">
      {{ t("admin.title") }}
    </h1>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <AdminStatCard
        label="Réservations totales"
        :value="totalReservations ?? 0"
        icon="calendar"
      />
      <AdminStatCard
        label="En attente"
        :value="pendingCount ?? 0"
        icon="clock"
        color="amber"
      />
      <AdminStatCard label="Clients" :value="totalClients ?? 0" icon="users" />
      <AdminStatCard label="Riads" :value="2" icon="home" color="olive" />
    </div>

    <!-- Dernières réservations -->
    <div class="card p-6">
      <h2 class="font-semibold text-stone-700 mb-4">Réservations récentes</h2>
      <AdminReservationsTable :limit="5" />
    </div>
  </div>
</template>
