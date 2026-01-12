<script setup lang="ts">
/**
 * 地图占位
 */
</script>

<template>
  <div class="map-placeholder">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      </div>
      <div class="placeholder-text">
        <p class="placeholder-title">地图预览</p>
        <p class="placeholder-hint">选择文件夹并点击预览按钮</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-muted);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  color: var(--text-muted);
}

.placeholder-icon svg {
  width: 32px;
  height: 32px;
}

.placeholder-text {
  text-align: center;
}

.placeholder-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.placeholder-hint {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
