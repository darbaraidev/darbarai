<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="absolute inset-0 bg-black/40" @click="$emit('update:modelValue', false)" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
          <div class="space-y-1.5">
            <h3 class="font-semibold text-stone-800 text-lg">{{ title }}</h3>
            <p v-if="description" class="text-sm text-stone-500 leading-relaxed">
              {{ description }}
            </p>
          </div>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              @click="$emit('update:modelValue', false)"
            >
              {{ cancelLabel || t("common.cancel") }}
            </button>
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-terracotta-600 hover:bg-terracotta-700'"
              @click="confirm"
            >
              {{ confirmLabel || t("common.delete") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();

const { t } = useI18n();

function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
