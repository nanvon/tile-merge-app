<script setup lang="ts">
/**
 * 应用顶栏
 */
defineProps<{
  /** 是否禁用新建任务按钮（合并中） */
  disableReset?: boolean;
}>();

defineEmits<{
  "show-help": [];
  reset: [];
}>();
</script>

<template>
  <header class="header">
    <!-- 左侧：操作按钮 -->
    <div class="header-left">
      <button class="header-btn" @click="$emit('show-help')">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
        <span>使用帮助</span>
      </button>
      <button
        class="header-btn"
        :disabled="disableReset"
        @click="$emit('reset')"
        :title="disableReset ? '合并进行中，请等待完成' : '新建任务'"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span>新建任务</span>
      </button>
    </div>

    <!-- 右侧留空或放其他内容 -->
    <div class="header-right"></div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 52px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.header-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.header-btn svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
