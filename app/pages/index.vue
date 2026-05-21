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
      <div class="grid grid-cols-2 gap-6">
        <img
          :src="homePresentation1"
          alt="Dar Baraï"
          class="w-full aspect-[5/3] object-cover rounded-2xl"
        />
        <img
          :src="homePresentation2"
          alt="Dar Baraï"
          class="w-full aspect-[5/3] object-cover rounded-2xl mt-10"
        />
      </div>
    </div>
  </section>

  <!-- Ce que vous allez aimer -->
  <section class="py-20 bg-stone-50 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-14">
        <p
          class="text-terracotta-400 text-xs font-semibold uppercase tracking-widest mb-3"
        >
          {{ t("home.highlights_eyebrow") }}
        </p>
        <h2 class="section-title">{{ t("home.highlights_title") }}</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="card in highlights"
          :key="card.key"
          class="group flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1"
          @click="card.action()"
        >
          <!-- Image (si disponible) -->
          <div
            v-if="card.image"
            class="relative aspect-square shrink-0 overflow-hidden w-4/5 mx-auto"
          >
            <img
              :src="card.image"
              :alt="card.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <!-- Contenu avec image : icône + titre centrés sous l'image -->
          <div v-if="card.image" class="flex flex-col items-center text-center px-4 pb-5 pt-3">
            <div class="flex items-center justify-center gap-2 mb-2">
              <div
                class="w-9 h-9 rounded-full bg-terracotta-50 flex items-center justify-center group-hover:bg-terracotta-100 transition-colors duration-300 shrink-0"
              >
                <svg viewBox="0 0 24 24" class="w-5 h-5 text-terracotta-600">
                  <path fill="currentColor" :d="card.icon" />
                </svg>
              </div>
              <h3 class="font-serif text-base md:text-lg text-stone-800 leading-snug">
                {{ card.title }}
              </h3>
            </div>
            <p class="text-sm text-stone-500 leading-relaxed">
              {{ card.desc }}
            </p>
          </div>

          <!-- Contenu sans image : icône centrée au-dessus -->
          <div v-else class="flex flex-col items-center text-center px-5 pb-6 pt-4">
            <div
              class="w-14 h-14 rounded-full bg-terracotta-50 flex items-center justify-center group-hover:bg-terracotta-100 transition-colors duration-300 shrink-0 mb-5 mt-2"
            >
              <svg viewBox="0 0 24 24" class="w-7 h-7 text-terracotta-600">
                <path fill="currentColor" :d="card.icon" />
              </svg>
            </div>
            <h3 class="font-serif text-base md:text-lg text-stone-800 mb-2">
              {{ card.title }}
            </h3>
            <p class="text-sm text-stone-500 leading-relaxed">
              {{ card.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Parallax -->
  <div
    class="relative h-[420px] bg-cover bg-center flex items-center justify-center"
    :style="{
      backgroundImage: `url('${homeBg1}')`,
      backgroundAttachment: 'fixed',
    }"
  >
    <div class="absolute inset-0 bg-black/40" />
    <div class="relative z-10 text-center px-4">
      <p class="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">
        {{ t("home.parallax_eyebrow") }}
      </p>
      <h2 class="font-serif text-3xl md:text-5xl text-white leading-snug whitespace-pre-line">
        {{ t("home.parallax_text") }}
      </h2>
    </div>
  </div>

  <!-- Nos riads -->
  <section class="py-20 px-4 max-w-7xl mx-auto">
    <h2 class="section-title text-center mb-4">
      {{ t("home.riads_section_title") }}
    </h2>
    <p class="text-center text-stone-500 text-lg max-w-2xl mx-auto mb-2">
      {{ t("home.riads_section_subtitle") }}
    </p>
    <p class="text-center text-stone-400 text-sm max-w-xl mx-auto mb-16 italic">
      {{ t("home.riads_section_note") }}
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
  <section id="localisation" class="py-20 px-4 max-w-6xl mx-auto">
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

  <!-- Parallax avis -->
  <div
    class="relative bg-cover bg-center flex items-center justify-center py-28"
    :style="{
      backgroundImage: `url('${homeBg2}')`,
      backgroundAttachment: 'fixed',
    }"
  >
    <div class="absolute inset-0 bg-black/55" />
    <div class="relative z-10 text-center px-4 w-full max-w-3xl mx-auto">
      <p class="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
        {{ t("home.trust_eyebrow") }}
      </p>
      <h2 class="font-serif text-3xl md:text-4xl text-white mb-10 whitespace-pre-line leading-snug">
        {{ t("home.trust_title") }}
      </h2>

      <div class="flex justify-center gap-6 flex-wrap">
        <!-- Airbnb -->
        <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-white w-44">
          <p class="text-white/50 text-xs uppercase tracking-widest mb-2">Airbnb</p>
          <p class="font-serif text-2xl font-light mb-1">5,0 <span class="text-lg">/ 5</span></p>
          <p class="text-amber-400 text-xs mb-2">★★★★★</p>
          <p class="text-white/70 text-xs">{{ t("home.trust_airbnb_reviews") }}</p>
          <p class="text-white/50 text-xs mt-1 italic">{{ t("home.trust_airbnb_badge") }}</p>
        </div>

        <!-- Booking -->
        <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-white w-44">
          <p class="text-white/50 text-xs uppercase tracking-widest mb-2">Booking.com</p>
          <p class="font-serif text-2xl font-light mb-1">9,7 <span class="text-lg">/ 10</span></p>
          <p class="text-white/70 text-xs mb-1">{{ t("home.trust_booking_reviews") }}</p>
          <p class="text-white/50 text-xs mt-1 italic">{{ t("home.trust_booking_label") }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- FAQ -->
  <section v-if="faqCategories.length > 0" class="py-20 px-4 bg-white">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-14">
        <p class="text-terracotta-400 text-xs font-semibold uppercase tracking-widest mb-3">
          {{ t("faq.eyebrow") }}
        </p>
        <h2 class="section-title">{{ t("faq.title") }}</h2>
      </div>

      <div
        v-for="(cat, ci) in faqCategories"
        :key="cat.key"
        :class="ci > 0 ? 'mt-10 pt-10 border-t border-stone-200' : ''"
      >
        <h3 class="font-serif text-xl text-stone-800 mb-6">{{ cat.title }}</h3>

        <div
          v-for="item in cat.items"
          :key="item.key"
          class="border-b border-stone-100 last:border-0"
        >
          <button
            class="w-full flex items-center justify-between gap-4 py-4 text-left group"
            @click="toggleFaq(item.key)"
          >
            <span
              class="font-medium text-stone-800 group-hover:text-terracotta-600 transition-colors"
            >
              {{ item.q }}
            </span>
            <span
              class="shrink-0 w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 group-hover:border-terracotta-400 group-hover:text-terracotta-500 transition-all text-sm"
            >
              {{ faqOpen[item.key] ? "−" : "+" }}
            </span>
          </button>

          <div class="faq-answer" :class="{ open: faqOpen[item.key] }">
            <div>
              <p class="text-stone-500 leading-relaxed pb-4 pr-10">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiPlus,
  mdiMapMarker,
  mdiBed,
  mdiWeatherSunny,
  mdiHandshake,
  mdiSilverwareForkKnife,
  mdiCompass,
  mdiCoffee,
  mdiCity,
} from "@mdi/js";

