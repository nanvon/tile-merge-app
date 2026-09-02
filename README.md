<p align="center">
  <img src="public/icon.svg" width="96" height="96" alt="TileMerge Icon">
</p>

<h1 align="center">TileMerge</h1>

<p align="center">基于 Tauri 与 Rust 的高性能瓦片地图合并与可视化检查桌面工具</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.3-blue" alt="Version">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-orange" alt="License">
  <img src="https://img.shields.io/badge/tech-Tauri%20v2%20%7C%20Rust%20%7C%20Vue%203-blueviolet" alt="Tech Stack">
</p>

<p align="center">
  <b>简体中文</b> · <a href="./README_EN.md">English</a>
</p>

<p align="center">
  <img src="public/应用.png" width="900" alt="TileMerge 应用主界面">
</p>

<p align="center">
  <a href="#-核心特性">核心特性</a> ·
  <a href="#-快速上手">快速上手</a> ·
  <a href="#-瓦片规范与格式约束">瓦片规范</a> ·
  <a href="#-合并机制与算法">合并机制</a> ·
  <a href="#-界面与交互指南">交互指南</a> ·
  <a href="#-权限与安全透明度">安全透明度</a> ·
  <a href="#-技术架构">技术架构</a> ·
  <a href="#-源码构建">源码构建</a> ·
  <a href="#-常见问题与排错">常见问题</a> ·
  <a href="#-开源协议与致谢">开源协议</a>
</p>

---

## ✨ 核心特性

- **多源目录按序合并** — 支持添加多个瓦片文件夹，通过直观的卡片列表自由调整上下图层堆叠优先级。
- **逐像素级 Alpha 混合** — 针对不同数据源重叠的瓦片，执行 RGBA 像素级透明度融合（`top * α + bottom * (1 - α)`），消除接缝边缘硬切。
- **Rayon 多线程并行加速** — 底层基于 Rust `rayon` 并行迭代器遍历与处理瓦片，充分利用多核 CPU 算力，万级瓦片高效批处理。
- **嵌入式本地瓦片微服务** — 内置基于 Rust `tiny_http` 的轻量 HTTP 瓦片服务器（端口 9527~9537 自动协商），彻底规避 Webview 本地协议跨域限制。
- **交互式地图校对与预览** — 深度整合 Leaflet.js 与高德卫星底图，支持合并前后瓦片图层实时叠加、经纬度精准定位跳转与点击拾取坐标。
- **跨平台原生桌面支持** — 采用 Tauri v2 架构，无 Electron 笨重运行时，支持 macOS（Apple Silicon 深度优化）与 Windows 64 位单文件便携运行。

---

## 📦 快速上手

### 下载预编译版本

