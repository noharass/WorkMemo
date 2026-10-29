use crate::{
    database::{SettleInput, data_center::DashboardQuery},
    service::{Backend, SharedStore},
};
use serde_json::{Value, json};
use std::{
    io::Read,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};
use tauri::{Emitter, Manager};
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};
type Result<T> = std::result::Result<T, String>;
pub struct DashboardState {
    pub origin: String,
    pub token: String,
}
fn token() -> Result<String> {
    let mut bytes = [0u8; 32];
    #[cfg(windows)]
    {
        use windows_sys::Win32::Security::Cryptography::*;
        if unsafe {
            BCryptGenRandom(
                std::ptr::null_mut(),
                bytes.as_mut_ptr(),
                32,
                BCRYPT_USE_SYSTEM_PREFERRED_RNG,
            )
        } < 0
        {
            return Err("无法生成网页访问令牌".into());
        }
    }
    #[cfg(not(windows))]
    {
        return Err("数据中心目前仅支持Windows".into());
    }
    Ok(bytes.iter().map(|b| format!("{b:02x}")).collect())
}
pub fn initialize(app: &tauri::App) -> Result<DashboardState> {
    let server = Server::http(("127.0.0.1", 0)).map_err(|e| e.to_string())?;
    let address = server.server_addr().to_ip().ok_or("本机地址无效")?;
    let origin = format!("http://{address}");
    let token = token()?;
    // Runtime connection information is outside the backup whitelist and bundles.
    let directory = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let endpoint = directory.join("dashboard.endpoint.json");
    let pending = directory.join("dashboard.endpoint.pending");
    std::fs::write(
        &pending,
        serde_json::to_vec(&json!({"origin":origin,"token":token})).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    std::fs::rename(pending, endpoint).map_err(|e| e.to_string())?;
    let handle = app.handle().clone();
    let shared = app.state::<Backend>().inner.clone();
    let authority = address.to_string();
    let secret = token.clone();
    let base = origin.clone();
    let clients = Arc::new(AtomicUsize::new(0));
    std::thread::spawn(move || {
        for req in server.incoming_requests() {
            if clients.load(Ordering::Relaxed) >= 16 {
                let _ = req.respond(Response::from_string("busy").with_status_code(503));
                continue;
            }
            clients.fetch_add(1, Ordering::Relaxed);
            let count = clients.clone();
            let app = handle.clone();
            let store = shared.clone();
            let host = authority.clone();
            let key = secret.clone();
            let origin = base.clone();
            std::thread::spawn(move || {
                serve(req, &app, &store, &host, &origin, &key);
                count.fetch_sub(1, Ordering::Relaxed);
            });
        }
    });
    Ok(DashboardState { origin, token })
}
fn header<'a>(req: &'a Request, name: &str) -> Option<&'a str> {
    req.headers()
        .iter()
        .find(|h| h.field.as_str().as_str().eq_ignore_ascii_case(name))
        .map(|h| h.value.as_str())
}
fn authorize(
    host: Option<&str>,
    origin: Option<&str>,
    auth: Option<&str>,
    expected_host: &str,
    base: &str,
    key: &str,
    write: bool,
) -> bool {
    if host != Some(expected_host)
        || origin.is_some_and(|v| v != base)
        || (write && origin != Some(base))
    {
        return false;
    }
    let expected = format!("Bearer {key}");
    let actual = auth.unwrap_or("").as_bytes();
    actual.len() == expected.len()
        && actual
            .iter()
            .zip(expected.bytes())
            .fold(0u8, |a, (b, c)| a | (*b ^ c))
            == 0
}
fn serve(
    mut req: Request,
    app: &tauri::AppHandle,
    shared: &SharedStore,
    host: &str,
    origin: &str,
    key: &str,
) {
    let path = req.url().split('?').next().unwrap_or("").to_string();
    if header(&req, "Host") != Some(host) {
        respond(req, 403, b"forbidden".to_vec(), "text/plain");
        return;
    }
    if path.starts_with("/api/") {
        let write = req.method() == &Method::Post;
        if !authorize(
            header(&req, "Host"),
            header(&req, "Origin"),
            header(&req, "Authorization"),
            host,
            origin,
            key,
            write,
        ) || (!write && req.method() != &Method::Get)
        {
            respond(req, 403, b"forbidden".to_vec(), "text/plain");
            return;
        }
        if req.body_length().is_some_and(|n| n > 65536) {
            respond(req, 413, b"too large".to_vec(), "text/plain");
            return;
        }
        let result = (|| -> Result<Value> {
            let mut body = String::new();
            req.as_reader()
                .take(65537)
                .read_to_string(&mut body)
                .map_err(|e| e.to_string())?;
            if body.len() > 65536 {
                return Err("请求过大".into());
            }
            let input: Value = if body.is_empty() {
                json!({})
            } else {
                serde_json::from_str(&body).map_err(|_| "请求格式无效")?
            };
            if path == "/api/meta" && !write {
                let presentation = crate::presentation::load(
                    &app.state::<crate::presentation::PresentationState>().dir,
                )?;
                let guard = shared.lock().map_err(|_| "数据库锁异常")?;
                let store = guard.as_ref().map_err(|e| e.clone())?;
                return Ok(
                    json!({"version":env!("CARGO_PKG_VERSION"),"presentation":presentation,"active":store.active()?,"category_names":store.category_names()?}),
                );
            }
            if !write {
                return Err("此接口需要POST请求".into());
            }
            let mut guard = shared.lock().map_err(|_| "数据库锁异常")?;
            let store = guard.as_mut().map_err(|e| e.clone())?;
            let value = match path.as_str() {
                "/api/query" => store.dashboard_query(
                    serde_json::from_value::<DashboardQuery>(input).map_err(|_| "筛选参数无效")?,
                )?,
                "/api/detail" => {
                    store.dashboard_detail(input["id"].as_i64().ok_or("记录编号无效")?)?
                }
                "/api/save" => {
                    store.settle(
                        serde_json::from_value::<SettleInput>(input).map_err(|_| "保存参数无效")?,
                    )?;
                    json!({"saved":true})
                }
                "/api/delete" => {
                    store.dashboard_delete(
                        input["id"].as_i64().ok_or("记录编号无效")?,
                        input["expected_revision"].as_i64().ok_or("记录版本无效")?,
                    )?;
                    json!({"deleted":true})
                }
                _ => return Err("接口不存在".into()),
            };
            if ["/api/save", "/api/delete"].contains(&path.as_str()) {
                let _ = app.emit("workmemo:data-changed", ());
            }
            Ok(value)
        })();
        match result {
            Ok(value) => respond(
                req,
                200,
                serde_json::to_vec(&value).unwrap_or_default(),
                "application/json",
            ),
            Err(error) => respond(
                req,
                400,
                serde_json::to_vec(&json!({"error":error})).unwrap_or_default(),
                "application/json",
            ),
        };
    } else {
        if req.method() != &Method::Get {
            respond(req, 405, Vec::new(), "text/plain");
            return;
        }
        let asset = if path == "/" || path == "/dashboard" {
            "index.html"
        } else {
            path.trim_start_matches('/')
        };
        if asset.contains("..")
            || asset.contains('%')
            || asset.contains('\\')
            || !(asset == "index.html" || asset == "workmemo.png" || asset.starts_with("assets/"))
        {
            respond(req, 404, Vec::new(), "text/plain");
            return;
        }
        if let Some(content) = app.asset_resolver().get(asset.into()) {
            respond(req, 200, content.bytes, &content.mime_type);
            return;
        }
        #[cfg(debug_assertions)]
        {
            let file = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../dist")
                .join(asset);
            if let Ok(bytes) = std::fs::read(file) {
                respond(
                    req,
                    200,
                    bytes,
                    if asset.ends_with(".js") {
                        "text/javascript"
                    } else if asset.ends_with(".css") {
                        "text/css"
                    } else {
                        "text/html"
                    },
                );
                return;
            }
        }
        respond(req, 404, Vec::new(), "text/plain");
    }
}
fn respond(req: Request, status: u16, body: Vec<u8>, mime: &str) {
    let mut response = Response::from_data(body).with_status_code(StatusCode(status));
    for (key, value) in [
        ("Content-Type", mime),
        ("Cache-Control", "no-store"),
        ("X-Content-Type-Options", "nosniff"),
        ("Referrer-Policy", "no-referrer"),
        (
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
        ),
    ] {
        response.add_header(Header::from_bytes(key, value).unwrap());
    }
    let _ = req.respond(response);
}
fn address(app: &tauri::AppHandle, view: &str, scope: &str) -> String {
    let state = app.state::<DashboardState>();
    let view = if ["today", "pending", "all"].contains(&view) {
        view
    } else {
        "all"
    };
    let scope = if scope == "demo" { "demo" } else { "real" };
    format!(
        "{}/dashboard#token={}&view={view}&scope={scope}",
        state.origin, state.token
    )
}
fn chrome_path() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::System::Registry::*;
        let sub: Vec<u16> = "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe\0"
            .encode_utf16()
            .collect();
        for key in [HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE] {
            let mut data = vec![0u16; 32768];
            let mut size = (data.len() * 2) as u32;
            if unsafe {
                RegGetValueW(
                    key,
                    sub.as_ptr(),
                    std::ptr::null(),
                    RRF_RT_REG_SZ,
                    std::ptr::null_mut(),
                    data.as_mut_ptr() as _,
                    &mut size,
                )
            } == 0
            {
                let n = data.iter().position(|c| *c == 0).unwrap_or(0);
                let p = PathBuf::from(String::from_utf16_lossy(&data[..n]));
                if p.is_file() {
                    return Some(p);
                }
            }
        }
    }
    for var in ["LOCALAPPDATA", "PROGRAMFILES", "PROGRAMFILES(X86)"] {
        if let Some(root) = std::env::var_os(var) {
            let path = PathBuf::from(root).join("Google/Chrome/Application/chrome.exe");
            if path.is_file() {
                return Some(path);
            }
        }
    }
    None
}
pub fn open_impl(
    app: &tauri::AppHandle,
    view: &str,
    scope: &str,
    default_browser: bool,
) -> Result<()> {
    let url = address(app, view, scope);
    if default_browser {
        #[cfg(windows)]
        {
            use windows_sys::Win32::UI::Shell::ShellExecuteW;
            let verb: Vec<u16> = "open\0".encode_utf16().collect();
            let file: Vec<u16> = url.encode_utf16().chain(Some(0)).collect();
            let result = unsafe {
                ShellExecuteW(
                    std::ptr::null_mut(),
                    verb.as_ptr(),
                    file.as_ptr(),
                    std::ptr::null(),
                    std::ptr::null(),
                    1,
                )
            };
            if result as isize <= 32 {
                return Err("无法打开默认浏览器，请复制网页地址。".into());
            }
            return Ok(());
        }
        #[cfg(not(windows))]
        {
            return Err("仅支持Windows浏览器启动".into());
        }
    }
    let chrome = chrome_path().ok_or("未找到Chrome，请选择默认浏览器或复制数据中心地址。")?;
    let mut command = std::process::Command::new(chrome);
    command.arg(url);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    command
        .spawn()
        .map_err(|_| "无法启动Chrome，请选择默认浏览器或复制地址。")?;
    Ok(())
}
#[tauri::command]
pub async fn open_dashboard(
    app: tauri::AppHandle,
    view: Option<String>,
    scope: Option<String>,
    default_browser: Option<bool>,
) -> Result<()> {
    tauri::async_runtime::spawn_blocking(move || {
        open_impl(
            &app,
            view.as_deref().unwrap_or("all"),
            scope.as_deref().unwrap_or("real"),
            default_browser.unwrap_or(false),
        )
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub fn get_dashboard_address(
    app: tauri::AppHandle,
    view: Option<String>,
    scope: Option<String>,
) -> String {
    address(
        &app,
        view.as_deref().unwrap_or("all"),
        scope.as_deref().unwrap_or("real"),
    )
}
#[tauri::command]
pub async fn get_today_workload(
    state: tauri::State<'_, Backend>,
) -> Result<Vec<crate::database::data_center::TodayWorkload>> {
    crate::service::access(state.inner.clone(), |s| s.today_workload()).await
}
#[tauri::command]
pub async fn seed_demo_data(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<i64> {
    let result = crate::service::access(state.inner.clone(), |s| s.seed_demo()).await?;
    let _ = app.emit("workmemo:data-changed", ());
    Ok(result)
}
#[tauri::command]
pub async fn clear_demo_data(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<usize> {
    let result = crate::service::access(state.inner.clone(), |s| s.clear_demo()).await?;
    let _ = app.emit("workmemo:data-changed", ());
    Ok(result)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn authentication_rejects_cross_origin_and_wrong_host() {
        let key = "test-secret";
        assert!(authorize(
            Some("127.0.0.1:1234"),
            Some("http://127.0.0.1:1234"),
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            true
        ));
        assert!(!authorize(
            Some("evil:1234"),
            None,
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            false
        ));
        assert!(!authorize(
            Some("127.0.0.1:1234"),
            Some("https://evil.test"),
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            true
        ));
        assert!(!authorize(
            Some("127.0.0.1:1234"),
            None,
            Some("Bearer wrong"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            false
        ));
    }
}

pub fn cleanup(app: &tauri::AppHandle) {
    if let (Some(state), Ok(dir)) = (
        app.try_state::<DashboardState>(),
        app.path().app_local_data_dir(),
    ) {
        let path = dir.join("dashboard.endpoint.json");
        if let Ok(bytes) = std::fs::read(&path) {
            if serde_json::from_slice::<Value>(&bytes)
                .ok()
                .is_some_and(|v| v["token"] == state.token)
            {
                let _ = std::fs::remove_file(path);
            }
        }
    }
}
