<template>
  <div>
    <!-- Hero -->
    <section class="pt-28 pb-16 px-4 max-w-4xl mx-auto">
      <h1 class="section-title text-center mb-16">{{ t("about.title") }}</h1>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Texte -->
        <div class="space-y-5 text-stone-700 leading-relaxed">
          <p class="font-serif text-xl text-stone-800">{{ t("about.greeting") }}</p>
          <p class="font-serif text-2xl text-terracotta-600 font-medium">{{ t("about.welcome") }}</p>
          <p>{{ t("about.p1") }}</p>
          <p>{{ t("about.p2") }}</p>
          <p>{{ t("about.p3") }}</p>
          <p>{{ t("about.p4") }}</p>
          <p>{{ t("about.p5") }}</p>
          <p>{{ t("about.p6") }}</p>
          <div class="pt-4">
            <p class="text-stone-500 italic">{{ t("about.sign_off") }}</p>
            <p class="font-serif text-lg text-stone-800 mt-1">{{ t("about.signatories") }}</p>
          </div>
        </div>

        <!-- Photo -->
        <div class="relative">
          <img
            :src="aboutPeople"
            alt="Nathalie, Chantal, Christine"
            class="w-full rounded-2xl shadow-lg object-cover"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import aboutPeople from "~/assets/images/about_people.png";

const { t } = useI18n();

useSeoMeta({
  title: t("about.seo_title"),
  description: t("seo.about_description"),
  ogTitle: t("about.seo_title"),
  ogDescription: t("seo.about_description"),
});
</script>
