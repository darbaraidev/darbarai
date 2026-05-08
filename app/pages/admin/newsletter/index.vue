<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const { t } = useI18n();

useSeoMeta({ title: "Newsletter – Admin" });
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-stone-800 mb-6">
      {{ t("admin.newsletter") }}
    </h1>
    <div class="card p-6">
      <NewsletterEditor />
    </div>
  </div>
</template>
