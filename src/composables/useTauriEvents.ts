/**
 * Tauri 事件管理 Composable
 * 处理 Tauri 后端事件的监听和清理
 */

import { onMounted, onUnmounted } from "vue";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { MergeProgress, MergeStats } from "../types";
import type { MergeManager } from "./useMerge";
import type { Logger } from "./useLogger";

/**
 * 设置 Tauri 事件监听
 * @param mergeManager - 合并管理器实例
 * @param logger - 日志管理器实例
 */
export function useTauriEvents(
  mergeManager: MergeManager,
  logger: Logger
): void {
  let unlistenProgress: UnlistenFn | null = null;
  let unlistenComplete: UnlistenFn | null = null;
  let unlistenError: UnlistenFn | null = null;

  onMounted(async () => {
    // 监听合并进度
    unlistenProgress = await listen<MergeProgress>(
      "merge-progress",
      (event) => {
        mergeManager.updateProgress(event.payload);
      }
    );

    // 监听合并完成
    unlistenComplete = await listen<MergeStats>("merge-complete", (event) => {
      mergeManager.setComplete(event.payload);
    });

    // 监听合并错误
    unlistenError = await listen<string>("merge-error", (event) => {
      logger.error(event.payload);
    });
  });

  onUnmounted(() => {
    unlistenProgress?.();
    unlistenComplete?.();
    unlistenError?.();
  });
}
