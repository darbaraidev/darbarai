<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">
        {{ t("admin.services") }}
      </h1>
      <button class="btn-primary text-sm" @click="openNew">
        + {{ t("admin.service_add") }}
      </button>
    </div>

    <!-- Gestion des catégories -->
    <div class="card p-5 mb-8">
      <div
        class="flex items-center justify-between cursor-pointer"
        @click="showCatPanel = !showCatPanel"
      >
        <h2 class="font-semibold text-stone-700 text-sm">
          {{ t("admin.categories_title") }}
          <span class="ml-2 text-xs text-stone-400"
            >({{ allCategories.length }})</span
          >
        </h2>
        <span class="text-stone-400 text-xs">{{
          showCatPanel ? "▲" : "▼"
        }}</span>
      </div>

      <div v-if="showCatPanel" class="mt-4 space-y-2">
        <!-- Liste des catégories -->
        <div
          v-for="cat in allCategories"
          :key="cat.id"
          class="space-y-1.5 pb-3 border-b border-stone-100 last:border-0"
        >
          <div class="flex items-center gap-2">
            <input
              :value="cat.name"
              class="input flex-1 text-sm"
              :placeholder="t('admin.cat_name_fr')"
              @change="updateCat(cat, 'name', ($event.target as HTMLInputElement).value)"
            />
            <input
              :value="cat.name_en"
              class="input flex-1 text-sm"
              :placeholder="t('admin.cat_name_en')"
              @change="updateCat(cat, 'name_en', ($event.target as HTMLInputElement).value)"
            />
            <input
              :value="cat.sort_order"
              type="number"
              min="0"
              class="input w-16 text-sm"
              @change="updateCat(cat, 'sort_order', Number(($event.target as HTMLInputElement).value))"
            />
            <button
              class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors"
              @click="removeCat(cat.id)"
            >
              ✕
            </button>
          </div>
          <div class="flex items-center gap-2">
            <input
              :value="cat.description"
              class="input flex-1 text-sm"
              placeholder="Description (français)"
              @change="updateCat(cat, 'description', ($event.target as HTMLInputElement).value)"
            />
            <input
              :value="cat.description_en"
              class="input flex-1 text-sm"
              placeholder="Description (anglais)"
              @change="updateCat(cat, 'description_en', ($event.target as HTMLInputElement).value)"
            />
            <div class="w-16 shrink-0" />
            <div class="w-[3.25rem] shrink-0" />
          </div>
        </div>

        <!-- Nouvelle catégorie -->
        <div
          v-if="newCatForm.open"
          class="space-y-1.5 pt-1 border-t border-stone-100"
        >
          <div class="flex items-center gap-2">
            <input
              v-model="newCatForm.name"
              class="input flex-1 text-sm"
              :placeholder="t('admin.cat_name_fr')"
            />
            <input
              v-model="newCatForm.name_en"
              class="input flex-1 text-sm"
              :placeholder="t('admin.cat_name_en')"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="newCatForm.description"
              class="input flex-1 text-sm"
              placeholder="Description (français)"
            />
            <input
              v-model="newCatForm.description_en"
              class="input flex-1 text-sm"
              placeholder="Description (anglais)"
            />
          </div>
          <div class="flex gap-2">
            <button class="btn-primary text-xs px-3" @click="addCat">
              {{ t("common.save") }}
            </button>
            <button
              class="btn-secondary text-xs px-3"
              @click="newCatForm.open = false"
            >
              {{ t("common.cancel") }}
            </button>
          </div>
        </div>
        <div v-else>
          <button
            class="btn-secondary text-xs mt-1"
            @click="
              newCatForm.open = true;
              newCatForm.name = '';
              newCatForm.name_en = '';
            "
          >
            + {{ t("admin.cat_add") }}
          </button>
        </div>
        <p v-if="catError" class="text-xs text-red-500">{{ catError }}</p>
      </div>
    </div>

    <!-- Formulaire ajout / édition -->
    <div v-if="editing" class="card p-6 mb-8 border-l-4 border-terracotta-500">
      <h2 class="font-semibold text-stone-800 mb-5">
        {{ editingId ? t("admin.service_edit") : t("admin.service_add") }}
      </h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_name_fr")
          }}</label>
          <input v-model="form.name" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_name_en")
          }}</label>
          <input v-model="form.name_en" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_desc_fr")
          }}</label>
          <textarea v-model="form.description" rows="3" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_desc_en")
          }}</label>
          <textarea
            v-model="form.description_en"
            rows="3"
            class="input w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_category")
          }}</label>
          <select v-model="form.category" class="input w-full">
            <option
              v-for="cat in allCategories"
              :key="cat.slug"
              :value="cat.slug"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-2">{{ t("admin.service_riads") }}</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="opt in riadOptions"
              :key="opt.value"
              type="button"
              class="px-3 py-1.5 rounded-full text-sm border transition-colors"
              :class="selectedRiadKey === opt.value
                ? 'bg-terracotta-600 text-white border-terracotta-600'
                : 'border-stone-200 text-stone-600 hover:border-terracotta-300'"
              @click="applyRiadOption(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1"
            >{{ t("admin.service_icon") }} (emoji)</label
          >
          <input
            v-model="form.icon"
            class="input w-full"
            maxlength="4"
            placeholder="✈️"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_price")
          }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="priceEur"
              type="number"
              min="0"
              step="0.5"
              class="input w-32"
              :placeholder="t('admin.service_price_placeholder')"
            />
            <span class="text-stone-400 text-sm"
              >€ (0 = {{ t("services.on_request") }})</span
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_order")
          }}</label>
          <input
            v-model.number="form.sort_order"
            type="number"
            min="0"
            class="input w-24"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_details_fr")
          }}</label>
          <AdminRichTextEditor v-model="form.details" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_details_en")
          }}</label>
          <AdminRichTextEditor v-model="form.details_en" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{
            t("admin.service_photos")
          }}</label>
          <div class="space-y-2">
            <div v-for="(_, i) in form.photos" :key="i" class="flex gap-2">
              <input
                v-model="form.photos[i]"
                class="input flex-1 text-xs"
                placeholder="https://..."
              />
              <button
                class="btn-secondary text-xs px-3"
                @click="form.photos.splice(i, 1)"
              >
                ✕
              </button>
            </div>
            <button class="btn-secondary text-xs" @click="form.photos.push('')">
              + {{ t("admin.service_add_photo") }}
            </button>
            <button
              class="btn-secondary text-xs"
              :disabled="uploadingPhotos"
              @click="photoFileInput?.click()"
            >
              {{
                uploadingPhotos
                  ? t("common.loading")
                  : t("admin.service_upload_photo")
              }}
            </button>
            <input
              ref="photoFileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="hidden"
              @change="onPhotoUpload"
            />
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 mt-6">
        <button class="btn-primary text-sm" :disabled="saving" @click="save">
          {{ saving ? t("common.loading") : t("common.save") }}
        </button>
        <button class="btn-secondary text-sm" @click="cancelEdit">
          {{ t("common.cancel") }}
        </button>
        <span v-if="saveError" class="text-sm text-red-500">{{
          saveError
        }}</span>
      </div>
    </div>

    <!-- Liste des services -->
    <div class="space-y-3">
      <div
        v-for="service in allServices"
        :key="service.id"
        class="card p-4 flex items-center gap-4"
        :class="service.active ? '' : 'opacity-50'"
      >
        <span class="text-3xl w-10 text-center">{{
          service.icon ?? "✨"
        }}</span>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-stone-800 flex items-center gap-2 flex-wrap">
            {{ service.name }}
            <span class="text-xs font-mono text-stone-400">{{ service.slug }}</span>
            <span
              v-if="service.riad_slugs?.length === 1"
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="service.riad_slugs[0] === 'dar-barai' ? 'bg-terracotta-50 text-terracotta-700' : 'bg-blue-50 text-blue-700'"
            >
              {{ service.riad_slugs[0] === 'dar-barai' ? 'Dar Baraï' : 'Dar Tanawi' }}
            </span>
            <span
              class="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
            >
              {{
                allCategories.find((c) => c.slug === service.category)?.name ??
                service.category
              }}
            </span>
            <span
              v-if="!service.active"
              class="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-400"
            >
              {{ t("admin.service_inactive") }}
            </span>
          </div>
          <div class="text-sm text-stone-400 truncate">
            {{ service.description }}
          </div>
        </div>
        <div class="text-sm font-semibold text-terracotta-600 shrink-0">
          {{
            service.price_cents
              ? formatPrice(service.price_cents)
              : t("services.on_request")
          }}
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <!-- Toggle actif -->
          <button
            class="text-xs px-2 py-1 rounded border transition-colors"
            :class="
              service.active
                ? 'border-stone-200 text-stone-500 hover:border-red-300 hover:text-red-500'
                : 'border-olive-300 text-olive-600 hover:bg-olive-50'
            "
            @click="toggleActive(service)"
          >
            {{
              service.active
                ? t("admin.service_deactivate")
                : t("admin.service_activate")
            }}
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-500 hover:border-terracotta-300 hover:text-terracotta-600 transition-colors"
            @click="openEdit(service)"
          >
            {{ t("common.edit") }}
          </button>
          <button
            class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors"
            @click="remove(service.id)"
          >
            {{ t("common.delete") }}
          </button>
        </div>
      </div>

      <div v-if="!allServices.length" class="text-center py-16 text-stone-400">
        {{ t("services.empty") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service } from "~/types";
import type { ServiceCategoryRecord } from "~/composables/useServiceCategories";

definePageMeta({ layout: "admin", middleware: "admin" });

const { t } = useI18n();
const { fetchServices, createService, updateService, deleteService } =
  useServices();
const { fetchCategories, createCategory, updateCategory, deleteCategory } =
  useServiceCategories();
const { formatPrice } = useRiad();

// Catégories
const allCategories = ref<ServiceCategoryRecord[]>([]);
const showCatPanel = ref(false);
const catError = ref<string | null>(null);
const newCatForm = reactive({ open: false, name: "", name_en: "", description: "", description_en: "" });

const loadCategories = async () => {
  const { data } = await fetchCategories();
  allCategories.value = data;
};

const addCat = async () => {
  if (!newCatForm.name.trim()) return;
  const slug = newCatForm.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const { error } = await createCategory({
    slug,
    name: newCatForm.name.trim(),
    name_en: newCatForm.name_en.trim() || null,
    description: newCatForm.description.trim() || null,
    description_en: newCatForm.description_en.trim() || null,
    sort_order: allCategories.value.length,
  });
  if (error) {
    catError.value = error.message;
    return;
  }
  catError.value = null;
  newCatForm.open = false;
  await loadCategories();
};

const updateCat = async (
  cat: ServiceCategoryRecord,
  field: keyof ServiceCategoryRecord,
  value: string | number,
) => {
  const { error } = await updateCategory(cat.id, { [field]: value });
  if (error) {
    catError.value = error.message;
    return;
  }
  catError.value = null;
  await loadCategories();
};

const removeCat = async (id: string) => {
  if (!confirm(t("admin.cat_confirm_delete"))) return;
  const { error } = await deleteCategory(id);
  if (error) {
    catError.value = error.message;
    return;
  }
  await loadCategories();
};

const allServices = ref<Service[]>([]);

const loadServices = async () => {
  const { data } = await fetchServices(false);
  allServices.value = data;
};
await useAsyncData("admin-services", async () => {
  await Promise.all([loadServices(), loadCategories()]);
});

// Formulaire
const editing = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);

