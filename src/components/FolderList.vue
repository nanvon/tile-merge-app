<script setup lang="ts">
/**
 * 文件夹列表
 */
import type { FolderInfo } from "../types";
import FolderCard from "./FolderCard.vue";

defineProps<{
  folders: FolderInfo[];
  previewingFolder: string | null;
  /** 是否禁用编辑操作 */
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
  <div class="folder-list">
    <FolderCard
      v-for="(folder, index) in folders"
      :key="folder.path"
      :folder="folder"
      :index="index"
      :is-first="index === 0"
      :is-last="index === folders.length - 1"
      :is-previewing="previewingFolder === folder.path"
      :disabled="disabled"
      @preview="$emit('preview', folder)"
      @remove="$emit('remove', index)"
      @move-up="$emit('move-up', index)"
      @move-down="$emit('move-down', index)"
    />

    <div v-if="!folders.length" class="empty-state">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>
      <p class="empty-text">添加瓦片文件夹开始</p>
    </div>
  </div>
</template>

<style scoped>
.folder-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 16px;
  color: var(--text-muted);
}

.empty-icon svg {
  width: 24px;
  height: 24px;
}

.empty-text {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
