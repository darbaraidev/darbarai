<template>
  <div class="max-w-2xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">Visibilité des pages</h1>
      <p class="text-sm text-stone-400 mt-0.5">Activer ou désactiver l'accès aux pages publiques du site. Une page désactivée redirige vers l'accueil.</p>
    </div>

    <!-- Mode maintenance -->
    <div
      class="rounded-2xl border-2 mb-6 p-5 transition-colors"
      :class="maintenanceOn ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white'"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p class="font-semibold text-stone-800">Mode maintenance</p>
            <span v-if="maintenanceOn" class="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium">Actif</span>
          </div>
          <p class="text-sm text-stone-500 leading-relaxed">
            Affiche une page de maintenance aux visiteurs. <strong>Les admins voient le site normalement.</strong>
          </p>
        </div>
        <button
          class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5"
          :class="maintenanceOn ? 'bg-amber-500' : 'bg-stone-300'"
          :disabled="savingMaintenance"
          @click="toggleMaintenance"
        >
          <span
            class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200"
            :class="maintenanceOn ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
      <div v-if="maintenanceOn" class="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        Le site est actuellement en maintenance — seuls les admins peuvent y accéder.
      </div>
    </div>

    <div class="card divide-y divide-stone-100 mb-6">
      <div v-for="page in pages" :key="page.key" class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-medium text-stone-800">{{ page.label }}</p>
          <p class="text-sm text-stone-400 mt-0.5">{{ page.path }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium" :class="states[page.key] ? 'text-emerald-600' : 'text-red-500'">
            {{ saving === page.key ? '...' : states[page.key] ? 'Visible' : 'Masquée' }}
          </span>
          <button
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="states[page.key] ? 'bg-emerald-500' : 'bg-stone-300'"
            :disabled="saving === page.key || loading"
            @click="toggle(page.key)"
          >
            <span
              class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200"
              :class="states[page.key] ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Paiements en ligne -->
    <div
      class="rounded-2xl border-2 mb-6 p-5 transition-colors"
      :class="!paymentsOn ? 'border-red-200 bg-red-50' : 'border-stone-200 bg-white'"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-stone-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            <p class="font-semibold text-stone-800">Paiements en ligne (Stripe)</p>
            <span v-if="!paymentsOn" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Désactivé</span>
          </div>
          <p class="text-sm text-stone-500 leading-relaxed">
            Désactiver pour forcer les clients à passer par contact uniquement (WhatsApp / email).
          </p>
        </div>
        <button
          class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5"
          :class="paymentsOn ? 'bg-emerald-500' : 'bg-stone-300'"
          :disabled="savingPayments"
          @click="togglePayments"
        >
          <span
            class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200"
            :class="paymentsOn ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
      <div v-if="!paymentsOn" class="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-100 rounded-lg px-3 py-2">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        Les paiements CB sont désactivés — les clients ne peuvent réserver que par contact.
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const { fetchPageSettings, setPageEnabled, fetchPaymentsEnabled, setPaymentsEnabled, fetchMaintenanceMode, setMaintenanceMode } = useSiteSettings();
const supabase = useSupabaseClient();

const pages = [
  { key: "boutique", label: "Boutique", path: "/boutique" },
  { key: "gallery", label: "Galerie", path: "/gallery" },
  { key: "services", label: "Nos Services", path: "/services" },
  { key: "contact", label: "Contact", path: "/contact" },
];

const loading = ref(true);
const saving = ref<string | null>(null);
const states = ref<Record<string, boolean>>({
  boutique: true, gallery: true, services: true, contact: true,
});

const maintenanceOn = ref(false);
const savingMaintenance = ref(false);
const paymentsOn = ref(true);
const savingPayments = ref(false);


onMounted(async () => {
  const [pageData, maintenance, payments] = await Promise.all([fetchPageSettings(), fetchMaintenanceMode(), fetchPaymentsEnabled()]);
  Object.assign(states.value, pageData);
  maintenanceOn.value = maintenance;
  paymentsOn.value = payments;
  loading.value = false;
});

async function togglePayments() {
  savingPayments.value = true;
  const next = !paymentsOn.value;
  const { error } = await setPaymentsEnabled(next);
  if (!error) paymentsOn.value = next;
  savingPayments.value = false;
}

async function toggleMaintenance() {
  savingMaintenance.value = true;
  const next = !maintenanceOn.value;
  const { error } = await setMaintenanceMode(next);
  if (!error) maintenanceOn.value = next;
  savingMaintenance.value = false;
}

async function toggle(key: string) {
  saving.value = key;
  const next = !states.value[key];
  const { error } = await setPageEnabled(key, next);
  if (!error) states.value[key] = next;
  saving.value = null;
}


useSeoMeta({ title: "Visibilité des pages – Admin" });
</script>
