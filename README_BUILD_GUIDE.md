# 📦 TileMerge Build Guide

[![中文文档](https://img.shields.io/badge/文档-中文版-blue)](./README_BUILD_GUIDE_CN.md)
[![Back to Home](https://img.shields.io/badge/Back-Home-lightgrey)](./README.md)

## Build Artifacts

| Platform      | Command             | Output          |
| ------------- | ------------------- | --------------- |
| macOS (M1)    | `npm run build:mac` | `TileMerge.app` |
| Windows (x64) | `npm run build:win` | `TileMerge.exe` |

---

## 1. Build macOS Application

Build .app bundle on macOS (M1/ARM64 chips only).

```bash
npm run build:mac
```

**Output location:**

```text
src-tauri/target/aarch64-apple-darwin/release/bundle/macos/TileMerge.app
```

---

## 2. Build Windows Portable Version

Cross-compile Windows 64-bit portable `.exe` on macOS (no installation required, just double-click to run).

### Prerequisites (One-time Setup)

```bash
# 1. Add Rust Windows target
rustup target add x86_64-pc-windows-msvc

# 2. Install cargo-xwin cross-compilation tool
cargo install --locked cargo-xwin

# 3. Install LLVM (provides llvm-rc)
brew install llvm
```

### Build Command

```bash
npm run build:win
```

**Output location:**

```text
src-tauri/target/x86_64-pc-windows-msvc/release/TileMerge.exe
```

---

## 3. GitHub Actions Automated Build

Pushing a `v*` format tag will automatically trigger the build:

```bash
git tag v0.1.0
git push origin v0.1.0
```

After the build completes, artifacts will be automatically uploaded to GitHub Release:

- macOS: `TileMerge_v0.1.0_macos_arm64.zip` (contains .app)
- Windows: `TileMerge_v0.1.0_windows_x64.exe`

---

## 4. Configuration Options

Modify `src-tauri/tauri.conf.json` to adjust application configuration:

| Config Item      | Description                            |
| ---------------- | -------------------------------------- |
| `productName`    | App name (must be in English)          |
| `version`        | Version number                         |
| `mainBinaryName` | Executable file name                   |
| `bundle.targets` | Bundle targets (currently only "app")  |

> **Note**: Due to Tauri compatibility issues on macOS, `productName` and `mainBinaryName` must be in English. The application window title can use Chinese characters.
