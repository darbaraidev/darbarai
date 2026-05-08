<script setup lang="ts">
import type { Riad } from "~/types";

const route = useRoute();
const { getRiadBySlug, formatPrice } = useRiad();

const riad = await getRiadBySlug(route.params.slug as string);
if (!riad) throw createError({ statusCode: 404 });

const { locale } = useI18n();
const name = computed(() =>
  locale.value === "fr" ? riad.name : riad.name_en || riad.name,
);
const description = computed(() =>
  locale.value === "fr"
    ? riad.description
    : riad.description_en || riad.description,
);

useSeoMeta({
  title: `${riad.name} – Riad à Marrakech`,
  description: riad.description,
  ogImage: riad.cover_image,
});
</script>

<template>
  <div>
    <!-- Galerie hero -->
    <div class="relative h-[60vh] overflow-hidden">
      <NuxtImg
        :src="riad.cover_image"
        :alt="riad.name"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
      />
      <div class="absolute bottom-8 left-8 text-white">
        <h1 class="font-serif text-5xl mb-2">{{ name }}</h1>
        <p class="text-white/80 text-lg">
          Jusqu'à {{ riad.max_guests }} voyageurs ·
          {{ formatPrice(riad.base_price_per_night) }} / nuit
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-12">
      <!-- Description -->
      <div class="lg:col-span-2">
        <p class="text-stone-600 text-lg leading-relaxed mb-8">
          {{ description }}
        </p>
        <!-- Galerie -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NuxtImg
            v-for="(img, i) in riad.images"
            :key="i"
            :src="img"
            :alt="`${riad.name} - photo ${i + 1}`"
            class="rounded-xl aspect-square object-cover w-full hover:scale-105 transition-transform cursor-pointer"
          />
        </div>
      </div>

      <!-- Booking widget -->
      <div id="booking" class="lg:col-span-1">
        <BookingWidget :riad="riad" />
      </div>
    </div>
  </div>
</template>
