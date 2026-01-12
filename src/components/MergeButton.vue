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

/* 开始合并按钮 - 发光渐变样式 */
.btn-merge {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--color-accent) 0%, #0d9488 100%);
  border: none;
  border-radius: 10px;
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 12px var(--color-accent-glow);
  position: relative;
  overflow: hidden;
}

.btn-merge::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%,
    transparent 100%
  );
  pointer-events: none;
}

.btn-merge:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--color-accent-hover) 0%,
    var(--color-accent) 100%
  );
  box-shadow: 0 4px 20px var(--color-accent-glow);
  transform: translateY(-1px);
}

.btn-merge:active:not(:disabled) {
  transform: scale(0.98) translateY(0);
  box-shadow: 0 2px 8px var(--color-accent-glow);
}

.btn-merge:disabled {
  background: var(--bg-elevated);
  color: var(--text-muted);
  box-shadow: none;
  cursor: not-allowed;
}

.btn-merge.is-merging {
  background: var(--bg-elevated);
  color: var(--text-secondary);
  box-shadow: none;
}

.btn-merge.is-merging::before {
  display: none;
}

.btn-merge svg {
  width: 16px;
  height: 16px;
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
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  border-radius: 9999px;
  transition: width 200ms ease;
  box-shadow: 0 0 8px var(--color-accent-glow);
}
</style>
