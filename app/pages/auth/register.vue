<template>
  <div>
    <h1 class="font-serif text-2xl text-center mb-6">
      {{ t("auth.register_title") }}
    </h1>

    <div v-if="success" class="text-center py-8">
      <p class="text-green-700 font-medium">
        {{ t("auth.register_success") }}
      </p>
    </div>

    <form v-else @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{
          t("auth.full_name")
        }}</label>
        <input
          v-model="form.fullName"
          type="text"
          required
          class="input-field"
          autocomplete="name"
        />
      </div>
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
          minlength="8"
          class="input-field"
          autocomplete="new-password"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{
          t("auth.confirm_password")
        }}</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          required
          class="input-field"
          autocomplete="new-password"
        />
      </div>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? t("common.loading") : t("auth.register_btn") }}
      </button>
    </form>

    <div class="mt-4 text-center text-sm text-stone-500">
      {{ t("auth.already_account") }}
      <NuxtLink
        :to="redirect !== '/account' ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'"
        class="text-terracotta-600 hover:underline font-medium"
      >
        {{ t("auth.login_btn") }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });
const { signUpWithEmail } = useAuth();
const { t } = useI18n();
const route = useRoute();
const redirect = (route.query.redirect as string) || "/account";

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
});
const error = ref<string | null>(null);
const loading = ref(false);
const success = ref(false);

const onSubmit = async () => {
  error.value = null;
  if (form.password !== form.confirmPassword) {
    error.value = t("auth.passwords_mismatch");
    return;
  }
  loading.value = true;
  const { error: err } = await signUpWithEmail(
    form.email,
    form.password,
    form.fullName,
  );
  loading.value = false;
  if (err) {
    error.value = err.message;
  } else {
    success.value = true;
  }
};
</script>
