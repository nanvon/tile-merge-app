<script setup lang="ts">
/**
 * 合并结果
 */
import type { MergeStats } from "../types";

defineProps<{
  result: MergeStats;
}>();

defineEmits<{
  preview: [];
}>();
</script>

<template>
  <div class="result-card">
    <div class="result-header">
      <div class="result-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div class="result-title">
        <span class="title">合并完成</span>
        <span class="subtitle"
          >{{ (result.duration_ms / 1000).toFixed(1) }}s</span
        >
      </div>
    </div>

    <div class="result-stats">
      <div class="stat">
        <span class="stat-value">{{
          result.total_processed.toLocaleString()
        }}</span>
        <span class="stat-label">处理</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{
          result.merged_count.toLocaleString()
        }}</span>
        <span class="stat-label">合并</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{
          result.copied_count.toLocaleString()
        }}</span>
        <span class="stat-label">复制</span>
      </div>
    </div>

    <button class="btn-preview" @click="$emit('preview')">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      预览结果
    </button>
  </div>
</template>

<style scoped>
.result-card {
  padding: 16px;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #059669;
  border-radius: 9999px;
  color: #ffffff;
}

.result-icon svg {
  width: 16px;
  height: 16px;
}

.result-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
}

.subtitle {
  font-size: 11px;
  color: #047857;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #065f46;
}

.stat-label {
  font-size: 11px;
  color: #047857;
}

.btn-preview {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #2563eb;
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-preview:hover {
  background: #1d4ed8;
}

.btn-preview svg {
  width: 16px;
  height: 16px;
}
</style>
