/**
 * 预览管理 Composable
 * 处理瓦片地图预览的开启和关闭
 */

import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import type { FolderInfo } from "../types";
import type { Logger } from "./useLogger";

/**
 * 创建预览管理器
 * @param logger - 日志管理器实例
 */
export function usePreview(logger: Logger) {
  /** 当前预览的瓦片路径 */
  const currentTilePath = ref<string | null>(null);

  /** 正在加载预览的文件夹路径 */
  const previewingFolder = ref<string | null>(null);

  /** 是否正在启动预览 */
  const isStartingPreview = ref(false);

  /** 瓦片服务器端口 */
  const tileServerPort = ref<number | null>(null);

  /**
   * 预览指定文件夹的瓦片
   * @param folder - 文件夹信息
   */
  async function previewFolder(folder: FolderInfo): Promise<void> {
    previewingFolder.value = folder.path;
    logger.info(`预览: ${folder.name}`);

    try {
      const port = await invoke<number | null>("set_tile_path", {
        path: folder.path,
      });
      tileServerPort.value = port;
      currentTilePath.value = folder.path;
      // 打印瓦片服务地址用于调试
      if (port) {
        logger.info(`瓦片服务: http://127.0.0.1:${port}/{z}/{x}/{y}.png`);
      }
      logger.success("预览已开启");
    } catch (e) {
      logger.error(`预览失败: ${e}`);
    } finally {
      previewingFolder.value = null;
    }
  }

  /**
   * 预览合并结果
   * @param outputDir - 输出目录路径
   */
  async function openPreviewMap(outputDir: string): Promise<void> {
    if (!outputDir) return;

    isStartingPreview.value = true;
    logger.info("启动结果预览...");

    try {
      const port = await invoke<number | null>("set_tile_path", {
        path: outputDir,
      });
      tileServerPort.value = port;
      currentTilePath.value = outputDir;
      logger.success("预览已开启");
    } catch (e) {
      logger.error(`预览失败: ${e}`);
    } finally {
      isStartingPreview.value = false;
    }
  }

  /**
   * 关闭预览
   */
  async function closePreview(): Promise<void> {
    currentTilePath.value = null;
    tileServerPort.value = null;
    try {
      await invoke("set_tile_path", { path: null });
    } catch (e) {
      // 忽略关闭时的错误
    }
  }

  /**
   * 重置预览状态
   */
  function reset(): void {
    currentTilePath.value = null;
    previewingFolder.value = null;
    isStartingPreview.value = false;
    tileServerPort.value = null;
  }

  return {
    currentTilePath,
    previewingFolder,
    isStartingPreview,
    tileServerPort,
    previewFolder,
    openPreviewMap,
    closePreview,
    reset,
  };
}

/** 预览管理器类型 */
export type PreviewManager = ReturnType<typeof usePreview>;
