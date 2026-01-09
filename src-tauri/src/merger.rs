use image::Rgba;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use walkdir::WalkDir;

/// 合并进度信息
#[derive(Clone, Serialize, Deserialize)]
pub struct MergeProgress {
    /// 当前处理的文件夹索引
    pub current_folder: usize,
    /// 总文件夹数
    pub total_folders: usize,
    /// 当前文件夹已处理文件数
    pub processed_files: usize,
    /// 当前文件夹总文件数
    pub total_files: usize,
    /// 当前状态消息
    pub message: String,
    /// 总体进度百分比 (0-100)
    pub percentage: f64,
    /// 当前文件夹名称
    pub folder_name: String,
    /// 当前文件夹合并数量
    pub folder_merged: usize,
    /// 当前文件夹复制数量
    pub folder_copied: usize,
    /// 当前文件夹错误数量
    pub folder_errors: usize,
    /// 是否是文件夹完成事件
    pub is_folder_complete: bool,
}

/// 合并结果统计
#[derive(Clone, Serialize, Deserialize)]
pub struct MergeStats {
    /// 总处理文件数
    pub total_processed: usize,
    /// 合并的文件数（两张图叠加）
    pub merged_count: usize,
    /// 复制的文件数（直接复制）
    pub copied_count: usize,
    /// 错误数
    pub error_count: usize,
    /// 耗时（毫秒）
    pub duration_ms: u64,
}

/// 合并日志类型
#[derive(Clone, Serialize, Deserialize)]
pub enum MergeLogType {
    /// 合并（两张图叠加）
    Merge,
    /// 复制（直接复制）
    Copy,
    /// 错误
    Error,
}

/// 合并日志
#[derive(Clone, Serialize, Deserialize)]
pub struct MergeLog {
    /// 日志类型
    pub log_type: MergeLogType,
    /// 瓦片路径 (z/x/y.png)
    pub tile_path: String,
    /// 源文件夹名称
    pub source_folder: String,
    /// 错误信息（仅当 log_type 为 Error 时）
    pub error_message: Option<String>,
}

/// 瓦片合并器
pub struct TileMerger;

