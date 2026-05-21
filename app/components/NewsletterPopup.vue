<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
        @click.self="dismiss"
      >
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
          <!-- Image décorative -->
          <div class="h-2 bg-gradient-to-r from-terracotta-500 to-amber-400" />

          <div class="p-8">
            <!-- Close -->
            <button
              class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
              @click="dismiss"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Succès -->
            <div v-if="success" class="text-center py-2">
              <div class="text-4xl mb-4">🎉</div>
              <h2 class="font-serif text-2xl text-stone-800 mb-2">{{ t("newsletter_popup.success_title") }}</h2>
              <p class="text-stone-500 text-sm mb-6">{{ t("newsletter_popup.success_text") }}</p>
              <div class="bg-terracotta-50 border border-terracotta-200 rounded-xl px-6 py-4 flex items-center justify-between gap-4">
                <span class="font-mono font-bold text-xl text-terracotta-700 tracking-widest">{{ PROMO_CODE }}</span>
                <button
                  class="text-xs text-terracotta-600 hover:text-terracotta-800 font-medium transition-colors"
                  @click="copyCode"
                >
                  {{ copied ? "✓ Copié" : "Copier" }}
                </button>
              </div>
              <p class="text-xs text-stone-400 mt-3">{{ t("newsletter_popup.success_note") }}</p>
              <button class="btn-primary w-full mt-6" @click="dismiss">{{ t("newsletter_popup.close") }}</button>
            </div>

            <!-- Formulaire -->
            <template v-else>
              <div class="text-center mb-6">
                <span class="inline-block bg-terracotta-100 text-terracotta-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {{ t("newsletter_popup.badge") }}
                </span>
                <h2 class="font-serif text-2xl text-stone-800 mb-2">{{ t("newsletter_popup.title") }}</h2>
                <p class="text-stone-500 text-sm leading-relaxed">{{ t("newsletter_popup.subtitle") }}</p>
              </div>

              <form @submit.prevent="onSubmit" class="space-y-3">
                <input
                  v-model="email"
                  type="email"
                  required
                  :placeholder="t('newsletter_popup.placeholder')"
                  class="input-field w-full"
                  :disabled="loading"
                />
                <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
                <button type="submit" class="btn-primary w-full" :disabled="loading">
                  {{ loading ? t("common.loading") : t("newsletter_popup.cta") }}
                </button>
              </form>

              <button
                class="w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors mt-4"
                @click="dismiss"
              >
                {{ t("newsletter_popup.no_thanks") }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const PROMO_CODE = "BIENVENUE10";
const STORAGE_KEY = "nl_popup_shown";

const { t } = useI18n();
const user = useSupabaseUser();

const visible = ref(false);
const success = ref(false);
const email = ref("");
const loading = ref(false);
const error = ref("");
const copied = ref(false);

onMounted(() => {
  if (user.value) return;
  if (localStorage.getItem(STORAGE_KEY)) return;
  setTimeout(() => { visible.value = true; }, 5000);
});

function dismiss() {
  visible.value = false;
  localStorage.setItem(STORAGE_KEY, "1");
}

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await $fetch("/api/newsletter/subscribe", { method: "POST", body: { email: email.value } });
    success.value = true;
    localStorage.setItem(STORAGE_KEY, "1");
  } catch (e: any) {
    const status = e?.response?.status ?? e?.statusCode;
    if (status === 409) {
      error.value = t("newsletter_popup.already");
    } else {
      error.value = t("newsletter_popup.error");
    }
  } finally {
    loading.value = false;
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(PROMO_CODE);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.25s ease;
}
.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>
