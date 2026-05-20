<template>
  <div class="max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">FAQ</h1>
      <button class="btn-primary text-sm" @click="openAddCategory">
        + Catégorie
      </button>
    </div>

    <div v-if="loading" class="text-stone-400">{{ t("common.loading") }}</div>

    <div v-else class="space-y-6">
      <div v-if="categories.length === 0" class="card p-8 text-center text-stone-400 text-sm">
        Aucune catégorie. Commencez par en créer une.
      </div>

      <!-- Catégorie -->
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="card p-0 overflow-hidden"
      >
        <!-- Header catégorie -->
        <div class="flex items-center justify-between px-5 py-4 bg-stone-50 border-b border-stone-200">
          <div>
            <span class="font-semibold text-stone-800">{{ cat.name_fr }}</span>
            <span class="text-stone-400 text-sm ml-2">/ {{ cat.name_en }}</span>
            <span class="ml-3 text-xs text-stone-400 bg-stone-200 rounded-full px-2 py-0.5">
              {{ cat.items?.length ?? 0 }} question{{ (cat.items?.length ?? 0) > 1 ? 's' : '' }}
            </span>
          </div>
          <div class="flex gap-2">
            <button
              class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
              @click="openEditCategory(cat)"
            >
              {{ t("common.edit") }}
            </button>
            <button
              class="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              @click="confirmDeleteCategory(cat)"
            >
              {{ t("common.delete") }}
            </button>
          </div>
        </div>

        <!-- Liste des questions -->
        <div class="divide-y divide-stone-100">
          <div
            v-for="item in cat.items"
            :key="item.id"
            class="px-5 py-3 hover:bg-stone-50 flex items-start gap-3"
          >
            <span
              class="shrink-0 mt-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center"
              :class="item.active ? 'bg-green-100 text-green-600' : 'bg-stone-200 text-stone-400'"
              :title="item.active ? 'Visible' : 'Masquée'"
            >●</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-700 truncate">{{ item.question_fr }}</p>
              <p class="text-xs text-stone-400 truncate mt-0.5">{{ item.answer_fr }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                @click="openEditItem(item)"
              >
                {{ t("common.edit") }}
              </button>
              <button
                class="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                @click="confirmDeleteItem(item)"
              >
                {{ t("common.delete") }}
              </button>
            </div>
          </div>

          <div class="px-5 py-3">
            <button
              class="text-xs text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors"
              @click="openAddItem(cat.id)"
            >
              + Ajouter une question
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Catégorie -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="catModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="catModalOpen = false"
        >
          <div class="absolute inset-0 bg-black/40" @click="catModalOpen = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 class="font-semibold text-stone-800 mb-5">
              {{ editingCatId ? "Modifier la catégorie" : "Nouvelle catégorie" }}
            </h2>
            <form class="space-y-4" @submit.prevent="saveCategory">
              <div>
                <label class="admin-label">Nom (français)</label>
                <input v-model="catForm.name_fr" type="text" class="input-field" placeholder="Réservation & Séjour" required />
              </div>
              <div>
                <label class="admin-label">Nom (anglais)</label>
                <input v-model="catForm.name_en" type="text" class="input-field" placeholder="Booking & Stay" required />
              </div>
              <div>
                <label class="admin-label">Ordre d'affichage</label>
                <input v-model.number="catForm.sort_order" type="number" min="0" class="input-field" />
              </div>
              <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
              <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary flex-1" :disabled="saving">
                  {{ saving ? t("common.loading") : t("common.save") }}
                </button>
                <button type="button" class="btn-secondary flex-1" @click="catModalOpen = false">
                  {{ t("common.cancel") }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Question/Réponse -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="itemModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="itemModalOpen = false"
        >
          <div class="absolute inset-0 bg-black/40" @click="itemModalOpen = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 class="font-semibold text-stone-800 mb-5">
              {{ editingItemId ? "Modifier la question" : "Nouvelle question" }}
            </h2>
            <form class="space-y-4" @submit.prevent="saveItem">
              <div>
                <label class="admin-label">Catégorie</label>
                <select v-model="itemForm.category_id" class="input-field" required>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name_fr }}
                  </option>
                </select>
              </div>
              <div>
                <label class="admin-label">Question (français)</label>
                <input v-model="itemForm.question_fr" type="text" class="input-field" required />
              </div>
              <div>
                <label class="admin-label">Question (anglais)</label>
                <input v-model="itemForm.question_en" type="text" class="input-field" required />
              </div>
              <div>
                <label class="admin-label">Réponse (français)</label>
                <textarea v-model="itemForm.answer_fr" class="input-field min-h-[100px]" required />
              </div>
              <div>
                <label class="admin-label">Réponse (anglais)</label>
                <textarea v-model="itemForm.answer_en" class="input-field min-h-[100px]" required />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="admin-label">Ordre</label>
                  <input v-model.number="itemForm.sort_order" type="number" min="0" class="input-field" />
                </div>
                <div class="flex items-end pb-1">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="itemForm.active" type="checkbox" class="w-4 h-4 accent-terracotta-600" />
                    <span class="text-sm text-stone-700">Visible sur le site</span>
                  </label>
                </div>
              </div>
              <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
              <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary flex-1" :disabled="saving">
                  {{ saving ? t("common.loading") : t("common.save") }}
                </button>
                <button type="button" class="btn-secondary flex-1" @click="itemModalOpen = false">
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
      v-model="deleteCatModal"
      title="Supprimer cette catégorie ? Toutes les questions associées seront supprimées."
      :danger="true"
      @confirm="doDeleteCategory"
    />
    <UiConfirmModal
      v-model="deleteItemModal"
      title="Supprimer cette question ?"
      :danger="true"
      @confirm="doDeleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { FaqCategory, FaqItem } from "~/composables/useFaq";

