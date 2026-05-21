<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/riads"
        class="text-stone-400 hover:text-stone-700 transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-playfair text-stone-800">
        {{ form.name || t("admin.edit_riad") }}
      </h1>
    </div>

    <div v-if="loading" class="text-stone-400">{{ t("common.loading") }}</div>
    <div v-else-if="!riad" class="text-red-600">Riad introuvable.</div>

    <form v-else @submit.prevent="onSave" class="space-y-10 pb-24">
      <!-- IMAGE DE COUVERTURE -->
      <section class="space-y-3">
        <h2 class="admin-section-title">{{ t("admin.cover_image") }}</h2>
        <div class="flex gap-5 items-start">
          <div
            class="w-48 aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0"
          >
            <img
              v-if="form.cover_image"
              :src="form.cover_image"
              class="w-full h-full object-cover"
              alt="cover"
            />
            <div
              v-else
              class="flex items-center justify-center h-full text-xs text-stone-400"
            >
              {{ t("admin.no_image") }}
            </div>
          </div>
          <div class="flex flex-col gap-2 flex-1">
            <button
              type="button"
              class="btn-secondary w-fit"
              @click="coverInput?.click()"
            >
              {{
                uploadingCover ? t("common.loading") : t("admin.upload_image")
              }}
            </button>
            <input
              ref="coverInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onCoverUpload"
            />
            <input
              v-model="form.cover_image"
              type="url"
              class="input-field text-xs"
              :placeholder="t('admin.or_paste_url')"
            />
          </div>
        </div>
      </section>

      <!-- INFOS FR -->
      <section class="space-y-4">
        <h2 class="admin-section-title">Informations (FR)</h2>
        <div>
          <label class="admin-label">Nom</label>
          <input v-model="form.name" type="text" class="input-field" required />
        </div>
        <div>
          <label class="admin-label">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="input-field resize-none"
            required
          />
        </div>
      </section>

      <!-- INFOS EN -->
      <section class="space-y-4">
        <h2 class="admin-section-title">Informations (EN)</h2>
        <div>
          <label class="admin-label">Name</label>
          <input
            v-model="form.name_en"
            type="text"
            class="input-field"
            required
          />
        </div>
        <div>
          <label class="admin-label">Description</label>
          <textarea
            v-model="form.description_en"
            rows="4"
            class="input-field resize-none"
            required
          />
        </div>
      </section>

      <!-- TARIFS & CAPACITÉ -->
      <section class="space-y-4">
        <h2 class="admin-section-title">Tarifs &amp; capacité</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="admin-label">{{
              t("admin.price_per_night_eur")
            }}</label>
            <div class="relative">
              <input
                v-model="priceEur"
                type="number"
                min="1"
                step="1"
                class="input-field pr-8"
                required
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm"
                >€</span
              >
            </div>
          </div>
          <div>
            <label class="admin-label">{{ t("admin.max_guests_label") }}</label>
            <input
              v-model="form.max_guests"
              type="number"
              min="1"
              max="30"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="admin-label">Nuits minimum</label>
            <input
              v-model="form.min_nights"
              type="number"
              min="1"
              max="30"
              class="input-field"
            />
          </div>
        </div>
        <div>
          <label class="admin-label">Surface (m²)</label>
          <input
            v-model="form.area_sqm"
            type="number"
            min="1"
            class="input-field w-32"
            placeholder="350"
          />
        </div>
      </section>

      <!-- HORAIRES -->
      <section class="space-y-4">
        <h2 class="admin-section-title">Horaires</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Arrivée à partir de</label>
            <input
              v-model="form.checkin_time"
              type="time"
              class="input-field"
            />
          </div>
          <div>
            <label class="admin-label">Départ avant</label>
            <input
              v-model="form.checkout_time"
              type="time"
              class="input-field"
            />
          </div>
        </div>
      </section>

      <!-- COUCHAGE -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="admin-section-title">Couchage</h2>
          <button
            type="button"
            class="btn-secondary text-sm"
            @click="addSleeping"
          >
            + Ajouter
          </button>
        </div>
        <div
          v-for="(room, i) in form.sleeping_arrangements"
          :key="i"
          class="grid grid-cols-[1fr_1fr_auto] gap-3 items-start"
        >
          <div class="space-y-1">
            <input
              v-model="room.label"
              type="text"
              class="input-field text-sm"
              placeholder="Suite Zitoun"
            />
            <input
              v-model="room.label_en"
              type="text"
              class="input-field text-sm"
              placeholder="Zitoun Suite (EN)"
            />
          </div>
          <div class="space-y-1">
            <input
              v-model="room.beds"
              type="text"
              class="input-field text-sm"
              placeholder="1 lit king size"
            />
            <input
              v-model="room.beds_en"
              type="text"
              class="input-field text-sm"
              placeholder="1 king size bed (EN)"
            />
          </div>
          <button
            type="button"
            class="text-red-400 hover:text-red-600 mt-2"
            @click="form.sleeping_arrangements.splice(i, 1)"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p
          v-if="!form.sleeping_arrangements.length"
          class="text-sm text-stone-400"
        >
          Aucun couchage renseigné.
        </p>
      </section>

      <!-- ÉQUIPEMENTS -->
      <section class="space-y-4">
        <h2 class="admin-section-title">Équipements</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label
            v-for="a in (allAmenities ?? [])"
            :key="a.slug"
            class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors"
          >
            <input
              type="checkbox"
              :value="a.slug"
              v-model="form.amenities"
              class="accent-terracotta-600"
            />
            <span class="text-sm">{{ a.emoji }} {{ a.name_fr }}</span>
          </label>
        </div>
      </section>

      <!-- SERVICES -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="admin-section-title">Services</h2>
          <button
            type="button"
            class="btn-secondary text-sm"
            @click="addService"
          >
            + Ajouter
          </button>
        </div>
        <div
          v-for="(svc, i) in form.services"
          :key="i"
          class="p-4 rounded-xl border border-stone-200 space-y-3"
        >
          <div class="flex justify-between items-start">
            <span class="text-sm font-medium text-stone-600"
              >Service {{ i + 1 }}</span
            >
            <button
              type="button"
              class="text-red-400 hover:text-red-600"
              @click="form.services.splice(i, 1)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <input
              v-model="svc.name"
              type="text"
              class="input-field text-sm"
              placeholder="Petit-déjeuner (FR)"
            />
            <input
              v-model="svc.name_en"
              type="text"
              class="input-field text-sm"
              placeholder="Breakfast (EN)"
            />
            <input
              v-model="svc.description"
              type="text"
              class="input-field text-sm"
              placeholder="Description (FR)"
            />
            <input
              v-model="svc.description_en"
              type="text"
              class="input-field text-sm"
              placeholder="Description (EN)"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="admin-label mb-0"
              >Prix (€) — 0 = inclus, vide = sur demande</label
            >
            <input
              v-model="svc.priceEur"
              type="number"
              min="0"
              step="0.01"
              class="input-field w-28 text-sm"
            />
          </div>
        </div>
        <p v-if="!form.services.length" class="text-sm text-stone-400">
          Aucun service renseigné.
        </p>
      </section>

      <!-- GALERIE PAR PIÈCE -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="admin-section-title">{{ t("admin.gallery_images") }}</h2>
          <button
            type="button"
            class="btn-secondary text-sm"
            @click="addGalleryGroup"
          >
            + Ajouter une pièce
          </button>
        </div>
        <div
          v-for="(group, gi) in form.gallery"
          :key="gi"
          class="p-4 rounded-xl border border-stone-200 space-y-4"
        >
          <div class="flex items-center gap-2">
            <!-- Réordonner -->
            <div class="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                class="text-stone-400 hover:text-stone-700 disabled:opacity-20"
                :disabled="gi === 0"
                @click="moveGalleryGroup(gi, -1)"
              >
                ▲
              </button>
              <button
                type="button"
                class="text-stone-400 hover:text-stone-700 disabled:opacity-20"
                :disabled="gi === form.gallery.length - 1"
                @click="moveGalleryGroup(gi, 1)"
              >
                ▼
              </button>
            </div>
            <input
              v-model="group.label"
              type="text"
              class="input-field text-sm flex-1"
              placeholder="Patio (FR)"
            />
            <input
              v-model="group.label_en"
              type="text"
              class="input-field text-sm flex-1"
              placeholder="Patio (EN)"
            />
            <button
              type="button"
              class="text-red-400 hover:text-red-600 shrink-0"
              @click="form.gallery.splice(gi, 1)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(photo, pi) in group.photos"
              :key="pi"
              class="relative aspect-square rounded-lg overflow-hidden bg-stone-100 group/photo"
            >
              <img :src="photo" class="w-full h-full object-cover" alt="" />
              <button
                type="button"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity text-xs"
                @click="group.photos.splice(pi, 1)"
              >
                ✕
              </button>
            </div>
            <button
              type="button"
              class="aspect-square rounded-lg border-2 border-dashed border-stone-300 hover:border-terracotta-400 text-stone-400 hover:text-terracotta-500 transition-colors flex items-center justify-center text-xl"
              @click="triggerGalleryUpload(gi)"
            >
              +
            </button>
          </div>
          <div
            v-if="uploadingGalleryIndex === gi"
            class="text-xs text-stone-400"
          >
            {{ t("common.loading") }}
          </div>
        </div>
        <input
          ref="galleryGroupInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onGalleryGroupUpload"
        />
      </section>

      <!-- LOCALISATION -->
      <section class="space-y-4">
        <h2 class="admin-section-title">{{ t("riads.location_title") }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="admin-label">Adresse</label>
            <input
              v-model="form.location.address"
              type="text"
              class="input-field"
              placeholder="12 Derb Lalla Azzouna, Médina"
            />
          </div>
          <div>
            <label class="admin-label">Quartier</label>
            <input
              v-model="form.location.neighborhood"
              type="text"
              class="input-field"
              placeholder="Médina Sud"
            />
          </div>
          <div>
            <label class="admin-label">URL Google Maps</label>
            <input
              v-model="form.location.google_maps_url"
              type="url"
              class="input-field"
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div>
            <label class="admin-label">Latitude</label>
            <input
              v-model="form.location.lat"
              type="number"
              step="any"
              class="input-field"
              placeholder="31.6248"
            />
          </div>
          <div>
            <label class="admin-label">Longitude</label>
            <input
              v-model="form.location.lng"
              type="number"
              step="any"
              class="input-field"
              placeholder="-7.9817"
            />
          </div>
        </div>
      </section>

      <!-- RÈGLES -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="admin-section-title">
            {{ t("riads.house_rules_title") }}
          </h2>
          <button
            type="button"
            class="btn-secondary text-sm"
            @click="
              form.house_rules.push('');
              form.house_rules_en.push('');
            "
          >
            + Ajouter
          </button>
        </div>
        <div
          v-for="(_, i) in form.house_rules"
          :key="i"
          class="flex gap-2 items-center"
        >
          <input
            v-model="form.house_rules[i]"
            type="text"
            class="input-field text-sm flex-1"
            placeholder="Non-fumeur (FR)"
          />
          <input
            v-model="form.house_rules_en[i]"
            type="text"
            class="input-field text-sm flex-1"
            placeholder="Non-smoking (EN)"
          />
          <button
            type="button"
            class="text-red-400 hover:text-red-600"
            @click="
              form.house_rules.splice(i, 1);
              form.house_rules_en.splice(i, 1);
            "
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </section>

      <!-- POLITIQUE D'ANNULATION -->
      <section class="space-y-4">
        <h2 class="admin-section-title">Politique d'annulation</h2>
        <div>
          <label class="admin-label">FR</label>
          <textarea
            v-model="form.cancellation_policy"
            rows="3"
            class="input-field resize-none"
            placeholder="Annulation gratuite jusqu'à 7 jours avant..."
          />
        </div>
        <div>
          <label class="admin-label">EN</label>
          <textarea
            v-model="form.cancellation_policy_en"
            rows="3"
            class="input-field resize-none"
            placeholder="Free cancellation up to 7 days before..."
          />
        </div>
      </section>

      <!-- iCAL -->
      <section class="space-y-4">
        <h2 class="admin-section-title">{{ t("admin.ical_urls") }}</h2>
        <div>
          <label class="admin-label">Airbnb (.ics URL)</label>
          <input
            v-model="form.ical_airbnb_url"
            type="url"
            class="input-field"
            placeholder="https://www.airbnb.com/calendar/ical/..."
          />
        </div>
        <div>
          <label class="admin-label">Booking.com (.ics URL)</label>
          <input
            v-model="form.ical_booking_url"
            type="url"
            class="input-field"
            placeholder="https://admin.booking.com/..."
          />
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="btn-secondary"
            :disabled="syncingIcal"
            @click="onSyncIcal"
          >
            {{ syncingIcal ? t("common.loading") : t("admin.sync_ical") }}
          </button>
          <span v-if="syncResult" class="text-sm text-green-700">{{
            syncResult
          }}</span>
        </div>
      </section>

      <!-- ACTIONS -->
      <div
        class="flex items-center gap-4 fixed bottom-0 left-64 right-0 bg-white border-t border-stone-200 px-6 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] z-20"
      >
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? t("common.loading") : t("common.save") }}
        </button>
        <NuxtLink
          :to="`/riads/${riadSlug}`"
          target="_blank"
          class="btn-ghost text-sm"
          >Voir la page →</NuxtLink
        >
        <span v-if="saved" class="text-green-700 text-sm">{{
          t("admin.riad_saved")
        }}</span>
        <span v-if="saveError" class="text-red-600 text-sm">{{
          saveError
        }}</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type {
  Riad,
  RiadGalleryGroup,
  RiadSleepingArrangement,
  RiadService,
  RiadLocation,
} from "~/types";

