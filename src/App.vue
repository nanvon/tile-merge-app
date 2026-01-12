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
      :disable-reset="
        mergeManager.isMerging.value || foldersManager.isLoading.value
      "
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
            :disabled="
              mergeManager.isTaskCompleted.value ||
              foldersManager.isLoading.value ||
              mergeManager.isMerging.value
            "
            @click="foldersManager.selectFolders"
          >
            <template v-if="foldersManager.isLoading.value">
              <svg
                class="loading-spinner"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
              </svg>
              添加中...
            </template>
            <template v-else>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              添加文件夹
            </template>
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
            :disabled="
              mergeManager.isTaskCompleted.value ||
              foldersManager.isLoading.value ||
              mergeManager.isMerging.value
            "
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
            :disabled="
              mergeManager.isTaskCompleted.value ||
              foldersManager.isLoading.value ||
              mergeManager.isMerging.value
            "
            @select="foldersManager.selectOutputDir"
          />
        </div>

        <div class="sidebar-section">
          <MergeButton
            :can-merge="
              mergeManager.canMerge.value && !foldersManager.isLoading.value
            "
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
  background: var(--bg-base);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
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
  background: var(--bg-subtle);
  border-right: 1px solid var(--border-default);
  overflow: hidden;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
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
  background: var(--bg-subtle);
  border-right: 1px solid var(--border-default);
  overflow: hidden;
}

.panel-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
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
  background: var(--bg-muted);
  min-width: 0;
  overflow: hidden;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
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
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border-radius: 9999px;
}

/* 添加文件夹按钮 - 虚线边框样式 */
.btn-add {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  border: 1.5px dashed var(--color-gray-600);
  border-radius: 10px;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-add:hover:not(:disabled) {
  background: var(--bg-elevated);
  border-color: var(--color-accent);
  border-style: solid;
  color: var(--color-accent);
}

.btn-add:active:not(:disabled) {
  background: var(--color-accent-light);
  transform: scale(0.98);
}

.btn-add svg {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.btn-add:hover:not(:disabled) svg {
  opacity: 1;
}

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Loading spinner 动画 */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 任务完成提示 */
.task-complete-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--color-warning-light);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-warning);
  line-height: 1.4;
}

.task-complete-hint svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
