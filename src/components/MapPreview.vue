<script setup lang="ts">
/**
 * 地图预览 - 控制面板分两行
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import L from "leaflet";

const props = defineProps<{
  tilePath: string;
  tileServerPort: number | null;
  visible: boolean;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const zoomLevel = ref(12);
const inputLng = ref(""); // 经度在前
const inputLat = ref(""); // 纬度在后
const clickLng = ref<string | null>(null);
const clickLat = ref<string | null>(null);
const showBaseLayer = ref(true);

let map: L.Map | null = null;
let gaodeLayer: L.TileLayer | null = null;
let tileLayer: L.TileLayer | null = null;
let clickMarker: L.CircleMarker | null = null;

function initMap(): void {
  if (!mapContainer.value || map) return;

  map = L.map(mapContainer.value, {
    center: [31.828937, 117.132797],
    zoom: 12,
    minZoom: 1,
    maxZoom: 24,
    attributionControl: false,
    zoomControl: false,
  });

  gaodeLayer = L.tileLayer(
    "https://webst01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6",
    { maxZoom: 24, maxNativeZoom: 18 }
  ).addTo(map);

  updateTileLayer();

  map.on("zoomend", () => {
    if (map) zoomLevel.value = map.getZoom();
  });

  map.on("click", (e: L.LeafletMouseEvent) => {
    clickLng.value = e.latlng.lng.toFixed(6); // 经度在前
    clickLat.value = e.latlng.lat.toFixed(6); // 纬度在后

    if (clickMarker && map) {
      clickMarker.setLatLng(e.latlng);
    } else if (map) {
      clickMarker = L.circleMarker(e.latlng, {
        radius: 6,
        fillColor: "#10b981",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map);
    }
  });

  zoomLevel.value = map.getZoom();
}

function updateTileLayer(): void {
  if (!map || !props.tileServerPort) return;
  if (tileLayer) map.removeLayer(tileLayer);
  // 使用本地 HTTP 服务器 URL 加载瓦片（跨平台兼容）
  const timestamp = Date.now();
  const tileUrl = `http://127.0.0.1:${props.tileServerPort}/{z}/{x}/{y}.png?t=${timestamp}`;
  tileLayer = L.tileLayer(tileUrl, {
    maxZoom: 24,
    tms: false,
  }).addTo(map);
}

function destroyMap(): void {
  if (clickMarker && map) {
    map.removeLayer(clickMarker);
    clickMarker = null;
  }
  if (tileLayer && map) {
    map.removeLayer(tileLayer);
    tileLayer = null;
  }
  if (gaodeLayer && map) {
    map.removeLayer(gaodeLayer);
    gaodeLayer = null;
  }
  if (map) {
    map.remove();
    map = null;
  }
  clickLng.value = null;
  clickLat.value = null;
}

function gotoLocation(): void {
  const lng = parseFloat(inputLng.value); // 经度
  const lat = parseFloat(inputLat.value); // 纬度
  if (
    !isNaN(lat) &&
    !isNaN(lng) &&
    map &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    map.setView([lat, lng], map.getZoom());
  }
}

function zoomIn(): void {
  if (map) map.zoomIn();
}
function zoomOut(): void {
  if (map) map.zoomOut();
}

function toggleBaseLayer(): void {
  if (!map || !gaodeLayer) return;
  if (showBaseLayer.value) {
    map.addLayer(gaodeLayer);
    gaodeLayer.bringToBack();
  } else {
    map.removeLayer(gaodeLayer);
  }
}

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      await nextTick();
      initMap();
    } else {
      destroyMap();
    }
  },
  { immediate: true }
);

watch(
  () => props.tilePath,
  async () => {
    if (props.visible) {
      // 完全销毁旧地图
      destroyMap();
      // 等待 DOM 更新后重建地图
      await nextTick();
      initMap();
    }
  }
);
watch(showBaseLayer, toggleBaseLayer);

onMounted(() => {
  if (props.visible) nextTick(() => initMap());
});
onUnmounted(() => destroyMap());
</script>

<template>
  <div class="map-preview" v-show="visible">
    <div ref="mapContainer" class="map-container"></div>

    <!-- 缩放控件 - 右下角 -->
    <div class="zoom-controls">
      <button @click="zoomIn">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>放大</span>
      </button>
      <button @click="zoomOut">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M5 12h14" />
        </svg>
        <span>缩小</span>
      </button>
    </div>

    <!-- 控制面板 - 左下角两行布局 -->
    <div class="control-panel">
      <!-- 第一行：输入经纬度并定位 -->
      <div class="panel-row">
        <span class="row-label">定位</span>
        <div class="input-group">
          <input
            v-model="inputLng"
            type="text"
            placeholder="经度 如 117.132797"
            @keypress.enter="gotoLocation"
          />
        </div>
        <div class="input-group">
          <input
            v-model="inputLat"
            type="text"
            placeholder="纬度 如 31.828937"
            @keypress.enter="gotoLocation"
          />
        </div>
        <button class="btn-action" @click="gotoLocation">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
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
          <span v-if="clickLng && clickLat" class="data-value data-value--mono"
            >{{ clickLng }}, {{ clickLat }}</span
          >
          <span v-else class="data-hint">点击地图获取</span>
        </div>
        <div class="data-divider"></div>
        <label class="data-item data-item--toggle">
          <input type="checkbox" v-model="showBaseLayer" />
          <span>显示卫星底图</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-preview {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f9fafb;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 关闭按钮 - 右上角 */
.btn-close-map {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  z-index: 1000;
  transition: all 150ms ease;
}

.btn-close-map:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-close-map svg {
  width: 16px;
  height: 16px;
}

/* 缩放控件 - 右下角 */
.zoom-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1000;
}

.zoom-controls button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.zoom-controls button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.zoom-controls button svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

/* 控制面板 - 左下角两行布局 */
.control-panel {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

/* 第一行 */
.panel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.input-group input {
  width: 140px;
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  font-family: "SF Mono", Consolas, monospace;
  color: #111827;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.input-group input:focus {
  outline: none;
  border-color: #10b981;
  background: #ffffff;
}

.input-group input::placeholder {
  color: #9ca3af;
  font-family: -apple-system, sans-serif;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-action:hover {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

.btn-action svg {
  width: 14px;
  height: 14px;
  color: #6b7280;
}

.btn-action:hover svg {
  color: #166534;
}

/* 第二行 - 数据展示 */
.panel-row--data {
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-item--toggle {
  cursor: pointer;
  user-select: none;
}

.data-item--toggle input {
  width: 14px;
  height: 14px;
  accent-color: #10b981;
}

.data-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 8px;
}

.data-label {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.data-value {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.data-value--mono {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 12px;
  font-weight: 500;
}

.data-hint {
  font-size: 12px;
  color: #9ca3af;
}
</style>
