<template>
  <div>
    <!-- Hero -->
    <div class="bg-sand-50 py-20 px-4 text-center">
      <h1 class="section-title mb-4">{{ t("services.page_title") }}</h1>
      <p class="text-stone-500 text-lg max-w-2xl mx-auto">
        {{ t("services.page_subtitle") }}
      </p>
      <p class="text-stone-500 text-sm max-w-xl mx-auto mt-4 border border-stone-300 rounded-xl px-5 py-3">
        {{ t("services.page_description") }}
      </p>
      <p class="text-stone-400 text-sm max-w-xl mx-auto mt-3 italic">
        {{ t("services.page_description_note") }}
      </p>
    </div>

    <!-- Contenu -->
    <div class="py-12">
      <template v-if="servicesByCategory.length">
        <div
          v-for="cat in servicesByCategory"
          :key="cat.category"
class="mb-20"
        >
          <div class="w-full bg-terracotta-100 px-8 py-8 mb-8 text-center">
            <h2 class="font-serif text-3xl text-terracotta-800 mb-1">{{ cat.name }}</h2>
            <p v-if="cat.description" class="text-terracotta-700 text-base max-w-xl mx-auto">{{ cat.description }}</p>
          </div>
          <div class="max-w-7xl mx-auto px-4">
          <div class="flex flex-wrap justify-center gap-5">
            <div
              v-for="service in cat.items"
              :key="service.id"
              class="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
              @click="openModal(service)"
            >
              <!-- Photo -->
              <img
                v-if="service.photos?.length"
                :src="service.photos[0]"
                :alt="locale === 'fr' ? service.name : service.name_en || service.name"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <!-- Fallback sans photo -->
              <div
                v-else
                class="absolute inset-0 bg-sand-100 flex items-center justify-center"
              >
                <ClientOnly>
                  <LottieIcon
                    v-if="lottieAnimations[service.slug]"
                    :animation-data="lottieAnimations[service.slug]!"
                    class="w-20 h-20"
                  />
                  <span v-else class="text-5xl">{{ service.icon ?? "✨" }}</span>
                  <template #fallback>
                    <span class="text-5xl">{{ service.icon ?? "✨" }}</span>
                  </template>
                </ClientOnly>
              </div>

              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

              <!-- Contenu bas de card -->
              <div class="absolute bottom-0 left-0 right-0 p-5">
                <span
                  v-if="service.riad_slugs?.length === 1"
                  class="inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2"
                  :class="service.riad_slugs[0] === 'dar-barai' ? 'bg-terracotta-600/80 text-white' : 'bg-blue-600/80 text-white'"
                >
                  {{ service.riad_slugs[0] === 'dar-barai' ? 'Dar Baraï' : 'Dar Tanawi' }}
                </span>
                <h3 class="font-serif text-xl text-white leading-snug">
                  {{ locale === "fr" ? service.name : service.name_en || service.name }}
                </h3>
                <p class="text-white/70 text-sm mt-1">
                  <template v-if="!service.price_cents">
                    {{ t("services.on_request") }}
                  </template>
                  <template v-else>
                    {{ formatPrice(service.price_cents) }} {{ t("services.per_person") }}
                  </template>
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </template>

      <!-- État vide -->
      <div v-else class="text-center py-20 text-stone-400">
        <span class="text-5xl mb-4 block">✨</span>
        <p>{{ t("services.empty") }}</p>
      </div>
    </div>

    <!-- MODAL -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="modal.open && modal.service"
          class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          @click.self="modal.open = false"
        >
          <div
            class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <!-- Contenu -->
            <div class="p-8">
              <!-- Header -->
              <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-3">
                  <ClientOnly>
                    <LottieIcon
                      v-if="modal.service && lottieAnimations[modal.service.slug]"
                      :animation-data="lottieAnimations[modal.service.slug]!"
                      class="w-14 h-14 shrink-0"
                    />
                    <span v-else class="text-4xl">{{ modal.service.icon ?? "✨" }}</span>
                    <template #fallback>
                      <span class="text-4xl">{{ modal.service.icon ?? "✨" }}</span>
                    </template>
                  </ClientOnly>
                  <div>
                    <h2 class="font-serif text-2xl text-stone-800">
                      {{
                        locale === "fr"
                          ? modal.service.name
                          : modal.service.name_en || modal.service.name
                      }}
                    </h2>
                    <p class="text-sm font-medium text-terracotta-600 mt-0.5">
                      <template v-if="!modal.service.price_cents">
                        {{ t("services.on_request") }}
                      </template>
                      <template v-else>
                        {{ formatPrice(modal.service.price_cents) }}
                        {{ t("services.per_person") }}
                      </template>
                    </p>
                  </div>
                </div>
                <button
                  class="text-stone-400 hover:text-stone-600 transition-colors mt-1"
                  @click="modal.open = false"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Description courte -->
              <p
                v-if="
                  locale === 'fr'
                    ? modal.service.description
                    : modal.service.description_en
                "
                class="text-stone-600 leading-relaxed mb-6"
              >
                {{
                  locale === "fr"
                    ? modal.service.description
                    : modal.service.description_en || modal.service.description
                }}
              </p>

              <!-- Texte long (details) -->
              <div
                v-if="
                  locale === 'fr'
                    ? modal.service.details
                    : modal.service.details_en
                "
                class="prose prose-stone max-w-none mb-8 text-sm"
                v-html="
                  locale === 'fr'
                    ? modal.service.details
                    : modal.service.details_en || modal.service.details
                "
              />

              <!-- CTA -->

              <!-- Photos -->
              <div
                v-if="modal.service.photos?.length"
                class="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                <div
                  v-for="(photo, i) in modal.service.photos"
                  :key="i"
                  class="aspect-[4/3] rounded-lg overflow-hidden cursor-zoom-in"
                  @click="openLightbox(i)"
                >
                  <img
                    :src="photo"
                    :alt="modal.service.name + ' ' + (i + 1)"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- LIGHTBOX -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="lightbox.open"
          class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          @click.self="lightbox.open = false"
        >
          <!-- Fermer -->
          <button
            class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            @click="lightbox.open = false"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Précédent -->
          <button
            v-if="lightboxPhotos.length > 1"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            @click="lightboxPrev"
          >
            <svg
              class="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Image -->
          <img
            :src="lightboxPhotos[lightbox.index]"
            :alt="'Photo ' + (lightbox.index + 1)"
            class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
          />

          <!-- Suivant -->
          <button
            v-if="lightboxPhotos.length > 1"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            @click="lightboxNext"
          >
            <svg
              class="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Indicateur -->
          <div
            v-if="lightboxPhotos.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          >
            <button
              v-for="(_, i) in lightboxPhotos"
              :key="i"
              class="w-2 h-2 rounded-full transition-colors"
              :class="i === lightbox.index ? 'bg-white' : 'bg-white/40'"
              @click="lightbox.index = i"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Service } from "~/types";
