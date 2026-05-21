<template>
  <div class="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
    <div class="text-center max-w-md">
      <NuxtLink :to="localePath('/')">
        <img
          src="/images/logo_app.jpg"
          alt="Dar Baraï"
          class="h-20 w-auto rounded-xl shadow-md mx-auto mb-8"
        />
      </NuxtLink>

      <div class="bg-white rounded-2xl shadow-sm border border-stone-100 px-8 py-10">
        <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-xl font-semibold text-stone-800 mb-2">{{ t("unsubscribe.title") }}</h1>
        <p class="text-sm text-stone-500 leading-relaxed">{{ t("unsubscribe.message") }}</p>

        <NuxtLink
          :to="localePath('/')"
          class="inline-block mt-8 btn-primary text-sm px-6 py-2.5"
        >
          {{ t("unsubscribe.back_home") }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

definePageMeta({ layout: false });
useSeoMeta({ title: "Désabonnement – Dar Baraï" });
</script>
