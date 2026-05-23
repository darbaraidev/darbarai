<template>
  <div class="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
    <!-- Logo -->
    <div class="flex items-center justify-center gap-3 mb-10">
      <img src="/images/logo_app.jpg" alt="Dar Baraï" class="w-16 rounded-xl shadow-sm" />
      <img src="/images/logo_app_1.jpg" alt="Dar Tanawi" class="w-16 rounded-xl shadow-sm" />
    </div>

    <!-- Icône -->
    <div class="w-16 h-16 rounded-full bg-terracotta-100 flex items-center justify-center mb-6">
      <svg class="w-8 h-8 text-terracotta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    </div>

    <!-- Titre -->
    <h1 class="font-serif text-3xl md:text-4xl text-stone-800 mb-4 leading-snug">
      {{ t("maintenance.title") }}
    </h1>
    <p class="text-stone-500 text-base md:text-lg max-w-md leading-relaxed mb-10">
      {{ t("maintenance.subtitle") }}
    </p>

    <!-- Séparateur décoratif -->
    <div class="flex items-center gap-3 mb-10">
      <div class="h-px w-12 bg-terracotta-200" />
      <svg viewBox="0 0 40 40" class="w-4 h-4 text-terracotta-300" fill="currentColor">
        <path d="M20 0l2.9 8.9 8.7-5.1-3.8 8.9 9.5 1.3-9.4 1.2L30.9 25l-7.6-5.9L20 28.1l-3.3-9L9.1 25l2-9.8L1.7 14l9.8-1.3L7.6 3.8l9 5.1z"/>
      </svg>
      <div class="h-px w-12 bg-terracotta-200" />
    </div>

    <!-- Contact -->
    <p class="text-stone-400 text-sm mb-4">{{ t("maintenance.contact_hint") }}</p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href="mailto:contact@darbarai.com"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 text-sm hover:bg-white hover:shadow-sm transition-all"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        contact@darbarai.com
      </a>
      <a
        href="https://wa.me/33676847685"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 text-sm hover:bg-white hover:shadow-sm transition-all"
      >
        <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
const { t } = useI18n();
useSeoMeta({ title: t("maintenance.seo_title") });
</script>
