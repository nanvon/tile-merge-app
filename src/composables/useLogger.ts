/**
 * 日志管理 Composable
 * 处理日志添加、展示和自动滚动
 */

import { ref, nextTick, type Ref } from "vue";
import type { LogEntry } from "../types";

/** 最大日志条数 */
const MAX_LOGS = 100;

/**
 * 创建日志管理器
 * @param containerRef - 日志容器元素的引用，用于自动滚动
 */
export function useLogger(containerRef?: Ref<HTMLElement | null>) {
  /** 日志列表 */
  const logs = ref<LogEntry[]>([]);

  /**
   * 添加日志
   * @param type - 日志类型
   * @param message - 日志消息
   */
  function addLog(type: LogEntry["type"], message: string): void {
    const now = new Date();
    const time = now.toLocaleTimeString("zh-CN", { hour12: false });

    logs.value.push({ time, type, message });

    // 限制日志数量
    if (logs.value.length > MAX_LOGS) {
      logs.value.shift();
    }

    // 自动滚动到底部
    if (containerRef) {
      nextTick(() => {
        if (containerRef.value) {
          containerRef.value.scrollTop = containerRef.value.scrollHeight;
        }
      });
    }
  }

  /**
   * 清空所有日志
   */
  function clearLogs(): void {
    logs.value = [];
  }

  /**
   * 添加信息日志
   */
  function info(message: string): void {
    addLog("info", message);
  }

  /**
   * 添加成功日志
   */
  function success(message: string): void {
    addLog("success", message);
  }

  /**
   * 添加警告日志
   */
  function warning(message: string): void {
    addLog("warning", message);
  }

  /**
   * 添加错误日志
   */
  function error(message: string): void {
    addLog("error", message);
  }

  return {
    logs,
    addLog,
    clearLogs,
    info,
    success,
    warning,
    error,
  };
}

/** 日志管理器类型 */
export type Logger = ReturnType<typeof useLogger>;
