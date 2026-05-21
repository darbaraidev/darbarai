<template>
  <div class="max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-stone-800">Codes promo</h1>
        <p class="text-sm text-stone-400 mt-0.5">Gérez les codes de réduction</p>
      </div>
      <button class="btn-primary text-sm" @click="openAdd">+ Nouveau code</button>
    </div>

    <!-- Codes newsletter automatiques -->
    <div class="card p-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="font-semibold text-stone-800">Codes newsletter automatiques</span>
            <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">Automatique</span>
          </div>
          <p class="text-sm text-stone-500 leading-relaxed mb-3">
            À chaque inscription à la newsletter, un code unique au format
            <span class="font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-xs">BIEN-XXXXXX</span>
            est généré automatiquement et envoyé par email.
            Il donne <strong class="text-stone-700">-10%</strong> sur la première réservation,
            est lié à l'adresse email de l'abonné et ne peut être utilisé qu'une seule fois.
          </p>
          <div class="flex gap-5 text-sm">
            <span class="text-stone-500">Codes générés : <strong class="text-stone-800">{{ nlTotal }}</strong></span>
            <span class="text-stone-500">Utilisés : <strong class="text-stone-800">{{ nlUsed }}</strong></span>
            <span v-if="nlTotal > 0" class="text-stone-400 text-xs self-center">
              ({{ Math.round(nlUsed / nlTotal * 100) }}% de taux d'utilisation)
            </span>
          </div>
        </div>
        <button
          class="shrink-0 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg font-medium transition-colors"
          :class="nlPromoEnabled
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'"
          :disabled="nlPromoLoading"
          @click="toggleNlPromo"
        >
          <span class="w-2 h-2 rounded-full" :class="nlPromoEnabled ? 'bg-green-500' : 'bg-stone-400'"></span>
          {{ nlPromoEnabled ? 'Actif' : 'Désactivé' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-stone-400 text-sm">{{ t("common.loading") }}</div>

    <div v-else class="card p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide border-b border-stone-200">
          <tr>
            <th class="px-4 py-3 text-left">Code</th>
            <th class="px-4 py-3 text-left">Type</th>
            <th class="px-4 py-3 text-left">Valeur</th>
            <th class="px-4 py-3 text-left">Validité</th>
            <th class="px-4 py-3 text-left">Utilisations</th>
            <th class="px-4 py-3 text-left">Statut</th>
            <th class="px-4 py-3 w-28"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr v-for="promo in rows" :key="promo.id" class="hover:bg-stone-50">
            <td class="px-4 py-3 font-mono font-semibold text-stone-800">{{ promo.code }}</td>
            <td class="px-4 py-3 text-stone-500">
              {{ promo.type === 'percentage' ? 'Pourcentage' : 'Montant fixe' }}
            </td>
            <td class="px-4 py-3 font-medium text-stone-800">
              {{ promo.type === 'percentage' ? `${promo.value}%` : formatPrice(promo.value) }}
            </td>
            <td class="px-4 py-3 text-stone-500 text-xs">
              <template v-if="promo.valid_from || promo.valid_until">
                <span v-if="promo.valid_from">Du {{ promo.valid_from }}</span>
                <span v-if="promo.valid_from && promo.valid_until"> au </span>
                <span v-else-if="!promo.valid_from && promo.valid_until">Jusqu'au </span>
                <span v-if="promo.valid_until">{{ promo.valid_until }}</span>
              </template>
              <span v-else class="text-stone-300">Illimitée</span>
            </td>
            <td class="px-4 py-3 text-stone-500">
              {{ promo.uses_count }}
              <span v-if="promo.max_uses !== null" class="text-stone-400"> / {{ promo.max_uses }}</span>
            </td>
            <td class="px-4 py-3">
              <button
                class="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium transition-colors"
                :class="promo.active
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'"
                @click="toggleActive(promo)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="promo.active ? 'bg-green-500' : 'bg-stone-400'"></span>
                {{ promo.active ? 'Actif' : 'Inactif' }}
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2 justify-end">
                <button
                  class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                  @click="openEdit(promo)"
                >
                  {{ t("common.edit") }}
                </button>
                <button
                  class="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  @click="confirmDelete(promo)"
                >
                  {{ t("common.delete") }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="7" class="px-4 py-10 text-center text-stone-400 text-sm">
              Aucun code promo. Créez-en un ci-dessus.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal add/edit -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="absolute inset-0 bg-black/40" @click="closeModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 class="font-semibold text-stone-800 mb-5">
              {{ editingId ? "Modifier le code" : "Nouveau code promo" }}
            </h2>

            <form class="space-y-4" @submit.prevent="onSave">
              <div>
                <label class="admin-label">Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="input-field font-mono uppercase"
                  placeholder="ETE2025"
                  :disabled="!!editingId"
                  required
                />
                <p class="text-xs text-stone-400 mt-1">Majuscules automatiques. Non modifiable après création.</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="admin-label">Type</label>
                  <select v-model="form.type" class="input-field" required>
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label class="admin-label">Valeur</label>
                  <div class="relative">
                    <input
                      v-model.number="form.value"
                      type="number"
                      min="1"
                      :max="form.type === 'percentage' ? 100 : undefined"
                      class="input-field pr-8"
                      required
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                      {{ form.type === 'percentage' ? '%' : '€' }}
                    </span>
                  </div>
                  <p v-if="form.type === 'fixed'" class="text-xs text-stone-400 mt-1">En centimes (ex : 5000 = 50 €)</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="admin-label">Valide à partir du</label>
                  <input v-model="form.valid_from" type="date" class="input-field" />
                </div>
                <div>
                  <label class="admin-label">Valide jusqu'au</label>
                  <input v-model="form.valid_until" type="date" class="input-field" />
                </div>
              </div>

              <div>
                <label class="admin-label">Nombre d'utilisations max</label>
                <input
                  v-model.number="form.max_uses"
                  type="number"
                  min="1"
                  class="input-field"
                  placeholder="Illimité"
                />
              </div>

              <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>

              <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary flex-1" :disabled="saving">
                  {{ saving ? t("common.loading") : t("common.save") }}
                </button>
                <button type="button" class="btn-secondary flex-1" @click="closeModal">
                  {{ t("common.cancel") }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm delete -->
    <UiConfirmModal
      v-model="deleteModal"
      title="Supprimer ce code promo ?"
      :danger="true"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });
const { t } = useI18n();
const { formatPrice } = useRiad();
const supabase = useSupabaseClient();
const { fetchNewsletterPromoEnabled, setNewsletterPromoEnabled } = useSiteSettings();

type PromoCode = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
};

const loading = ref(true);
const rows = ref<PromoCode[]>([]);
const nlTotal = ref(0);
const nlUsed = ref(0);
const nlPromoEnabled = ref(true);
const nlPromoLoading = ref(false);
const modalOpen = ref(false);
const deleteModal = ref(false);
const saving = ref(false);
const saveError = ref("");
const editingId = ref<string | null>(null);
const deletingId = ref<string | null>(null);

const form = reactive({
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: 10,
  valid_from: "",
  valid_until: "",
  max_uses: null as number | null,
});

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.expires_at && session.expires_at * 1000 < Date.now() + 60_000) {
    const { data } = await supabase.auth.refreshSession();
    return data.session?.access_token ?? "";
  }
  return session?.access_token ?? "";
}