definePageMeta({ layout: "admin", middleware: "admin" });
const { t } = useI18n();
const route = useRoute();
const supabase = useSupabaseClient();
const riadSlug = route.params.riadSlug as string;

const { amenities: allAmenities } = useAmenities();

interface ServiceForm {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  priceEur: number;
}

const loading = ref(true);
const riad = ref<Riad | null>(null);
const priceEur = ref(200);

const form = reactive({
  name: "",
  name_en: "",
  description: "",
  description_en: "",
  cover_image: "",
  max_guests: 8,
  min_nights: 2,
  area_sqm: null as number | null,
  checkin_time: "15:00",
  checkout_time: "11:00",
  sleeping_arrangements: [] as RiadSleepingArrangement[],
  amenities: [] as string[],
  services: [] as ServiceForm[],
  gallery: [] as RiadGalleryGroup[],
  location: {
    address: "",
    neighborhood: "",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    google_maps_url: "",
  } as RiadLocation,
  house_rules: [] as string[],
  house_rules_en: [] as string[],
  cancellation_policy: "",
  cancellation_policy_en: "",
  ical_airbnb_url: "" as string | null,
  ical_booking_url: "" as string | null,
});

onMounted(async () => {
  const { data } = await supabase
    .from("riads")
    .select("*")
    .eq("slug", riadSlug)
    .single();
  if (data) {
    riad.value = data as Riad;
    const d = data as Riad;
    form.name = d.name;
    form.name_en = d.name_en;
    form.description = d.description;
    form.description_en = d.description_en;
    form.cover_image = d.cover_image ?? "";
    form.max_guests = d.max_guests;
    form.min_nights = d.min_nights ?? 2;
    form.area_sqm = d.area_sqm ?? null;
    form.checkin_time = d.checkin_time ?? "15:00";
    form.checkout_time = d.checkout_time ?? "11:00";
    form.sleeping_arrangements = d.sleeping_arrangements ?? [];
    form.amenities = d.amenities ?? [];
    form.services = (d.services ?? []).map((s: RiadService) => ({
      name: s.name,
      name_en: s.name_en ?? "",
      description: s.description ?? "",
      description_en: s.description_en ?? "",
      priceEur: s.price_cents / 100,
    }));
    form.gallery = d.gallery ?? [];
    form.location = d.location
      ? { ...d.location }
      : { address: "", neighborhood: "", google_maps_url: "" };
    form.house_rules = d.house_rules ?? [];
    form.house_rules_en = d.house_rules_en ?? [];
    form.cancellation_policy = d.cancellation_policy ?? "";
    form.cancellation_policy_en = d.cancellation_policy_en ?? "";
    form.ical_airbnb_url = d.ical_airbnb_url ?? "";
    form.ical_booking_url = d.ical_booking_url ?? "";
    priceEur.value = Math.round(d.base_price_per_night / 100);
  }
  loading.value = false;
});

