/// 文件夹信息
export interface FolderInfo {
  /** 文件夹路径 */
  path: string;
  /** 文件夹名称 */
  name: string;
  /** 瓦片数量 */
  tile_count: number;
}

/// 合并进度
export interface MergeProgress {
  /** 当前处理的文件夹索引 */
  current_folder: number;
  /** 总文件夹数 */
  total_folders: number;
  /** 当前文件夹已处理文件数 */
  processed_files: number;
  /** 当前文件夹总文件数 */
  total_files: number;
  /** 当前状态消息 */
  message: string;
  /** 总体进度百分比 (0-100) */
  percentage: number;
  /** 当前文件夹名称 */
  folder_name: string;
  /** 当前文件夹合并数量 */
  folder_merged: number;
  /** 当前文件夹复制数量 */
  folder_copied: number;
  /** 当前文件夹错误数量 */
  folder_errors: number;
  /** 是否是文件夹完成事件 */
  is_folder_complete: boolean;
}

/// 合并结果统计
export interface MergeStats {
  /** 总处理文件数 */
  total_processed: number;
  /** 合并的文件数 */
  merged_count: number;
  /** 复制的文件数 */
  copied_count: number;
  /** 错误数 */
  error_count: number;
  /** 耗时（毫秒） */
  duration_ms: number;
}

/// 日志条目
export interface LogEntry {
  /** 时间戳 */
  time: string;
  /** 日志类型 */
  type: "info" | "success" | "warning" | "error";
  /** 日志消息 */
  message: string;
}
