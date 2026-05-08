<template>
  <div class="min-h-screen bg-stone-100 flex">
    <!-- Sidebar -->
    <AdminSidebar />
    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <AdminHeader />
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
