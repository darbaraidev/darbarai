<script setup lang="ts">
const { riads, fetchRiads } = useRiad();
await fetchRiads();

useSeoMeta({ title: "Nos Riads – Dar Baraï & Dar Tanawi" });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-16">
    <h1 class="section-title text-center mb-4">Nos Riads</h1>
    <p class="text-center text-stone-500 mb-12">
      Deux adresses d'exception pour vivre Marrakech autrement
    </p>
    <div class="grid md:grid-cols-2 gap-10">
      <RiadCard v-for="riad in riads" :key="riad.id" :riad="riad" />
    </div>
  </div>
</template>
