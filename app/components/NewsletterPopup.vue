<template>
  <Teleport to="body">
    <Transition name="popup-slide">
      <div
        v-if="visible"
        class="fixed bottom-5 right-5 z-[200] w-80 bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
      >
        <div class="h-1.5 bg-gradient-to-r from-terracotta-500 to-amber-400" />

        <div class="p-5">
          <!-- Close -->
          <button
            class="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors"
            @click="dismiss"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Succès -->
          <div v-if="success" class="text-center py-2">
            <div class="text-3xl mb-3">🎉</div>
            <h2 class="font-serif text-lg text-stone-800 mb-2">{{ t("newsletter_popup.success_title") }}</h2>
            <p class="text-stone-600 text-sm leading-relaxed mb-3">{{ t("newsletter_popup.success_text") }}</p>
            <p class="text-xs text-stone-400">{{ t("newsletter_popup.success_note") }}</p>
          </div>

          <!-- Formulaire -->
          <template v-else>
            <span class="inline-block bg-terracotta-100 text-terracotta-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
              {{ t("newsletter_popup.badge") }}
            </span>
            <h2 class="font-serif text-lg text-stone-800 mb-1 leading-snug">{{ t("newsletter_popup.title") }}</h2>
            <p class="text-stone-500 text-xs leading-relaxed mb-3">{{ t("newsletter_popup.subtitle") }}</p>

            <form @submit.prevent="onSubmit" class="space-y-2">
              <input
                v-model="email"
                type="email"
                required
                :placeholder="t('newsletter_popup.placeholder')"
                class="input-field w-full text-sm py-2"
                :disabled="loading"
              />
              <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
              <button type="submit" class="btn-primary w-full text-sm py-2" :disabled="loading">
                {{ loading ? t("common.loading") : t("newsletter_popup.cta") }}
              </button>
            </form>

            <button
              class="w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors mt-2"
              @click="dismiss"
            >
              {{ t("newsletter_popup.no_thanks") }}
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const STORAGE_KEY = "nl_popup_shown";

const { t } = useI18n();
const user = useSupabaseUser();
const supabase = useSupabaseClient() as any;

const visible = ref(false);
const success = ref(false);
const email = ref("");
const loading = ref(false);
const error = ref("");

onMounted(async () => {
  if (localStorage.getItem(STORAGE_KEY)) return;

  if (user.value) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("newsletter_subscribed")
      .eq("id", user.value.id)
      .single();

    if (profile?.newsletter_subscribed) {
      localStorage.setItem(STORAGE_KEY, "1");
      return;
    }
    email.value = user.value.email ?? "";
  }

  setTimeout(() => { visible.value = true; }, 2000);
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
      if (user.value) {
        dismiss();
      } else {
        error.value = t("newsletter_popup.already");
      }
    } else {
      error.value = t("newsletter_popup.error");
    }
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.popup-slide-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.popup-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.popup-slide-enter-from,
.popup-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
