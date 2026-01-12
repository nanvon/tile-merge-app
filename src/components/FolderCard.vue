<script setup lang="ts">
/**
 * 文件夹卡片
 */
import type { FolderInfo } from "../types";

defineProps<{
  folder: FolderInfo;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isPreviewing: boolean;
  /** 是否禁用编辑操作（任务已完成时） */
  disabled?: boolean;
}>();

defineEmits<{
  preview: [folder: FolderInfo];
  remove: [index: number];
  "move-up": [index: number];
  "move-down": [index: number];
}>();
</script>

<template>
  <div class="folder-card">
    <div class="folder-info">
      <div class="folder-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>
      <div class="folder-text">
        <span class="folder-name" :title="folder.path">{{ folder.name }}</span>
        <span class="folder-meta"
          >{{ folder.tile_count.toLocaleString() }} 瓦片</span
        >
      </div>
    </div>
    <div class="folder-actions">
      <button
        class="action-btn"
        @click="$emit('preview', folder)"
        :disabled="isPreviewing"
        title="预览"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        class="action-btn"
        @click="$emit('move-up', index)"
        :disabled="isFirst || disabled"
        title="上移"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
      <button
        class="action-btn"
        @click="$emit('move-down', index)"
        :disabled="isLast || disabled"
        title="下移"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <button
        class="action-btn action-btn--danger"
        @click="$emit('remove', index)"
        :disabled="disabled"
        title="移除"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.folder-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  transition: all 150ms ease;
}

.folder-card:hover {
  border-color: var(--color-gray-600);
  background: var(--bg-elevated);
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.folder-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-light);
  border-radius: 8px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.folder-icon svg {
  width: 16px;
  height: 16px;
}

.folder-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.folder-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.folder-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.action-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 150ms ease;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.action-btn:hover:not(:disabled) {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn--danger:hover:not(:disabled) {
  background: var(--color-error-light);
  color: var(--color-error);
}
</style>
