//! 瓦片服务器模块
//! 使用 tiny_http 提供本地 HTTP 服务来加载瓦片

use std::fs;
use std::io::Read;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU16, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use tiny_http::{Response, Server};

/// 透明 PNG 占位图
const TRANSPARENT_PNG: &[u8] = &[
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82,
];

// 全局状态
static RUNNING: AtomicBool = AtomicBool::new(false);
static CURRENT_PORT: AtomicU16 = AtomicU16::new(0);
lazy_static::lazy_static! {
    static ref TILE_PATH: Mutex<Option<String>> = Mutex::new(None);
    static ref SERVER_HANDLE: Mutex<Option<thread::JoinHandle<()>>> = Mutex::new(None);
}

/// 启动或更新瓦片服务器
pub fn start_or_update(tile_path: &str) -> u16 {
    // 更新瓦片路径
    {
        let mut path = TILE_PATH.lock().unwrap();
        *path = Some(tile_path.to_string());
    }

    // 如果服务器已经在运行，直接返回当前端口
    if RUNNING.load(Ordering::SeqCst) {
        return CURRENT_PORT.load(Ordering::SeqCst);
    }

    // 启动新服务器
    let port = start_server();
    CURRENT_PORT.store(port, Ordering::SeqCst);
    port
}

/// 停止服务器
pub fn stop() {
    RUNNING.store(false, Ordering::SeqCst);
    let mut path = TILE_PATH.lock().unwrap();
    *path = None;
}

/// 启动 HTTP 服务器
fn start_server() -> u16 {
    // 尝试在 9527-9537 范围内找一个可用端口
    let mut port = 9527u16;
    let server = loop {
        match Server::http(format!("127.0.0.1:{}", port)) {
            Ok(s) => break s,
            Err(_) => {
                port += 1;
                if port > 9537 {
                    eprintln!("[TileServer] 无法找到可用端口");
                    return 0;
                }
            }
        }
    };

    let server = Arc::new(server);
    RUNNING.store(true, Ordering::SeqCst);

    let srv = Arc::clone(&server);
    thread::spawn(move || {
        eprintln!("[TileServer] 启动在端口 {}", port);

        while RUNNING.load(Ordering::SeqCst) {
            // 设置超时，以便定期检查 RUNNING 状态
            if let Ok(Some(request)) = srv.recv_timeout(std::time::Duration::from_millis(100)) {
                let url = request.url().to_string();

                // 解析路径: /z/x/y.png 或 /z/x/y.png?t=xxx
                let path = url.split('?').next().unwrap_or(&url);
                let path = path.trim_start_matches('/');

                // 获取当前瓦片根目录
                let tile_base = {
                    let p = TILE_PATH.lock().unwrap();
                    p.clone()
                };

                let response = if let Some(base) = tile_base {
                    // 构建完整路径
                    let mut tile_path = PathBuf::from(&base);
                    for component in path.split('/') {
                        if !component.is_empty() {
                            tile_path.push(component);
                        }
                    }

                    // 尝试读取文件
                    if tile_path.exists() && tile_path.is_file() {
                        if let Ok(mut file) = fs::File::open(&tile_path) {
                            let mut contents = Vec::new();
                            if file.read_to_end(&mut contents).is_ok() {
                                Response::from_data(contents)
                                    .with_header(tiny_http::Header::from_bytes(
                                        &b"Content-Type"[..],
                                        &b"image/png"[..],
                                    ).unwrap())
                                    .with_header(tiny_http::Header::from_bytes(
                                        &b"Access-Control-Allow-Origin"[..],
                                        &b"*"[..],
                                    ).unwrap())
                            } else {
                                transparent_response()
                            }
                        } else {
                            transparent_response()
                        }
                    } else {
                        transparent_response()
                    }
                } else {
                    transparent_response()
                };

                let _ = request.respond(response);
            }
        }

        eprintln!("[TileServer] 已停止");
    });

    port
}

/// 返回透明图片响应
fn transparent_response() -> Response<std::io::Cursor<Vec<u8>>> {
    Response::from_data(TRANSPARENT_PNG.to_vec())
        .with_header(tiny_http::Header::from_bytes(
            &b"Content-Type"[..],
            &b"image/png"[..],
        ).unwrap())
        .with_header(tiny_http::Header::from_bytes(
            &b"Access-Control-Allow-Origin"[..],
            &b"*"[..],
        ).unwrap())
}
