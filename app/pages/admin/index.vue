<template>
  <div>
    <h1 class="text-2xl font-semibold text-stone-800 mb-8">
      {{ t("admin.title") }}
    </h1>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <AdminStatCard
        :label="t('admin.stat_total_reservations')"
        :value="totalReservations ?? 0"
        icon="calendar"
      />
      <AdminStatCard
        :label="t('admin.stat_pending')"
        :value="pendingCount ?? 0"
        icon="clock"
        color="amber"
      />
      <AdminStatCard
        :label="t('admin.stat_clients')"
        :value="totalClients ?? 0"
        icon="users"
      />
      <AdminStatCard
        :label="t('admin.stat_riads')"
        :value="2"
        icon="home"
        color="olive"
      />
    </div>

    <!-- Toggle réservations en ligne -->
    <div class="card p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold text-stone-800">{{ t("admin.booking_toggle_title") }}</h2>
          <p class="text-sm text-stone-500 mt-0.5">{{ t("admin.booking_toggle_description") }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium" :class="bookingEnabled ? 'text-emerald-600' : 'text-red-500'">
            {{ bookingToggleSaving ? t("admin.booking_toggle_saving") : bookingEnabled ? t("admin.booking_toggle_on") : t("admin.booking_toggle_off") }}
          </span>
          <button
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="bookingEnabled ? 'bg-emerald-500' : 'bg-stone-300'"
            :disabled="bookingToggleSaving"
            @click="toggleBooking"
          >
            <span
              class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200"
              :class="bookingEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Dernières réservations -->
    <div class="card p-6">
      <h2 class="font-semibold text-stone-700 mb-4">
        {{ t("admin.recent_reservations") }}
      </h2>
      <AdminReservationsTable :limit="5" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const supabase = useSupabaseClient();
const { t } = useI18n();
const { fetchBookingEnabled, setBookingEnabled } = useSiteSettings();

const [
  { count: totalReservations },
  { count: pendingCount },
  { count: totalClients },
  initialBookingEnabled,
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
  fetchBookingEnabled(),
]);

const bookingEnabled = ref(initialBookingEnabled);
const bookingToggleSaving = ref(false);

const toggleBooking = async () => {
  bookingToggleSaving.value = true;
  const next = !bookingEnabled.value;
  const { error } = await setBookingEnabled(next);
  if (!error) bookingEnabled.value = next;
  bookingToggleSaving.value = false;
};

useSeoMeta({ title: t("admin.seo_title") });
</script>
