<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-stone-800">{{ t("admin.carte") }}</h1>
      <button class="btn-primary text-sm" @click="openNew">+ {{ t("admin.place_add") }}</button>
    </div>

    <!-- Password section -->
    <div class="card p-5 mb-8">
      <h2 class="font-semibold text-stone-800 mb-3">{{ t("admin.map_password") }}</h2>
      <div class="flex items-center gap-3">
        <input
          v-model="newPassword"
          type="text"
          class="input w-56"
          :placeholder="t('admin.map_password_placeholder')"
        />
        <button class="btn-secondary text-sm" :disabled="savingPassword" @click="savePassword">
          {{ savingPassword ? t("common.loading") : t("common.save") }}
        </button>
        <span v-if="passwordSaved" class="text-sm text-olive-600">{{ t("admin.map_password_saved") }}</span>
      </div>
      <p class="text-xs text-stone-400 mt-2">{{ t("admin.map_password_hint") }}</p>
    </div>

    <!-- Form add / edit -->
    <div v-if="editing && !editingId" class="card p-6 mb-8 border-l-4 border-terracotta-500">
      <h2 class="font-semibold text-stone-800 mb-5">
        {{ t("admin.place_add") }}
      </h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_name") }}</label>
          <input v-model="form.name" class="input w-full" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_description") }}</label>
          <textarea v-model="form.description" rows="2" class="input w-full" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_address") }}</label>
          <input v-model="form.address" class="input w-full" placeholder="386 Rue de la Kasbah, Marrakech 40000, Maroc" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_lat") }}</label>
          <input v-model.number="form.lat" type="number" step="0.00001" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_lng") }}</label>
          <input v-model.number="form.lng" type="number" step="0.00001" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_maps_url") }}</label>
          <input v-model="form.maps_url" class="input w-full" placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_website_url") }}</label>
          <input v-model="form.website_url" class="input w-full" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_price_level") }}</label>
          <div class="flex gap-2">
            <button
              v-for="level in priceLevels"
              :key="level.value ?? 'none'"
              class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
              :class="form.price_level === level.value
                ? 'bg-stone-800 text-white border-stone-800'
                : 'border-stone-200 text-stone-600 hover:border-stone-400'"
              @click="form.price_level = level.value"
            >
              {{ level.label }}
            </button>
          </div>
        </div>

        <!-- Photo principale -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_photo_main") }}</label>
          <div class="flex items-start gap-3">
            <img
              v-if="form.photo_main"
              :src="form.photo_main"
              class="w-20 h-20 object-cover rounded-lg border border-stone-200 shrink-0"
            />
            <div class="flex-1">
              <!-- Zone de collage principale -->
              <div
                tabindex="0"
                class="border-2 border-dashed border-stone-200 rounded-lg px-4 py-3 text-xs text-stone-400 text-center mb-2 cursor-pointer focus:border-terracotta-400 focus:outline-none hover:border-stone-300 transition-colors"
                :class="uploadingMain ? 'opacity-50 pointer-events-none' : ''"
                @paste="onPasteMain"
                @click="mainPhotoInput?.click()"
              >
                {{ uploadingMain ? t("common.loading") : "📋 Coller une image (Ctrl+V) ou cliquer pour importer" }}
              </div>
              <input v-model="form.photo_main" class="input w-full text-xs mb-2" placeholder="Ou coller une URL..." />
              <button
                v-if="form.photo_main"
                class="btn-secondary text-xs text-red-500 hover:text-red-700"
                @click="form.photo_main = null"
              >
                {{ t("common.delete") }}
              </button>
              <input
                ref="mainPhotoInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="onMainPhotoUpload"
              />
            </div>
          </div>
        </div>

        <!-- Photos secondaires -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_photos") }}</label>
          <div class="space-y-2">
            <div v-for="(_, i) in form.photos" :key="i" class="flex gap-2 items-center">
              <img
                v-if="form.photos[i]"
                :src="form.photos[i]"
                class="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
              />
              <input
                v-model="form.photos[i]"
                class="input flex-1 text-xs"
                placeholder="URL..."
                @paste="onPasteSecondary($event, i)"
              />
              <button class="btn-secondary text-xs px-3" @click="form.photos.splice(i, 1)">✕</button>
            </div>
            <!-- Zone de collage secondaire -->
            <div
              tabindex="0"
              class="border-2 border-dashed border-stone-200 rounded-lg px-4 py-3 text-xs text-stone-400 text-center cursor-pointer focus:border-terracotta-400 focus:outline-none hover:border-stone-300 transition-colors"
              :class="uploadingPhotos ? 'opacity-50 pointer-events-none' : ''"
              @paste="onPasteSecondaryZone"
              @click="photosInput?.click()"
            >
              {{ uploadingPhotos ? t("common.loading") : "📋 Coller une image (Ctrl+V) ou cliquer pour importer plusieurs" }}
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary text-xs" @click="form.photos.push('')">
                + {{ t("admin.product_add_photo") }}
              </button>
              <button
                class="btn-secondary text-xs"
                :disabled="uploadingPhotos"
                @click="photosInput?.click()"
              >
                {{ uploadingPhotos ? t("common.loading") : t("admin.product_upload_photo") }}
              </button>
              <input
                ref="photosInput"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="onPhotosUpload"
              />
            </div>
          </div>
        </div>

        <!-- Points forts -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-2">{{ t("admin.place_highlights") }}</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="h in PLACE_HIGHLIGHTS"
              :key="h.slug"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1"
              :class="form.highlights.includes(h.slug)
                ? 'bg-stone-800 text-white border-stone-800'
                : 'border-stone-200 text-stone-600 hover:border-stone-400'"
              @click="toggleHighlight(h.slug)"
            >
              <span>{{ h.icon }}</span>
              <span>{{ h.labelFr }}</span>
            </button>
          </div>
        </div>

        <!-- Categories -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-stone-600 mb-2">{{ t("admin.place_categories") }}</label>
          <div class="space-y-2">
            <div v-for="group in MAP_CATEGORY_GROUPS" :key="group.slug">
              <p class="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                {{ group.icon }} {{ group.labelFr }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cat in group.categories"
                  :key="cat.slug"
                  class="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  :class="form.categories.includes(cat.slug)
                    ? 'text-white border-transparent'
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'"
                  :style="form.categories.includes(cat.slug) ? `background:${group.color}` : ''"
                  @click="toggleCategory(cat.slug)"
                >
                  {{ cat.labelFr }}
                </button>
              </div>
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

    <!-- List -->
    <div class="space-y-2">
      <template v-for="place in allPlaces" :key="place.id">
        <div
          class="card p-4 flex items-start gap-4"
          :class="place.active ? '' : 'opacity-50'"
        >
          <!-- Miniature -->
          <div class="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
            <img
              v-if="place.photo_main"
              :src="place.photo_main"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xl">
              {{ getCategoryEmoji(place.categories[0] ?? "") }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="font-medium text-stone-800 flex items-center gap-2 flex-wrap">
              {{ place.name }}
              <span v-if="place.price_level" class="text-xs text-stone-400">{{ place.price_level }}</span>
              <span v-if="!place.active" class="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-400">inactif</span>
            </div>
            <p v-if="place.description" class="text-sm text-stone-400 mt-0.5 truncate">{{ place.description }}</p>
            <div class="flex flex-wrap gap-1 mt-1.5">
              <span
                v-for="cat in place.categories"
                :key="cat"
                class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                :style="`background:${getGroupColor(cat)}1a;color:${getGroupColor(cat)}`"
              >
                {{ getCatLabel(cat) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              class="text-xs px-2 py-1 rounded border transition-colors"
              :class="place.active
                ? 'border-stone-200 text-stone-500 hover:border-red-300 hover:text-red-500'
                : 'border-olive-300 text-olive-600 hover:bg-olive-50'"
              @click="toggleActive(place)"
            >
              {{ place.active ? t("admin.place_deactivate") : t("admin.place_activate") }}
            </button>
            <button
              class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-500 hover:border-terracotta-300 hover:text-terracotta-600 transition-colors"
              @click="openEdit(place)"
            >
              {{ t("common.edit") }}
            </button>
            <button
              class="text-xs px-2 py-1 rounded border border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors"
              @click="remove(place.id)"
            >
              {{ t("common.delete") }}
            </button>
          </div>
        </div>

        <!-- Form inline d'édition -->
        <div
          v-if="editing && editingId === place.id"
          :id="`edit-form-${place.id}`"
          class="card p-6 border-l-4 border-terracotta-500"
        >
          <h2 class="font-semibold text-stone-800 mb-5">{{ t("admin.place_edit") }}</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_name") }}</label>
              <input v-model="form.name" class="input w-full" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_description") }}</label>
              <textarea v-model="form.description" rows="2" class="input w-full" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_address") }}</label>
              <input v-model="form.address" class="input w-full" placeholder="386 Rue de la Kasbah, Marrakech 40000, Maroc" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_lat") }}</label>
              <input v-model.number="form.lat" type="number" step="0.00001" class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_lng") }}</label>
              <input v-model.number="form.lng" type="number" step="0.00001" class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_maps_url") }}</label>
              <input v-model="form.maps_url" class="input w-full" placeholder="https://maps.google.com/..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_website_url") }}</label>
              <input v-model="form.website_url" class="input w-full" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_price_level") }}</label>
              <div class="flex gap-2">
                <button
                  v-for="level in priceLevels"
                  :key="level.value ?? 'none'"
                  class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
                  :class="form.price_level === level.value
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'"
                  @click="form.price_level = level.value"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_photo_main") }}</label>
              <div class="flex items-start gap-3">
                <img v-if="form.photo_main" :src="form.photo_main" class="w-20 h-20 object-cover rounded-lg border border-stone-200 shrink-0" />
                <div class="flex-1">
                  <div
                    tabindex="0"
                    class="border-2 border-dashed border-stone-200 rounded-lg px-4 py-3 text-xs text-stone-400 text-center mb-2 cursor-pointer focus:border-terracotta-400 focus:outline-none hover:border-stone-300 transition-colors"
                    :class="uploadingMain ? 'opacity-50 pointer-events-none' : ''"
                    @paste="onPasteMain"
                    @click="mainPhotoInput?.click()"
                  >
                    {{ uploadingMain ? t("common.loading") : "📋 Coller une image (Ctrl+V) ou cliquer pour importer" }}
                  </div>
                  <input v-model="form.photo_main" class="input w-full text-xs mb-2" placeholder="Ou coller une URL..." />
                  <button v-if="form.photo_main" class="btn-secondary text-xs text-red-500 hover:text-red-700" @click="form.photo_main = null">
                    {{ t("common.delete") }}
                  </button>
                  <input ref="mainPhotoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onMainPhotoUpload" />
                </div>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-1">{{ t("admin.place_photos") }}</label>
              <div class="space-y-2">
                <div v-for="(_, i) in form.photos" :key="i" class="flex gap-2 items-center">
                  <img v-if="form.photos[i]" :src="form.photos[i]" class="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0" />
                  <input v-model="form.photos[i]" class="input flex-1 text-xs" placeholder="URL..." @paste="onPasteSecondary($event, i)" />
                  <button class="btn-secondary text-xs px-3" @click="form.photos.splice(i, 1)">✕</button>
                </div>
                <div
                  tabindex="0"
                  class="border-2 border-dashed border-stone-200 rounded-lg px-4 py-3 text-xs text-stone-400 text-center cursor-pointer focus:border-terracotta-400 focus:outline-none hover:border-stone-300 transition-colors"
                  :class="uploadingPhotos ? 'opacity-50 pointer-events-none' : ''"
                  @paste="onPasteSecondaryZone"
                  @click="photosInput?.click()"
                >
                  {{ uploadingPhotos ? t("common.loading") : "📋 Coller une image (Ctrl+V) ou cliquer pour importer plusieurs" }}
                </div>
                <div class="flex gap-2">
                  <button class="btn-secondary text-xs" @click="form.photos.push('')">+ {{ t("admin.product_add_photo") }}</button>
                  <button class="btn-secondary text-xs" :disabled="uploadingPhotos" @click="photosInput?.click()">
                    {{ uploadingPhotos ? t("common.loading") : t("admin.product_upload_photo") }}
                  </button>
                  <input ref="photosInput" type="file" multiple accept="image/jpeg,image/png,image/webp" class="hidden" @change="onPhotosUpload" />
                </div>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-2">{{ t("admin.place_highlights") }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="h in PLACE_HIGHLIGHTS"
                  :key="h.slug"
                  class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1"
                  :class="form.highlights.includes(h.slug)
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'"
                  @click="toggleHighlight(h.slug)"
                >
                  <span>{{ h.icon }}</span>
                  <span>{{ h.labelFr }}</span>
                </button>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-stone-600 mb-2">{{ t("admin.place_categories") }}</label>
              <div class="space-y-2">
                <div v-for="group in MAP_CATEGORY_GROUPS" :key="group.slug">
                  <p class="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">{{ group.icon }} {{ group.labelFr }}</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="cat in group.categories"
                      :key="cat.slug"
                      class="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                      :class="form.categories.includes(cat.slug)
                        ? 'text-white border-transparent'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'"
                      :style="form.categories.includes(cat.slug) ? `background:${group.color}` : ''"
                      @click="toggleCategory(cat.slug)"
                    >
                      {{ cat.labelFr }}
                    </button>
                  </div>
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
      </template>

      <div v-if="!allPlaces.length" class="text-center py-16 text-stone-400">
        {{ t("admin.place_empty") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Place } from "~/types";
import { MAP_CATEGORY_GROUPS, getCategoryMeta, getGroupColor } from "~/utils/mapCategories";
import { PLACE_HIGHLIGHTS } from "~/utils/placeHighlights";

definePageMeta({ layout: "admin", middleware: "admin" });

const { t } = useI18n();
const { fetchPlaces, createPlace, updatePlace, deletePlace } = usePlaces();
const supabase = useSupabaseClient();

const allPlaces = ref<Place[]>([]);

const loadPlaces = async () => {
  const { data } = await fetchPlaces(false);
  allPlaces.value = data;
};

await useAsyncData("admin-carte", () => loadPlaces());

// --- Password ---
const newPassword = ref("");
const savingPassword = ref(false);
const passwordSaved = ref(false);


onMounted(async () => {
  const { data } = await (supabase as any)
    .from("site_settings")
    .select("map_password")
    .eq("id", 1)
    .single();
  if (data?.map_password) newPassword.value = data.map_password;
});

const savePassword = async () => {
  if (!newPassword.value.trim()) return;
  savingPassword.value = true;
  await (supabase as any).from("site_settings").update({
    map_password: newPassword.value.trim(),
  }).eq("id", 1);
  savingPassword.value = false;
  passwordSaved.value = true;
  setTimeout(() => { passwordSaved.value = false; }, 2000);
};

// --- Form ---
const editing = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);

