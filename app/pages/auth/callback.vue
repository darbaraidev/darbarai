<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-stone-500">Connexion en cours…</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

onMounted(() => {
  const supabase = useSupabaseClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    subscription.unsubscribe();

    if (event === "PASSWORD_RECOVERY") {
      navigateTo("/auth/reset-password", { replace: true });
      return;
    }

    // Sync phone + birth_date depuis user_metadata vers profiles
    // (le trigger Supabase ne copie pas forcément tous les champs)
    if (session?.user) {
      const meta = session.user.user_metadata ?? {};
      const updates: Record<string, string> = {};
      if (meta.phone) updates.phone = meta.phone;
      if (meta.birth_date) updates.birth_date = meta.birth_date;
      if (Object.keys(updates).length > 0) {
        await (supabase as any)
          .from("profiles")
          .update(updates)
          .eq("id", session.user.id);
      }
    }

    const redirect = localStorage.getItem("auth_redirect") || "/account";
    localStorage.removeItem("auth_redirect");
    navigateTo(redirect, { replace: true });
  });

  setTimeout(() => {
    subscription.unsubscribe();
    navigateTo("/account", { replace: true });
  }, 5000);
});
</script>
