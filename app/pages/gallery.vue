<template>
  <div class="min-h-screen pt-24 pb-20">
    <!-- Header -->
    <div class="max-w-7xl mx-auto px-4 text-center mb-12">
      <h1 class="section-title mb-4">{{ t("gallery.title") }}</h1>
      <p class="text-stone-500 text-lg max-w-2xl mx-auto">
        {{ t("gallery.subtitle") }}
      </p>
    </div>

    <!-- Filters -->
    <div class="flex justify-center gap-3 mb-10 px-4 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.value"
        class="px-5 py-2 rounded-full text-sm font-medium transition-colors"
        :class="
          activeFilter === f.value
            ? 'bg-terracotta-600 text-white'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
        "
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Gallery grid -->
    <div class="max-w-7xl mx-auto px-4">
      <p
        v-if="filteredPhotos.length === 0"
        class="text-center text-stone-400 py-20"
      >
        {{ t("gallery.empty") }}
      </p>
      <div v-else class="columns-2 md:columns-3 lg:columns-4 gap-3">
        <div
          v-for="(item, idx) in filteredPhotos"
          :key="item.photo + idx"
          class="break-inside-avoid mb-3 cursor-pointer group relative overflow-hidden rounded-xl"
          @click="openLightbox(idx)"
        >
          <img
            :src="item.photo"
            :alt="`${item.riadName} – ${item.groupLabel}`"
            class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 rounded-xl"
          />
          <div
            class="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span class="text-white text-xs font-semibold drop-shadow-md">
              {{ item.riadName }} · {{ item.groupLabel }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxOpen"
          ref="lightboxEl"
          class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none"
          @click.self="closeLightbox"
        >
          <!-- Close -->
          <button
            class="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            @click="closeLightbox"
          >
            <svg viewBox="0 0 24 24" class="w-7 h-7">
              <path fill="currentColor" :d="mdiClose" />
            </svg>
          </button>

          <!-- Prev -->
          <button
            class="absolute left-2 md:left-6 text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
            :disabled="lightboxIdx === 0"
            @click="prevPhoto"
          >
            <svg viewBox="0 0 24 24" class="w-8 h-8">
              <path fill="currentColor" :d="mdiChevronLeft" />
            </svg>
          </button>

          <!-- Image + caption -->
          <div
            class="px-20 md:px-24 flex flex-col items-center max-w-6xl w-full"
          >
            <Transition name="photo-fade" mode="out-in">
              <img
                :key="lightboxIdx"
                :src="filteredPhotos[lightboxIdx]?.photo"
                :alt="filteredPhotos[lightboxIdx]?.riadName"
                class="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </Transition>
            <p class="text-white/50 text-sm text-center mt-4">
              <span class="text-white/80 font-medium">{{
                filteredPhotos[lightboxIdx]?.riadName
              }}</span>
              <span class="mx-2">·</span>
              {{ filteredPhotos[lightboxIdx]?.groupLabel }}
              <span class="ml-4 text-white/30"
                >{{ lightboxIdx + 1 }} / {{ filteredPhotos.length }}</span
              >
            </p>
          </div>

          <!-- Next -->
          <button
            class="absolute right-2 md:right-6 text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
            :disabled="lightboxIdx === filteredPhotos.length - 1"
            @click="nextPhoto"
          >
            <svg viewBox="0 0 24 24" class="w-8 h-8">
              <path fill="currentColor" :d="mdiChevronRight" />
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { mdiClose, mdiChevronLeft, mdiChevronRight } from "@mdi/js";

const { t, locale } = useI18n();
const { riads, fetchRiads } = useRiad();
await useAsyncData("gallery-riads", () => fetchRiads());

useSeoMeta({ title: t("gallery.seo_title") });

interface FlatPhoto {
  photo: string;
  riadName: string;
  riadSlug: string;
  groupLabel: string;
}

const activeFilter = ref<string>("all");
const lightboxOpen = ref(false);
const lightboxIdx = ref(0);
const lightboxEl = ref<HTMLElement | null>(null);

const allPhotos = computed<FlatPhoto[]>(() => {
  const result: FlatPhoto[] = [];
  for (const riad of riads.value) {
    for (const group of riad.gallery ?? []) {
      const label =
        locale.value === "en" && group.label_en ? group.label_en : group.label;
      for (const photo of group.photos) {
        result.push({
          photo,
          riadName: riad.name,
          riadSlug: riad.slug,
          groupLabel: label,
        });
      }
    }
  }
  return result;
});

const filters = computed(() => [
  { value: "all", label: t("gallery.all") },
  ...riads.value.map((r) => ({ value: r.slug, label: r.name })),
]);

const filteredPhotos = computed<FlatPhoto[]>(() => {
  if (activeFilter.value === "all") return allPhotos.value;
  return allPhotos.value.filter((p) => p.riadSlug === activeFilter.value);
});

watch(activeFilter, () => {
  lightboxOpen.value = false;
});

function openLightbox(idx: number) {
  lightboxIdx.value = idx;
  lightboxOpen.value = true;
  nextTick(() => lightboxEl.value?.focus());
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function prevPhoto() {
  if (lightboxIdx.value > 0) lightboxIdx.value--;
}

function nextPhoto() {
  if (lightboxIdx.value < filteredPhotos.value.length - 1) lightboxIdx.value++;
}

function handleKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return;
  if (e.key === "ArrowRight") nextPhoto();
  if (e.key === "ArrowLeft") prevPhoto();
  if (e.key === "Escape") closeLightbox();
}

onMounted(() => window.addEventListener("keydown", handleKey));
onUnmounted(() => window.removeEventListener("keydown", handleKey));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.photo-fade-enter-active,
.photo-fade-leave-active {
  transition: opacity 0.15s ease;
}
.photo-fade-enter-from,
.photo-fade-leave-to {
  opacity: 0;
}
</style>
