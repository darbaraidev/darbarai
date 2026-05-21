<template>
  <div class="max-w-2xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">Visibilité des pages</h1>
      <p class="text-sm text-stone-400 mt-0.5">Activer ou désactiver l'accès aux pages publiques du site. Une page désactivée redirige vers l'accueil.</p>
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

    <!-- Migration images Cloudinary -->
    <div class="card p-6">
      <h2 class="font-semibold text-stone-800 mb-1">Migration images → Cloudinary</h2>
      <p class="text-sm text-stone-400 mb-4">
        Transfère toutes les images encore hébergées sur Supabase Storage vers Cloudinary.
        À lancer une seule fois. Sans effet si déjà migré.
      </p>
      <div v-if="migrateLog.length" class="bg-stone-50 rounded-lg p-3 mb-4 text-xs text-stone-500 font-mono max-h-40 overflow-y-auto space-y-0.5">
        <p v-for="(line, i) in migrateLog" :key="i">{{ line }}</p>
      </div>
      <div v-if="migrateDone && migrateLog.length === 0" class="text-sm text-emerald-600 mb-4">
        ✓ Aucune image à migrer — tout est déjà sur Cloudinary.
      </div>
      <button
        class="btn-primary text-sm"
        :disabled="migrating"
        @click="runMigration"
      >
        {{ migrating ? 'Migration en cours…' : 'Lancer la migration' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const { fetchPageSettings, setPageEnabled } = useSiteSettings();
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

const migrating = ref(false);
const migrateDone = ref(false);
const migrateLog = ref<string[]>([]);

onMounted(async () => {
  const data = await fetchPageSettings();
  Object.assign(states.value, data);
  loading.value = false;
});

async function toggle(key: string) {
  saving.value = key;
  const next = !states.value[key];
  const { error } = await setPageEnabled(key, next);
  if (!error) states.value[key] = next;
  saving.value = null;
}

async function runMigration() {
  migrating.value = true;
  migrateDone.value = false;
  migrateLog.value = [];
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const result = await $fetch<{ migrated: number; log: string[] }>("/api/admin/migrate-images", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    migrateLog.value = result.log;
    migrateDone.value = true;
  } catch (e: any) {
    migrateLog.value = [`Erreur : ${e?.data?.statusMessage ?? e.message}`];
  } finally {
    migrating.value = false;
  }
}

useSeoMeta({ title: "Visibilité des pages – Admin" });
</script>
