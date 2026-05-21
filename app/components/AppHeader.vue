<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="flex items-center flex-shrink-0">
        <img
          src="/images/logo_app.jpg"
          alt="Dar Baraï"
          class="h-12 w-auto transition-all duration-300 rounded-lg"
          :class="scrolled ? '' : 'ring-1 ring-white/20 shadow-md'"
        />
      </NuxtLink>

      <!-- Nav desktop - centré -->
      <nav class="hidden md:flex items-center gap-7 flex-1 justify-center">
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-1.5 text-sm font-medium transition-colors"
          :class="
            scrolled
              ? 'text-stone-700 hover:text-terracotta-600'
              : 'text-stone-900 hover:text-terracotta-600'
          "
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="currentColor" :d="mdiHome" />
          </svg>
          {{ t("nav.home") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/riads')"
          class="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="currentColor" :d="mdiBed" />
          </svg>
          {{ t("nav.riads") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/services')"
          class="flex items-center gap-1.5 text-sm font-medium transition-colors"
          :class="
            scrolled
              ? 'text-stone-700 hover:text-terracotta-600'
              : 'text-stone-900 hover:text-terracotta-600'
          "
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="currentColor" :d="mdiFlower" />
          </svg>
          {{ t("nav.services") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/gallery')"
          class="flex items-center gap-1.5 text-sm font-medium transition-colors"
          :class="
            scrolled
              ? 'text-stone-700 hover:text-terracotta-600'
              : 'text-stone-900 hover:text-terracotta-600'
          "
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="currentColor" :d="mdiCamera" />
          </svg>
          {{ t("nav.gallery") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/boutique')"
          class="flex items-center gap-1.5 text-sm font-medium transition-colors"
          :class="
            scrolled
              ? 'text-stone-700 hover:text-terracotta-600'
              : 'text-stone-900 hover:text-terracotta-600'
          "
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="currentColor" :d="mdiStorefront" />
          </svg>
          {{ t("nav.boutique") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/contact')"
          class="flex items-center gap-1.5 text-sm font-medium transition-colors"
          :class="
            scrolled
              ? 'text-stone-700 hover:text-terracotta-600'
              : 'text-stone-900 hover:text-terracotta-600'
          "
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="currentColor" :d="mdiEmailOutline" />
          </svg>
          {{ t("nav.contact") }}
        </NuxtLink>
      </nav>

      <!-- Actions - collées à droite -->
      <div class="flex items-center gap-3 flex-shrink-0 ml-auto">
        <!-- Sélecteur de langue -->
        <div class="relative">
          <button
            class="flex items-center gap-1.5 text-xs font-medium uppercase px-2 py-1 rounded transition-colors"
            :class="
              scrolled
                ? 'text-stone-600 hover:text-terracotta-600'
                : 'text-stone-900 hover:text-terracotta-600'
            "
            @click="langOpen = !langOpen"
          >
            <img
              :src="`https://flagcdn.com/16x12/${localeFlagCodes[locale]}.png`"
              :alt="locale"
              class="w-4 rounded-sm"
            />
            <span>{{ locale }}</span>
            <svg
              class="w-3 h-3 transition-transform"
              :class="langOpen ? 'rotate-180' : ''"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="langOpen"
              class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-stone-100 overflow-hidden z-50"
            >
              <button
                v-for="loc in availableLocales"
                :key="loc"
                class="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium uppercase text-stone-700 hover:bg-stone-50 transition-colors"
                :class="locale === loc ? 'text-terracotta-600' : ''"
                @click="
                  setLocale(loc);
                  langOpen = false;
                "
              >
                <img
                  :src="`https://flagcdn.com/16x12/${localeFlagCodes[loc]}.png`"
                  :alt="loc"
                  class="w-4 rounded-sm"
                />
                {{ loc }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Auth -->
        <template v-if="user">
          <NuxtLink
            :to="localePath('/account')"
            class="text-sm font-medium transition-colors"
            :class="
              scrolled
                ? 'text-stone-700 hover:text-terracotta-600'
                : 'text-stone-900 hover:text-terracotta-600'
            "
          >
            {{ t("nav.account") }}
          </NuxtLink>
          <NuxtLink
            v-if="isAdmin"
            :to="localePath('/admin')"
            class="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            :class="
              scrolled
                ? 'border-terracotta-600 text-terracotta-600 hover:bg-terracotta-600 hover:text-white'
                : 'border-stone-900 text-stone-900 hover:bg-stone-900/10'
            "
          >
            ⚙ {{ t("nav.admin") }}
          </NuxtLink>
          <button class="btn-primary text-sm px-4 py-2" @click="signOut">
            {{ t("nav.logout") }}
          </button>
        </template>
        <template v-else>
          <NuxtLink
            :to="localePath('/auth/login')"
            class="text-sm font-medium transition-colors"
            :class="
              scrolled
                ? 'text-stone-700 hover:text-terracotta-600'
                : 'text-stone-900 hover:text-terracotta-600'
            "
          >
            {{ t("nav.login") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/auth/register')"
            class="btn-primary text-sm px-4 py-2"
          >
            {{ t("nav.register") }}
          </NuxtLink>
        </template>

        <!-- Menu burger mobile -->
        <button class="md:hidden p-2" @click="mobileOpen = !mobileOpen">
          <span class="sr-only">Menu</span>
          <svg
            class="w-5 h-5"
            :class="scrolled ? 'text-stone-700' : 'text-stone-900'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              v-if="!mobileOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden bg-white border-t border-stone-100 shadow-lg"
      >
        <nav class="flex flex-col px-4 py-4 gap-4">
          <NuxtLink
            :to="localePath('/')"
            class="flex items-center gap-2 text-stone-700 font-medium"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
              <path fill="currentColor" :d="mdiHome" />
            </svg>
            {{ t("nav.home") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/riads')"
            class="btn-primary text-sm px-4 py-2 flex items-center gap-2 self-start"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
              <path fill="currentColor" :d="mdiBed" />
            </svg>
            {{ t("nav.riads") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/services')"
            class="flex items-center gap-2 text-stone-700 font-medium"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
              <path fill="currentColor" :d="mdiFlower" />
            </svg>
            {{ t("nav.services") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/gallery')"
            class="flex items-center gap-2 text-stone-700 font-medium"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
              <path fill="currentColor" :d="mdiCamera" />
            </svg>
            {{ t("nav.gallery") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/boutique')"
            class="flex items-center gap-2 text-stone-700 font-medium"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
              <path fill="currentColor" :d="mdiStorefront" />
            </svg>
            {{ t("nav.boutique") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            class="flex items-center gap-2 text-stone-700 font-medium"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
              <path fill="currentColor" :d="mdiEmailOutline" />
            </svg>
            {{ t("nav.contact") }}
          </NuxtLink>
          <template v-if="user">
            <NuxtLink
              :to="localePath('/account')"
              class="text-stone-700 font-medium"
              @click="mobileOpen = false"
            >
              {{ t("nav.account") }}
            </NuxtLink>
            <button
              class="text-left text-stone-700 font-medium"
              @click="signOut"
            >
              {{ t("nav.logout") }}
            </button>
          </template>
          <template v-else>
            <NuxtLink
              :to="localePath('/auth/login')"
              class="text-stone-700 font-medium"
              @click="mobileOpen = false"
            >
              {{ t("nav.login") }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/auth/register')"
              class="text-stone-700 font-medium"
              @click="mobileOpen = false"
            >
              {{ t("nav.register") }}
            </NuxtLink>
          </template>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import {
  mdiHome,
  mdiFlower,
  mdiCamera,
  mdiBed,
  mdiEmailOutline,
  mdiStorefront,
} from "@mdi/js";

const { t, locale, availableLocales, setLocale } = useI18n();
const localeFlagCodes: Record<string, string> = { fr: "fr", en: "gb" };
const localePath = useLocalePath();
const { user, isAdmin, signOut } = useAuth();

const scrolled = ref(false);
const mobileOpen = ref(false);
const langOpen = ref(false);

onMounted(() => {
  const close = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".relative")) langOpen.value = false;
  };
  document.addEventListener("click", close);
  onUnmounted(() => document.removeEventListener("click", close));
});

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 40;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onUnmounted(() => window.removeEventListener("scroll", onScroll));
});
</script>
