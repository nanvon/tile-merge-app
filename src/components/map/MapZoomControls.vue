<script setup lang="ts">
/**
 * 地图缩放控件组件
 */
import Icon from "../ui/Icon.vue";

const emit = defineEmits<{
  zoomIn: [];
  zoomOut: [];
}>();
</script>

<template>
  <div class="zoom-controls">
    <button @click="emit('zoomIn')" title="放大">
      <Icon name="plus" />
      <span>放大</span>
    </button>
    <button @click="emit('zoomOut')" title="缩小">
      <Icon name="zoomOut" />
      <span>缩小</span>
    </button>
  </div>
</template>

<style scoped>
.zoom-controls {
  position: absolute;
  bottom: var(--space-4, 16px);
  right: var(--space-4, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  z-index: 1000;
}

.zoom-controls button {
  display: flex;
  align-items: center;
  gap: var(--space-2, 6px);
  height: 36px;
  padding: 0 var(--space-3, 12px);
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e7eb);
  border-radius: var(--radius-lg, 10px);
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.06));
  color: var(--text-secondary, #374151);
  font-size: var(--text-base, 13px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
}

.zoom-controls button:hover {
  background: var(--bg-subtle, #f9fafb);
  border-color: var(--color-gray-300, #d1d5db);
}

.zoom-controls button :deep(.icon) {
  color: var(--text-muted, #6b7280);
}
</style>
