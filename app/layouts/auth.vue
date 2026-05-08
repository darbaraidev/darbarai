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
    </div>
  </div>
</template>