const priceLevels: { label: string; value: Place["price_level"] }[] = [
  { label: "—", value: null },
  { label: "€", value: "€" },
  { label: "€€", value: "€€" },
  { label: "€€€", value: "€€€" },
];

const emptyForm = (): Omit<Place, "id" | "created_at"> => ({
  name: "",
  description: null,
  address: null,
  lat: 31.6258,
  lng: -7.9892,
  categories: [],
  price_level: null,
  maps_url: null,
  website_url: null,
  photo_main: null,
  photos: [],
  highlights: [],
  active: true,
});

const form = reactive<Omit<Place, "id" | "created_at">>(emptyForm());

const toggleCategory = (slug: string) => {
  const idx = form.categories.indexOf(slug);
  if (idx >= 0) form.categories.splice(idx, 1);
  else form.categories.push(slug);
};

const toggleHighlight = (slug: string) => {
  const idx = form.highlights.indexOf(slug);
  if (idx >= 0) form.highlights.splice(idx, 1);
  else form.highlights.push(slug);
};

const openNew = () => {
  Object.assign(form, emptyForm());
  editingId.value = null;
  editing.value = true;
  saveError.value = null;
};

const openEdit = (place: Place) => {
  Object.assign(form, {
    ...place,
    categories: [...place.categories],
    photos: [...place.photos],
  });
  editingId.value = place.id;
  editing.value = true;
  saveError.value = null;
  nextTick(() => {
    document.getElementById(`edit-form-${place.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const cancelEdit = () => {
  editing.value = false;
  editingId.value = null;
};

const save = async () => {
  if (!form.name.trim()) { saveError.value = "Le nom est requis."; return; }
  if (!form.lat || !form.lng) { saveError.value = "Latitude et longitude requises."; return; }
  saving.value = true;
  saveError.value = null;

  const { id: _id, created_at: _ca, ...formRest } = form as any;
  const payload = {
    ...formRest,
    name: form.name.trim(),
    description: form.description?.trim() || null,
    address: form.address?.trim() || null,
    maps_url: form.maps_url?.trim() || null,
    website_url: form.website_url?.trim() || null,
    photo_main: form.photo_main?.trim() || null,
    photos: form.photos.filter((u) => u.trim()),
  };

  let error;
  if (editingId.value) {
    ({ error } = await updatePlace(editingId.value, payload));
  } else {
    ({ error } = await createPlace(payload));
  }

  saving.value = false;
  if (error) {
    saveError.value = (error as any).message;
  } else {
    editing.value = false;
    editingId.value = null;
    await loadPlaces();
  }
};

// --- Upload photos ---
const mainPhotoInput = ref<HTMLInputElement | null>(null);
const photosInput = ref<HTMLInputElement | null>(null);
const uploadingMain = ref(false);
const uploadingPhotos = ref(false);

const uploadFile = async (file: File): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "places");
  try {
    const data = await $fetch<{ url: string }>("/api/upload/image", {
      method: "POST",
      body: formData,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    return data.url;
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage ?? "Erreur upload";
    return null;
  }
};

const onMainPhotoUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingMain.value = true;
  const url = await uploadFile(file);
  if (url) form.photo_main = url;
  uploadingMain.value = false;
  if (mainPhotoInput.value) mainPhotoInput.value.value = "";
};

const onPhotosUpload = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (!files.length) return;
  uploadingPhotos.value = true;
  for (const file of files) {
    const url = await uploadFile(file);
    if (url) form.photos.push(url);
  }
  uploadingPhotos.value = false;
  if (photosInput.value) photosInput.value.value = "";
};

const getImageFromClipboard = (e: ClipboardEvent): File | null => {
  const items = Array.from(e.clipboardData?.items ?? []);
  const imageItem = items.find((item) => item.type.startsWith("image/"));
  return imageItem?.getAsFile() ?? null;
};

const onPasteMain = async (e: ClipboardEvent) => {
  const file = getImageFromClipboard(e);
  if (!file) return;
  e.preventDefault();
  uploadingMain.value = true;
  const url = await uploadFile(file);
  if (url) form.photo_main = url;
  uploadingMain.value = false;
};

const onPasteSecondary = async (e: ClipboardEvent, index: number) => {
  const file = getImageFromClipboard(e);
  if (!file) return;
  e.preventDefault();
  uploadingPhotos.value = true;
  const url = await uploadFile(file);
  if (url) form.photos[index] = url;
  uploadingPhotos.value = false;
};

const onPasteSecondaryZone = async (e: ClipboardEvent) => {
  const file = getImageFromClipboard(e);
  if (!file) return;
  e.preventDefault();
  uploadingPhotos.value = true;
  const url = await uploadFile(file);
  if (url) form.photos.push(url);
  uploadingPhotos.value = false;
};

// --- Actions ---
const toggleActive = async (place: Place) => {
  await updatePlace(place.id, { active: !place.active });
  await loadPlaces();
};

const remove = async (id: string) => {
  if (!confirm(t("admin.place_confirm_delete"))) return;
  await deletePlace(id);
  await loadPlaces();
};

// --- Helpers ---
const getCatLabel = (slug: string) => getCategoryMeta(slug)?.labelFr ?? slug;
const getCategoryEmoji = (slug: string) => getCategoryMeta(slug)?.groupIcon ?? "📍";

useSeoMeta({ title: t("admin.carte") + " – Admin" });
</script>
