<template>
  <!-- Hero -->
  <section
    class="relative h-screen min-h-[600px] flex items-center justify-center text-white"
  >
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{
        backgroundImage: `url('${heroBg}')`,
        backgroundAttachment: 'fixed',
      }"
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

  <!-- Brand -->
  <section class="py-24 px-4 bg-stone-900 text-white">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <!-- Texte -->
      <div>
        <p
          class="text-terracotta-400 text-xs font-semibold uppercase tracking-widest mb-4"
        >
          {{ t("home.brand_eyebrow") }}
        </p>
        <h2 class="font-serif text-4xl md:text-5xl mb-10 leading-snug">
          {{ t("home.brand_title") }}
        </h2>
        <div class="space-y-6 text-stone-300 text-lg leading-relaxed">
          <p>{{ t("home.brand_p1") }}</p>
          <p>{{ t("home.brand_p2") }}</p>
          <p>{{ t("home.brand_p3") }}</p>
        </div>
      </div>

      <!-- Photos -->
      <div class="grid grid-cols-2 gap-6 h-[520px]">
        <img
          :src="homePresentation1"
          alt="Dar Baraï"
          class="w-full h-full object-cover rounded-2xl"
        />
        <img
          :src="homePresentation2"
          alt="Dar Baraï"
          class="w-full h-full object-cover rounded-2xl mt-12"
        />
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

  <!-- Services -->
  <section class="relative py-20">
    <!-- Fond terracotta pleine largeur couvrant titre + moitié supérieure des images -->
    <div class="absolute inset-x-0 top-0 bg-terracotta-100 h-[540px]" />

    <div class="relative z-10">
      <div class="text-center mb-16 py-10 px-4">
        <h2 class="section-title mb-3 text-stone-800">
          {{ t("home.services_section_title") }}
        </h2>
        <p class="text-stone-500 text-lg">
          {{ t("home.services_section_subtitle") }}
        </p>
        <p class="text-stone-600 text-base mt-4 max-w-3xl mx-auto">
          {{ t("home.services_description") }}
        </p>
      </div>
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(card, i) in serviceCards"
            :key="card.key"
            class="flex flex-col group"
            :class="i === 1 ? 'md:mt-16' : ''"
            @mouseenter="hoveredService = i"
            @mouseleave="hoveredService = null"
          >
            <!-- Image portrait -->
            <div
              class="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-stone-100"
            >
              <img
                :src="card.photo"
                :alt="card.title"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <!-- Texte -->
            <h3 class="font-serif text-2xl text-stone-800 mb-3 text-center">
              {{ card.title }}
            </h3>
            <p class="text-stone-500 leading-relaxed text-center">
              {{ card.description }}
            </p>

            <!-- Animation -->
            <ClientOnly v-if="card.lottie">
              <LottieIcon
                :animation-data="card.lottie"
                :playing="hoveredService === i"
                class="w-20 h-20 mx-auto"
              />
            </ClientOnly>
            <img
              v-else-if="card.image"
              :src="card.image"
              :alt="card.title"
              class="w-20 h-20 mx-auto mt-4 object-contain"
            />
          </div>
        </div>

        <div class="text-center mt-5">
          <NuxtLink
            :to="localePath('/services')"
            class="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" :d="mdiPlus" />
            </svg>
            {{ t("home.services_cta") }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <!-- Localisation -->
  <section class="py-20 px-4 max-w-6xl mx-auto">
    <h2 class="section-title text-center mb-3">
      {{ t("home.location_title") }}
    </h2>
    <p class="text-center text-stone-500 mb-10">
      {{ t("home.location_subtitle") }}
    </p>
    <div class="grid md:grid-cols-[2fr_3fr] gap-6 items-start">
      <ClientOnly>
        <div class="h-[420px] rounded-2xl overflow-hidden shadow-lg isolate">
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

      <!-- Image entrees -->
      <img
        :src="locale === 'fr' ? locationImageFr : locationImageEn"
        :alt="t('home.location_title')"
        class="w-full h-auto rounded-2xl shadow-lg"
      />
    </div>
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
import { mdiPlus } from "@mdi/js";
import heroBg from "~/assets/images/home_bg.jpg";
import homePresentation1 from "~/assets/images/home_presentation_1.jpg";
import homePresentation2 from "~/assets/images/home_presentation_2.jpg";
import locationImageFr from "~/assets/images/entrees.jpg";
import locationImageEn from "~/assets/images/entrances.jpg";
import serviceHammam from "~/assets/images/service_hammam.jpg";
import serviceExcursions from "~/assets/images/service_excursions.jpg";
import serviceVisites from "~/assets/images/service_visites.jpg";
import animMassage from "~/assets/animations/massage.json";
import animExcursion from "~/assets/animations/excursion-desert.json";
import imgMontgolfiere from "~/assets/animations/montgolfiere.png";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const { riads, fetchRiads } = useRiad();
const hoveredService = ref<number | null>(null);

await useAsyncData("riads-home", () => fetchRiads());

const serviceCards = computed(() => [
  {
    key: "hammam",
    photo: serviceHammam,
    title: t("home.service_hammam_title"),
    description: t("home.service_hammam_desc"),
    lottie: animMassage,
    image: null,
  },
  {
    key: "excursions",
    photo: serviceExcursions,
    title: t("home.service_excursions_title"),
    description: t("home.service_excursions_desc"),
    lottie: animExcursion,
    image: null,
  },
  {
    key: "visites",
    photo: serviceVisites,
    title: t("home.service_visites_title"),
    description: t("home.service_visites_desc"),
    lottie: null,
    image: imgMontgolfiere,
  },
]);

useSeoMeta({
  title: t("seo.home_title"),
  description: t("seo.home_description"),
});
</script>
