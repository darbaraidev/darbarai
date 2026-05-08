<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const { profile } = useAuth();
const { fetchMyReservations } = useBooking();
const { t } = useI18n();

const reservations = ref(await fetchMyReservations());

const tabs = [
  { id: "reservations", label: t("account.my_reservations") },
  { id: "profile", label: t("account.profile") },
];
const activeTab = ref("reservations");

useSeoMeta({ title: "Mon espace – Dar Baraï" });
</script>

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

    <!-- Reservations -->
    <div v-if="activeTab === 'reservations'">
      <div
        v-if="reservations.length === 0"
        class="text-stone-400 text-center py-12"
      >
        {{ t("account.no_reservations") }}
      </div>
      <div v-else class="space-y-4">
        <ReservationCard
          v-for="res in reservations"
          :key="res.id"
          :reservation="res"
        />
      </div>
    </div>

    <!-- Profile -->
    <div v-if="activeTab === 'profile'">
      <AccountProfileForm :profile="profile" />
    </div>
  </div>
</template>
