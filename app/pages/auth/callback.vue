<script setup lang="ts">
// Callback OAuth – Supabase gère la session automatiquement via @nuxtjs/supabase
// Cette page est le point de redirection post-OAuth Google
definePageMeta({ layout: false });

onMounted(async () => {
  // Le module @nuxtjs/supabase échange le code PKCE automatiquement
  // On attend juste que la session soit prête puis on redirige
  await navigateTo("/account", { replace: true });
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-stone-500">Connexion en cours…</p>
  </div>
</template>
