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
          v-if="ps?.page_services_enabled !== false"
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
          v-if="ps?.page_gallery_enabled !== false"
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
          v-if="ps?.page_boutique_enabled !== false"
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
          v-if="ps?.page_contact_enabled !== false"
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

        <!-- Auth dropdown -->
        <div class="relative profile-dropdown">
          <!-- Bouton connecté -->
          <button
            v-if="user"
            class="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors"
            :class="scrolled
              ? 'border-stone-300 text-stone-700 hover:border-terracotta-500 hover:text-terracotta-600'
              : 'border-white/40 text-stone-900 hover:border-white hover:text-terracotta-600'"
            @click="profileOpen = !profileOpen"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            {{ t("nav.account") }}
            <svg class="w-3 h-3 transition-transform" :class="profileOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Bouton déconnecté -->
          <button
            v-else
            class="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors"
            :class="scrolled
              ? 'border-stone-300 text-stone-700 hover:border-terracotta-500 hover:text-terracotta-600'
              : 'border-white/40 text-stone-900 hover:border-white hover:text-terracotta-600'"
            @click="profileOpen = !profileOpen"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            {{ t("nav.login") }}
            <svg class="w-3 h-3 transition-transform" :class="profileOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="profileOpen"
              class="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50 min-w-[180px]"
            >
              <template v-if="user">
                <NuxtLink
                  :to="localePath('/account')"
                  class="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  @click="profileOpen = false"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4 text-stone-400" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                  {{ t("account.profile") }}
                </NuxtLink>
                <NuxtLink
                  :to="{ path: localePath('/account'), query: { tab: 'reservations' } }"
                  class="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  @click="profileOpen = false"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ t("account.my_reservations") }}
                </NuxtLink>
                <NuxtLink
                  v-if="isAdmin"
                  :to="localePath('/admin')"
                  class="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  @click="profileOpen = false"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  {{ t("nav.admin") }}
                </NuxtLink>
                <div class="border-t border-stone-100" />
                <button
                  class="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  @click="signOut(); profileOpen = false"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  {{ t("nav.logout") }}
                </button>
              </template>
              <template v-else>
                <NuxtLink
                  :to="localePath('/auth/login')"
                  class="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  @click="profileOpen = false"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  {{ t("nav.login") }}
                </NuxtLink>
                <NuxtLink
                  :to="localePath('/auth/register')"
                  class="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  @click="profileOpen = false"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  {{ t("nav.register") }}
                </NuxtLink>
              </template>
            </div>
          </Transition>
        </div>

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
            v-if="ps?.page_services_enabled !== false"
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
            v-if="ps?.page_gallery_enabled !== false"
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
            v-if="ps?.page_boutique_enabled !== false"
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
            v-if="ps?.page_contact_enabled !== false"
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

const { data: pageSettings } = useFetch("/api/site-settings", { key: "site-settings" });
const ps = computed(() => pageSettings.value as Record<string, boolean> | null);

const scrolled = ref(false);
const mobileOpen = ref(false);
const langOpen = ref(false);
const profileOpen = ref(false);

onMounted(() => {
  const close = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".relative")) langOpen.value = false;
    if (!(e.target as HTMLElement).closest(".profile-dropdown")) profileOpen.value = false;
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
