<template>
  <div>
    <h1 class="text-2xl font-semibold text-stone-800 mb-6">
      {{ t("admin.newsletter") }}
    </h1>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Envoi newsletter -->
      <div class="card p-6">
        <h2 class="font-semibold text-stone-700 mb-4">Envoyer une newsletter</h2>
        <NewsletterEditor />
      </div>

      <!-- Liste des abonnés -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-stone-700">
            Abonnés
            <span class="ml-2 text-sm font-normal text-stone-400">({{ totalCount }})</span>
          </h2>
        </div>

        <div v-if="pending" class="text-stone-400 text-sm">Chargement...</div>

        <template v-else>
          <!-- Inscrits via popup/externe -->
          <div v-if="subscribers.length" class="mb-6">
            <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Via newsletter</p>
            <div class="divide-y divide-stone-100">
              <div
                v-for="s in subscribers"
                :key="s.email"
                class="py-2.5 flex items-center justify-between"
              >
                <span class="text-sm text-stone-700">{{ s.email }}</span>
                <span class="text-xs text-stone-400">{{ formatDate(s.subscribed_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Profils inscrits -->
          <div v-if="profileSubscribers.length">
            <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Clients inscrits</p>
            <div class="divide-y divide-stone-100">
              <div
                v-for="p in profileSubscribers"
                :key="p.email"
                class="py-2.5 flex items-center justify-between"
              >
                <div>
                  <span class="text-sm text-stone-700">{{ p.email }}</span>
                  <span v-if="p.full_name" class="text-xs text-stone-400 ml-2">{{ p.full_name }}</span>
                </div>
                <span class="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">compte</span>
              </div>
            </div>
          </div>

          <p v-if="!subscribers.length && !profileSubscribers.length" class="text-sm text-stone-400 text-center py-6">
            Aucun abonné pour l'instant.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const { t } = useI18n();
const supabase = useSupabaseClient() as any;

const { data, pending } = await useAsyncData("admin-newsletter-subscribers", async () => {
  const [{ data: subs }, { data: profiles }] = await Promise.all([
    supabase.from("newsletter_subscribers").select("email, subscribed_at").order("subscribed_at", { ascending: false }),
    supabase.from("profiles").select("email, full_name").eq("newsletter_subscribed", true).order("email"),
  ]);
  return { subscribers: subs ?? [], profileSubscribers: profiles ?? [] };
});

const subscribers = computed(() => data.value?.subscribers ?? []);
const profileSubscribers = computed(() => data.value?.profileSubscribers ?? []);
const totalCount = computed(() => subscribers.value.length + profileSubscribers.value.length);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

useSeoMeta({ title: t("admin.seo_newsletter_title") });
</script>
