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

    <!-- Newsletter -->
    <section class="py-20 px-4 bg-stone-900 text-white overflow-hidden">
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- Texte + perks -->
          <div>
            <p class="text-terracotta-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Newsletter
            </p>
            <h2 class="font-serif text-3xl md:text-4xl mb-5 leading-snug">
              {{ t("contact.newsletter_title") }}
            </h2>
            <p class="text-stone-300 text-base leading-relaxed mb-8">
              {{ t("contact.newsletter_subtitle") }}
            </p>
            <ul class="space-y-3.5">
              <li
                v-for="perk in newsletterPerks"
                :key="perk"
                class="flex items-center gap-3 text-stone-300 text-sm"
              >
                <span class="w-5 h-5 rounded-full bg-terracotta-500/25 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3 text-terracotta-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </span>
                {{ perk }}
              </li>
            </ul>
          </div>

          <!-- Formulaire -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-8">
            <!-- Succès -->
            <div v-if="nlSuccess" class="text-center py-4">
              <div class="text-4xl mb-4">🎉</div>
              <h3 class="font-serif text-xl text-white mb-2">
                {{ t("newsletter_popup.success_title") }}
              </h3>
              <p class="text-stone-300 text-sm leading-relaxed">
                {{ t("newsletter_popup.success_text") }}
              </p>
            </div>

            <!-- Déjà abonné -->
            <div v-else-if="nlAlready" class="text-center py-4">
              <div class="text-4xl mb-4">✓</div>
              <h3 class="font-serif text-xl text-white mb-2">
                {{ t("contact.newsletter_already") }}
              </h3>
            </div>

            <!-- Form -->
            <template v-else>
              <h3 class="font-serif text-xl text-white mb-1">
                {{ t("newsletter_popup.title") }}
              </h3>
              <p class="text-stone-400 text-sm mb-5">
                {{ t("newsletter_popup.subtitle") }}
              </p>
              <form class="space-y-3" @submit.prevent="nlSubmit">
                <input
                  v-model="nlEmail"
                  type="email"
                  required
                  :placeholder="t('newsletter_popup.placeholder')"
                  :disabled="nlLoading"
                  class="w-full bg-white/10 border border-white/20 text-white placeholder-stone-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta-400 transition-colors"
                />
                <p v-if="nlError" class="text-red-400 text-xs">{{ nlError }}</p>
                <button
                  type="submit"
                  class="btn-primary w-full py-3 text-sm"
                  :disabled="nlLoading"
                >
                  {{ nlLoading ? t("common.loading") : t("contact.newsletter_cta") }}
                </button>
              </form>
              <p class="text-stone-500 text-xs text-center mt-4">
                {{ t("contact.newsletter_legal") }}
              </p>
            </template>
          </div>
        </div>
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
const user = useSupabaseUser();

const newsletterPerks = computed(() => [
  t("contact.newsletter_perk_1"),
  t("contact.newsletter_perk_2"),
  t("contact.newsletter_perk_3"),
  t("contact.newsletter_perk_4"),
]);

const nlEmail = ref("");
const nlLoading = ref(false);
const nlError = ref("");
const nlSuccess = ref(false);
const nlAlready = ref(false);

onMounted(() => {
  if (user.value) nlEmail.value = user.value.email ?? "";
});

async function nlSubmit() {
  nlError.value = "";
  nlLoading.value = true;
  try {
    await $fetch("/api/newsletter/subscribe", { method: "POST", body: { email: nlEmail.value } });
    nlSuccess.value = true;
  } catch (e: any) {
    const status = e?.response?.status ?? e?.statusCode;
    if (status === 409) {
      nlAlready.value = true;
    } else {
      nlError.value = t("newsletter_popup.error");
    }
  } finally {
    nlLoading.value = false;
  }
}

useSeoMeta({
  title: t("contact.seo_title"),
});
</script>