const addSleeping = () =>
  form.sleeping_arrangements.push({
    label: "",
    beds: "",
    label_en: "",
    beds_en: "",
  });
const addService = () =>
  form.services.push({
    name: "",
    name_en: "",
    description: "",
    description_en: "",
    priceEur: 0,
  });
const addGalleryGroup = () =>
  form.gallery.push({ label: "", label_en: "", photos: [] });

const moveGalleryGroup = (index: number, direction: -1 | 1) => {
  const target = index + direction;
  if (target < 0 || target >= form.gallery.length) {
    return;
  }
  const tmp = form.gallery[index]!;
  form.gallery[index] = form.gallery[target]!;
  form.gallery[target] = tmp;
};

// Upload cover
const coverInput = ref<HTMLInputElement | null>(null);
const uploadingCover = ref(false);

const supabaseClient = useSupabaseClient();
const uploadUploadError = ref<string | null>(null);

const uploadFile = async (
  file: File,
  folder: string,
): Promise<string | null> => {
  uploadUploadError.value = null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    uploadUploadError.value = "Type de fichier non autorisé (jpg, png, webp, gif uniquement)";
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const data = await $fetch<{ url: string }>("/api/upload/image", { method: "POST", body: formData });
    return data.url;
  } catch (e: any) {
    uploadUploadError.value = e?.data?.statusMessage ?? "Erreur upload";
    return null;
  }
};

const onCoverUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingCover.value = true;
  const url = await uploadFile(file, riadSlug);
  if (url) form.cover_image = url;
  uploadingCover.value = false;
};

// Upload galerie
const galleryGroupInput = ref<HTMLInputElement | null>(null);
const uploadingGalleryIndex = ref<number | null>(null);
let activeGalleryGroupIndex = 0;

const triggerGalleryUpload = (gi: number) => {
  activeGalleryGroupIndex = gi;
  galleryGroupInput.value?.click();
};

const onGalleryGroupUpload = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (!files.length) return;
  uploadingGalleryIndex.value = activeGalleryGroupIndex;
  for (const file of files) {
    const url = await uploadFile(file, `${riadSlug}/gallery`);
    const group = form.gallery[activeGalleryGroupIndex];
    if (url && group) {
      group.photos.push(url);
    }
  }
  uploadingGalleryIndex.value = null;
  if (galleryGroupInput.value) galleryGroupInput.value.value = "";
};

// Save
const saving = ref(false);
const saved = ref(false);
const saveError = ref<string | null>(null);

const onSave = async () => {
  saving.value = true;
  saved.value = false;
  saveError.value = null;
  const { error } = await (supabase as any)
    .from("riads")
    .update({
      name: form.name,
      name_en: form.name_en,
      description: form.description,
      description_en: form.description_en,
      cover_image: form.cover_image || null,
      max_guests: form.max_guests,
      min_nights: form.min_nights,
      area_sqm: form.area_sqm || null,
      base_price_per_night: priceEur.value * 100,
      checkin_time: form.checkin_time,
      checkout_time: form.checkout_time,
      sleeping_arrangements: form.sleeping_arrangements,
      amenities: form.amenities,
      services: form.services.map((s) => ({
        name: s.name,
        name_en: s.name_en || null,
        description: s.description || null,
        description_en: s.description_en || null,
        price_cents: Math.round(s.priceEur * 100),
      })),
      gallery: form.gallery,
      location: form.location.address ? form.location : null,
      house_rules: form.house_rules.filter(Boolean),
      house_rules_en: form.house_rules_en.filter(Boolean),
      cancellation_policy: form.cancellation_policy || null,
      cancellation_policy_en: form.cancellation_policy_en || null,
      ical_airbnb_url: form.ical_airbnb_url || null,
      ical_booking_url: form.ical_booking_url || null,
    })
    .eq("id", riad.value!.id);
  saving.value = false;
  if (error) {
    saveError.value = error.message;
  } else {
    saved.value = true;
  }
};

// Sync iCal
const syncingIcal = ref(false);
const syncResult = ref<string | null>(null);

const onSyncIcal = async () => {
  await (supabase as any)
    .from("riads")
    .update({
      ical_airbnb_url: form.ical_airbnb_url || null,
      ical_booking_url: form.ical_booking_url || null,
    })
    .eq("id", riad.value!.id);
  syncingIcal.value = true;
  syncResult.value = null;
  try {
    const data = await $fetch<{ synced: { imported: number }[] }>(
      "/api/ical/sync",
      { method: "POST" },
    );
    const total = data?.synced.reduce((s, r) => s + r.imported, 0) ?? 0;
    syncResult.value = `${total} créneau(x) importé(s)`;
  } catch (err: any) {
    syncResult.value = `Erreur : ${err?.message ?? err}`;
  }
  syncingIcal.value = false;
};

useSeoMeta({ title: `${form.name || riadSlug} – Admin` });
</script>

<style scoped>
.admin-section-title {
  @apply text-lg font-semibold text-stone-700 border-b border-stone-100 pb-2 mb-1;
}
.admin-label {
  @apply block text-sm font-medium text-stone-600 mb-1;
}
</style>
