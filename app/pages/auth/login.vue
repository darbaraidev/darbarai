<template>
  <div>
    <h1 class="font-serif text-2xl text-center mb-6">
      {{ t("auth.login_title") }}
    </h1>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{
          t("auth.email")
        }}</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="input-field"
          autocomplete="email"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{
          t("auth.password")
        }}</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="input-field"
          autocomplete="current-password"
        />
      </div>
      <div
        v-if="emailNotConfirmed"
        class="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3"
      >
        <p class="text-sm text-amber-800">
          {{ t("auth.email_not_confirmed") }}
        </p>
        <button
          type="button"
          class="text-sm font-medium text-terracotta-600 hover:underline disabled:opacity-50"
          :disabled="resendLoading || resendSent"
          @click="resendConfirmation"
        >
          {{
            resendSent
              ? t("auth.resend_sent")
              : resendLoading
                ? t("common.loading")
                : t("auth.resend_confirmation")
          }}
        </button>
      </div>
      <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? t("common.loading") : t("auth.login_btn") }}
      </button>
    </form>

    <div class="mt-4 text-center text-sm text-stone-500">
      {{ t("auth.no_account") }}
      <NuxtLink
        :to="
          redirect
            ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
            : '/auth/register'
        "
        class="text-terracotta-600 hover:underline font-medium"
      >
        {{ t("auth.register_btn") }}
      </NuxtLink>
    </div>
    <div class="mt-2 text-center text-sm">
      <NuxtLink
        to="/auth/forgot-password"
        class="text-stone-400 hover:text-stone-600"
      >
        {{ t("auth.forgot_password") }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });
const { signInWithEmail } = useAuth();
const { t } = useI18n();
const route = useRoute();

const redirect = route.query.redirect as string | undefined;

const supabase = useSupabaseClient();
const form = reactive({ email: "", password: "" });
const error = ref<string | null>(null);
const loading = ref(false);
const emailNotConfirmed = ref(false);
const resendLoading = ref(false);
const resendSent = ref(false);

const onSubmit = async () => {
  error.value = null;
  emailNotConfirmed.value = false;
  loading.value = true;
  const { error: err } = await signInWithEmail(form.email, form.password);
  loading.value = false;
  if (err) {
    if (err.message.toLowerCase().includes("email not confirmed")) {
      emailNotConfirmed.value = true;
    } else {
      error.value = err.message;
    }
  } else if (redirect) {
    await navigateTo(redirect);
  } else {
    useRouter().back();
  }
};

const resendConfirmation = async () => {
  resendLoading.value = true;
  await supabase.auth.resend({
    type: "signup",
    email: form.email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  resendLoading.value = false;
  resendSent.value = true;
};
</script>
