<script setup lang="ts">
definePageMeta({ layout: "auth" });
const { signInWithEmail, signInWithGoogle } = useAuth();
const { t } = useI18n();

const form = reactive({ email: "", password: "" });
const error = ref<string | null>(null);
const loading = ref(false);

const onSubmit = async () => {
  error.value = null;
  loading.value = true;
  const { error: err } = await signInWithEmail(form.email, form.password);
  loading.value = false;
  if (err) {
    error.value = err.message;
  } else {
    await navigateTo("/account");
  }
};

const onGoogle = async () => {
  await signInWithGoogle();
};
</script>

<template>
  <div>
    <h1 class="font-serif text-2xl text-center mb-6">
      {{ t("auth.login_title") }}
    </h1>

    <button type="button" class="btn-secondary w-full mb-4" @click="onGoogle">
      {{ t("auth.google_btn") }}
    </button>

    <div class="flex items-center gap-3 my-4 text-stone-400 text-sm">
      <hr class="flex-1 border-stone-200" />
      ou
      <hr class="flex-1 border-stone-200" />
    </div>

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
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? t("common.loading") : t("auth.login_btn") }}
      </button>
    </form>

    <div class="mt-4 text-center text-sm text-stone-500">
      {{ t("auth.no_account") }}
      <NuxtLink
        to="/auth/register"
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
