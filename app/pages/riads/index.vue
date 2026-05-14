<template>
  <div class="max-w-7xl mx-auto px-4 py-16">
    <h1 class="section-title text-center mb-4">{{ t("riads.page_title") }}</h1>
    <p class="text-center text-stone-500 mb-12">
      {{ t("riads.page_subtitle") }}
    </p>

    <!-- 2 riads individuels -->
    <div class="grid md:grid-cols-2 gap-10">
      <RiadCard v-for="riad in riads" :key="riad.id" :riad="riad" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n, useRiad } from "#imports";

const { t } = useI18n();
const { riads, fetchRiads } = useRiad();
await useAsyncData("riads-list", () => fetchRiads());

useSeoMeta({ title: t("seo.riads_title") });
</script>
