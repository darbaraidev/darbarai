<template>
  <div>
    <h1 class="text-2xl font-semibold text-stone-800 mb-6">
      {{ t("admin.clients") }}
    </h1>

    <input
      v-model="search"
      type="search"
      placeholder="Rechercher par nom ou email..."
      class="input-field mb-4 w-full max-w-sm"
    />

    <div class="card p-0 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-100 text-xs font-medium text-stone-500 uppercase tracking-wide">
            <th class="text-left px-6 py-3">Nom</th>
            <th class="text-left px-6 py-3">Email</th>
            <th class="text-left px-6 py-3">Téléphone</th>
            <th class="text-left px-6 py-3">Réservations</th>
            <th class="text-left px-6 py-3">Inscrit le</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredClients.length">
            <td colspan="6" class="px-6 py-10 text-center text-stone-400">
              {{ search ? "Aucun résultat." : "Aucun client pour le moment." }}
            </td>
          </tr>
          <tr
            v-for="client in filteredClients"
            :key="client.id"
            class="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
          >
            <td class="px-6 py-4">
              <span class="font-medium text-stone-800">{{ client.full_name || "—" }}</span>
              <span v-if="client.id === user?.id" class="ml-2 text-xs bg-stone-100 text-stone-500 rounded-full px-2 py-0.5">vous</span>
              <span v-else-if="client.role === 'admin'" class="ml-2 text-xs bg-terracotta-100 text-terracotta-700 rounded-full px-2 py-0.5">admin</span>
            </td>
            <td class="px-6 py-4 text-stone-600">{{ client.email }}</td>
            <td class="px-6 py-4 text-stone-500">{{ client.phone || "—" }}</td>
            <td class="px-6 py-4 text-stone-500">{{ client.reservation_count ?? 0 }}</td>
            <td class="px-6 py-4 text-stone-400">{{ formatDate(client.created_at) }}</td>
            <td class="px-6 py-4 text-right">
              <button
                v-if="client.id !== user?.id && client.role !== 'admin'"
                class="text-xs text-red-400 hover:text-red-600 transition-colors"
                @click="confirmDelete(client)"
              >
                {{ t("common.delete") }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmation -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="toDelete"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          @click.self="toDelete = null"
        >
          <div class="bg-white w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl">
            <!-- Icône + titre -->
            <div class="p-6 pb-0 flex gap-4 items-start">
              <div class="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 class="font-semibold text-stone-900 text-base">Supprimer ce compte ?</h2>
                <p class="text-sm text-stone-500 mt-1 leading-relaxed">
                  Le compte de <span class="font-medium text-stone-700">{{ toDelete.full_name || toDelete.email }}</span> sera définitivement supprimé, ainsi que toutes ses réservations.
                </p>
              </div>
            </div>

            <!-- Erreur -->
            <div v-if="deleteError" class="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
              {{ deleteError }}
            </div>

            <!-- Actions -->
            <div class="p-6 flex flex-col-reverse sm:flex-row gap-3 mt-2">
              <button
                class="flex-1 rounded-xl border border-stone-200 bg-white py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                @click="toDelete = null"
              >
                Annuler
              </button>
              <button
                class="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="deleteLoading"
                @click="deleteClient"
              >
                {{ deleteLoading ? "Suppression..." : "Supprimer définitivement" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { t } = useI18n();

const { data: clients, refresh } = await useAsyncData("admin:clients", async () => {
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (!profiles?.length) return [];

  const { data: counts } = await (supabase as any)
    .from("reservations")
    .select("user_id")
    .in("user_id", profiles.map((p: any) => p.id));

  const countMap: Record<string, number> = {};
  for (const r of counts ?? []) {
    countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1;
  }

  return profiles.map((p: any) => ({ ...p, reservation_count: countMap[p.id] ?? 0 }));
});

const search = ref("");
const filteredClients = computed(() => {
  if (!search.value.trim()) return clients.value ?? [];
  const q = search.value.toLowerCase();
  return (clients.value ?? []).filter(
    (c: any) => c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
  );
});

const toDelete = ref<any>(null);
const deleteLoading = ref(false);
const deleteError = ref<string | null>(null);

const confirmDelete = (client: any) => {
  deleteError.value = null;
  toDelete.value = client;
};

const deleteClient = async () => {
  if (!toDelete.value) return;
  deleteLoading.value = true;
  deleteError.value = null;
  try {
    await $fetch(`/api/admin/users/${toDelete.value.id}`, { method: "DELETE" });
    toDelete.value = null;
    await refresh();
  } catch (err: any) {
    deleteError.value = err?.data?.statusMessage ?? t("errors.generic");
  } finally {
    deleteLoading.value = false;
  }
};

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(d),
  );

useSeoMeta({ title: `${t("admin.clients")} – Admin` });
</script>
