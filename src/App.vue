<script setup lang="ts">
/**
 * Tile Merge App - 瓦片地图合并工具
 */
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import {
  useLogger,
  useFolders,
  useMerge,
  usePreview,
  useTauriEvents,
} from "./composables";

import AppHeader from "./components/layout/AppHeader.vue";
import FolderList from "./components/FolderList.vue";
import OutputSelector from "./components/OutputSelector.vue";
import MergeButton from "./components/MergeButton.vue";
import MergeResult from "./components/MergeResult.vue";
import ActivityLog from "./components/ActivityLog.vue";
import HelpModal from "./components/HelpModal.vue";
import MapPreview from "./components/MapPreview.vue";
import MapPlaceholder from "./components/MapPlaceholder.vue";

const logContainer = ref<HTMLElement | null>(null);
const showHelp = ref(false);

const logger = useLogger(logContainer);
const foldersManager = useFolders(logger);
const mergeManager = useMerge(
  foldersManager.folders,
  foldersManager.outputDir,
  logger
);
const previewManager = usePreview(logger);

useTauriEvents(mergeManager, logger);

async function resetTask(): Promise<void> {
  await previewManager.closePreview();
  foldersManager.reset();
  mergeManager.reset();
  previewManager.reset();
  logger.clearLogs();
  logger.info("已重置");
}

function handlePreviewResult(): void {
  previewManager.openPreviewMap(foldersManager.outputDir.value);
}

// F12 快捷键打开开发者工具
function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === "F12") {
    invoke("open_devtools").catch(() => {});
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="app">
    <AppHeader
      :disable-reset="mergeManager.isMerging.value"
      @show-help="showHelp = true"
      @reset="resetTask"
    />

    <div class="layout">
      <!-- 左栏：文件管理 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <span class="section-label">源文件</span>
          <button
            class="btn-add"
            :disabled="mergeManager.isTaskCompleted.value"
            @click="foldersManager.selectFolders"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            添加文件夹
          </button>
        </div>

        <div class="sidebar-section sidebar-section--grow">
          <div class="section-header">
            <span class="section-label">待合并列表</span>
            <span v-if="foldersManager.folders.value.length" class="badge">
              {{ foldersManager.folders.value.length }} 个
            </span>
          </div>
          <FolderList
            :folders="foldersManager.folders.value"
            :previewing-folder="previewManager.previewingFolder.value"
            :disabled="mergeManager.isTaskCompleted.value"
            @preview="previewManager.previewFolder"
            @remove="foldersManager.removeFolder"
            @move-up="(i) => foldersManager.moveFolder(i, -1)"
            @move-down="(i) => foldersManager.moveFolder(i, 1)"
          />
        </div>

        <div class="sidebar-section">
          <span class="section-label">输出设置</span>
          <OutputSelector
            :output-dir="foldersManager.outputDir.value"
            :disabled="mergeManager.isTaskCompleted.value"
            @select="foldersManager.selectOutputDir"
          />
        </div>

        <div class="sidebar-section">
          <MergeButton
            :can-merge="mergeManager.canMerge.value"
            :is-merging="mergeManager.isMerging.value"
            :progress="mergeManager.progress.value"
            @merge="mergeManager.startMerge"
          />
          <!-- 任务完成提示 -->
          <div
            v-if="mergeManager.isTaskCompleted.value"
            class="task-complete-hint"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
            <span>合并已完成，请点击左上角「新建任务」开始新的合并</span>
          </div>
        </div>
      </aside>

      <!-- 中栏：状态 -->
      <aside class="panel">
        <div v-if="mergeManager.mergeResult.value" class="panel-section">
          <MergeResult
            :result="mergeManager.mergeResult.value"
            @preview="handlePreviewResult"
          />
        </div>
        <div class="panel-section panel-section--grow">
          <ActivityLog :logs="logger.logs.value" />
        </div>
      </aside>

      <!-- 右栏：地图 -->
      <main class="main">
        <MapPreview
          v-if="previewManager.currentTilePath.value"
          :key="previewManager.currentTilePath.value"
          :tile-path="previewManager.currentTilePath.value"
          :tile-server-port="previewManager.tileServerPort.value"
          :visible="!!previewManager.currentTilePath.value"
        />
        <MapPlaceholder v-else />
      </main>
    </div>

    <HelpModal :visible="showHelp" @close="showHelp = false" />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  color: #111827;
  -webkit-font-smoothing: antialiased;
}

.layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  min-width: 300px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.sidebar-section:last-child {
  border-bottom: none;
}

.sidebar-section--grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.panel {
  width: 350px;
  min-width: 350px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
}

.panel-section {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-section--grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  background: #f3f4f6;
  min-width: 0;
  overflow: hidden;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header .section-label {
  margin-bottom: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 9999px;
}

/* 白底深边框按钮 - 参考设计 */
.btn-add {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  color: #111827;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-add:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-add:active {
  background: #f3f4f6;
}

.btn-add svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 任务完成提示 */
.task-complete-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.4;
}

.task-complete-hint svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
