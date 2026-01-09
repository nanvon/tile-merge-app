/**
 * 文件夹管理 Composable
 * 处理文件夹的添加、删除、排序和输出目录选择
 */

import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { FolderInfo } from "../types";
import type { Logger } from "./useLogger";

/**
 * 创建文件夹管理器
 * @param logger - 日志管理器实例
 */
export function useFolders(logger: Logger) {
  /** 文件夹列表 */
  const folders = ref<FolderInfo[]>([]);

  /** 输出目录 */
  const outputDir = ref<string>("");

  /** 是否正在加载 */
  const isLoading = ref(false);

  /** 总瓦片数量 */
  const totalTiles = computed(() => {
    return folders.value.reduce((sum, folder) => sum + folder.tile_count, 0);
  });

  /**
   * 从路径中提取文件夹名称
   */
  function getFolderName(path: string): string {
    return path.split("/").pop() || path;
  }

  /**
   * 选择并添加文件夹
   */
  async function selectFolders(): Promise<void> {
    try {
      const selected = await open({
        directory: true,
        multiple: true,
        title: "选择瓦片文件夹",
      });

      if (!selected) return;

      const paths = Array.isArray(selected) ? selected : [selected];
      isLoading.value = true;

      for (const path of paths) {
        // 检查是否已存在
        if (folders.value.some((f) => f.path === path)) {
          logger.warning(`已存在: ${getFolderName(path)}`);
          continue;
        }

        try {
          const info = await invoke<FolderInfo>("get_folder_info", { path });
          folders.value.push(info);
          logger.info(`添加: ${info.name} (${info.tile_count} 瓦片)`);
        } catch (e) {
          logger.error(`无法读取: ${path}`);
        }
      }

      isLoading.value = false;
    } catch (e) {
      console.error("选择文件夹失败:", e);
      isLoading.value = false;
    }
  }

  /**
   * 选择输出目录
   */
  async function selectOutputDir(): Promise<void> {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择输出目录",
      });

      if (selected && typeof selected === "string") {
        outputDir.value = selected;
        logger.info(`输出: ${getFolderName(selected)}`);
      }
    } catch (e) {
      console.error("选择输出目录失败:", e);
    }
  }

  /**
   * 移除指定索引的文件夹
   * @param index - 文件夹索引
   */
  function removeFolder(index: number): void {
    const folder = folders.value[index];
    if (folder) {
      folders.value.splice(index, 1);
      logger.info(`移除: ${folder.name}`);
    }
  }

  /**
   * 移动文件夹位置
   * @param index - 当前索引
   * @param direction - 移动方向，-1 向上，1 向下
   */
  function moveFolder(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= folders.value.length) return;

    const temp = folders.value[index];
    folders.value[index] = folders.value[newIndex];
    folders.value[newIndex] = temp;
  }

  /**
   * 重置所有状态
   */
  function reset(): void {
    folders.value = [];
    outputDir.value = "";
    isLoading.value = false;
  }

  return {
    folders,
    outputDir,
    isLoading,
    totalTiles,
    selectFolders,
    selectOutputDir,
    removeFolder,
    moveFolder,
    reset,
  };
}

/** 文件夹管理器类型 */
export type FoldersManager = ReturnType<typeof useFolders>;
