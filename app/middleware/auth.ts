// Redirige vers /auth/login si non connecté
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();
  if (!user.value) {
    return navigateTo("/auth/login");
  }
});
