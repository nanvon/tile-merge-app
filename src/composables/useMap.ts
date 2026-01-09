/**
 * 地图管理 Composable
 * 处理 Leaflet 地图的初始化、图层管理和交互
 */

import { ref, onMounted, onUnmounted, nextTick, watch, type Ref } from "vue";
import L from "leaflet";

export interface UseMapOptions {
  /** 地图容器元素 */
  container: Ref<HTMLElement | null>;
  /** 瓦片服务器端口 */
  tileServerPort: Ref<number | null>;
  /** 是否可见 */
  visible: Ref<boolean>;
  /** 瓦片路径（用于重新加载） */
  tilePath: Ref<string | null>;
}

export interface MapState {
  /** 当前缩放级别 */
  zoomLevel: Ref<number>;
  /** 点击的经度 */
  clickLng: Ref<string | null>;
  /** 点击的纬度 */
  clickLat: Ref<string | null>;
  /** 是否显示底图 */
  showBaseLayer: Ref<boolean>;
}

export interface MapActions {
  /** 初始化地图 */
  initMap: () => void;
  /** 销毁地图 */
  destroyMap: () => void;
  /** 放大 */
  zoomIn: () => void;
  /** 缩小 */
  zoomOut: () => void;
  /** 跳转到指定位置 */
  gotoLocation: (lng: number, lat: number) => void;
  /** 切换底图显示 */
  toggleBaseLayer: () => void;
}

/**
 * 创建地图管理器
 */
export function useMap(options: UseMapOptions): MapState & MapActions {
  const { container, tileServerPort, visible, tilePath } = options;

  // 状态
  const zoomLevel = ref(12);
  const clickLng = ref<string | null>(null);
  const clickLat = ref<string | null>(null);
  const showBaseLayer = ref(true);

  // 地图实例
  let map: L.Map | null = null;
  let gaodeLayer: L.TileLayer | null = null;
  let tileLayer: L.TileLayer | null = null;
  let clickMarker: L.CircleMarker | null = null;

  /**
   * 初始化地图
   */
  function initMap(): void {
    if (!container.value || map) return;

    map = L.map(container.value, {
      center: [31.828937, 117.132797],
      zoom: 12,
      minZoom: 1,
      maxZoom: 24,
      attributionControl: false,
      zoomControl: false,
    });

    // 高德卫星图底图
    gaodeLayer = L.tileLayer(
      "https://webst01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6",
      { maxZoom: 24, maxNativeZoom: 18 }
    ).addTo(map);

    // 添加自定义瓦片图层
    updateTileLayer();

    // 监听缩放事件
    map.on("zoomend", () => {
      if (map) zoomLevel.value = map.getZoom();
    });

    // 监听点击事件
    map.on("click", (e: L.LeafletMouseEvent) => {
      clickLng.value = e.latlng.lng.toFixed(6);
      clickLat.value = e.latlng.lat.toFixed(6);

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

  /**
   * 更新瓦片图层
   */
  function updateTileLayer(): void {
    if (!map || !tileServerPort.value) return;
    if (tileLayer) map.removeLayer(tileLayer);

    const timestamp = Date.now();
    const tileUrl = `http://127.0.0.1:${tileServerPort.value}/{z}/{x}/{y}.png?t=${timestamp}`;
    tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 24,
      tms: false,
    }).addTo(map);
  }

  /**
   * 销毁地图
   */
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

  /**
   * 放大
   */
  function zoomIn(): void {
    if (map) map.zoomIn();
  }

  /**
   * 缩小
   */
  function zoomOut(): void {
    if (map) map.zoomOut();
  }

  /**
   * 跳转到指定位置
   */
  function gotoLocation(lng: number, lat: number): void {
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

  /**
   * 切换底图显示
   */
  function toggleBaseLayer(): void {
    if (!map || !gaodeLayer) return;
    if (showBaseLayer.value) {
      map.addLayer(gaodeLayer);
      gaodeLayer.bringToBack();
    } else {
      map.removeLayer(gaodeLayer);
    }
  }

  // 监听可见性变化
  watch(
    visible,
    async (isVisible) => {
      if (isVisible) {
        await nextTick();
        initMap();
      } else {
        destroyMap();
      }
    },
    { immediate: true }
  );

  // 监听瓦片路径变化，重新初始化地图
  watch(tilePath, async () => {
    if (visible.value) {
      destroyMap();
      await nextTick();
      initMap();
    }
  });

  // 监听底图开关变化
  watch(showBaseLayer, toggleBaseLayer);

  // 生命周期
  onMounted(() => {
    if (visible.value) nextTick(() => initMap());
  });

  onUnmounted(() => destroyMap());

  return {
    // 状态
    zoomLevel,
    clickLng,
    clickLat,
    showBaseLayer,
    // 方法
    initMap,
    destroyMap,
    zoomIn,
    zoomOut,
    gotoLocation,
    toggleBaseLayer,
  };
}
