<script setup lang="ts">
/**
 * 地图控制面板组件
 * 包含坐标输入、缩放级别显示、点击坐标显示、底图开关
 */
import { ref } from "vue";
import Icon from "../ui/Icon.vue";

const props = defineProps<{
  /** 当前缩放级别 */
  zoomLevel: number;
  /** 点击的经度 */
  clickLng: string | null;
  /** 点击的纬度 */
  clickLat: string | null;
  /** 是否显示底图 */
  showBaseLayer: boolean;
}>();

const emit = defineEmits<{
  "goto-location": [lng: number, lat: number];
  "update:showBaseLayer": [value: boolean];
}>();

const inputLng = ref("");
const inputLat = ref("");

function handleGoto(): void {
  const lng = parseFloat(inputLng.value);
  const lat = parseFloat(inputLat.value);
  if (!isNaN(lng) && !isNaN(lat)) {
    emit("goto-location", lng, lat);
  }
}

function toggleBaseLayer(): void {
  emit("update:showBaseLayer", !props.showBaseLayer);
}
</script>

<template>
  <div class="control-panel">
    <!-- 第一行：输入经纬度并定位 -->
    <div class="panel-row">
      <span class="row-label">定位</span>
      <div class="input-group">
        <input
          v-model="inputLng"
          type="text"
          placeholder="经度 如 117.132797"
          @keypress.enter="handleGoto"
        />
      </div>
      <div class="input-group">
        <input
          v-model="inputLat"
          type="text"
          placeholder="纬度 如 31.828937"
          @keypress.enter="handleGoto"
        />
      </div>
      <button class="btn-action" @click="handleGoto">
        <Icon multi="mapPin" size="sm" />
        <span>跳转</span>
      </button>
    </div>

    <!-- 第二行：展示数据 -->
    <div class="panel-row panel-row--data">
      <div class="data-item">
        <span class="data-label">缩放级别</span>
        <span class="data-value">{{ zoomLevel }}</span>
      </div>
      <div class="data-divider"></div>
      <div class="data-item">
        <span class="data-label">点击坐标</span>
        <span v-if="clickLng && clickLat" class="data-value data-value--mono">
          {{ clickLng }}, {{ clickLat }}
        </span>
        <span v-else class="data-hint">点击地图获取</span>
      </div>
      <div class="data-divider"></div>
      <label class="data-item data-item--toggle">
        <input
          type="checkbox"
          :checked="showBaseLayer"
          @change="toggleBaseLayer"
        />
        <span>显示卫星底图</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  position: absolute;
  bottom: var(--space-4, 16px);
  left: var(--space-4, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px);
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e7eb);
  border-radius: var(--radius-xl, 12px);
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.06));
  z-index: 1000;
}

.panel-row {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.row-label {
  font-size: var(--text-sm, 12px);
  font-weight: var(--font-medium, 500);
  color: var(--text-muted, #6b7280);
  white-space: nowrap;
}

.input-group input {
  width: 140px;
  height: 32px;
  padding: 0 var(--space-3, 10px);
  font-size: var(--text-sm, 12px);
  font-family: var(--font-mono);
  color: var(--text-primary, #111827);
  background: var(--bg-subtle, #f9fafb);
  border: 1px solid var(--border-default, #e5e7eb);
  border-radius: var(--radius-md, 8px);
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-success, #10b981);
  background: var(--bg-base, #ffffff);
}

.input-group input::placeholder {
  color: var(--text-muted, #9ca3af);
  font-family: var(--font-sans);
}

.btn-action {
  display: flex;
  align-items: center;
  gap: var(--space-2, 6px);
  height: 32px;
  padding: 0 var(--space-3, 12px);
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  color: var(--text-secondary, #374151);
  font-size: var(--text-sm, 12px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
}

.btn-action:hover {
  background: var(--color-success-light, #f0fdf4);
  border-color: var(--color-success, #86efac);
  color: var(--color-success, #166534);
}

.btn-action :deep(.icon) {
  color: var(--text-muted, #6b7280);
}

.btn-action:hover :deep(.icon) {
  color: var(--color-success, #166534);
}

/* 第二行 - 数据展示 */
.panel-row--data {
  padding-top: var(--space-2, 8px);
  border-top: 1px solid var(--border-muted, #f3f4f6);
}

.data-item {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.data-item--toggle {
  cursor: pointer;
  user-select: none;
}

.data-item--toggle input {
  width: 14px;
  height: 14px;
  accent-color: var(--color-success, #10b981);
}

.data-divider {
  width: 1px;
  height: 20px;
  background: var(--border-default, #e5e7eb);
  margin: 0 var(--space-2, 8px);
}

.data-label {
  font-size: var(--text-xs, 11px);
  color: var(--text-muted, #9ca3af);
  white-space: nowrap;
}

.data-value {
  font-size: var(--text-base, 13px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-primary, #111827);
}

.data-value--mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm, 12px);
  font-weight: var(--font-medium, 500);
}

.data-hint {
  font-size: var(--text-sm, 12px);
  color: var(--text-muted, #9ca3af);
}
</style>