const cardImages = import.meta.glob<{ default: string }>(
  "../assets/images/home_card/*.{jpg,jpeg,png,webp}",
  { eager: true }
);

function getCardImage(key: string): string | undefined {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const path = `../assets/images/home_card/${key}${ext}`;
    if (cardImages[path]) return cardImages[path].default;
  }
  return undefined;
}
import heroBg from "~/assets/images/home_bg.jpg";
import homeBg1 from "~/assets/images/home_bg_1.jpg";
import homeBg2 from "~/assets/images/home_bg_2.jpg";
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

const highlights = computed(() => [
  {
    key: "location",
    icon: mdiMapMarker,
    image: getCardImage("location"),
    title: t("home.hl_location_title"),
    desc: t("home.hl_location_desc"),
    action: () => {
      if (import.meta.client)
        document
          .getElementById("localisation")
          ?.scrollIntoView({ behavior: "smooth" });
    },
  },
  {
    key: "rooms",
    icon: mdiBed,
    image: getCardImage("rooms"),
    title: t("home.hl_rooms_title"),
    desc: t("home.hl_rooms_desc"),
    action: () => navigateTo(localePath("/riads")),
  },
  {
    key: "rooftop",
    icon: mdiWeatherSunny,
    image: getCardImage("rooftop"),
    title: t("home.hl_rooftop_title"),
    desc: t("home.hl_rooftop_desc"),
    action: () => navigateTo(localePath("/riads")),
  },
  {
    key: "service",
    icon: mdiHandshake,
    image: getCardImage("service"),
    title: t("home.hl_service_title"),
    desc: t("home.hl_service_desc"),
    action: () => navigateTo(localePath("/riads")),
  },
  {
    key: "meals",
    icon: mdiSilverwareForkKnife,
    image: getCardImage("meals"),
    title: t("home.hl_meals_title"),
    desc: t("home.hl_meals_desc"),
    action: () => navigateTo(localePath("/riads")),
  },
  {
    key: "activities",
    icon: mdiCompass,
    image: getCardImage("activities"),
    title: t("home.hl_activities_title"),
    desc: t("home.hl_activities_desc"),
    action: () => navigateTo(localePath("/services")),
  },
  {
    key: "breakfast",
    icon: mdiCoffee,
    image: getCardImage("breakfast"),
    title: t("home.hl_breakfast_title"),
    desc: t("home.hl_breakfast_desc"),
    action: () => navigateTo(localePath("/riads") + "#petit-dejeuner"),
  },
  {
    key: "visits",
    icon: mdiCity,
    image: getCardImage("visits"),
    title: t("home.hl_visits_title"),
    desc: t("home.hl_visits_desc"),
    action: () => navigateTo(localePath("/services")),
  },
]);

const faqOpen = ref<Record<string, boolean>>({});
function toggleFaq(key: string) {
  faqOpen.value[key] = !faqOpen.value[key];
}
const { fetchFaq } = useFaq();
const { data: faqRawData } = await useAsyncData("faq-home", () => fetchFaq(true));
const faqCategories = computed(() =>
  (faqRawData.value ?? [])
    .filter((cat) => (cat.items?.length ?? 0) > 0)
    .map((cat) => ({
      key: cat.id,
      title: locale.value === "en" ? cat.name_en : cat.name_fr,
      items: (cat.items ?? []).map((item) => ({
        key: item.id,
        q: locale.value === "en" ? item.question_en : item.question_fr,
        a: locale.value === "en" ? item.answer_en : item.answer_fr,
      })),
    }))
);

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

<style scoped>
.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.faq-answer.open {
  grid-template-rows: 1fr;
}
.faq-answer > div {
  overflow: hidden;
}
</style>
