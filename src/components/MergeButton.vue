<script setup lang="ts">
/**
 * 合并按钮 - 白底深边框样式
 */
import type { MergeProgress } from "../types";

defineProps<{
  canMerge: boolean;
  isMerging: boolean;
  progress: MergeProgress | null;
}>();

defineEmits<{
  merge: [];
}>();
</script>

<template>
  <div class="merge-action">
    <button
      class="btn-merge"
      :class="{ 'is-merging': isMerging }"
      :disabled="!canMerge"
      @click="$emit('merge')"
    >
      <template v-if="isMerging">
        <svg
          class="spinner"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <span>合并中 {{ progress?.percentage?.toFixed(0) || 0 }}%</span>
      </template>
      <template v-else>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
        </svg>
        <span>开始合并</span>
      </template>
    </button>

    <div v-if="isMerging && progress" class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: progress.percentage + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.merge-action {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 白底深边框样式 */
.btn-merge {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #111827;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-merge:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-merge:active:not(:disabled) {
  background: #f3f4f6;
}

.btn-merge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-merge.is-merging {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}

.btn-merge svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.progress-track {
  height: 3px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 9999px;
  transition: width 200ms ease;
}
</style>
