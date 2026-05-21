<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">Équipements</h1>
      <button class="btn-primary text-sm" @click="openAdd">+ Ajouter</button>
    </div>

    <div v-if="loading" class="text-stone-400">{{ t("common.loading") }}</div>

    <div v-else class="card p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide border-b border-stone-200">
          <tr>
            <th class="px-4 py-3 text-left w-16">Ordre</th>
            <th class="px-4 py-3 text-left w-12">Emoji</th>
            <th class="px-4 py-3 text-left w-36">Slug</th>
            <th class="px-4 py-3 text-left">Nom (FR)</th>
            <th class="px-4 py-3 text-left">Nom (EN)</th>
            <th class="px-4 py-3 w-28"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr v-for="a in rows" :key="a.id" class="hover:bg-stone-50">
            <td class="px-4 py-3 text-stone-400">{{ a.sort_order }}</td>
            <td class="px-4 py-3 text-xl">{{ a.emoji }}</td>
            <td class="px-4 py-3 font-mono text-xs text-stone-500">{{ a.slug }}</td>
            <td class="px-4 py-3 font-medium">{{ a.name_fr }}</td>
            <td class="px-4 py-3 text-stone-500">{{ a.name_en }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2 justify-end">
                <button
                  class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                  @click="openEdit(a)"
                >
                  {{ t("common.edit") }}
                </button>
                <button
                  class="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  @click="confirmDelete(a)"
                >
                  {{ t("common.delete") }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-stone-400 text-sm">
              Aucun équipement. Ajoutez-en un ci-dessus.
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
              {{ editingId ? "Modifier l'équipement" : "Nouvel équipement" }}
            </h2>

            <form class="space-y-4" @submit.prevent="onSave">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="admin-label">Emoji</label>
                  <input
                    v-model="form.emoji"
                    type="text"
                    class="input-field"
                    placeholder="🏊"
                    required
                  />
                </div>
                <div>
                  <label class="admin-label">Ordre</label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
                    min="0"
                    class="input-field"
                  />
                </div>
              </div>

              <div>
                <label class="admin-label">Slug (identifiant unique)</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="input-field font-mono text-sm"
                  placeholder="piscine"
                  :disabled="!!editingId"
                  required
                />
                <p class="text-xs text-stone-400 mt-1">Minuscules, tirets autorisés. Non modifiable après création.</p>
              </div>

              <div>
                <label class="admin-label">Nom (français)</label>
                <input
                  v-model="form.name_fr"
                  type="text"
                  class="input-field"
                  placeholder="Piscine"
                  required
                />
              </div>

              <div>
                <label class="admin-label">Nom (anglais)</label>
                <input
                  v-model="form.name_en"
                  type="text"
                  class="input-field"
                  placeholder="Pool"
                  required
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
      title="Supprimer cet équipement ? Les riads qui l'utilisent devront être mis à jour manuellement."
      :danger="true"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { AmenityDef } from "~/composables/useAmenities";

definePageMeta({ layout: "admin", middleware: "admin" });
const { t } = useI18n();
const supabase = useSupabaseClient() as any;

const loading = ref(true);
const rows = ref<AmenityDef[]>([]);
const modalOpen = ref(false);
const deleteModal = ref(false);
const saving = ref(false);
const saveError = ref("");
const editingId = ref<string | null>(null);
const deletingId = ref<string | null>(null);

const form = reactive({
  slug: "",
  name_fr: "",
  name_en: "",
  emoji: "✓",
  sort_order: 0,
});

const fetchRows = async () => {
  loading.value = true;
  const { data } = await supabase
    .from("amenities")
    .select("*")
    .order("sort_order");
  rows.value = (data as any[] ?? []) as AmenityDef[];
  loading.value = false;
};

onMounted(fetchRows);

const openAdd = () => {
  editingId.value = null;
  Object.assign(form, { slug: "", name_fr: "", name_en: "", emoji: "✓", sort_order: rows.value.length + 1 });
  saveError.value = "";
  modalOpen.value = true;
};

const openEdit = (a: AmenityDef) => {
  editingId.value = a.id;
  Object.assign(form, { slug: a.slug, name_fr: a.name_fr, name_en: a.name_en, emoji: a.emoji, sort_order: a.sort_order });
  saveError.value = "";
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const onSave = async () => {
  saving.value = true;
  saveError.value = "";
  try {
    if (editingId.value) {
      const { error } = await supabase
        .from("amenities")
        .update({ name_fr: form.name_fr, name_en: form.name_en, emoji: form.emoji, sort_order: form.sort_order })
        .eq("id", editingId.value);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("amenities")
        .insert({ slug: form.slug, name_fr: form.name_fr, name_en: form.name_en, emoji: form.emoji, sort_order: form.sort_order });
      if (error) throw error;
    }
    closeModal();
    await fetchRows();
  } catch (e: any) {
    saveError.value = e.message ?? "Erreur";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (a: AmenityDef) => {
  deletingId.value = a.id;
  deleteModal.value = true;
};

const doDelete = async () => {
  if (!deletingId.value) return;
  await supabase.from("amenities").delete().eq("id", deletingId.value);
  deletingId.value = null;
  await fetchRows();
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
