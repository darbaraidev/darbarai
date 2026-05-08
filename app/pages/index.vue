<script setup lang="ts">
const { t } = useI18n();
const { riads, fetchRiads } = useRiad();

await fetchRiads();

useSeoMeta({
  title: "Dar Baraï & Dar Tanawi – Riads à Marrakech",
  description:
    "Réservez votre séjour dans nos deux riads d'exception au cœur de la médina de Marrakech.",
  ogImage: "/images/hero.jpg",
});
</script>

<template>
  <!-- Hero -->
  <section
    class="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden"
  >
    <NuxtImg
      src="/images/hero.jpg"
      alt="Riad Marrakech"
      class="absolute inset-0 w-full h-full object-cover"
      preload
    />
    <div class="absolute inset-0 bg-black/40" />
    <div class="relative z-10 text-center px-4 max-w-3xl mx-auto">
      <h1 class="font-serif text-5xl md:text-7xl mb-6 leading-tight">
        {{ t("home.hero_title") }}
      </h1>
      <p class="text-xl md:text-2xl text-white/90 mb-10 font-light">
        {{ t("home.hero_subtitle") }}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/riads" class="btn-primary text-lg px-8 py-4">
          {{ t("home.cta_discover") }}
        </NuxtLink>
        <NuxtLink
          to="/riads/dar-barai#booking"
          class="btn-secondary text-lg px-8 py-4 border-white text-white hover:bg-white/10"
        >
          {{ t("home.cta_book") }}
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- Nos riads -->
  <section class="py-20 px-4 max-w-7xl mx-auto">
    <h2 class="section-title text-center mb-16">Nos Riads</h2>
    <div class="grid md:grid-cols-2 gap-10">
      <RiadCard v-for="riad in riads" :key="riad.id" :riad="riad" />
    </div>
  </section>

  <!-- Expériences -->
  <section class="py-20 bg-sand-50 px-4">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="section-title mb-4">L'art de vivre marocain</h2>
      <p class="text-stone-600 text-lg max-w-2xl mx-auto">
        Piscine, hammam, petit-déjeuner marocain, excursions — nous prenons soin
        de chaque détail pour un séjour inoubliable.
      </p>
    </div>
  </section>
</template>
