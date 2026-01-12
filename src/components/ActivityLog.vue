<script setup lang="ts">
/**
 * 活动日志
 */
import { ref, watch, nextTick } from "vue";
import type { LogEntry } from "../types";

const props = defineProps<{
  logs: LogEntry[];
}>();

const logContainer = ref<HTMLElement | null>(null);

watch(
  () => props.logs.length,
  async () => {
    await nextTick();
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  }
);
</script>

<template>
  <div class="log-panel">
    <div class="log-header">
      <span class="log-title">活动日志</span>
      <span class="log-count">{{ logs.length }}</span>
    </div>

    <div class="log-list" ref="logContainer">
      <div
        v-for="(log, i) in logs"
        :key="i"
        :class="['log-item', 'log-' + log.type]"
      >
        <span class="log-time">{{ log.time }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
      <div v-if="!logs.length" class="log-empty">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>暂无活动记录</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.log-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border-radius: 9999px;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  line-height: 1.5;
}

.log-time {
  color: var(--text-muted);
  flex-shrink: 0;
}

.log-message {
  color: var(--text-secondary);
  word-break: break-word;
}

.log-success .log-message {
  color: var(--color-success);
}

.log-warning .log-message {
  color: var(--color-warning);
}

.log-error .log-message {
  color: var(--color-error);
}

.log-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  padding: 24px;
}

.log-empty svg {
  width: 24px;
  height: 24px;
  opacity: 0.5;
}
</style>