从 [GitHub Releases](https://github.com/nanvon/tile-merge-app/releases) 下载适合您操作系统的最新发行版：

- **macOS (Apple Silicon)**：下载 `TileMerge.app.zip`，解压后将 `TileMerge.app` 拖入 `Applications` 文件夹即可（最低支持 macOS 10.13）。
- **Windows (x64)**：下载 `TileMerge.exe`，单文件便携绿色版，双击直接运行，无需安装与配置外部运行库。

### 4 步标准工作流

1. **添加源目录**：点击左侧「**添加文件夹**」，批量选取待合并的瓦片目录，应用自动通过递归扫描统计瓦片总数。
2. **调整图层顺序**：在文件夹列表中通过 ⬆️ / ⬇️ 按钮调整次序。**核心准则：越靠底部的目录，在合并渲染时叠加在越上层**。
3. **指定输出目录**：在下方「输出目录」区域设定合并产物的目标存储路径。
4. **执行合并与校对**：点击「**开始合并**」，实时追踪处理进度、合并数、复制数及耗时；任务完成后点击「**预览结果**」即刻在地图上查验对齐质量。

---

## 📁 瓦片规范与格式约束

### 目录拓扑结构（Slippy Map XYZ）

待合并的源文件夹及输出目录均须严格遵循标准的 Slippy Map XYZ 目录层级：

```text
tile-directory/
├── {z}/            # 缩放层级 (Zoom Level，正整数，如 10)
│   ├── {x}/        # 瓦片列号 (Tile Column / X 坐标，如 827)
│   │   ├── {y}.png # 瓦片行号 (Tile Row / Y 坐标，如 373.png)
```

### 格式与协议边界声明

| 维度 | 支持状态 | 规格说明与技术边界 |
| :--- | :---: | :--- |
| **图像格式** | **仅限 PNG (`.png`)** | 必须具备透明度（Alpha 通道）方可实现重叠融合。**不支持 JPG、WebP 等格式**。 |
| **切片协议** | **标准 XYZ 规范** | 切片坐标原点位于左上角（Google / OSM / 高德规范），**非 TMS 协议**（TMS 原点位于左下角）。 |
| **容器格式** | **仅限离散目录** | 直接读取与写出目录树结构。**不直接支持 MBTiles、GeoPackage 单文件或 GeoTIFF 原生栅格**（需先解压/切片为 XYZ 目录）。 |
| **缺省占位** | **1×1 透明回退** | 本地预览服务在遇到未切片区域或请求不存在的瓦片时，自动响应 1×1 内存透明 PNG，防止地图出现碎图图标。 |

> [!NOTE]
> 如果现有数据为 GeoTIFF 航拍正射影像或 MBTiles 格式，建议先使用 `gdal2tiles.py` 或 `mb-util` 将其切出/解包为 PNG 格式的 XYZ 目录结构，再载入本工具执行多层合并。

---

## 🔄 合并机制与算法

### 图层处理顺序

合并流程按文件夹列表中**从上到下**的顺序逐步执行：

```text
[文件夹 1 (顶部)] ──────► 基础底图 (Base Layer)
       │
       ▼
[文件夹 2 (中部)] ──────► 中间层 (Overlay)
       │
       ▼
[文件夹 3 (底部)] ──────► 顶层图层 (Top Layer，最终可见最上方)
```

### 分级写入与 Alpha 混合逻辑

对于遍历到的每一张相对路径为 `{z}/{x}/{y}.png` 的瓦片：

1. **首次写入**：若输出目录中尚不存在该位置的瓦片，直接调用操作系统底层高效文件复制（`fs::copy`），零编码转换损耗。
2. **重叠叠加**：若输出目录已存在同名瓦片，将既有文件作为下层底图（`base`），待合并文件作为上层覆盖图（`overlay`），执行逐像素 Alpha 合成。

### 像素混合公式

应用对两张瓦片对应坐标 $(x, y)$ 的 RGBA 像素执行数学加权计算：

$$\alpha = \frac{\text{Alpha}_{\text{top}}}{255.0}$$

$$\text{RGB}_{\text{out}} = \text{RGB}_{\text{top}} \times \alpha + \text{RGB}_{\text{bottom}} \times (1.0 - \alpha)$$

$$\text{Alpha}_{\text{out}} = \max(\text{Alpha}_{\text{top}}, \text{Alpha}_{\text{bottom}})$$

- 当 $\alpha = 1.0$（完全不透明）：上层像素完全遮盖下层像素；
- 当 $0 < \alpha < 1.0$（半透明过渡）：上下层像素按比例平滑混合，保留羽化边缘；
- 当 $\alpha = 0.0$（完全透明）：直接透传下层像素，不受任何干扰。

---

## 📍 界面与交互指南

### 模块功能对照

| 界面区域 | 功能项目 | 操作方式 | 行为机制 |
| :--- | :--- | :--- | :--- |
| **文件管理区** | 目录导入 | 点击「添加文件夹」 | 唤起原生目录选择器，递归统计瓦片总数并录入任务列表 |
| | 顺序调整 | 点击卡片 ⬆️ / ⬇️ | 调整任务堆叠顺序（下方目录叠加在上方目录之上） |
| | 独立预览 | 点击卡片 👁️ 按钮 | 将当前单一目录挂载至本地瓦片服务器并在地图显示 |
| | 删除条目 | 点击卡片 ❌ 按钮 | 将指定目录移出合并任务队列 |
| | 任务重置 | 顶部「新建任务」 | 重置任务状态、断开预览服务并清空活动日志 |
| **地图预览区** | 坐标跳转 | 经纬度输入框 + 回车 / 跳转 | 平滑平移并缩放地图视角至指定经纬度中心点 |
| | 拾取坐标 | 单击地图任意位置 | 在点击点标注绿色圆点指示器，底部显示 6 位小数经纬度 |
| | 缩放控制 | 鼠标滚轮 / 界面缩放按钮 | 支持 1~24 级缩放切换（高德卫星图原生最高 18 级） |
| | 底图开关 | 切换「卫星底图」单选框 | 关闭卫星底图后呈现透明网格底，专门用于精准检查瓦片透明切边 |
| **全局快捷键** | 开发者工具 | 按下键盘 `F12` | 唤起 Webview 内置控制台，用于调试前端状态与网络请求 |

---

## 🔒 权限与安全透明度

为确保用户数据与本地系统安全，TileMerge 严格遵循最小权限原则：

| 模块 / 行为 | 访问资源 / 路径 | 权限级别 | 行为机制与安全保障 |
| :--- | :--- | :---: | :--- |
| **源瓦片扫描** | 用户明确选定的瓦片目录 | **严格只读** | 仅通过 `walkdir` 遍历路径并只读读取 `.png` 二进制，绝不修改源文件 |
| **合并文件输出** | 用户明确指定的输出目录 | **读 / 写** | 仅在指定目录内创建子层级并写入合并图像，杜绝访问界外路径 |
| **本地瓦片服务** | `127.0.0.1:9527~9537` | **本地回环** | 仅绑定本机回环地址（Loopback），不监听公网端口，局域网不可达 |
| **卫星底图通信** | 高德公共卫星瓦片服务 | **只读外联** | 仅拉取公开的底图切片以供对比，**绝不上传**用户的本地瓦片或位置数据 |
| **凭据与遥测** | 零凭据 / 零分析探针 | **无** | 无需账号登录、不读取系统钥匙串，无任何后台埋点或第三方遥测收集 |

---

## 🧱 技术架构

### 架构拓扑

```text
┌─────────────────────────────────────────────────────────────────┐
│                      TileMerge UI (Webview)                     │
│  Vue 3.5 + TypeScript + Vite 6 + Leaflet 1.9 (CSS Modules)      │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Tauri IPC (Commands & Events)
┌────────────────────────────────┴────────────────────────────────┐
│                       Rust Core Engine                          │
├────────────────────────────────┬────────────────────────────────┤
│  TileMerger (核心合并引擎)     │  TileServer (本地微服务)        │
│  - WalkDir 递归扫描            │  - Tiny-HTTP 极轻量服务         │
│  - Rayon 并行任务池            │  - 端口防冲突自动探测 (9527-37) │
│  - Image-rs 像素混合与编码     │  - 1x1 透明 PNG 缺省占位拦截    │
│  - Atomic 并发状态计数器       │  - 纯内存响应，无磁盘临时缓存   │
└────────────────────────────────┴────────────────────────────────┘
```

### 核心技术栈清单

| 依赖分层 | 组件 / 库 | 版本 | 用途与职责 |
| :--- | :--- | :--- | :--- |
| **应用容器** | [Tauri](https://tauri.app/) | `^2.0` | 原生跨平台窗口管理、系统级目录选择弹窗及 IPC 管道通讯 |
| **前端框架** | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) | `^3.5` / `~5.6` | 响应式状态管理、UI 组件构建与类型安全检查 |
| **地图引擎** | [Leaflet](https://leafletjs.com/) | `^1.9.4` | 地图瓦片加载、坐标变换、平移缩放与底图标注 |
| **并行处理** | [Rayon](https://github.com/rayon-rs/rayon) | `1.10` | 瓦片任务列表的多核 CPU 工作窃取并行调度 |
| **图像编解码** | [image](https://github.com/image-rs/image) | `0.25` | PNG 图像快速解析、RGBA8 像素遍历计算与无损写出 |
| **内嵌服务器** | [tiny_http](https://github.com/tiny-http/tiny-http) | `0.12` | 极简无额外依赖的本地 HTTP 瓦片响应服务 |

---

## 🔧 源码构建

### 环境准备

- [Node.js](https://nodejs.org/) >= 18（推荐 Node 20 LTS）
- [Rust](https://www.rust-lang.org/) >= 1.70（包含 `cargo` 工具链）
- npm / pnpm / yarn 任选其一

### 本地开发

```bash
# 1. 克隆代码仓库
git clone https://github.com/nanvon/tile-merge-app.git
cd tile-merge-app

# 2. 安装前端依赖
npm install

# 3. 启动本地开发模式（自动启动 Vite 与 Tauri 桌面窗口）
npm run tauri dev
```

### 生产打包

```bash
# 构建 macOS 原生应用包（Apple Silicon aarch64）
npm run build:mac
# 构建产物位于: src-tauri/target/aarch64-apple-darwin/release/bundle/macos/TileMerge.app

# 在 macOS 上交叉编译 Windows x64 便携版（需要提前安装 cargo-xwin 与 llvm）
npm run build:win
# 构建产物位于: src-tauri/target/x86_64-pc-windows-msvc/release/TileMerge.exe
```

> [!TIP]
> 交叉编译 Windows 便携版所需的环境配置细节（LLVM、cargo-xwin 安装与参数设定），请参阅 [构建指南](./README_BUILD_GUIDE_CN.md)。

---

## ❓ 常见问题与排错

<details>
<summary><b>Q: 为什么预览时地图上看不到瓦片？</b></summary>
<br>

1. **层级不匹配**：瓦片目录内的缩放层级（`{z}`）可能未覆盖当前地图缩放级别。请查看当前地图层级数字，并对照源文件夹内的 `{z}` 子目录。
2. **位置偏移**：瓦片覆盖范围不在当前地图视野中心。请在顶部坐标输入框输入瓦片真实覆盖的经纬度后点击「跳转」。
3. **底图遮挡辨别**：若瓦片边缘颜色与卫星影像接近，可临时取消勾选「卫星底图」，切换至纯黑/透明视图排查。
</details>

<details>
<summary><b>Q: 为什么不支持 JPG 或 WebP 格式的瓦片？</b></summary>
<br>

JPG 格式标准不具备 Alpha 透明通道，合并重叠区域时无法计算图层羽化透光率，会产生直接覆盖的矩形黑边或白边；当前底层采用 `image-rs` 的 RGBA8 像素格式对 PNG 深度优化。如需使用其他格式切片，建议预先利用批量工具将其无损转换为带透明通道的 PNG 瓦片。
</details>

<details>
<summary><b>Q: 处理数十万张大批量瓦片时会耗尽系统内存吗？</b></summary>
<br>

不会。TileMerge 采用流式批处理架构：由 `WalkDir` 仅收集相对路径清单，`rayon` 多线程池按 CPU 核心数动态摄取任务，逐对加载图像、像素合成后立即释放并写入磁盘，内存常驻开销仅与并发工作线程数挂钩，而非瓦片总量。
</details>

<details>
<summary><b>Q: 合并后的输出目录如何发布给 Web 地图或 QGIS 使用？</b></summary>
<br>

合并后的目录完全符合标准 Slippy Map 规范：
- **Web 端（Leaflet / OpenLayers / Mapbox GL）**：将输出目录置于任意静态 HTTP 服务器（如 Nginx），直接配置 URL 模板为 `http://your-server/tiles/{z}/{x}/{y}.png` 即可。
- **桌面端（QGIS）**：在 QGIS 浏览器面板中右键「XYZ Tiles」新建连接，填入本地文件路径或静态服务器 URL 即可无缝加载。
</details>

---

## 📜 开源协议与致谢

### 开源许可

本项目代码遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)（知识共享 署名-非商业性使用-相同方式共享 4.0 国际许可协议）：

- **允许自由共享与演绎**：可在任何媒介以任何形式复制、发行并修改本作品；
- **须标明作者署名**：须给出适当的署名，并提供许可协议链接；
- **禁止商业用途**：不得将本作品及其二次演绎产物用于任何直接或间接的商业盈利目的；
- **相同方式共享**：再分发衍生作品时，必须采用与本协议相同的许可协议。

完整协议文本详见 [LICENSE](./LICENSE) 文件。

### 致谢

核心合并算法与实现思路借鉴并参考了以下开源贡献者的成果：

- [merge_tile_sets.pl](https://github.com/jlmcgraw/aviationCharts/blob/master/merge_tile_sets.pl) by jlmcgraw
- [Stack Exchange GIS 社区讨论](https://gis.stackexchange.com/questions/247717) 关于 ImageMagick 瓦片合并方案的深度探讨
