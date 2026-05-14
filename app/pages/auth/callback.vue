<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-stone-500">Connexion en cours…</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

onMounted(() => {
  const supabase = useSupabaseClient();

  // Supabase émet PASSWORD_RECOVERY quand le lien de reset est utilisé.
  // Dans tous les autres cas (magic link, confirm) → /account.
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    subscription.unsubscribe();
    if (event === "PASSWORD_RECOVERY") {
      navigateTo("/auth/reset-password", { replace: true });
    } else {
      const redirect = localStorage.getItem("auth_redirect") || "/account";
      localStorage.removeItem("auth_redirect");
      navigateTo(redirect, { replace: true });
    }
  });

  // Fallback si l'événement ne se déclenche pas dans les 5s
  setTimeout(() => {
    subscription.unsubscribe();
    navigateTo("/account", { replace: true });
  }, 5000);
});
</script>
