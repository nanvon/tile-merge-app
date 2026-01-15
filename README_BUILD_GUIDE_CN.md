# 📦 TileMerge 构建指南

[![English](https://img.shields.io/badge/Docs-English-blue)](./README_BUILD_GUIDE.md)
[![返回主页](https://img.shields.io/badge/返回-主页-lightgrey)](./README_CN.md)

## 构建产物

| 平台          | 命令                | 产物            |
| ------------- | ------------------- | --------------- |
| macOS (M1)    | `npm run build:mac` | `TileMerge.app` |
| Windows (x64) | `npm run build:win` | `TileMerge.exe` |

---

## 1. 构建 macOS 应用

在 macOS 上构建 .app 程序包（仅 M1/ARM64 芯片）。

```bash
npm run build:mac
```

**产物位置：**

```text
src-tauri/target/aarch64-apple-darwin/release/bundle/macos/TileMerge.app
```

---

## 2. 构建 Windows 便携版

在 macOS 上交叉编译 Windows 64 位便携版 `.exe`（无需安装，双击即用）。

### 前置要求（仅需执行一次）

```bash
# 1. 添加 Rust Windows 目标
rustup target add x86_64-pc-windows-msvc

# 2. 安装 cargo-xwin 交叉编译工具
cargo install --locked cargo-xwin

# 3. 安装 LLVM（提供 llvm-rc）
brew install llvm
```

### 构建命令

```bash
npm run build:win
```

**产物位置：**

```text
src-tauri/target/x86_64-pc-windows-msvc/release/TileMerge.exe
```

---

## 3. GitHub Actions 自动构建

推送 `v*` 格式的 tag 会自动触发构建：

```bash
git tag v0.1.0
git push origin v0.1.0
```

构建完成后，产物会自动上传到 GitHub Release：

- macOS: `TileMerge_v0.1.0_macos_arm64.zip`（包含 .app）
- Windows: `TileMerge_v0.1.0_windows_x64.exe`

---

## 4. 配置说明

修改 `src-tauri/tauri.conf.json` 可调整应用配置：

| 配置项           | 说明                     |
| ---------------- | ------------------------ |
| `productName`    | 应用名（需为英文）       |
| `version`        | 版本号                   |
| `mainBinaryName` | 可执行文件名             |
| `bundle.targets` | 打包目标（当前仅 "app"） |

> **注意**: 由于 Tauri 在 macOS 上的兼容性问题，`productName` 和 `mainBinaryName` 必须使用英文。应用窗口标题可以使用中文。
