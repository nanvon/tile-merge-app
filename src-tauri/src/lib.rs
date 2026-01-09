mod merger;
mod tile_server;

use merger::{MergeStats, TileMerger};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State, WebviewWindow};

/// 文件夹信息
#[derive(Clone, Serialize, Deserialize)]
pub struct FolderInfo {
    /// 文件夹路径
    pub path: String,
    /// 文件夹名称
    pub name: String,
    /// 瓦片数量
    pub tile_count: usize,
}

/// 应用状态
struct AppState {
    is_merging: Mutex<bool>,
    /// 当前预览的瓦片路径
    tile_path: Mutex<Option<String>>,
    /// 瓦片服务器端口
    tile_server_port: Mutex<Option<u16>>,
}

/// 获取文件夹信息（包括瓦片数量）
#[tauri::command]
async fn get_folder_info(path: String) -> Result<FolderInfo, String> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return Err("文件夹不存在".to_string());
    }

    if !path_buf.is_dir() {
        return Err("路径不是文件夹".to_string());
    }

    let name = path_buf
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());

    let tile_count = TileMerger::count_tiles(&path_buf);

    Ok(FolderInfo {
        path,
        name,
        tile_count,
    })
}

/// 开始合并瓦片
#[tauri::command]
async fn start_merge(
    app: AppHandle,
    folders: Vec<String>,
    output_dir: String,
    state: State<'_, AppState>,
) -> Result<MergeStats, String> {
    // 检查是否已有任务在运行
    {
        let mut is_merging = state.is_merging.lock().unwrap();
        if *is_merging {
            return Err("已有合并任务正在运行".to_string());
        }
        *is_merging = true;
    }

    // 转换路径
    let folder_paths: Vec<PathBuf> = folders.iter().map(PathBuf::from).collect();
    let output_path = PathBuf::from(&output_dir);

    // 验证文件夹
    for folder in &folder_paths {
        if !folder.exists() || !folder.is_dir() {
            let mut is_merging = state.is_merging.lock().unwrap();
            *is_merging = false;
            return Err(format!("无效的文件夹: {:?}", folder));
        }
    }

    // 执行合并
    let result = TileMerger::merge(&folder_paths, &output_path, |progress| {
        // 发送进度事件到前端
        let _ = app.emit("merge-progress", progress);
    });

    // 重置运行状态
    {
        let mut is_merging = state.is_merging.lock().unwrap();
        *is_merging = false;
    }

    // 发送完成事件
    match &result {
        Ok(stats) => {
            let _ = app.emit("merge-complete", stats);
        }
        Err(e) => {
            let _ = app.emit("merge-error", e);
        }
    }

    result
}

/// 取消合并（预留接口）
#[tauri::command]
async fn cancel_merge(state: State<'_, AppState>) -> Result<(), String> {
    let mut is_merging = state.is_merging.lock().unwrap();
    *is_merging = false;
    Ok(())
}

/// 设置当前预览的瓦片路径并启动服务器
#[tauri::command]
async fn set_tile_path(path: Option<String>, state: State<'_, AppState>) -> Result<Option<u16>, String> {
    let mut tile_path = state.tile_path.lock().unwrap();
    *tile_path = path.clone();

    if let Some(p) = path {
        // 启动或更新瓦片服务器
        let port = tile_server::start_or_update(&p);
        let mut server_port = state.tile_server_port.lock().unwrap();
        *server_port = Some(port);
        Ok(Some(port))
    } else {
        // 停止服务器
        tile_server::stop();
        let mut server_port = state.tile_server_port.lock().unwrap();
        *server_port = None;
        Ok(None)
    }
}

/// 获取当前预览的瓦片路径
#[tauri::command]
async fn get_tile_path(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let tile_path = state.tile_path.lock().unwrap();
    Ok(tile_path.clone())
}

/// 获取瓦片服务器端口
#[tauri::command]
async fn get_tile_server_port(state: State<'_, AppState>) -> Result<Option<u16>, String> {
    let port = state.tile_server_port.lock().unwrap();
    Ok(*port)
}

/// 打开开发者工具
#[tauri::command]
async fn open_devtools(window: WebviewWindow) -> Result<(), String> {
    window.open_devtools();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            is_merging: Mutex::new(false),
            tile_path: Mutex::new(None),
            tile_server_port: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            get_folder_info,
            start_merge,
            cancel_merge,
            set_tile_path,
            get_tile_path,
            get_tile_server_port,
            open_devtools
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
