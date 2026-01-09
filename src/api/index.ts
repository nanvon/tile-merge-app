/**
 * API 层 - 统一的 Tauri 命令调用封装
 * 提供类型安全的 API 调用和统一的错误处理
 */

import { invoke } from "@tauri-apps/api/core";
import type { FolderInfo, MergeStats } from "../types";

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 统一的命令调用封装
 */
async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ApiError("INVOKE_ERROR", message, error);
  }
}

// ============ 文件夹相关 API ============

/**
 * 获取文件夹信息
 */
export async function getFolderInfo(path: string): Promise<FolderInfo> {
  return invokeCommand<FolderInfo>("get_folder_info", { path });
}

// ============ 合并相关 API ============

/**
 * 开始合并操作
 */
export async function startMerge(
  folders: string[],
  outputDir: string
): Promise<MergeStats> {
  return invokeCommand<MergeStats>("start_merge", { folders, outputDir });
}

/**
 * 取消合并操作
 */
export async function cancelMerge(): Promise<void> {
  return invokeCommand<void>("cancel_merge");
}

// ============ 预览相关 API ============

/**
 * 设置瓦片预览路径并启动服务器
 * @returns 服务器端口号，如果 path 为 null 则返回 null
 */
export async function setTilePath(path: string | null): Promise<number | null> {
  return invokeCommand<number | null>("set_tile_path", { path });
}

/**
 * 获取当前预览的瓦片路径
 */
export async function getTilePath(): Promise<string | null> {
  return invokeCommand<string | null>("get_tile_path");
}

/**
 * 获取瓦片服务器端口
 */
export async function getTileServerPort(): Promise<number | null> {
  return invokeCommand<number | null>("get_tile_server_port");
}

// ============ 开发工具 API ============

/**
 * 打开开发者工具
 */
export async function openDevtools(): Promise<void> {
  return invokeCommand<void>("open_devtools");
}
