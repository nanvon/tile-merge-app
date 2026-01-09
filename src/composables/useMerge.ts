/**
 * 合并操作 Composable
 * 处理瓦片合并的触发和状态管理
 */

import { ref, computed, type Ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import type { MergeProgress, MergeStats, FolderInfo } from "../types";
import type { Logger } from "./useLogger";

/**
 * 创建合并操作管理器
 * @param folders - 文件夹列表引用
 * @param outputDir - 输出目录引用
 * @param logger - 日志管理器实例
 */
export function useMerge(
  folders: Ref<FolderInfo[]>,
  outputDir: Ref<string>,
  logger: Logger
) {
  /** 是否正在合并 */
  const isMerging = ref(false);

  /** 当前合并进度 */
  const progress = ref<MergeProgress | null>(null);

  /** 合并结果 */
  const mergeResult = ref<MergeStats | null>(null);

  /** 是否可以开始合并 */
  const canMerge = computed(() => {
    return (
      folders.value.length >= 1 &&
      !!outputDir.value &&
      !isMerging.value &&
      !mergeResult.value
    );
  });

  /** 任务是否已完成（合并结果已存在） */
  const isTaskCompleted = computed(() => !!mergeResult.value);

  /**
   * 更新进度
   * @param newProgress - 新的进度信息
   */
  function updateProgress(newProgress: MergeProgress): void {
    progress.value = newProgress;

    if (newProgress.is_folder_complete) {
      logger.info(
        `📁 ${newProgress.folder_name}: 合并 ${newProgress.folder_merged}, 复制 ${newProgress.folder_copied}`
      );
    }
  }

  /**
   * 设置合并完成
   * @param stats - 合并统计结果
   */
  function setComplete(stats: MergeStats): void {
    mergeResult.value = stats;
  }

  /**
   * 开始合并操作
   */
  async function startMerge(): Promise<void> {
    if (!canMerge.value) return;

    isMerging.value = true;
    mergeResult.value = null;
    progress.value = null;
    logger.info("开始合并...");

    try {
      const result = await invoke<MergeStats>("start_merge", {
        folders: folders.value.map((f) => f.path),
        outputDir: outputDir.value,
      });

      mergeResult.value = result;
      const duration = (result.duration_ms / 1000).toFixed(2);
      logger.success(
        `完成! 处理 ${result.total_processed} 文件，耗时 ${duration}s`
      );
    } catch (e) {
      logger.error(`合并失败: ${e}`);
    } finally {
      isMerging.value = false;
    }
  }

  /**
   * 重置合并状态
   */
  function reset(): void {
    isMerging.value = false;
    progress.value = null;
    mergeResult.value = null;
  }

  return {
    isMerging,
    progress,
    mergeResult,
    canMerge,
    isTaskCompleted,
    updateProgress,
    setComplete,
    startMerge,
    reset,
  };
}

/** 合并管理器类型 */
export type MergeManager = ReturnType<typeof useMerge>;
