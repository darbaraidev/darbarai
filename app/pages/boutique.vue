<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <h1 class="section-title text-center mb-4">{{ t("boutique.page_title") }}</h1>
      <p class="text-center text-stone-500 max-w-2xl mx-auto mb-8">{{ t("boutique.page_subtitle") }}</p>

      <!-- Info achat -->
      <div class="max-w-2xl mx-auto bg-sand-50 border border-sand-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="text-2xl shrink-0">🛍️</div>
        <div class="text-stone-600 text-sm leading-relaxed">
          <p>{{ t("boutique.info_riad") }}</p>
          <p class="mt-1">
            {{ t("boutique.info_contact") }}
            <a href="tel:+33750996975" class="font-semibold text-terracotta-700 hover:underline">+33 7 50 99 69 75</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Grille -->
    <div class="max-w-7xl mx-auto px-4 pb-20">
      <div v-if="products && products.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="group cursor-pointer"
          @click="openModal(product)"
        >
          <!-- Image -->
          <div class="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-3">
            <img
              v-if="product.images.length"
              :src="product.images[0]"
              :alt="productName(product)"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-stone-300">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>

          <!-- Infos -->
          <p class="font-serif text-stone-800 text-sm leading-snug group-hover:text-terracotta-700 transition-colors">{{ productName(product) }}</p>
          <p class="text-terracotta-600 font-medium text-sm mt-0.5">
            {{ formatProductPrice(product.price_cents) ?? t("boutique.on_request") }}
          </p>
        </div>
      </div>

      <div v-else class="text-center py-24 text-stone-400">
        {{ t("boutique.empty") }}
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="modal.open && modal.product"
          class="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          @click.self="modal.open = false"
        >
          <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Bouton fermer -->
            <div class="flex justify-end p-4 pb-0">
              <button class="text-stone-400 hover:text-stone-700 transition-colors" @click="modal.open = false">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="px-8 pb-8">
              <!-- Photos -->
              <div v-if="modal.product.images.length" class="grid grid-cols-2 gap-3 mb-6">
                <img
                  v-for="(img, i) in modal.product.images"
                  :key="i"
                  :src="img"
                  :alt="`photo ${i + 1}`"
                  class="w-full h-auto rounded-xl"
                />
              </div>

              <!-- Infos -->
              <h2 class="font-serif text-2xl text-stone-800 mb-2">{{ productName(modal.product) }}</h2>

              <p class="text-terracotta-600 font-semibold text-xl mb-4">
                {{ formatProductPrice(modal.product.price_cents) ?? t("boutique.on_request") }}
              </p>

              <p v-if="productDescription(modal.product)" class="text-stone-600 leading-relaxed whitespace-pre-wrap mb-6">
                {{ productDescription(modal.product) }}
              </p>

              <!-- Tailles -->
              <div v-if="modal.product.sizes.length" class="mb-6">
                <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">{{ t("admin.product_sizes") }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="size in modal.product.sizes"
                    :key="size"
                    class="px-3 py-1 rounded-full border border-stone-200 text-stone-700 text-sm font-medium"
                  >
                    {{ size }}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
const { data: _ps } = await useAsyncData("site-settings", () => $fetch("/api/site-settings"));
if ((_ps.value as any)?.page_boutique_enabled === false) await navigateTo("/");

const { t, locale } = useI18n();
const { fetchProducts, formatProductPrice } = useProducts();

const { data: products } = await useAsyncData("boutique", async () => {
  const { data } = await fetchProducts(true);
  return data ?? [];
});

const productName = (p: Product) =>
  locale.value === "fr" ? p.name : p.name_en || p.name;

const productDescription = (p: Product) =>
  locale.value === "fr" ? p.description : p.description_en || p.description;

const activeModalImage = ref(0);

const modal = reactive<{ open: boolean; product: Product | null }>({
  open: false,
  product: null,
});

const openModal = (product: Product) => {
  modal.product = product;
  modal.open = true;
  activeModalImage.value = 0;
};

useSeoMeta({ title: t("boutique.seo_title") });
</script>