const fetchRows = async () => {
  loading.value = true;
  const token = await getToken();
  try {
    const data = await $fetch<PromoCode[]>("/api/admin/promo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    rows.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

async function fetchNlData() {
  const [{ data: nlData }, enabled] = await Promise.all([
    (supabase as any).from("newsletter_subscribers").select("promo_used"),
    fetchNewsletterPromoEnabled(),
  ]);
  nlTotal.value = nlData?.length ?? 0;
  nlUsed.value = nlData?.filter((s: any) => s.promo_used).length ?? 0;
  nlPromoEnabled.value = enabled;
}

async function toggleNlPromo() {
  nlPromoLoading.value = true;
  const { error } = await setNewsletterPromoEnabled(!nlPromoEnabled.value);
  if (!error) nlPromoEnabled.value = !nlPromoEnabled.value;
  nlPromoLoading.value = false;
}

onMounted(() => {
  fetchRows();
  fetchNlData();
});

const openAdd = () => {
  editingId.value = null;
  Object.assign(form, { code: "", type: "percentage", value: 10, valid_from: "", valid_until: "", max_uses: null });
  saveError.value = "";
  modalOpen.value = true;
};

const openEdit = (p: PromoCode) => {
  editingId.value = p.id;
  Object.assign(form, {
    code: p.code,
    type: p.type,
    value: p.value,
    valid_from: p.valid_from ?? "",
    valid_until: p.valid_until ?? "",
    max_uses: p.max_uses,
  });
  saveError.value = "";
  modalOpen.value = true;
};

const closeModal = () => { modalOpen.value = false; };

const onSave = async () => {
  saving.value = true;
  saveError.value = "";
  const token = await getToken();
  try {
    const body = {
      code: form.code,
      type: form.type,
      value: form.value,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      max_uses: form.max_uses || null,
    };
    if (editingId.value) {
      await $fetch(`/api/admin/promo/${editingId.value}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
    } else {
      await $fetch("/api/admin/promo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
    }
    closeModal();
    await fetchRows();
  } catch (e: any) {
    saveError.value = e.data?.statusMessage ?? e.message ?? "Erreur";
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (promo: PromoCode) => {
  const token = await getToken();
  try {
    await $fetch(`/api/admin/promo/${promo.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: { active: !promo.active },
    });
    promo.active = !promo.active;
  } catch (e) {
    console.error(e);
  }
};

const confirmDelete = (p: PromoCode) => {
  deletingId.value = p.id;
  deleteModal.value = true;
};

const doDelete = async () => {
  if (!deletingId.value) return;
  const token = await getToken();
  try {
    await $fetch(`/api/admin/promo/${deletingId.value}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    deletingId.value = null;
    await fetchRows();
  } catch (e) {
    console.error(e);
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
