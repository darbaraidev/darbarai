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
        <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("auth.full_name") }} *</label>
        <input v-model="form.fullName" type="text" required class="input-field" autocomplete="name" />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("auth.email") }} *</label>
        <input v-model="form.email" type="email" required class="input-field" autocomplete="email" />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("account.phone") }} *</label>
        <input
          v-model="form.phone"
          type="tel"
          required
          class="input-field"
          autocomplete="tel"
          :placeholder="t('auth.phone_placeholder')"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("auth.birth_date") }} *</label>
        <input
          v-model="form.birthDate"
          type="date"
          required
          :max="maxBirthDate"
          class="input-field"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("auth.password") }} *</label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            class="input-field pr-10"
            autocomplete="new-password"
          />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors" @click="showPassword = !showPassword">
            <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("auth.confirm_password") }} *</label>
        <div class="relative">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            class="input-field pr-10"
            autocomplete="new-password"
          />
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors" @click="showConfirmPassword = !showConfirmPassword">
            <svg v-if="showConfirmPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
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

// Date max = 18 ans révolus
const maxBirthDate = new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
  .toISOString().slice(0, 10);

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phone: "",
  birthDate: "",
});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
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
    form.phone,
    form.birthDate,
  );
  loading.value = false;
  if (err) {
    error.value = err.message;
  } else {
    success.value = true;
  }
};
</script>