const riadOptions = [
  { value: "all", label: t("admin.service_riads_all") },
  { value: "dar-barai", label: "Dar Baraï uniquement" },
  { value: "dar-tanawi", label: "Dar Tanawi uniquement" },
];

const selectedRiadKey = ref<"all" | "dar-barai" | "dar-tanawi">("all");

const applyRiadOption = (val: "all" | "dar-barai" | "dar-tanawi") => {
  selectedRiadKey.value = val;
  (form as any).riad_slugs = val === "all" ? [] : [val];
};

const emptyForm = () => ({
  slug: "",
  name: "",
  name_en: null as string | null,
  description: null as string | null,
  description_en: null as string | null,
  details: null as string | null,
  details_en: null as string | null,
  photos: [] as string[],
  price_cents: null as number | null,
  icon: null as string | null,
  category: "other" as ServiceCategory,
  riad_slugs: [] as string[],
  active: true,
  sort_order: allServices.value.length,
});

const form = reactive(emptyForm());
const priceEur = ref(0);

watch(priceEur, (v) => {
  form.price_cents = v > 0 ? Math.round(v * 100) : null;
});

const openNew = () => {
  Object.assign(form, emptyForm());
  priceEur.value = 0;
  selectedRiadKey.value = "all";
  editingId.value = null;
  editing.value = true;
};

