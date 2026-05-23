<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="section-title mb-8">{{ t("account.title") }}</h1>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-stone-200 mb-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="
          activeTab === tab.id
            ? 'border-terracotta-600 text-terracotta-700'
            : 'border-transparent text-stone-500 hover:text-stone-700'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Réservations -->
    <div v-if="activeTab === 'reservations'">
      <div
        v-if="reservations.length === 0"
        class="text-stone-400 text-center py-12"
      >
        {{ t("account.no_reservations") }}
      </div>
      <div v-else class="space-y-4">
        <BookingReservationCard
          v-for="res in reservations"
          :key="res.id"
          :reservation="res"
          @cancelled="onCancelled(res.id)"
        />
      </div>
    </div>

    <!-- Profil -->
    <div v-if="activeTab === 'profile'">
      <UiAccountProfileForm :profile="profile" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const { profile, fetchProfile } = useAuth();
const { fetchMyReservations } = useBooking();
const { t } = useI18n();

const reservations = ref<any[]>([]);
const route = useRoute();
const activeTab = ref((route.query.tab as string) === "reservations" ? "reservations" : "profile");

const tabs = [
  { id: "profile", label: t("account.profile") },
  { id: "reservations", label: t("account.my_reservations") },
];

const onCancelled = (id: string) => {
  reservations.value = reservations.value.filter((r) => r.id !== id);
};

onMounted(async () => {
  await fetchProfile();
  reservations.value = await fetchMyReservations();

  const paidId = route.query.reservation as string | undefined;
  if (route.query.payment === "success" && paidId) {
    const supabase = useSupabaseClient();
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const { data } = await (supabase as any)
        .from("reservations")
        .select("status")
        .eq("id", paidId)
        .single();
      if (data?.status === "confirmed") {
        reservations.value = await fetchMyReservations();
        break;
      }
    }
  }
});

useSeoMeta({ title: t("seo.account_title") });
</script>
