<template>
  <aside
    class="w-64 shrink-0 bg-stone-900 text-stone-300 flex flex-col fixed top-0 left-0 h-screen z-30"
  >
    <!-- Retour accueil -->
    <div class="px-4 pt-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors w-full"
      >
        <svg
          class="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        {{ t("admin.back_to_site") }}
      </NuxtLink>
    </div>

    <!-- Logo -->
    <div class="px-6 py-5 border-b border-stone-800">
      <NuxtLink to="/" class="font-serif text-xl text-white"
        >Dar Baraï</NuxtLink
      >
      <p class="text-xs text-stone-500 mt-0.5">Administration</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="
          $route.path.startsWith(item.to) && item.to !== '/admin'
            ? 'bg-terracotta-700 text-white'
            : $route.path === '/admin' && item.to === '/admin'
              ? 'bg-terracotta-700 text-white'
              : 'text-stone-400 hover:bg-stone-800 hover:text-white'
        "
      >
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- Footer sidebar -->
    <div class="px-6 py-4 border-t border-stone-800">
      <NuxtLink
        to="/"
        class="text-xs text-stone-500 hover:text-white transition-colors"
      >
        ← {{ t("admin.back_to_site") }}
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { t } = useI18n();

// Icônes inline SVG minimalistes
const IconDashboard = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
});
const IconCalendar = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
});
const IconUsers = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
});
const IconMail = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
});
const IconMailDoc = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
});

const IconHome = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 21V12h6v9"/></svg>`,
});

const IconStar = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
});
const IconTag = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>`,
});

const navItems = [
  { to: "/admin", label: t("admin.title"), icon: IconDashboard },
  {
    to: "/admin/reservations",
    label: t("admin.reservations"),
    icon: IconCalendar,
  },
  { to: "/admin/riads", label: t("admin.riads"), icon: IconHome },
  { to: "/admin/services", label: t("admin.services"), icon: IconStar },
  { to: "/admin/amenities", label: "Équipements", icon: IconTag },
  { to: "/admin/clients", label: t("admin.clients"), icon: IconUsers },
  { to: "/admin/newsletter", label: t("admin.newsletter"), icon: IconMail },
  { to: "/admin/emails", label: "Emails", icon: IconMailDoc },
];
</script>