const openEdit = (service: Service) => {
  Object.assign(form, { ...service });
  priceEur.value = service.price_cents ? service.price_cents / 100 : 0;
  const slugs = service.riad_slugs ?? [];
  selectedRiadKey.value = slugs.length === 1 ? (slugs[0] as "dar-barai" | "dar-tanawi") : "all";
  editingId.value = service.id;
  editing.value = true;
  saveError.value = null;
};

const cancelEdit = () => {
  editing.value = false;
  editingId.value = null;
};

const save = async () => {
  saving.value = true;
  saveError.value = null;

  // Générer le slug depuis le nom si vide
  if (!form.slug) {
    form.slug = form.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const { id: _id, created_at: _ca, ...rest } = form as any;
  const payload = rest;
  let error;

  if (editingId.value) {
    ({ error } = await updateService(editingId.value, payload));
  } else {
    ({ error } = await createService(payload));
  }

  saving.value = false;
  if (error) {
    saveError.value = error.message;
  } else {
    editing.value = false;
    editingId.value = null;
    await loadServices();
  }
};

// Upload photo depuis le PC
const supabaseClient = useSupabaseClient();
const photoFileInput = ref<HTMLInputElement | null>(null);
const uploadingPhotos = ref(false);

const onPhotoUpload = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (!files.length) return;
  uploadingPhotos.value = true;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      saveError.value = "Type non autorisé (jpg, png, webp, gif uniquement)";
      continue;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "services");
      const data = await $fetch<{ url: string }>("/api/upload/image", { method: "POST", body: formData });
      form.photos.push(data.url);
    } catch (e: any) {
      saveError.value = e?.data?.statusMessage ?? "Erreur upload";
    }
  }
  uploadingPhotos.value = false;
  if (photoFileInput.value) photoFileInput.value.value = "";
};

const toggleActive = async (service: Service) => {
  await updateService(service.id, { active: !service.active });
  await loadServices();
};


const remove = async (id: string) => {
  if (!confirm(t("admin.service_confirm_delete"))) {
    return;
  }
  await deleteService(id);
  await loadServices();
};

useSeoMeta({ title: t("admin.services") + " – Admin" });
</script>
