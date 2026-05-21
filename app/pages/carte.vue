<template>
  <div class="min-h-screen">
    <template v-if="mounted">
    <!-- Access gate -->
    <div v-if="!hasAccess" class="min-h-screen flex items-center justify-center p-4 bg-sand-50 pt-16">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <div class="text-center mb-6">
          <div class="text-5xl mb-3">🗺️</div>
          <h1 class="font-serif text-2xl text-stone-800">{{ t("carte.gate_title") }}</h1>
          <p class="text-stone-500 text-sm mt-2 leading-relaxed">{{ t("carte.gate_subtitle") }}</p>
        </div>
        <form @submit.prevent="unlock">
          <input
            v-model="password"
            type="password"
            :placeholder="t('carte.gate_placeholder')"
            class="input w-full mb-3"
            autofocus
          />
          <button type="submit" class="btn-primary w-full" :disabled="unlocking">
            {{ unlocking ? t("common.loading") : t("carte.gate_submit") }}
          </button>
          <p v-if="accessError" class="text-red-500 text-sm text-center mt-3">{{ accessError }}</p>
        </form>
      </div>
    </div>

    <!-- Map view -->
    <div v-else class="flex pt-16 overflow-hidden" style="height:100dvh">

      <!-- LEFT sidebar: filtres -->
      <div class="w-52 shrink-0 bg-white border-r border-stone-200 flex-col overflow-y-auto hidden md:flex">
        <div class="px-3 py-4 space-y-0.5">
          <p class="font-serif text-stone-700 px-3 pb-3 text-sm">{{ t("carte.title") }}</p>

          <!-- Tout afficher -->
          <button
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
            :class="selectedGroup === null ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'"
            @click="selectedGroup = null; selectedCategory = null"
          >
            <span>{{ t("carte.filter_all") }}</span>
            <span class="text-xs opacity-60">{{ allPlaces.length }}</span>
          </button>

          <!-- Prix -->
          <div class="pt-3 pb-1">
            <p class="text-xs font-semibold text-stone-400 uppercase tracking-wide px-3 mb-1.5">{{ t("carte.filter_price") }}</p>
            <div class="flex gap-1 px-1">
              <button
                v-for="level in priceLevels"
                :key="level"
                class="flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                :class="selectedPriceLevel === level
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'"
                @click="selectedPriceLevel = selectedPriceLevel === level ? null : level"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <div class="border-t border-stone-100 pt-2 mt-1" />

          <!-- Groupes + sous-catégories toujours visibles -->
          <template v-for="group in MAP_CATEGORY_GROUPS" :key="group.slug">
            <!-- En-tête de groupe -->
            <button
              class="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-1.5 mt-2"
              :class="selectedGroup === group.slug && !selectedCategory ? 'text-white' : 'text-stone-400 hover:bg-stone-100'"
              :style="selectedGroup === group.slug && !selectedCategory ? `background:${group.color}` : ''"
              @click="toggleGroup(group.slug)"
            >
              <span>{{ group.icon }}</span>
              <span class="flex-1 truncate">{{ locale === "fr" ? group.labelFr : group.labelEn }}</span>
              <span class="opacity-60 font-normal normal-case tracking-normal">{{ countByGroup(group.slug) }}</span>
            </button>

            <!-- Sous-catégories toujours affichées -->
            <button
              v-for="cat in group.categories"
              :key="cat.slug"
              class="w-full text-left pl-5 pr-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              :class="selectedCategory === cat.slug ? 'text-white' : 'text-stone-500 hover:bg-stone-100'"
              :style="selectedCategory === cat.slug ? `background:${group.color}` : ''"
              @click="selectCategory(cat.slug, group.slug)"
            >
              <span class="shrink-0">{{ cat.icon }}</span>
              <span class="flex-1">{{ locale === "fr" ? cat.labelFr : cat.labelEn }}</span>
              <span class="opacity-60">{{ countByCategory(cat.slug) }}</span>
            </button>
          </template>
        </div>
      </div>

      <!-- MAP -->
      <div class="flex-1 relative overflow-hidden">
        <ClientOnly>
          <PlacesMap
            :places="filteredPlaces"
            :selected-id="selectedPlaceId"
            class="w-full h-full"
            @select="selectPlace"
            @map-click="selectedPlaceId = null"
          />
        </ClientOnly>

        <!-- Bouton filtres mobile -->
        <button
          class="absolute top-3 left-3 md:hidden z-10 bg-white shadow-md rounded-full px-3 py-2 text-sm font-medium flex items-center gap-1.5 text-stone-700"
          @click="mobileFiltersOpen = true"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
          </svg>
          {{ t("carte.filters") }}
          <span v-if="selectedGroup" class="bg-terracotta-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
        </button>

        <!-- Bouton liste mobile -->
        <button
          class="absolute bottom-5 left-1/2 -translate-x-1/2 md:hidden z-10 bg-white shadow-lg rounded-full px-5 py-2.5 text-sm font-medium text-stone-700 flex items-center gap-2"
          @click="mobileListOpen = true"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {{ filteredPlaces.length }} {{ t("carte.places_count") }}
        </button>
      </div>

      <!-- RIGHT sidebar: détail d'une adresse -->
      <Transition
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="selectedPlace"
          class="w-80 shrink-0 bg-white border-l border-stone-200 overflow-y-auto hidden md:flex flex-col"
        >
          <!-- Photo principale -->
          <div class="relative shrink-0">
            <button
              v-if="selectedPlace.photo_main"
              class="w-full block group"
              @click="openLightbox(selectedPlace, -1)"
            >
              <img :src="selectedPlace.photo_main" class="w-full h-52 object-cover transition-opacity group-hover:opacity-90" />
            </button>
            <div v-else class="w-full h-20 bg-stone-100 flex items-center justify-center text-3xl">
              {{ getCategoryEmoji(selectedPlace.categories[0] ?? "") }}
            </div>
            <button
              class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow text-stone-500 hover:text-stone-800 transition-colors"
              @click="selectedPlaceId = null"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4 flex-1">
            <!-- En-tête -->
            <div class="flex items-start justify-between gap-2 mb-1">
              <h2 class="font-serif text-lg text-stone-800 leading-snug">{{ selectedPlace.name }}</h2>
              <span v-if="selectedPlace.price_level" class="text-stone-400 text-sm shrink-0 mt-1">{{ selectedPlace.price_level }}</span>
            </div>

            <!-- Catégories -->
            <div class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="cat in selectedPlace.categories"
                :key="cat"
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :style="`background:${getGroupColor(cat)}1a;color:${getGroupColor(cat)}`"
              >
                {{ getCategoryLabel(cat) }}
              </span>
            </div>

            <!-- Description -->
            <p v-if="selectedPlace.description" class="text-stone-600 text-sm leading-relaxed mb-3">
              {{ selectedPlace.description }}
            </p>

            <!-- Adresse -->
            <p v-if="selectedPlace.address" class="text-stone-400 text-xs mb-4 flex items-start gap-1.5">
              <svg class="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ selectedPlace.address }}
            </p>

            <!-- Liens -->
            <div class="flex gap-3 mb-4">
              <a
                v-if="selectedPlace.maps_url"
                :href="selectedPlace.maps_url"
                target="_blank"
                class="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-terracotta-600 hover:bg-terracotta-700 rounded-lg px-3 py-2 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Maps
              </a>
              <a
                v-if="selectedPlace.website_url"
                :href="selectedPlace.website_url"
                target="_blank"
                class="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 rounded-lg px-3 py-2 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
                {{ t("carte.website") }}
              </a>
            </div>

            <!-- Points forts -->
            <div v-if="selectedPlace.highlights.length" class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="slug in selectedPlace.highlights"
                :key="slug"
                class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium"
              >
                <span>{{ getHighlightMeta(slug)?.icon }}</span>
                <span>{{ locale === "fr" ? getHighlightMeta(slug)?.labelFr : getHighlightMeta(slug)?.labelEn }}</span>
              </span>
            </div>

            <!-- Photos secondaires -->
            <div v-if="selectedPlace.photos.length" class="grid grid-cols-2 gap-2">
              <button
                v-for="(img, i) in selectedPlace.photos"
                :key="i"
                class="relative group overflow-hidden rounded-lg aspect-square"
                @click="openLightbox(selectedPlace, i)"
              >
                <img :src="img" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    </template>

    <!-- Mobile: drawer filtres -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div v-if="mobileFiltersOpen" class="fixed inset-0 z-[200] flex flex-col md:hidden">
          <div class="flex-1 bg-black/40" @click="mobileFiltersOpen = false" />
          <div class="bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between px-4 py-3 border-b border-stone-100 sticky top-0 bg-white">
              <p class="font-medium text-stone-800">{{ t("carte.filters") }}</p>
              <button class="text-stone-400" @click="mobileFiltersOpen = false">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-4 space-y-1">
              <!-- Prix -->
              <div class="pb-3">
                <p class="text-xs font-semibold text-stone-400 uppercase tracking-wide px-3 mb-2">{{ t("carte.filter_price") }}</p>
                <div class="flex gap-1.5 px-1">
                  <button
                    v-for="level in priceLevels"
                    :key="level"
                    class="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                    :class="selectedPriceLevel === level
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-100'"
                    @click="selectedPriceLevel = selectedPriceLevel === level ? null : level"
                  >
                    {{ level }}
                  </button>
                </div>
              </div>
              <div class="border-t border-stone-100 pb-1" />
              <button
                class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
                :class="selectedGroup === null ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'"
                @click="selectedGroup = null; selectedCategory = null; mobileFiltersOpen = false"
              >
                <span>{{ t("carte.filter_all") }}</span>
                <span class="text-xs opacity-60">{{ allPlaces.length }}</span>
              </button>
              <template v-for="group in MAP_CATEGORY_GROUPS" :key="group.slug">
                <button
                  class="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-1.5 mt-2"
                  :class="selectedGroup === group.slug && !selectedCategory ? 'text-white' : 'text-stone-400 hover:bg-stone-100'"
                  :style="selectedGroup === group.slug && !selectedCategory ? `background:${group.color}` : ''"
                  @click="toggleGroup(group.slug)"
                >
                  <span>{{ group.icon }}</span>
                  <span class="flex-1">{{ locale === "fr" ? group.labelFr : group.labelEn }}</span>
                  <span class="opacity-60 font-normal normal-case tracking-normal">{{ countByGroup(group.slug) }}</span>
                </button>
                <button
                  v-for="cat in group.categories"
                  :key="cat.slug"
                  class="w-full text-left pl-6 pr-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  :class="selectedCategory === cat.slug ? 'text-white' : 'text-stone-500 hover:bg-stone-100'"
                  :style="selectedCategory === cat.slug ? `background:${group.color}` : ''"
                  @click="() => { selectCategory(cat.slug, group.slug); mobileFiltersOpen = false; }"
                >
                  <span class="shrink-0">{{ cat.icon }}</span>
                  <span class="flex-1">{{ locale === "fr" ? cat.labelFr : cat.labelEn }}</span>
                  <span class="opacity-60">{{ countByCategory(cat.slug) }}</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Mobile: drawer liste -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div v-if="mobileListOpen" class="fixed inset-0 z-[200] flex flex-col md:hidden">
          <div class="flex-1 bg-black/40" @click="mobileListOpen = false" />
          <div class="bg-white rounded-t-2xl max-h-[75vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between px-4 py-3 border-b border-stone-100 sticky top-0 bg-white">
              <p class="font-medium text-stone-800 text-sm">{{ filteredPlaces.length }} {{ t("carte.places_count") }}</p>
              <button class="text-stone-400" @click="mobileListOpen = false">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="divide-y divide-stone-100">
              <div
                v-for="place in filteredPlaces"
                :key="place.id"
                class="p-4 flex items-center gap-3"
                @click="() => { selectPlace(place); mobileListOpen = false; }"
              >
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center text-xl">
                  <img v-if="place.photo_main" :src="place.photo_main" class="w-full h-full object-cover" />
                  <span v-else>{{ getCategoryEmoji(place.categories[0] ?? "") }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-stone-800 text-sm truncate">{{ place.name }}</p>
                  <p v-if="place.description" class="text-stone-500 text-xs truncate">{{ place.description }}</p>
                </div>
                <span v-if="place.price_level" class="text-xs text-stone-400 shrink-0">{{ place.price_level }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Mobile: detail bottom sheet -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div v-if="selectedPlace" class="fixed inset-x-0 bottom-0 z-[150] md:hidden bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
          <div class="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <p class="font-semibold text-stone-800 text-sm">{{ selectedPlace.name }}</p>
            <button class="text-stone-400" @click="selectedPlaceId = null">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <img v-if="selectedPlace.photo_main" :src="selectedPlace.photo_main" class="w-full h-40 object-cover rounded-xl mb-3" />
            <p v-if="selectedPlace.description" class="text-stone-600 text-sm mb-2">{{ selectedPlace.description }}</p>
            <p v-if="selectedPlace.address" class="text-stone-400 text-xs mb-3">{{ selectedPlace.address }}</p>
            <div class="flex gap-2 mb-3">
              <a v-if="selectedPlace.maps_url" :href="selectedPlace.maps_url" target="_blank" class="flex-1 text-center text-sm font-medium text-white bg-terracotta-600 rounded-lg px-3 py-2">Maps</a>
              <a v-if="selectedPlace.website_url" :href="selectedPlace.website_url" target="_blank" class="flex-1 text-center text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2">{{ t("carte.website") }}</a>
            </div>
          </div>
        </div>
      </Transition>
      <!-- Lightbox -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center"
          @click.self="closeLightbox"
        >
          <!-- Close -->
          <button
            class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            @click="closeLightbox"
          >
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Prev -->
          <button
            v-if="lightboxImages.length > 1"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 bg-black/30 hover:bg-black/50 rounded-full p-2"
            @click="lightboxPrev"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Image -->
          <img
            :src="lightboxImages[lightboxIndex]"
            class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
          />

          <!-- Next -->
          <button
            v-if="lightboxImages.length > 1"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 bg-black/30 hover:bg-black/50 rounded-full p-2"
            @click="lightboxNext"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Counter -->
          <div v-if="lightboxImages.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {{ lightboxIndex + 1 }} / {{ lightboxImages.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Place } from "~/types";
import { MAP_CATEGORY_GROUPS, getCategoryMeta, getGroupColor } from "~/utils/mapCategories";
import { PLACE_HIGHLIGHTS, getHighlightMeta } from "~/utils/placeHighlights";

definePageMeta({ layout: "default" });

const { t, locale } = useI18n();
const supabase = useSupabaseClient();

// --- Access gate ---
const mounted = ref(false);
const hasAccess = ref(false);
const password = ref("");
const unlocking = ref(false);
const accessError = ref<string | null>(null);

onMounted(() => {
  mounted.value = true;
  if (sessionStorage.getItem("map_access") === "1") {
    hasAccess.value = true;
    loadPlaces();
  }
});

const unlock = async () => {
  if (!password.value.trim()) return;
  unlocking.value = true;
  accessError.value = null;
  try {
    const res = await $fetch<{ valid: boolean }>("/api/map/validate-access", {
      method: "POST",
      body: { password: password.value.trim() },
    });
    if (res.valid) {
      sessionStorage.setItem("map_access", "1");
      hasAccess.value = true;
      await loadPlaces();
    } else {
      accessError.value = t("carte.gate_error");
    }
  } catch {
    accessError.value = t("carte.gate_error");
  } finally {
    unlocking.value = false;
  }
};

// --- Places ---
const allPlaces = ref<Place[]>([]);
const loadPlaces = async () => {
  const { data } = await (supabase as any)
    .from("places")
    .select("*")
    .eq("active", true)
    .order("name");
  allPlaces.value = (data ?? []) as Place[];
};

// --- Filters ---
const priceLevels = ['€', '€€', '€€€'] as const;
type PriceLevel = typeof priceLevels[number];

const selectedGroup = ref<string | null>(null);
const selectedCategory = ref<string | null>(null);
const selectedPriceLevel = ref<PriceLevel | null>(null);

const toggleGroup = (slug: string) => {
  if (selectedGroup.value === slug && !selectedCategory.value) {
    selectedGroup.value = null;
  } else {
    selectedGroup.value = slug;
    selectedCategory.value = null;
  }
};

const selectCategory = (catSlug: string, groupSlug: string) => {
  if (selectedCategory.value === catSlug) {
    selectedCategory.value = null;
    selectedGroup.value = null;
  } else {
    selectedCategory.value = catSlug;
    selectedGroup.value = groupSlug;
  }
};

const applyFilters = (places: Place[]) => {
  let result = places;
  if (selectedCategory.value) {
    result = result.filter((p) => p.categories.includes(selectedCategory.value!));
  } else if (selectedGroup.value) {
    const groupCats = (MAP_CATEGORY_GROUPS
      .find((g) => g.slug === selectedGroup.value)
      ?.categories.map((c) => c.slug) ?? []) as string[];
    result = result.filter((p) => p.categories.some((c) => groupCats.includes(c)));
  }
  if (selectedPriceLevel.value) {
    result = result.filter((p) => p.price_level === selectedPriceLevel.value);
  }
  return result;
};

const filteredPlaces = computed(() => applyFilters(allPlaces.value));

const countByGroup = (groupSlug: string) => {
  const cats = (MAP_CATEGORY_GROUPS.find((g) => g.slug === groupSlug)?.categories.map((c) => c.slug) ?? []) as string[];
  return applyFilters(allPlaces.value.filter((p) => p.categories.some((c) => cats.includes(c)))).length;
};

const countByCategory = (catSlug: string) =>
  applyFilters(allPlaces.value.filter((p) => p.categories.includes(catSlug))).length;

// --- Selection ---
const selectedPlaceId = ref<string | null>(null);
const selectedPlace = computed(() => allPlaces.value.find((p) => p.id === selectedPlaceId.value) ?? null);

const selectPlace = (place: Place) => {
  selectedPlaceId.value = selectedPlaceId.value === place.id ? null : place.id;
};

// --- Mobile ---
const mobileFiltersOpen = ref(false);
const mobileListOpen = ref(false);

// --- Lightbox ---
const lightboxOpen = ref(false);
const lightboxImages = ref<string[]>([]);
const lightboxIndex = ref(0);

const openLightbox = (place: Place, index: number) => {
  const all: string[] = [];
  if (place.photo_main) all.push(place.photo_main);
  all.push(...place.photos);
  if (!all.length) return;
  // index -1 = main photo (position 0), else offset by 1 if main exists
  if (index === -1) {
    lightboxIndex.value = 0;
  } else {
    lightboxIndex.value = place.photo_main ? index + 1 : index;
  }
  lightboxImages.value = all;
  lightboxOpen.value = true;
};

const closeLightbox = () => { lightboxOpen.value = false; };
const lightboxPrev = () => { lightboxIndex.value = (lightboxIndex.value - 1 + lightboxImages.value.length) % lightboxImages.value.length; };
const lightboxNext = () => { lightboxIndex.value = (lightboxIndex.value + 1) % lightboxImages.value.length; };

const onLightboxKey = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxPrev();
  if (e.key === "ArrowRight") lightboxNext();
};

onMounted(() => { window.addEventListener("keydown", onLightboxKey); });
onUnmounted(() => { window.removeEventListener("keydown", onLightboxKey); });

// --- Helpers ---
const getCategoryLabel = (slug: string) => {
  const meta = getCategoryMeta(slug);
  return meta ? (locale.value === "fr" ? meta.labelFr : meta.labelEn) : slug;
};

const getCategoryEmoji = (slug: string) => getCategoryMeta(slug)?.groupIcon ?? "📍";

useSeoMeta({ title: t("carte.seo_title") });
</script>