definePageMeta({ layout: "admin", middleware: "admin" });
const { t } = useI18n();
const { fetchFaq, faqData, createCategory, updateCategory, deleteCategory, createItem, updateItem, deleteItem } = useFaq();

const loading = ref(true);
const saving = ref(false);
const saveError = ref("");

const categories = computed(() => faqData.value);

// --- Category modal ---
const catModalOpen = ref(false);
const editingCatId = ref<string | null>(null);
const deleteCatModal = ref(false);
const deletingCatId = ref<string | null>(null);
const catForm = reactive({ name_fr: "", name_en: "", sort_order: 0 });

function openAddCategory() {
  editingCatId.value = null;
  Object.assign(catForm, { name_fr: "", name_en: "", sort_order: categories.value.length + 1 });
  saveError.value = "";
  catModalOpen.value = true;
}

function openEditCategory(cat: FaqCategory) {
  editingCatId.value = cat.id;
  Object.assign(catForm, { name_fr: cat.name_fr, name_en: cat.name_en, sort_order: cat.sort_order });
  saveError.value = "";
  catModalOpen.value = true;
}

async function saveCategory() {
  saving.value = true;
  saveError.value = "";
  try {
    const { error } = editingCatId.value
      ? await updateCategory(editingCatId.value, catForm)
      : await createCategory({ ...catForm });
    if (error) throw error;
    catModalOpen.value = false;
    await fetchFaq(false);
  } catch (e: any) {
    saveError.value = e.message ?? "Erreur";
  } finally {
    saving.value = false;
  }
}

function confirmDeleteCategory(cat: FaqCategory) {
  deletingCatId.value = cat.id;
  deleteCatModal.value = true;
}

async function doDeleteCategory() {
  if (!deletingCatId.value) return;
  await deleteCategory(deletingCatId.value);
  deletingCatId.value = null;
  await fetchFaq(false);
}

// --- Item modal ---
const itemModalOpen = ref(false);
const editingItemId = ref<string | null>(null);
const deleteItemModal = ref(false);
const deletingItemId = ref<string | null>(null);
const itemForm = reactive({
  category_id: "",
  question_fr: "",
  question_en: "",
  answer_fr: "",
  answer_en: "",
  sort_order: 0,
  active: true,
});

function openAddItem(categoryId: string) {
  editingItemId.value = null;
  const cat = categories.value.find((c) => c.id === categoryId);
  Object.assign(itemForm, {
    category_id: categoryId,
    question_fr: "",
    question_en: "",
    answer_fr: "",
    answer_en: "",
    sort_order: (cat?.items?.length ?? 0) + 1,
    active: true,
  });
  saveError.value = "";
  itemModalOpen.value = true;
}

function openEditItem(item: FaqItem) {
  editingItemId.value = item.id;
  Object.assign(itemForm, {
    category_id: item.category_id,
    question_fr: item.question_fr,
    question_en: item.question_en,
    answer_fr: item.answer_fr,
    answer_en: item.answer_en,
    sort_order: item.sort_order,
    active: item.active,
  });
  saveError.value = "";
  itemModalOpen.value = true;
}

async function saveItem() {
  saving.value = true;
  saveError.value = "";
  try {
    const { error } = editingItemId.value
      ? await updateItem(editingItemId.value, itemForm)
      : await createItem({ ...itemForm });
    if (error) throw error;
    itemModalOpen.value = false;
    await fetchFaq(false);
  } catch (e: any) {
    saveError.value = e.message ?? "Erreur";
  } finally {
    saving.value = false;
  }
}

function confirmDeleteItem(item: FaqItem) {
  deletingItemId.value = item.id;
  deleteItemModal.value = true;
}

async function doDeleteItem() {
  if (!deletingItemId.value) return;
  await deleteItem(deletingItemId.value);
  deletingItemId.value = null;
  await fetchFaq(false);
}

onMounted(async () => {
  await fetchFaq(false);
  loading.value = false;
});
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