impl TileMerger {
    /// 扫描目录获取所有瓦片文件，返回相对路径列表
    pub fn scan_tiles(dir: &Path) -> Vec<PathBuf> {
        let mut tiles = Vec::new();

        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension() {
                    if ext.eq_ignore_ascii_case("png") {
                        if let Ok(rel_path) = path.strip_prefix(dir) {
                            tiles.push(rel_path.to_path_buf());
                        }
                    }
                }
            }
        }

        tiles
    }

    /// 统计目录中的瓦片数量
    pub fn count_tiles(dir: &Path) -> usize {
        Self::scan_tiles(dir).len()
    }

    /// 合并两张 PNG 图片（overlay 覆盖在 base 上）
    fn composite_images(base_path: &Path, overlay_path: &Path, output_path: &Path) -> Result<(), String> {
        // 加载两张图片
        let base_img = image::open(base_path)
            .map_err(|e| format!("无法打开基础图片 {:?}: {}", base_path, e))?;
        let overlay_img = image::open(overlay_path)
            .map_err(|e| format!("无法打开覆盖图片 {:?}: {}", overlay_path, e))?;

        // 转换为 RGBA
        let mut base_rgba = base_img.to_rgba8();
        let overlay_rgba = overlay_img.to_rgba8();

        // 获取尺寸
        let (base_w, base_h) = base_rgba.dimensions();
        let (overlay_w, overlay_h) = overlay_rgba.dimensions();

        // 逐像素合并（alpha 混合）
        for y in 0..base_h.min(overlay_h) {
            for x in 0..base_w.min(overlay_w) {
                let overlay_pixel = overlay_rgba.get_pixel(x, y);
                let base_pixel = base_rgba.get_pixel(x, y);

                // Alpha 混合
                let alpha = overlay_pixel[3] as f32 / 255.0;
                if alpha > 0.0 {
                    let new_pixel = Rgba([
                        ((overlay_pixel[0] as f32 * alpha + base_pixel[0] as f32 * (1.0 - alpha)) as u8),
                        ((overlay_pixel[1] as f32 * alpha + base_pixel[1] as f32 * (1.0 - alpha)) as u8),
                        ((overlay_pixel[2] as f32 * alpha + base_pixel[2] as f32 * (1.0 - alpha)) as u8),
                        ((overlay_pixel[3].max(base_pixel[3])) as u8),
                    ]);
                    base_rgba.put_pixel(x, y, new_pixel);
                }
            }
        }

        // 确保输出目录存在
        if let Some(parent) = output_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("无法创建目录 {:?}: {}", parent, e))?;
        }

        // 保存结果
        base_rgba.save(output_path)
            .map_err(|e| format!("无法保存图片 {:?}: {}", output_path, e))?;

        Ok(())
    }

    /// 合并多个瓦片文件夹到输出目录
    ///
    /// # 参数
    /// - `folders`: 待合并的文件夹路径列表（按顺序合并）
    /// - `output_dir`: 输出目录
    /// - `progress_callback`: 进度回调函数
    pub fn merge<F>(
        folders: &[PathBuf],
        output_dir: &Path,
        mut progress_callback: F,
    ) -> Result<MergeStats, String>
    where
        F: FnMut(MergeProgress) + Send,
    {
        let start_time = std::time::Instant::now();

        let mut total_processed = 0usize;
        let mut merged_count = 0usize;
        let mut copied_count = 0usize;
        let mut error_count = 0usize;

        // 确保输出目录存在
        fs::create_dir_all(output_dir)
            .map_err(|e| format!("无法创建输出目录: {}", e))?;

        let total_folders = folders.len();

        for (folder_idx, folder) in folders.iter().enumerate() {
            // 扫描当前文件夹的所有瓦片
            let tiles = Self::scan_tiles(folder);
            let total_files = tiles.len();

            progress_callback(MergeProgress {
                current_folder: folder_idx + 1,
                total_folders,
                processed_files: 0,
                total_files,
                message: format!("正在处理: {}", folder.file_name().unwrap_or_default().to_string_lossy()),
                percentage: (folder_idx as f64 / total_folders as f64) * 100.0,
                folder_name: folder.file_name().unwrap_or_default().to_string_lossy().to_string(),
                folder_merged: 0,
                folder_copied: 0,
                folder_errors: 0,
                is_folder_complete: false,
            });

            let processed_counter = Arc::new(AtomicUsize::new(0));
            let merged_counter = Arc::new(AtomicUsize::new(0));
            let copied_counter = Arc::new(AtomicUsize::new(0));
            let error_counter = Arc::new(AtomicUsize::new(0));

            // 使用 rayon 并行处理瓦片
            tiles.par_iter().for_each(|rel_path| {
                let src_path = folder.join(rel_path);
                let dst_path = output_dir.join(rel_path);

                let result = if dst_path.exists() {
                    // 目标文件已存在，需要合并
                    match Self::composite_images(&dst_path, &src_path, &dst_path) {
                        Ok(_) => {
                            merged_counter.fetch_add(1, Ordering::Relaxed);
                            Ok(())
                        }
                        Err(e) => Err(e),
                    }
                } else {
                    // 目标文件不存在，直接复制
                    if let Some(parent) = dst_path.parent() {
                        let _ = fs::create_dir_all(parent);
                    }
                    match fs::copy(&src_path, &dst_path) {
                        Ok(_) => {
                            copied_counter.fetch_add(1, Ordering::Relaxed);
                            Ok(())
                        }
                        Err(e) => Err(format!("复制失败: {}", e)),
                    }
                };

                if result.is_err() {
                    error_counter.fetch_add(1, Ordering::Relaxed);
                }

                processed_counter.fetch_add(1, Ordering::Relaxed);
            });

            let folder_processed = processed_counter.load(Ordering::Relaxed);
            let folder_merged = merged_counter.load(Ordering::Relaxed);
            let folder_copied = copied_counter.load(Ordering::Relaxed);
            let folder_errors = error_counter.load(Ordering::Relaxed);

            total_processed += folder_processed;
            merged_count += folder_merged;
            copied_count += folder_copied;
            error_count += folder_errors;

            progress_callback(MergeProgress {
                current_folder: folder_idx + 1,
                total_folders,
                processed_files: folder_processed,
                total_files,
                message: format!("完成: {} (合并: {}, 复制: {}, 错误: {})",
                    folder.file_name().unwrap_or_default().to_string_lossy(),
                    folder_merged,
                    folder_copied,
                    folder_errors
                ),
                percentage: ((folder_idx + 1) as f64 / total_folders as f64) * 100.0,
                folder_name: folder.file_name().unwrap_or_default().to_string_lossy().to_string(),
                folder_merged,
                folder_copied,
                folder_errors,
                is_folder_complete: true,
            });
        }

        let duration_ms = start_time.elapsed().as_millis() as u64;

        Ok(MergeStats {
            total_processed,
            merged_count,
            copied_count,
            error_count,
            duration_ms,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_empty_dir() {
        let temp_dir = std::env::temp_dir().join("tile_merge_test_empty");
        let _ = fs::create_dir_all(&temp_dir);

        let tiles = TileMerger::scan_tiles(&temp_dir);
        assert!(tiles.is_empty());

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