import type { ServiceCategoryRecord } from "~/composables/useServiceCategories";

const animationFiles = import.meta.glob("~/assets/animations/*.json", {
  eager: true,
  import: "default",
});
const lottieAnimations: Record<string, object> = Object.fromEntries(
  Object.entries(animationFiles).map(([path, data]) => {
    const slug = path.split("/").pop()?.replace(".json", "") ?? "";
    return [slug, data as object];
  }),
);

const staticImageFiles = import.meta.glob(
  "~/assets/animations/*.{jpg,jpeg,png,svg,webp}",
  { eager: true, import: "default" },
);
const staticImages: Record<string, string> = Object.fromEntries(
  Object.entries(staticImageFiles).map(([path, url]) => {
    const slug = path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    return [slug, url as string];
  }),
);

const { t, locale } = useI18n();
const { fetchServices } = useServices();
const { fetchCategories } = useServiceCategories();
const { formatPrice } = useRiad();

const { data: pageData } = await useAsyncData("services-public", async () => {
  const [{ data: services }, { data: categories }] = await Promise.all([
    fetchServices(true),
    fetchCategories(),
  ]);
  return { services: services ?? [], categories: categories ?? [] };
});

const services = computed(() => pageData.value?.services ?? []);
const categories = computed(() => pageData.value?.categories ?? []);

const servicesByCategory = computed(() => {
  const list = services.value;
  return categories.value
    .map((cat: ServiceCategoryRecord) => ({
      category: cat.slug,
      name: locale.value === "fr" ? cat.name : cat.name_en || cat.name,
      description: locale.value === "fr" ? cat.description : cat.description_en || cat.description,
      items: list.filter((s: Service) => s.category === cat.slug),
    }))
    .filter((g) => g.items.length > 0);
});

// Modal
const modal = reactive<{ open: boolean; service: Service | null }>({
  open: false,
  service: null,
});

const openModal = (service: Service) => {
  modal.service = service;
  modal.open = true;
};

// Lightbox
const lightbox = reactive({ open: false, index: 0 });
const lightboxPhotos = computed(() => modal.service?.photos ?? []);

const openLightbox = (i: number) => {
  lightbox.index = i;
  lightbox.open = true;
};

const lightboxPrev = () => {
  lightbox.index =
    (lightbox.index - 1 + lightboxPhotos.value.length) %
    lightboxPhotos.value.length;
};

const lightboxNext = () => {
  lightbox.index = (lightbox.index + 1) % lightboxPhotos.value.length;
};

const onKeydown = (e: KeyboardEvent) => {
  if (lightbox.open) {
    if (e.key === "Escape") {
      lightbox.open = false;
    } else if (e.key === "ArrowLeft") {
      lightboxPrev();
    } else if (e.key === "ArrowRight") {
      lightboxNext();
    }
  } else if (e.key === "Escape") {
    modal.open = false;
  }
};
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

useSeoMeta({
  title: t("services.seo_title"),
  description: t("services.page_subtitle"),
});
</script>
