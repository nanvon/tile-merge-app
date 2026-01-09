# 瓦片地图合并工具 (Tile Merge)

一个基于 **Tauri + Vue 3 + TypeScript** 的桌面应用，用于合并多个瓦片地图文件夹。

## ✨ 功能特性

- 📁 **多文件夹合并** - 支持添加多个瓦片文件夹，按顺序合并
- 🖼️ **智能叠加** - 相同位置的瓦片自动进行 Alpha 混合
- 🗺️ **实时预览** - 内置地图预览，支持高德卫星底图
- 📍 **坐标定位** - 输入经纬度快速跳转，点击地图获取坐标
- ⚡ **高性能** - Rust 后端 + Rayon 并行处理，快速合并大量瓦片
- 💻 **跨平台** - 支持 macOS 和 Windows

## 📸 截图

<!-- TODO: 添加应用截图 -->

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) 1.70+
- [pnpm](https://pnpm.io/) 或 npm

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装 Tauri CLI（如果未安装）
npm install -g @tauri-apps/cli
```

### 开发模式

```bash
npm run tauri dev
```

### 构建发布版本

```bash
# macOS
npm run build:cn

# Windows（需要在 macOS 上交叉编译，或在 Windows 上构建）
npm run build:win
```

## 📖 使用指南

1. **添加文件夹** - 点击「添加文件夹」选择包含瓦片的目录
2. **调整顺序** - 使用上下箭头调整合并顺序（后添加的覆盖在上层）
3. **选择输出目录** - 设置合并结果的保存位置
4. **开始合并** - 点击「开始合并」等待完成
5. **预览结果** - 合并完成后可预览结果或单独预览各文件夹

### 📁 瓦片文件夹格式

瓦片文件夹应包含以层级数字命名的子目录（TMS/XYZ 格式）：

```text
瓦片文件夹/
├── 10/          ← 层级 10
│   ├── 827/     ← X 坐标
│   │   ├── 373.png
│   │   └── 374.png
├── 11/
└── ...
```

### 🔄 合并规则

- 后添加的文件夹会**覆盖**先添加的（在重叠区域）
- 相同坐标的瓦片会进行 **Alpha 混合**（透明度叠加）
- 可通过上下箭头调整文件夹顺序

### 🗺️ 地图预览

- 点击文件夹右侧的预览按钮可查看瓦片效果
- 底图使用高德卫星图
- 支持输入经纬度跳转、点击获取坐标、缩放控制

## 🏗️ 技术架构

```
tile-merge-app/
├── src/                    # Vue 前端
│   ├── api/               # Tauri 命令调用封装
│   ├── components/        # Vue 组件
│   ├── composables/       # Vue Composables
│   └── types.ts           # TypeScript 类型定义
│
└── src-tauri/             # Rust 后端
    └── src/
        ├── lib.rs         # Tauri 命令入口
        ├── merger.rs      # 瓦片合并核心逻辑
        └── tile_server.rs # 本地瓦片 HTTP 服务
```

### 核心依赖

| 层级 | 技术栈                                        |
| ---- | --------------------------------------------- |
| 框架 | [Tauri 2.0](https://tauri.app/)               |
| 前端 | Vue 3 + TypeScript + Vite                     |
| 地图 | [Leaflet](https://leafletjs.com/)             |
| 图像 | [image-rs](https://github.com/image-rs/image) |
| 并行 | [Rayon](https://github.com/rayon-rs/rayon)    |

## 🛠️ 开发

### 推荐 IDE 配置

- [VS Code](https://code.visualstudio.com/)
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) 插件
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) 插件

### 常用命令

```bash
# 开发模式
npm run tauri dev

# 类型检查
npx vue-tsc --noEmit

# 仅构建前端
npm run build
```

## 🙏 致谢

核心合并逻辑参考以下开源项目：

- [merge_tile_sets.pl](https://github.com/jlmcgraw/aviationCharts/blob/master/merge_tile_sets.pl) by jlmcgraw
- [Stack Exchange GIS](https://gis.stackexchange.com/questions/247717) - ImageMagick 合并思路

## 📄 License

本项目采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。

- ✅ 可自由使用、复制、修改
- ✅ 需注明原作者
- ❌ **禁止商业用途**
- ⚠️ 衍生作品须使用相同协议

## 👤 作者

nanvon
