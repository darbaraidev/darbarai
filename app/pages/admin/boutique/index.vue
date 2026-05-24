<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">{{ t("admin.boutique") }}</h1>
      <button class="btn-primary text-sm" @click="openNew">
        + {{ t("admin.product_add") }}
      </button>
    </div>

    <!-- Formulaire ajout / édition -->
    <div v-if="editing" class="card p-6 mb-8 border-l-4 border-terracotta-500">
      <h2 class="font-semibold text-stone-800 mb-5">
        {{ editingId ? t("admin.product_edit") : t("admin.product_add") }}
      </h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_name_fr") }}</label>
          <input v-model="form.name" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_name_en") }}</label>
          <input v-model="form.name_en" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_desc_fr") }}</label>
          <textarea v-model="form.description" rows="3" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_desc_en") }}</label>
          <textarea v-model="form.description_en" rows="3" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_price") }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="priceEur"
              type="number"
              min="0"
              step="0.5"
              class="input w-32"
              placeholder="0"
            />
            <span class="text-stone-400 text-sm">€ (0 = {{ t("boutique.on_request") }})</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_order") }}</label>
          <input v-model.number="form.sort_order" type="number" min="0" class="input w-24" />
        </div>

        <!-- Tailles -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_sizes") }}</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <div
              v-for="(size, i) in form.sizes"
              :key="i"
              class="flex items-center gap-1 bg-stone-100 rounded-full px-3 py-1 text-sm"
            >
              <input
                v-model="form.sizes[i]"
                class="bg-transparent outline-none w-16 text-stone-700"
                :placeholder="t('admin.product_size_placeholder')"
              />
              <button class="text-stone-400 hover:text-red-500 transition-colors" @click="form.sizes.splice(i, 1)">✕</button>
            </div>
            <button class="btn-secondary text-xs px-3" @click="form.sizes.push('')">
              + {{ t("admin.product_size_add") }}
            </button>
          </div>
        </div>

        <!-- Photos -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.product_images") }}</label>
          <div class="space-y-2">
            <div v-for="(_, i) in form.images" :key="i" class="flex gap-2 items-center">
              <img
                v-if="form.images[i]"
                :src="form.images[i]"
                class="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
              />
              <input v-model="form.images[i]" class="input flex-1 text-xs" placeholder="https://..." />
              <button class="btn-secondary text-xs px-3" @click="form.images.splice(i, 1)">✕</button>
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary text-xs" @click="form.images.push('')">
                + {{ t("admin.product_add_photo") }}
              </button>
              <button
                class="btn-secondary text-xs"
                :disabled="uploadingPhotos"
                @click="photoFileInput?.click()"
              >
                {{ uploadingPhotos ? t("common.loading") : t("admin.product_upload_photo") }}
              </button>
              <input
                ref="photoFileInput"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="onPhotoUpload"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-6">
        <button class="btn-primary text-sm" :disabled="saving" @click="save">
          {{ saving ? t("common.loading") : t("common.save") }}
        </button>
        <button class="btn-secondary text-sm" @click="cancelEdit">{{ t("common.cancel") }}</button>
        <span v-if="saveError" class="text-sm text-red-500">{{ saveError }}</span>
      </div>
    </div>

    <!-- Liste des produits -->
    <div class="space-y-3">
      <div
        v-for="product in allProducts"
        :key="product.id"
        class="card p-4 flex items-center gap-4"
        :class="product.active ? '' : 'opacity-50'"
      >
        <!-- Miniature -->
        <div class="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
          <img
            v-if="product.images.length"
            :src="product.images[0]"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-stone-300">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="font-medium text-stone-800 flex items-center gap-2 flex-wrap">
            {{ product.name }}
            <span v-if="!product.active" class="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-400">
              {{ t("admin.product_inactive") }}
            </span>
          </div>
          <div class="text-sm text-stone-400 truncate">{{ product.description }}</div>
          <div v-if="product.sizes.length" class="flex flex-wrap gap-1 mt-1">
            <span
              v-for="size in product.sizes"
              :key="size"
              class="text-xs px-1.5 py-0.5 bg-stone-100 rounded text-stone-500"
            >{{ size }}</span>
          </div>
        </div>

        <div class="text-sm font-semibold text-terracotta-600 shrink-0">
          {{ formatProductPrice(product.price_cents) ?? t("boutique.on_request") }}
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            class="text-xs px-2 py-1 rounded border transition-colors"
            :class="product.active
              ? 'border-stone-200 text-stone-500 hover:border-red-300 hover:text-red-500'
              : 'border-olive-300 text-olive-600 hover:bg-olive-50'"
            @click="toggleActive(product)"
          >
            {{ product.active ? t("admin.product_deactivate") : t("admin.product_activate") }}
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-500 hover:border-terracotta-300 hover:text-terracotta-600 transition-colors"
            @click="openEdit(product)"
          >
            {{ t("common.edit") }}
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors"
            @click="remove(product.id)"
          >
            {{ t("common.delete") }}
          </button>
        </div>
      </div>

      <div v-if="!allProducts.length" class="text-center py-16 text-stone-400">
        {{ t("boutique.empty") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";

definePageMeta({ layout: "admin", middleware: "admin" });

const { t } = useI18n();
const { fetchProducts, createProduct, updateProduct, deleteProduct, formatProductPrice } = useProducts();
const supabaseClient = useSupabaseClient();

const allProducts = ref<Product[]>([]);

const loadProducts = async () => {
  const { data } = await fetchProducts(false);
  allProducts.value = data;
};

await useAsyncData("admin-boutique", () => loadProducts());

// Formulaire
const editing = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);
const priceEur = ref(0);

const emptyForm = (): Omit<Product, "id" | "created_at"> => ({
  name: "",
  name_en: null,
  description: null,
  description_en: null,
  price_cents: null,
  sizes: [],
  images: [],
  active: true,
  sort_order: allProducts.value.length,
});

const form = reactive<Omit<Product, "id" | "created_at">>(emptyForm());

watch(priceEur, (v) => {
  form.price_cents = v > 0 ? Math.round(v * 100) : null;
});

const openNew = () => {
  Object.assign(form, emptyForm());
  priceEur.value = 0;
  editingId.value = null;
  editing.value = true;
  saveError.value = null;
};

const openEdit = (product: Product) => {
  Object.assign(form, {
    ...product,
    sizes: [...product.sizes],
    images: [...product.images],
  });
  priceEur.value = product.price_cents ? product.price_cents / 100 : 0;
  editingId.value = product.id;
  editing.value = true;
  saveError.value = null;
};

const cancelEdit = () => {
  editing.value = false;
  editingId.value = null;
};

const save = async () => {
  if (!form.name.trim()) {
    saveError.value = "Le nom est requis.";
    return;
  }
  saving.value = true;
  saveError.value = null;

  const payload = {
    ...form,
    sizes: form.sizes.filter((s) => s.trim()),
    images: form.images.filter((u) => u.trim()),
    name_en: form.name_en?.trim() || null,
    description: form.description?.trim() || null,
    description_en: form.description_en?.trim() || null,
  };

  let error;
  if (editingId.value) {
    ({ error } = await updateProduct(editingId.value, payload));
  } else {
    ({ error } = await createProduct(payload));
  }

  saving.value = false;
  if (error) {
    saveError.value = (error as any).message;
  } else {
    editing.value = false;
    editingId.value = null;
    await loadProducts();
  }
};

// Upload photo
const photoFileInput = ref<HTMLInputElement | null>(null);
const uploadingPhotos = ref(false);

const onPhotoUpload = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (!files.length) return;
  uploadingPhotos.value = true;
  const { data: { session } } = await supabaseClient.auth.getSession();
  const token = session?.access_token ?? "";
  for (const file of files) {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "products");
    try {
      const res = await $fetch<{ url: string }>("/api/upload/image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      });
      form.images.push(res.url);
    } catch (err: any) {
      saveError.value = err?.data?.statusMessage ?? err.message;
    }
  }
  uploadingPhotos.value = false;
  if (photoFileInput.value) photoFileInput.value.value = "";
};

const toggleActive = async (product: Product) => {
  await updateProduct(product.id, { active: !product.active });
  await loadProducts();
};

const remove = async (id: string) => {
  if (!confirm(t("admin.product_confirm_delete"))) return;
  await deleteProduct(id);
  await loadProducts();
};

useSeoMeta({ title: t("admin.boutique") + " – Admin" });
</script>
