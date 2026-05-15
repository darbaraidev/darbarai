<template>
  <form @submit.prevent="onSubmit" class="space-y-5 max-w-lg">
    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">{{
        t("auth.full_name")
      }}</label>
      <input v-model="form.full_name" type="text" class="input w-full" />
    </div>
    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">{{
        t("auth.email")
      }}</label>
      <input
        :value="profile?.email"
        type="email"
        class="input w-full opacity-60"
        disabled
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("account.phone") }} *</label>
      <input v-model="form.phone" type="tel" required class="input w-full" autocomplete="tel" />
    </div>
    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">{{ t("auth.birth_date") }}</label>
      <input
        :value="profile?.birth_date ?? ''"
        type="date"
        class="input w-full opacity-60"
        disabled
      />
      <p class="text-xs text-stone-400 mt-1">{{ t("auth.birth_date_readonly") }}</p>
    </div>
    <div class="flex items-center gap-3">
      <input
        v-model="form.newsletter_subscribed"
        id="newsletter"
        type="checkbox"
        class="w-4 h-4 accent-terracotta-600"
      />
      <label for="newsletter" class="text-sm text-stone-600">{{
        t("account.newsletter_subscribe")
      }}</label>
    </div>

    <div v-if="success" class="text-green-700 text-sm">
      {{ t("account.profile_saved") }}
    </div>
    <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

    <button type="submit" class="btn-primary" :disabled="loading">
      {{ loading ? t("common.loading") : t("common.save") }}
    </button>
  </form>
</template>

<script setup lang="ts">
import type { Profile } from "~/types";

const props = defineProps<{ profile: Profile | null }>();
const { t } = useI18n();
const supabase = useSupabaseClient();

const form = reactive({
  full_name: props.profile?.full_name ?? "",
  phone: props.profile?.phone ?? "",
  newsletter_subscribed: props.profile?.newsletter_subscribed ?? true,
});

watch(
  () => props.profile,
  (p) => {
    if (!p) return;
    form.full_name = p.full_name ?? "";
    form.phone = p.phone ?? "";
    form.newsletter_subscribed = p.newsletter_subscribed;
  },
  { immediate: true },
);

const loading = ref(false);
const success = ref(false);
const error = ref<string | null>(null);

const onSubmit = async () => {
  loading.value = true;
  success.value = false;
  error.value = null;
  const { error: err } = await (supabase as any)
    .from("profiles")
    .update({
      full_name: form.full_name,
      phone: form.phone,
      newsletter_subscribed: form.newsletter_subscribed,
    })
    .eq("id", props.profile!.id);
  loading.value = false;
  if (err) {
    error.value = err.message;
  } else {
    success.value = true;
  }
};
</script>
