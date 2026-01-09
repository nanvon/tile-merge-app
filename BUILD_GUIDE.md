# 📦 瓦片图合并工具构建指南

## 1. 构建 macOS 应用

在 macOS 上构建 .app 和 .dmg 安装包。

```bash
# 构建并自动重命名为中文
npm run build:cn
```

**构建产物：**

- `src-tauri/target/release/bundle/dmg/瓦片图合并工具_0.1.0_aarch64.dmg`

---

## 2. 构建 Windows 便携版 (macOS 上交叉编译)

在 macOS 上直接编译出 Windows 可用的 `.exe` 文件（无需安装，双击即用）。

**前置要求：**
需要安装交叉编译工具链（仅需执行一次）：

```bash
# 1. 添加 Rust Windows 目标
rustup target add x86_64-pc-windows-msvc

# 2. 安装 cargo-xwin 工具
cargo install --locked cargo-xwin

# 3. 安装 LLVM (提供 llvm-rc)
brew install llvm
```

**构建命令：**

```bash
# 交叉编译并自动重命名为中文
npm run build:win:portable
```

**构建产物：**

- `src-tauri/target/x86_64-pc-windows-msvc/release/瓦片图合并工具.exe`

---

## 3. 应用配置 (可选)

修改 `src-tauri/tauri.conf.json` 可调整应用名称和窗口大小：

```json
{
  "productName": "瓦片图合并工具",
  "app": {
    "windows": [
      {
        "title": "瓦片图合并工具",
        "width": 1350,
        "height": 900
      }
    ]
  }
}
```
