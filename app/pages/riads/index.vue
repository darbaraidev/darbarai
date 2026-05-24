<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 pt-16 pb-12">
      <h1 class="section-title text-center mb-4">{{ t("riads.page_title") }}</h1>
      <p class="text-center text-stone-500">{{ t("riads.page_subtitle") }}</p>
    </div>

    <div class="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto px-4 pb-16">
      <RiadCard v-for="riad in riads" :key="riad.id" :riad="riad" />
    </div>

    <!-- Gouvernante -->
    <div ref="gouvRef" class="reveal-section bg-sand-50 py-12 pl-8 md:pl-20 lg:pl-32 pr-4" :class="{ 'is-visible': gouvVisible }">
      <div class="max-w-4xl flex items-center gap-10">
        <div class="flex-1">
          <h2 class="font-serif text-2xl mb-3 bg-gradient-to-r from-terracotta-700 to-amber-600 bg-clip-text text-transparent">{{ t("riads.gouvernante_title") }}</h2>
          <p class="text-stone-500 leading-relaxed mb-6">{{ t("riads.gouvernante_text") }}</p>
        </div>
        <img
          :src="gouvernantesImg"
          alt="Gouvernantes"
          class="w-48 h-48 object-cover rounded-2xl shrink-0 shadow-md"
        />
      </div>
    </div>

    <!-- Petit-déjeuner -->
    <div id="petit-dejeuner" ref="petitDejRef" class="reveal-section bg-sand-50 py-12 pr-8 md:pr-20 lg:pr-32 pl-4 mt-12" :class="{ 'is-visible': petitDejVisible }">
      <div class="max-w-4xl ml-auto flex items-start gap-10">
        <div class="w-96 shrink-0 grid grid-cols-3 gap-2">
          <img
            v-for="(src, i) in petitDejImages"
            :key="i"
            :src="src"
            :alt="`Petit-déjeuner ${i + 1}`"
            class="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            @click="openBreakfastLightbox(i)"
          />
        </div>
        <div class="flex-1">
          <h2 class="font-serif text-2xl mb-3 bg-gradient-to-r from-terracotta-700 to-amber-600 bg-clip-text text-transparent">{{ t("riads.breakfast_title") }}</h2>
          <p class="text-stone-500 leading-relaxed mb-4">{{ t("riads.breakfast_subtitle") }}</p>
          <p class="text-stone-700 font-medium mb-2">{{ t("riads.breakfast_menu_title") }}</p>
          <ul class="text-stone-500 space-y-1.5 text-sm">
            <li v-for="i in 6" :key="i" class="flex items-start gap-2">
              <span class="text-terracotta-400 shrink-0 mt-0.5">-</span>
              <span>{{ t(`riads.breakfast_menu_${i}`) }}</span>
            </li>
          </ul>
          <p class="text-stone-400 text-xs italic mt-4 leading-relaxed">
            {{ t("riads.breakfast_note") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Repas -->
    <div id="repas" ref="repasRef" class="reveal-section bg-sand-50 py-12 pl-8 md:pl-20 lg:pl-32 pr-4 mt-12 mb-12" :class="{ 'is-visible': repasVisible }">
      <div class="max-w-4xl flex items-start gap-10">
        <div class="flex-1">
          <h2 class="font-serif text-2xl mb-3 bg-gradient-to-r from-terracotta-700 to-amber-600 bg-clip-text text-transparent">{{ t("riads.meals_title") }}</h2>
          <p class="text-stone-500 leading-relaxed mb-6">{{ t("riads.meals_subtitle") }}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-stone-700 font-medium mb-2">{{ t("riads.meals_entrees_title") }}</p>
              <ul class="text-stone-500 space-y-1.5 text-sm">
                <li v-for="i in 10" :key="i" class="flex items-start gap-2">
                  <span class="text-terracotta-400 shrink-0 mt-0.5">-</span>
                  <span>{{ t(`riads.meals_entrees_${i}`) }}</span>
                </li>
              </ul>
            </div>
            <div>
              <p class="text-stone-700 font-medium mb-2">{{ t("riads.meals_plats_title") }}</p>
              <ul class="text-stone-500 space-y-1.5 text-sm">
                <li v-for="i in 6" :key="i" class="flex items-start gap-2">
                  <span class="text-terracotta-400 shrink-0 mt-0.5">-</span>
                  <span>{{ t(`riads.meals_plats_${i}`) }}</span>
                </li>
              </ul>
            </div>
            <div>
              <p class="text-stone-700 font-medium mb-2">{{ t("riads.meals_desserts_title") }}</p>
              <ul class="text-stone-500 space-y-1.5 text-sm">
                <li v-for="i in 5" :key="i" class="flex items-start gap-2">
                  <span class="text-terracotta-400 shrink-0 mt-0.5">-</span>
                  <span>{{ t(`riads.meals_desserts_${i}`) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="repasImages.length" class="w-72 shrink-0 grid grid-cols-3 gap-2">
          <img
            v-for="(src, i) in repasImages"
            :key="i"
            :src="src"
            :alt="`Repas ${i + 1}`"
            class="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            @click="openRepasLightbox(i)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Lightbox photos petit-déjeuner -->
  <Teleport to="body">
    <Transition name="lb-fade">
      <div
        v-if="lbOpen"
        class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        @click.self="lbOpen = false"
      >
        <button
          class="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          @click="lbOpen = false"
        >
          <svg viewBox="0 0 24 24" class="w-7 h-7"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <button
          class="absolute left-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
          :disabled="lbIdx === 0"
          @click="lbIdx--"
        >
          <svg viewBox="0 0 24 24" class="w-8 h-8"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <img
          :src="petitDejImages[lbIdx]"
          :alt="`Petit-déjeuner ${lbIdx + 1}`"
          class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        />
        <button
          class="absolute right-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
          :disabled="lbIdx === petitDejImages.length - 1"
          @click="lbIdx++"
        >
          <svg viewBox="0 0 24 24" class="w-8 h-8"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- Lightbox photos repas -->
  <Teleport to="body">
    <Transition name="lb-fade">
      <div
        v-if="repasLbOpen"
        class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        @click.self="repasLbOpen = false"
      >
        <button
          class="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          @click="repasLbOpen = false"
        >
          <svg viewBox="0 0 24 24" class="w-7 h-7"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <button
          class="absolute left-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
          :disabled="repasLbIdx === 0"
          @click="repasLbIdx--"
        >
          <svg viewBox="0 0 24 24" class="w-8 h-8"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <img
          :src="repasImages[repasLbIdx]"
          :alt="`Repas ${repasLbIdx + 1}`"
          class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        />
        <button
          class="absolute right-4 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
          :disabled="repasLbIdx === repasImages.length - 1"
          @click="repasLbIdx++"
        >
          <svg viewBox="0 0 24 24" class="w-8 h-8"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import gouvernantesImg from "~/assets/images/gouvernantes.jpg";

const petitDejRaw = import.meta.glob<{ default: string }>(
  "../../assets/images/petit_dej/*.{jpg,jpeg,png,webp}",
  { eager: true }
);
const petitDejImages = Object.values(petitDejRaw).map((m) => m.default);

const repasRaw = import.meta.glob<{ default: string }>(
  "../../assets/images/repas/*.{jpg,jpeg,png,webp}",
  { eager: true }
);
const repasImages = Object.values(repasRaw).map((m) => m.default);

const lbOpen = ref(false);
const lbIdx = ref(0);
const repasLbOpen = ref(false);
const repasLbIdx = ref(0);

function openBreakfastLightbox(i: number) {
  lbIdx.value = i;
  lbOpen.value = true;
}

function openRepasLightbox(i: number) {
  repasLbIdx.value = i;
  repasLbOpen.value = true;
}

function handleLbKey(e: KeyboardEvent) {
  if (lbOpen.value) {
    if (e.key === "ArrowRight" && lbIdx.value < petitDejImages.length - 1) lbIdx.value++;
    if (e.key === "ArrowLeft" && lbIdx.value > 0) lbIdx.value--;
    if (e.key === "Escape") lbOpen.value = false;
  } else if (repasLbOpen.value) {
    if (e.key === "ArrowRight" && repasLbIdx.value < repasImages.length - 1) repasLbIdx.value++;
    if (e.key === "ArrowLeft" && repasLbIdx.value > 0) repasLbIdx.value--;
    if (e.key === "Escape") repasLbOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleLbKey);
  const hash = useRoute().hash;
  if (hash) {
    nextTick(() => {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    });
  }
});
onUnmounted(() => window.removeEventListener("keydown", handleLbKey));

const { t } = useI18n();

const { riads, fetchRiads } = useRiad();
await useAsyncData("riads-list", () => fetchRiads());

const gouvRef = ref<HTMLElement | null>(null);
const petitDejRef = ref<HTMLElement | null>(null);
const repasRef = ref<HTMLElement | null>(null);
const gouvVisible = ref(false);
const petitDejVisible = ref(false);
const repasVisible = ref(false);

useIntersectionObserver(gouvRef, ([e]) => { if (e?.isIntersecting) gouvVisible.value = true; }, { threshold: 0.12 });
useIntersectionObserver(petitDejRef, ([e]) => { if (e?.isIntersecting) petitDejVisible.value = true; }, { threshold: 0.12 });
useIntersectionObserver(repasRef, ([e]) => { if (e?.isIntersecting) repasVisible.value = true; }, { threshold: 0.12 });

useSeoMeta({ title: t("seo.riads_title"), description: t("seo.riads_description"), ogTitle: t("seo.riads_title"), ogDescription: t("seo.riads_description") });
</script>

<style scoped>
.reveal-section {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.lb-fade-enter-active,
.lb-fade-leave-active {
  transition: opacity 0.2s ease;
}
.lb-fade-enter-from,
.lb-fade-leave-to {
  opacity: 0;
}
</style>
