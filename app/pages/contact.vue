<template>
  <div>
    <!-- Hero -->
    <section class="relative pt-32 pb-24 px-4 text-white">
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{
          backgroundImage: `url('${heroBg}')`,
          backgroundAttachment: 'fixed',
        }"
      />
      <div class="absolute inset-0 bg-stone-900/70" />
      <div class="relative z-10 text-center max-w-2xl mx-auto">
        <p
          class="text-terracotta-400 text-xs font-semibold uppercase tracking-widest mb-4"
        >
          Dar Baraï & Dar Tanawi
        </p>
        <h1 class="font-serif text-5xl md:text-6xl mb-6 leading-tight">
          {{ t("contact.hero_title") }}
        </h1>
        <p class="text-white/80 text-lg font-light">
          {{ t("contact.hero_subtitle") }}
        </p>
      </div>
    </section>

    <!-- Cards contact -->
    <section class="py-20 px-4 bg-stone-50">
      <div class="max-w-3xl mx-auto grid sm:grid-cols-3 gap-6 justify-items-center">
        <!-- Email -->
        <a
          href="mailto:contact@darbarai.com"
          class="w-full bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group"
        >
          <div
            class="w-14 h-14 rounded-full bg-terracotta-50 flex items-center justify-center mb-5 group-hover:bg-terracotta-100 transition-colors"
          >
            <svg class="w-6 h-6 text-terracotta-600" viewBox="0 0 24 24">
              <path fill="currentColor" :d="mdiEmail" />
            </svg>
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2"
          >
            {{ t("contact.email_label") }}
          </p>
          <p class="font-serif text-stone-800 text-lg mb-1">
            contact@darbarai.com
          </p>
          <p class="text-stone-400 text-sm">{{ t("contact.email_desc") }}</p>
        </a>

        <!-- WhatsApp -->
        <a
          href="https://wa.me/33676847685"
          target="_blank"
          rel="noopener"
          class="w-full bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group"
        >
          <div
            class="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors"
          >
            <svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24">
              <path fill="currentColor" :d="mdiWhatsapp" />
            </svg>
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2"
          >
            WhatsApp
          </p>
          <p class="font-serif text-stone-800 text-lg mb-1">+33750996975</p>
          <p class="text-stone-400 text-sm">{{ t("contact.phone_desc") }}</p>
        </a>

        <!-- Instagram -->
        <a
          href="https://www.instagram.com/dar.barai/"
          target="_blank"
          rel="noopener"
          class="w-full bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group"
        >
          <div
            class="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center mb-5 group-hover:bg-pink-100 transition-colors"
          >
            <svg class="w-6 h-6 text-pink-500" viewBox="0 0 24 24">
              <path fill="currentColor" :d="mdiInstagram" />
            </svg>
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2"
          >
            {{ t("contact.instagram_label") }}
          </p>
          <p class="font-serif text-stone-800 text-lg mb-1">@dar.barai</p>
          <p class="text-stone-400 text-sm">
            {{ t("contact.instagram_desc") }}
          </p>
        </a>
      </div>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
        <a
          href="https://wa.me/33676847685"
          target="_blank"
          rel="noopener"
          class="btn-primary px-8 py-3 inline-flex items-center gap-2 justify-center"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" :d="mdiWhatsapp" />
          </svg>
          {{ t("contact.cta_whatsapp") }}
        </a>
        <a
          href="mailto:contact@darbarai.com"
          class="btn-secondary px-8 py-3 inline-flex items-center gap-2 justify-center"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" :d="mdiEmail" />
          </svg>
          {{ t("contact.cta_email") }}
        </a>
      </div>
    </section>

    <!-- Adresse + carte -->
    <section class="py-16 px-4 max-w-5xl mx-auto text-center">
      <p
        class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3"
      >
        {{ t("contact.address_label") }}
      </p>
      <p class="font-serif text-2xl text-stone-800 mb-10">
        {{ t("contact.address_value") }}
      </p>
      <ClientOnly>
        <div class="h-[380px] rounded-2xl overflow-hidden shadow-lg isolate">
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
            ]"
            :center="{ lat: 31.61544777164044, lng: -7.989668939966876 }"
            :zoom="17"
          />
        </div>
        <template #fallback>
          <div class="h-[380px] rounded-2xl bg-sand-100 animate-pulse" />
        </template>
      </ClientOnly>

      <!-- Image entrees/entrances selon la langue -->
      <img
        :src="locale === 'fr' ? locationImageFr : locationImageEn"
        :alt="t('contact.address_value')"
        class="w-full h-auto rounded-2xl shadow-lg mt-6"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { mdiEmail, mdiPhone, mdiWhatsapp, mdiInstagram } from "@mdi/js";
const { data: _ps } = await useAsyncData("site-settings", () => $fetch("/api/site-settings"));
if ((_ps.value as any)?.page_contact_enabled === false) await navigateTo("/");
import heroBg from "~/assets/images/home_bg.jpg";
import locationImageFr from "~/assets/images/entrees.jpg";
import locationImageEn from "~/assets/images/entrances.jpg";

const { t, locale } = useI18n();

useSeoMeta({
  title: t("contact.seo_title"),
});
</script>
