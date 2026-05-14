<template>
  <!-- Hero -->
  <section
    class="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden"
  >
    <img
      src="~/assets/images/home_bg.jpg"
      :alt="t('home.hero_title')"
      class="absolute inset-0 w-full h-full object-cover"
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
        <NuxtLink
          :to="localePath('/riads')"
          class="btn-primary text-lg px-8 py-4 border-white text-white hover:bg-white/10"
        >
          {{ t("home.cta_book") }}
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- Nos riads -->
  <section class="py-20 px-4 max-w-7xl mx-auto">
    <h2 class="section-title text-center mb-4">
      {{ t("home.riads_section_title") }}
    </h2>
    <p class="text-center text-stone-500 text-lg max-w-2xl mx-auto mb-16">
      {{ t("home.riads_section_subtitle") }}
    </p>
    <div class="grid md:grid-cols-2 gap-10">
      <RiadCard v-for="riad in riads" :key="riad.id" :riad="riad" />
    </div>
  </section>

  <!-- Localisation -->
  <section class="py-20 px-4 max-w-7xl mx-auto">
    <h2 class="section-title text-center mb-3">
      {{ t("home.location_title") }}
    </h2>
    <p class="text-center text-stone-500 mb-10">
      {{ t("home.location_subtitle") }}
    </p>
    <ClientOnly>
      <div class="h-[420px] rounded-2xl overflow-hidden shadow-lg">
        <MapView
          :pins="[
            {
              lat: 31.61544777164044,
              lng: -7.989668939966876,
              label: 'Dar Baraï',
              color: '#dc2626',
            },
            {
              lat: 31.615308356540233,
              lng: -7.989629243899648,
              label: 'Dar Tanawi',
              color: '#dc2626',
            },
            {
              lat: 31.625949492067296,
              lng: -7.989045264913319,
              label: 'Jemaa el-Fna',
              color: '#4a7c59',
            },
          ]"
          :center="{ lat: 31.61544777164044, lng: -7.989668939966876 }"
          :zoom="17"
        />
      </div>
      <template #fallback>
        <div class="h-[420px] rounded-2xl bg-sand-100 animate-pulse" />
      </template>
    </ClientOnly>
  </section>

  <!-- Expériences -->
  <section class="py-20 bg-sand-50 px-4">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="section-title mb-4">{{ t("home.experiences_title") }}</h2>
      <p class="text-stone-600 text-lg max-w-2xl mx-auto">
        {{ t("home.experiences_subtitle") }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const { riads, fetchRiads } = useRiad();
await useAsyncData("riads-home", () => fetchRiads());

useSeoMeta({
  title: t("seo.home_title"),
  description: t("seo.home_description"),
});
</script>
