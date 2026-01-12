<script setup lang="ts">
/**
 * 输出目录选择器
 */
defineProps<{
  outputDir: string;
  /** 是否禁用 */
  disabled?: boolean;
}>();

defineEmits<{
  select: [];
}>();

function getFolderName(path: string): string {
  return path.split("/").pop() || path;
}
</script>

<template>
  <button
    class="output-selector"
    :class="{ 'is-disabled': disabled }"
    :disabled="disabled"
    @click="$emit('select')"
  >
    <div class="selector-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
        />
      </svg>
    </div>
    <div class="selector-content">
      <span class="selector-label">输出目录</span>
      <span class="selector-value" :class="{ 'is-placeholder': !outputDir }">
        {{ outputDir ? getFolderName(outputDir) : "点击选择目录..." }}
      </span>
    </div>
    <svg
      class="selector-arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  </button>
</template>

<style scoped>
.output-selector {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}

.output-selector:hover:not(:disabled) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.output-selector:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.selector-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 8px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.selector-icon svg {
  width: 16px;
  height: 16px;
}

.selector-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.selector-label {
  font-size: 11px;
  color: var(--text-muted);
}

.selector-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selector-value.is-placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.selector-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
