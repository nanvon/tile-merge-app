<script setup lang="ts">
/**
 * 地图预览组件（重构版）
 * 使用 useMap composable 和拆分的子组件
 */
import { ref, toRef } from "vue";
import { useMap } from "../../composables/useMap";
import Icon from "../ui/Icon.vue";
import MapZoomControls from "./MapZoomControls.vue";
import MapControlPanel from "./MapControlPanel.vue";

const props = defineProps<{
  tilePath: string;
  tileServerPort: number | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const mapContainer = ref<HTMLElement | null>(null);

// 使用 useMap composable 管理地图逻辑
const {
  zoomLevel,
  clickLng,
  clickLat,
  showBaseLayer,
  zoomIn,
  zoomOut,
  gotoLocation,
} = useMap({
  container: mapContainer,
  tileServerPort: toRef(props, "tileServerPort"),
  visible: toRef(props, "visible"),
  tilePath: toRef(props, "tilePath"),
});
</script>

<template>
  <div class="map-preview" v-show="visible">
    <div ref="mapContainer" class="map-container"></div>

    <!-- 关闭按钮 - 右上角 -->
    <button class="btn-close-map" @click="emit('close')">
      <Icon name="close" />
      <span>关闭预览</span>
    </button>

    <!-- 缩放控件 - 右下角 -->
    <MapZoomControls @zoom-in="zoomIn" @zoom-out="zoomOut" />

    <!-- 控制面板 - 左下角 -->
    <MapControlPanel
      :zoom-level="zoomLevel"
      :click-lng="clickLng"
      :click-lat="clickLat"
      v-model:show-base-layer="showBaseLayer"
      @goto-location="gotoLocation"
    />
  </div>
</template>

<style scoped>
.map-preview {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg-subtle, #f9fafb);
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 关闭按钮 - 右上角 */
.btn-close-map {
  position: absolute;
  top: var(--space-4, 16px);
  right: var(--space-4, 16px);
  display: flex;
  align-items: center;
  gap: var(--space-2, 6px);
  height: 36px;
  padding: 0 var(--space-3, 12px);
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e7eb);
  border-radius: var(--radius-lg, 10px);
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.06));
  color: var(--text-secondary, #374151);
  font-size: var(--text-base, 13px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  z-index: 1000;
  transition: all var(--transition-fast, 150ms ease);
}

.btn-close-map:hover {
  background: var(--color-error-light, #fef2f2);
  border-color: var(--color-error, #fecaca);
  color: var(--color-error, #dc2626);
}
</style>
