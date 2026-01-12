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

![应用截图](public/应用.png)

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
npm run build:mac

# Windows（需要在 macOS 上交叉编译，或在 Windows 上构建）
npm run build:win
```

## 📖 使用指南

### 操作流程

1. **添加文件夹** - 点击「添加文件夹」选择包含瓦片的目录
2. **调整顺序** - 使用 ⬆️⬇️ 按钮调整合并顺序（列表靠后的文件夹叠加在上层）
3. **选择输出目录** - 设置合并结果的保存位置
4. **开始合并** - 点击「开始合并」等待完成
5. **预览结果** - 合并完成后点击「预览结果」在地图上查看效果
6. **新建任务** - 如需开始新的合并任务，点击左上角「新建任务」

### 📁 瓦片文件夹格式

瓦片文件夹应包含以层级数字命名的子目录（XYZ 格式）：

> ⚠️ **重要：仅支持 PNG 格式的瓦片文件**，不支持 JPG、WebP 等其他格式。

```text
瓦片文件夹/
├── {z}/            ← 层级（zoom level）
│   ├── {x}/        ← X 坐标（列号）
│   │   ├── {y}.png ← Y 坐标（行号）

示例：10/827/373.png
表示层级10、X坐标827、Y坐标373的瓦片
```

### 🔄 合并原理

#### 合并逻辑

对于每个瓦片位置（z/x/y），程序按以下规则处理：

- **首次处理**：直接复制到输出目录
- **后续处理**：如果输出目录已存在该位置的瓦片，则进行 Alpha 混合叠加

#### Alpha 混合算法

程序逐像素进行透明度混合：

```
新像素 = 上层像素 × α + 下层像素 × (1 - α)
```

- **α = 1（完全不透明）**：完全覆盖下层
- **0 < α < 1（半透明）**：与下层混合产生过渡效果
- **α = 0（完全透明）**：不影响下层

#### 处理顺序

按照文件夹列表从上到下的顺序依次处理：

- 先处理的文件夹作为「底层」
- 后处理的文件夹「叠加」在上层

### 🖱️ 功能说明

#### 文件管理区

| 操作           | 说明                           |
| -------------- | ------------------------------ |
| 添加文件夹     | 选择瓦片目录，自动扫描瓦片数量 |
| 预览 👁️        | 在地图上查看该文件夹的瓦片     |
| 上移/下移 ⬆️⬇️ | 调整合并顺序                   |
| 移除 ❌        | 从列表中删除                   |

#### 地图预览区

| 功能     | 说明                            |
| -------- | ------------------------------- |
| 定位跳转 | 输入经纬度并点击跳转按钮        |
| 缩放控制 | 点击放大/缩小按钮或使用鼠标滚轮 |
| 获取坐标 | 点击地图任意位置获取经纬度      |
| 底图开关 | 可关闭卫星底图只看瓦片效果      |

#### 快捷键

| 快捷键 | 功能                       |
| ------ | -------------------------- |
| F12    | 打开开发者工具             |
| Enter  | 在坐标输入框按回车快速跳转 |

### ❓ 常见问题

**Q: 为什么预览看不到瓦片？**

A: 请检查：

1. 瓦片坐标是否与地图当前位置对应
2. 层级是否与当前缩放级别匹配
3. 可关闭卫星底图查看纯瓦片效果

**Q: 合并后部分瓦片缺失？**

A: 确保所有源文件夹的目录结构正确为 z/x/y.png 格式。

**Q: 如何控制叠加效果？**

A: 通过调整文件夹顺序。列表中靠后的文件夹会覆盖在上层。

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
