/**
 * 图标路径定义
 * 所有 SVG 图标统一在此定义，便于维护和复用
 */

// 基础图标路径 (单路径)
export const iconPaths = {
  // 操作图标
  plus: "M12 5v14M5 12h14",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",

  // 箭头
  chevronUp: "M18 15l-6-6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6 6",

  // 文件夹
  folder:
    "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",

  // 地图相关
  zoomIn: "M12 5v14M5 12h14",
  zoomOut: "M5 12h14",

  // 其他
  help: "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
  refresh:
    "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z",
} as const;

// 复合图标路径 (多路径)
export const iconPathsMulti = {
  // 眼睛图标 - 预览
  eye: [
    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
    "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0", // circle cx=12 cy=12 r=3
  ],

  // 定位图标
  mapPin: [
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z",
    "M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0", // circle cx=12 cy=10 r=3
  ],
} as const;

// 填充型图标
export const iconPathsFilled = {
  folder:
    "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
} as const;

export type IconName = keyof typeof iconPaths;
export type IconNameMulti = keyof typeof iconPathsMulti;
export type IconNameFilled = keyof typeof iconPathsFilled;
