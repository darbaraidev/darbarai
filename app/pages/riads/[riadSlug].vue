<template>
  <div v-if="riad">
    <!-- ===== HERO ===== -->
    <div class="relative h-[70vh] min-h-[500px] overflow-hidden">
      <img
        :src="riad.cover_image"
        :alt="name"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />
      <div class="absolute bottom-10 left-6 md:left-12 text-white max-w-2xl">
        <div class="flex items-center gap-4 mb-3">
          <img
            :src="`/images/logo_${(route.params.riadSlug as string).replace(/-/g, '_')}.jpg`"
            :alt="name"
            class="h-16 md:h-20 w-auto rounded-lg shadow-lg flex-shrink-0"
          />
          <h1 class="font-serif text-4xl md:text-6xl">{{ name }}</h1>
        </div>
        <div class="flex flex-wrap gap-4 text-white/90 text-sm md:text-base">
          <span class="flex items-center gap-1.5">
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ t("riads.up_to_guests", { n: riad.max_guests }) }}
          </span>
          <span v-if="riad.min_nights > 1" class="flex items-center gap-1.5">
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ t("riads.min_nights", { n: riad.min_nights }) }}
          </span>
          <span v-if="riad.area_sqm" class="flex items-center gap-1.5">
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            {{ riad.area_sqm }} m²
          </span>
          <span class="font-semibold">
            {{ formatPrice(riad.base_price_per_night) }}
            {{ t("common.per_night") }}
          </span>
        </div>
      </div>
    </div>

    <!-- ===== CONTENU + WIDGET ===== -->
    <div class="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-3 gap-14">
      <!-- COLONNE PRINCIPALE -->
      <div class="lg:col-span-2 space-y-14">
        <!-- Description -->
        <section>
          <p class="text-stone-600 text-lg leading-relaxed whitespace-pre-wrap">
            {{ description }}
          </p>
        </section>

        <!-- Couchage -->
        <section v-if="riad.sleeping_arrangements?.length">
          <h2 class="section-title mb-6">{{ t("riads.sleeping_title") }}</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div
              v-for="(room, i) in riad.sleeping_arrangements"
              :key="i"
              class="rounded-xl bg-sand-50 border border-sand-100 overflow-hidden"
            >
              <!-- Infos -->
              <div class="flex items-start gap-3 p-4">
                <svg
                  class="w-5 h-5 text-terracotta-500 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                >
                  <path fill="currentColor" :d="mdiBedKingOutline" />
                </svg>
                <div>
                  <div class="font-medium text-stone-800">
                    {{
                      locale === "fr" ? room.label : room.label_en || room.label
                    }}
                  </div>
                  <div class="text-sm text-stone-500">
                    {{
                      locale === "fr" ? room.beds : room.beds_en || room.beds
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Équipements -->
        <section v-if="riad.amenities?.length">
          <h2 class="section-title mb-6">{{ t("riads.amenities_title") }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="amenity in riad.amenities"
              :key="amenity"
              class="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100"
            >
              <span class="text-xl">{{ amenityEmoji(amenity) }}</span>
              <span class="text-sm font-medium text-stone-700 capitalize">{{
                amenityLabel(amenity)
              }}</span>
            </div>
          </div>
        </section>

        <!-- Services -->
        <section v-if="riad.services?.length">
          <div class="flex items-center justify-between mb-6">
            <h2 class="section-title">{{ t("riads.services_title") }}</h2>
            <a
              :href="localePath('/services')"
              target="_blank"
              rel="noopener"
              class="text-sm font-medium text-terracotta-600 hover:text-terracotta-800 transition-colors flex items-center gap-1 shrink-0"
            >
              {{ t("riads.services_see_all") }}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <div
            class="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden"
          >
            <div
              v-for="(service, i) in riad.services"
              :key="i"
              class="flex items-center justify-between px-5 py-4 bg-white hover:bg-stone-50 transition-colors"
            >
              <div>
                <div class="font-medium text-stone-800">
                  {{
                    locale === "fr"
                      ? service.name
                      : service.name_en || service.name
                  }}
                </div>
                <div class="text-sm text-stone-500">
                  {{
                    locale === "fr"
                      ? service.description
                      : service.description_en || service.description
                  }}
                </div>
              </div>
              <div
                class="text-sm font-semibold text-terracotta-600 shrink-0 ml-4"
              >
                {{
                  service.price_cents === null
                    ? t("services.on_request")
                    : service.price_cents === 0
                      ? t("riads.service_included")
                      : formatPrice(service.price_cents)
                }}
              </div>
            </div>
          </div>
        </section>

        <!-- Galerie groupée par pièce -->
        <section v-if="riad.gallery?.length">
          <h2 class="section-title mb-8">{{ t("riads.gallery_title") }}</h2>
          <div v-for="(group, gi) in riad.gallery.filter(g => g.label !== 'Divers')" :key="gi" class="mb-10">
            <h3
              class="text-base font-semibold text-stone-500 uppercase tracking-wider mb-3"
            >
              {{
                locale === "fr" ? group.label : group.label_en || group.label
              }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <img
                v-for="(photo, pi) in group.photos"
                :key="pi"
                :src="photo"
                :alt="`${group.label} ${pi + 1}`"
                class="rounded-xl aspect-square object-cover w-full hover:opacity-90 transition-opacity cursor-pointer"
                @click="openLightbox(group.photos, pi)"
              />
            </div>
          </div>
        </section>

        <!-- Localisation -->
        <section v-if="riad.location">
          <h2 class="section-title mb-6">{{ t("riads.location_title") }}</h2>
          <div
            class="flex items-start gap-3 p-5 rounded-xl bg-stone-50 border border-stone-100"
          >
            <svg
              class="w-5 h-5 text-terracotta-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <div class="font-medium text-stone-800">
                {{ riad.location.address }}
              </div>
              <div
                v-if="riad.location.neighborhood"
                class="text-sm text-stone-500 mt-0.5"
              >
                {{ riad.location.neighborhood }}
              </div>
              <a
                v-if="riad.location.google_maps_url"
                :href="riad.location.google_maps_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-terracotta-600 hover:underline mt-2 inline-block"
                >{{ t("riads.view_on_map") }} →</a
              >
            </div>
          </div>
        </section>

        <!-- Règles + horaires -->
        <section class="grid sm:grid-cols-2 gap-6">
          <div
            v-if="houseRules.length"
            class="p-5 rounded-xl bg-stone-50 border border-stone-100"
          >
            <h3 class="font-semibold text-stone-800 mb-3">
              {{ t("riads.house_rules_title") }}
            </h3>
            <ul class="space-y-1.5">
              <li
                v-for="(rule, i) in houseRules"
                :key="i"
                class="text-sm text-stone-600 flex items-start gap-2"
              >
                <span class="text-stone-300 mt-0.5">—</span> {{ rule }}
              </li>
            </ul>
          </div>
          <div
            class="p-5 rounded-xl bg-stone-50 border border-stone-100 space-y-4"
          >
            <div>
              <h3 class="font-semibold text-stone-800 mb-2">
                {{ t("riads.checkin_title") }}
              </h3>
              <p class="text-sm text-stone-600">
                {{ t("riads.checkin_from", { time: riad.checkin_time }) }}
              </p>
              <p class="text-sm text-stone-600">
                {{ t("riads.checkout_before", { time: riad.checkout_time }) }}
              </p>
            </div>
            <div v-if="cancellationPolicy">
              <h3 class="font-semibold text-stone-800 mb-2">
                {{ t("riads.cancellation_title") }}
              </h3>
              <p class="text-sm text-stone-600">{{ cancellationPolicy }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- WIDGET RÉSERVATION sticky -->
      <div id="booking" class="lg:col-span-1">
        <div class="sticky top-24">
          <BookingWidget :riad="riad" />
        </div>
      </div>
    </div>

    <!-- LIGHTBOX -->
    <Teleport to="body">
      <div
        v-if="lightbox.open"
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        @click.self="lightbox.open = false"
      >
        <button
          class="absolute top-4 right-4 text-white/80 hover:text-white"
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
        <button
          v-if="lightbox.index > 0"
          class="absolute left-4 text-white/80 hover:text-white"
          @click="lightbox.index--"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <img
          :src="lightbox.photos[lightbox.index]"
          class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          :alt="`Photo ${lightbox.index + 1}`"
        />
        <button
          v-if="lightbox.index < lightbox.photos.length - 1"
          class="absolute right-4 text-white/80 hover:text-white"
          @click="lightbox.index++"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div class="absolute bottom-4 text-white/60 text-sm">
          {{ lightbox.index + 1 }} / {{ lightbox.photos.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Riad } from "~/types";
import { mdiBedKingOutline } from "@mdi/js";

const route = useRoute();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { getRiadBySlug, formatPrice } = useRiad();

const riad = (await getRiadBySlug(route.params.riadSlug as string)) as Riad;
if (!riad) throw createError({ statusCode: 404 });

const name = computed(() =>
  locale.value === "fr" ? riad.name : riad.name_en || riad.name,
);
const description = computed(() =>
  locale.value === "fr"
    ? riad.description
    : riad.description_en || riad.description,
);
const houseRules = computed(() =>
  locale.value === "fr"
    ? (riad.house_rules ?? [])
    : riad.house_rules_en?.length
      ? riad.house_rules_en
      : (riad.house_rules ?? []),
);
const cancellationPolicy = computed(() =>
  locale.value === "fr"
    ? riad.cancellation_policy
    : riad.cancellation_policy_en || riad.cancellation_policy,
);

const lightbox = reactive({ open: false, photos: [] as string[], index: 0 });
const openLightbox = (photos: string[], index: number) => {
  lightbox.photos = photos;
  lightbox.index = index;
  lightbox.open = true;
};

onMounted(async () => {
  try {
    await $fetch("/api/ical/sync", { method: "POST" });
    await refreshNuxtData(`picker-availability:${riad.id}`);
  } catch {}
});

const onKeydown = (e: KeyboardEvent) => {
  if (!lightbox.open) {
    return;
  }
  if (e.key === "Escape") {
    lightbox.open = false;
  }
  if (e.key === "ArrowLeft" && lightbox.index > 0) {
    lightbox.index--;
  }
  if (e.key === "ArrowRight" && lightbox.index < lightbox.photos.length - 1) {
    lightbox.index++;
  }
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const galleryByLabel = computed(() => {
  const map: Record<string, string[]> = {};
  for (const group of riad.gallery ?? []) {
    map[group.label] = group.photos;
    if (group.label_en) {
      map[group.label_en] = group.photos;
    }
  }
  return map;
});

const roomPhotos = (room: { label: string; label_en?: string }) => {
  return (
    galleryByLabel.value[room.label] ??
    (room.label_en ? galleryByLabel.value[room.label_en] : undefined) ??
    []
  );
};

const { getAmenity } = useAmenities();
const amenityEmoji = (slug: string): string => getAmenity(slug)?.emoji ?? "✓";
const amenityLabel = (slug: string): string =>
  locale.value === "fr"
    ? (getAmenity(slug)?.name_fr ?? slug)
    : (getAmenity(slug)?.name_en ?? slug);

useSeoMeta({
  title: t("riads.seo_title", { name: riad.name }),
  description: riad.description,
  ogTitle: t("riads.seo_title", { name: riad.name }),
  ogDescription: riad.description,
  ogImage: riad.cover_image,
  twitterImage: riad.cover_image,
});

const riadConfig = useRuntimeConfig();
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        name: riad.name,
        description: riad.description,
        url: `${riadConfig.public.siteUrl}/riads/${route.params.riadSlug}`,
        image: riad.cover_image,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Marrakech",
          addressRegion: "Marrakech-Safi",
          addressCountry: "MA",
        },
        numberOfRooms: riad.sleeping_arrangements?.length ?? undefined,
        occupancy: { "@type": "QuantitativeValue", maxValue: riad.max_guests },
        priceRange: "€€€",
      }),
    },
  ],
});
</script>
