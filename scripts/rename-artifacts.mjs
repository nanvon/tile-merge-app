import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_NAME_CN = "瓦片图合并工具";
// Base directory for build artifacts
const TARGET_DIR = path.resolve(__dirname, "../src-tauri/target");

// Helper to rename files in a directory
function renameArtifacts(directory, extension, platform) {
  if (!fs.existsSync(directory)) return;

  const files = fs.readdirSync(directory);
  let renamedCount = 0;

  files.forEach((file) => {
    if (!file.endsWith(extension)) return;

    // Check if it's already renamed
    if (file.startsWith(APP_NAME_CN)) return;

    // Construct new name: replace 'tile-merge-app' with Chinese name
    // Example: tile-merge-app_0.1.0_aarch64.dmg -> 瓦片图合并工具_0.1.0_aarch64.dmg
    // Example: tile-merge-app_0.1.0_x64-setup.exe -> 瓦片图合并工具_0.1.0_x64-setup.exe

    // We assume the English name slug is derived from package name 'tile-merge-app'
    let newName = file.replace(/tile[-_]merge[-_]app/i, APP_NAME_CN);

    // If simple replacement didn't change anything (e.g. filename structure is different), force prefix
    if (newName === file) {
      newName = `${APP_NAME_CN}_${file}`;
    }

    const oldPath = path.join(directory, file);
    const newPath = path.join(directory, newName);

    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ [${platform}] 重命名: ${file} -> ${newName}`);
      renamedCount++;
    } catch (e) {
      console.error(`❌ [${platform}] 重命名失败: ${file}`, e);
    }
  });

  if (renamedCount === 0) {
    console.log(
      `ℹ️ [${platform}] 未找到需要重命名的 ${extension} 文件 (或已重命名)`
    );
  }
}

console.log("🔄 开始重命名构建产物...");

// 1. Rename macOS DMG
const dmgDir = path.join(TARGET_DIR, "release/bundle/dmg");
renameArtifacts(dmgDir, ".dmg", "macOS");

// 2. Rename macOS App (Just in case, though usually productName handles this)
const appDir = path.join(TARGET_DIR, "release/bundle/macos");
// .app is a directory, not a file, logic is similar
if (fs.existsSync(appDir)) {
  const apps = fs.readdirSync(appDir);
  apps.forEach((app) => {
    if (!app.endsWith(".app")) return;
    // If it's "tile-merge-app.app", rename it
    if (app.toLowerCase().includes("tile-merge-app")) {
      const newName = app.replace(/tile[-_]merge[-_]app/i, APP_NAME_CN);
      try {
        fs.renameSync(path.join(appDir, app), path.join(appDir, newName));
        console.log(`✅ [macOS] 重命名应用: ${app} -> ${newName}`);
      } catch (e) {
        console.error(`❌ [macOS] 重命名应用失败: ${app}`, e);
      }
    }
  });
}

// 3. Rename Windows NSIS Installer
// Path structure: src-tauri/target/release/bundle/nsis/ OR src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
// We check both common locations

const winDirs = [
  path.join(TARGET_DIR, "release/bundle/nsis"),
  path.join(TARGET_DIR, "x86_64-pc-windows-msvc/release/bundle/nsis"),
  // Check for portable EXEs in release root
  path.join(TARGET_DIR, "release"),
  path.join(TARGET_DIR, "x86_64-pc-windows-msvc/release"),
];

winDirs.forEach((dir) => renameArtifacts(dir, ".exe", "Windows"));

console.log("✨ 重命名完成!");
