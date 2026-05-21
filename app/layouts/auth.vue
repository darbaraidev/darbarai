<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/">
          <span class="font-serif text-2xl text-terracotta-700">Dar Baraï</span>
        </NuxtLink>
      </div>
      <div class="card p-8">
        <slot />
      </div>
      <div class="text-center mt-5">
        <NuxtLink
          to="/"
          class="text-sm text-stone-400 hover:text-stone-600 transition-colors inline-flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
