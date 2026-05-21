<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">Analytiques</h1>
      <span class="text-sm text-stone-400">30 derniers jours</span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="card p-5">
        <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Aujourd'hui</p>
        <p class="text-3xl font-bold text-stone-800">{{ todayCount }}</p>
        <p class="text-xs text-stone-400 mt-1">{{ todayUniq }} visiteur{{ todayUniq > 1 ? 's' : '' }} unique{{ todayUniq > 1 ? 's' : '' }}</p>
      </div>
      <div class="card p-5">
        <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">7 jours</p>
        <p class="text-3xl font-bold text-stone-800">{{ weekCount }}</p>
        <p class="text-xs text-stone-400 mt-1">{{ weekUniq }} visiteur{{ weekUniq > 1 ? 's' : '' }} unique{{ weekUniq > 1 ? 's' : '' }}</p>
      </div>
      <div class="card p-5">
        <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">30 jours</p>
        <p class="text-3xl font-bold text-stone-800">{{ monthCount }}</p>
        <p class="text-xs text-stone-400 mt-1">{{ monthUniq }} visiteur{{ monthUniq > 1 ? 's' : '' }} unique{{ monthUniq > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Bar chart -->
    <div class="card p-6 mb-8">
      <h2 class="font-semibold text-stone-700 mb-6">Visites par jour</h2>
      <div class="flex items-end gap-1 h-32">
        <div
          v-for="(d, i) in dailyData"
          :key="d.date"
          class="flex-1 flex flex-col items-center gap-1 group"
        >
          <div class="relative w-full">
            <div
              class="w-full rounded-t bg-terracotta-400 group-hover:bg-terracotta-500 transition-colors min-h-[2px]"
              :style="{ height: Math.max(2, (d.count / maxDaily) * 112) + 'px' }"
            />
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {{ d.count }}
            </div>
          </div>
          <span v-if="i % 5 === 0" class="text-[9px] text-stone-400 rotate-0">{{ shortDate(d.date) }}</span>
          <span v-else class="text-[9px] text-transparent">·</span>
        </div>
      </div>
    </div>

    <!-- Bottom grid -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Top pages -->
      <div class="card p-5">
        <h2 class="font-semibold text-stone-700 mb-4">Pages populaires</h2>
        <div class="space-y-3">
          <div v-for="item in topPages" :key="item.page">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-stone-600 truncate max-w-[140px]">{{ shortPage(item.page) }}</span>
              <span class="text-xs font-medium text-stone-500 shrink-0 ml-2">{{ item.count }}</span>
            </div>
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full bg-terracotta-400 rounded-full" :style="{ width: (item.count / topPages[0]!.count * 100) + '%' }" />
            </div>
          </div>
          <p v-if="!topPages.length" class="text-sm text-stone-400">Aucune donnée</p>
        </div>
      </div>

      <!-- Top pays -->
      <div class="card p-5">
        <h2 class="font-semibold text-stone-700 mb-4">Pays</h2>
        <div class="space-y-3">
          <div v-for="item in topCountries" :key="item.country">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-stone-600 flex items-center gap-1.5">
                <span>{{ flagEmoji(item.code) }}</span>
                <span class="truncate max-w-[110px]">{{ item.country }}</span>
              </span>
              <span class="text-xs font-medium text-stone-500 shrink-0 ml-2">{{ item.count }}</span>
            </div>
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-400 rounded-full" :style="{ width: (item.count / topCountries[0]!.count * 100) + '%' }" />
            </div>
          </div>
          <p v-if="!topCountries.length" class="text-sm text-stone-400">Aucune donnée</p>
        </div>
      </div>

      <!-- Top villes -->
      <div class="card p-5">
        <h2 class="font-semibold text-stone-700 mb-4">Villes</h2>
        <div class="space-y-3">
          <div v-for="item in topCities" :key="item.city">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-stone-600 truncate max-w-[140px]">{{ item.city }}</span>
              <span class="text-xs font-medium text-stone-500 shrink-0 ml-2">{{ item.count }}</span>
            </div>
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-full" :style="{ width: (item.count / topCities[0]!.count * 100) + '%' }" />
            </div>
          </div>
          <p v-if="!topCities.length" class="text-sm text-stone-400">Aucune donnée</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const supabase = useSupabaseClient() as any;

const now = new Date();

const startOf30Days = new Date(now);
startOf30Days.setDate(now.getDate() - 29);
startOf30Days.setHours(0, 0, 0, 0);

const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);

const startOf7Days = new Date(now);
startOf7Days.setDate(now.getDate() - 6);
startOf7Days.setHours(0, 0, 0, 0);

const { data: visits } = await useAsyncData("admin-analytics", async () => {
  const { data } = await supabase
    .from("page_visits")
    .select("page, country, country_code, city, created_at, visitor_id")
    .gte("created_at", startOf30Days.toISOString())
    .order("created_at", { ascending: true });
  return (data ?? []) as { page: string; country: string | null; country_code: string | null; city: string | null; created_at: string; visitor_id: string | null }[];
});

function uniq(subset: typeof visits.value) {
  return new Set(subset?.map((v) => v.visitor_id).filter(Boolean)).size;
}

const todayVisits = computed(() => visits.value?.filter((v) => new Date(v.created_at) >= startOfToday) ?? []);
const weekVisits = computed(() => visits.value?.filter((v) => new Date(v.created_at) >= startOf7Days) ?? []);

const todayCount = computed(() => todayVisits.value.length);
const weekCount = computed(() => weekVisits.value.length);
const monthCount = computed(() => visits.value?.length ?? 0);

const todayUniq = computed(() => uniq(todayVisits.value));
const weekUniq = computed(() => uniq(weekVisits.value));
const monthUniq = computed(() => uniq(visits.value));

const dailyData = computed(() => {
  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of visits.value ?? []) {
    const key = v.created_at.slice(0, 10);
    if (key in days) days[key]++;
  }
  return Object.entries(days).map(([date, count]) => ({ date, count }));
});

const maxDaily = computed(() => Math.max(...dailyData.value.map((d) => d.count), 1));

const topPages = computed(() => {
  const counts: Record<string, number> = {};
  for (const v of visits.value ?? []) counts[v.page] = (counts[v.page] ?? 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, count]) => ({ page, count }));
});

const topCountries = computed(() => {
  const counts: Record<string, { count: number; code: string }> = {};
  for (const v of visits.value ?? []) {
    if (!v.country) continue;
    if (!counts[v.country]) counts[v.country] = { count: 0, code: v.country_code ?? "" };
    counts[v.country].count++;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([country, { count, code }]) => ({ country, count, code }));
});

const topCities = computed(() => {
  const counts: Record<string, number> = {};
  for (const v of visits.value ?? []) {
    if (!v.city) continue;
    counts[v.city] = (counts[v.city] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count]) => ({ city, count }));
});

function flagEmoji(code: string) {
  if (!code || code.length !== 2) return "🌐";
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397)).join("");
}

function shortPage(page: string) {
  const clean = page.replace(/^\/en/, "").replace(/^\//, "") || "/";
  const labels: Record<string, string> = {
    "/": "Accueil", "": "Accueil", riads: "Nos Riads", services: "Services",
    gallery: "Galerie", contact: "Contact", boutique: "Boutique", carte: "Carte",
  };
  return labels[clean] ?? clean;
}

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

useSeoMeta({ title: "Analytiques – Admin" });
</script>
