use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf, sync::Mutex};
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Geometry {
    x: i32,
    y: i32,
    width: f64,
    height: f64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Layout {
    pub density: String,
    windows: BTreeMap<String, Geometry>,
}
impl Default for Layout {
    fn default() -> Self {
        Self {
            density: "comfortable".into(),
            windows: BTreeMap::new(),
        }
    }
}
pub struct WindowState {
    pub path: PathBuf,
    pub data: Mutex<Layout>,
    pub dirty: Mutex<BTreeMap<String, bool>>,
    opening: Mutex<()>,
}
pub fn valid_label(label: &str) -> bool {
    matches!(label, "main" | "settings" | "history" | "settlement")
}
pub fn load(path: &std::path::Path) -> Result<Layout, String> {
    if !path.exists() {
        return Ok(Layout::default());
    }
    decode_layout(&std::fs::read(path).map_err(|e| e.to_string())?)
}
pub fn decode_layout(bytes: &[u8]) -> Result<Layout, String> {
    let d: Layout = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if !["compact", "comfortable"].contains(&d.density.as_str())
        || d.windows.iter().any(|(k, v)| {
            !valid_label(k)
                || !v.width.is_finite()
                || !v.height.is_finite()
                || v.width < 100.0
                || v.height < 100.0
                || v.width > 10000.0
                || v.height > 10000.0
        })
    {
        return Err("窗口布局格式无效。".into());
    }
    Ok(d)
}
pub fn initialize(app: &tauri::App) -> Result<(), String> {
    let path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("window-layout.json");
    let data = match load(&path) {
        Ok(data) => data,
        Err(_) => {
            // Preserve the unreadable file before allowing future geometry saves.
            let stamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map_err(|e| e.to_string())?
                .as_nanos();
            std::fs::copy(&path, path.with_extension(format!("invalid-{stamp}.json")))
                .map_err(|e| format!("无法保留损坏的窗口设置：{e}"))?;
            Layout::default()
        }
    };
    app.manage(WindowState {
        path,
        data: Mutex::new(data),
        dirty: Mutex::new(BTreeMap::new()),
        opening: Mutex::new(()),
    });
    if let Some(w) = app.get_webview_window("main") {
        restore(&w)?;
    }
    Ok(())
}
fn persist(state: &WindowState) -> Result<(), String> {
    let d = state.data.lock().map_err(|_| "窗口设置锁异常")?;
    if let Some(p) = state.path.parent() {
        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    let tmp = state.path.with_extension("pending");
    use std::io::Write;
    let mut file = std::fs::File::create(&tmp).map_err(|e| e.to_string())?;
    file.write_all(&serde_json::to_vec(&*d).map_err(|e| e.to_string())?)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    std::fs::rename(tmp, &state.path).map_err(|e| e.to_string())
}
pub fn capture(window: &tauri::Window) -> Result<(), String> {
    if !valid_label(window.label()) || window.is_minimized().unwrap_or(true) {
        return Ok(());
    }
    let pos = window.outer_position().map_err(|e| e.to_string())?;
    let size = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(window.scale_factor().map_err(|e| e.to_string())?);
    let state = window.state::<WindowState>();
    state
        .data
        .lock()
        .map_err(|_| "窗口设置锁异常")?
        .windows
        .insert(
            window.label().into(),
            Geometry {
                x: pos.x,
                y: pos.y,
                width: size.width,
                height: size.height,
            },
        );
    persist(&state)
}
pub fn bounded(g: (i32, i32, f64, f64), area: (i32, i32, u32, u32), scale: f64) -> Geometry {
    let (ax, ay, aw, ah) = area;
    let width = g.2.max(320.0).min((aw as f64 / scale - 16.0).max(100.0));
    let height = g.3.max(280.0).min((ah as f64 / scale - 16.0).max(100.0));
    Geometry {
        x: g.0
            .clamp(ax, ax + (aw as f64 - width * scale).max(0.0) as i32),
        y: g.1
            .clamp(ay, ay + (ah as f64 - height * scale).max(0.0) as i32),
        width,
        height,
    }
}
fn restore(w: &tauri::WebviewWindow) -> Result<(), String> {
    let state = w.state::<WindowState>();
    let d = state
        .data
        .lock()
        .map_err(|_| "窗口设置锁异常")?
        .windows
        .get(w.label())
        .cloned();
    let default = match w.label() {
        "main" => (780.0, 560.0),
        "settlement" => (760.0, 620.0),
        _ => (900.0, 680.0),
    };
    let monitors = w.available_monitors().map_err(|e| e.to_string())?;
    let m = d
        .as_ref()
        .and_then(|g| {
            monitors.iter().find(|m| {
                let a = m.work_area();
                g.x >= a.position.x
                    && g.y >= a.position.y
                    && (g.x as i64) < a.position.x as i64 + a.size.width as i64
                    && (g.y as i64) < a.position.y as i64 + a.size.height as i64
            })
        })
        .or(monitors.first());
    if let Some(m) = m {
        let a = m.work_area();
        let s = m.scale_factor();
        let (x, y) = d.as_ref().map(|g| (g.x, g.y)).unwrap_or((
            a.position.x + ((a.size.width as f64 - default.0 * s) / 2.0).max(0.0) as i32,
            a.position.y + ((a.size.height as f64 - default.1 * s) / 2.0).max(0.0) as i32,
        ));
        let g = bounded(
            (
                x,
                y,
                d.as_ref().map_or(default.0, |g| g.width),
                d.as_ref().map_or(default.1, |g| g.height),
            ),
            (a.position.x, a.position.y, a.size.width, a.size.height),
            s,
        );
        w.set_size(tauri::LogicalSize::new(g.width, g.height))
            .map_err(|e| e.to_string())?;
        w.set_position(tauri::PhysicalPosition::new(g.x, g.y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub async fn open_panel(
    app: tauri::AppHandle,
    panel: String,
    section: Option<String>,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || show_panel(&app, &panel, section))
        .await
        .map_err(|e| e.to_string())?
}
pub fn show_panel(
    app: &tauri::AppHandle,
    panel: &str,
    section: Option<String>,
) -> Result<(), String> {
    let state = app.state::<WindowState>();
    let _opening = state.opening.lock().map_err(|_| "窗口创建锁异常")?;
    if !matches!(panel, "settings" | "history" | "settlement") {
        return Err("未知窗口".into());
    }
    let w = match app.get_webview_window(panel) {
        Some(w) => w,
        None => {
            let w = WebviewWindowBuilder::new(
                app,
                panel,
                WebviewUrl::App(
                    format!(
                        "index.html?panel={panel}&section={}",
                        section
                            .as_deref()
                            .filter(|s| ["appearance", "monitor", "layout", "data"].contains(s))
                            .unwrap_or("monitor")
                    )
                    .into(),
                ),
            )
            .title(match panel {
                "settings" => "WorkMemo 设置",
                "history" => "WorkMemo 历史与统计",
                _ => "WorkMemo 待补全",
            })
            .inner_size(900.0, 680.0)
            .transparent(true)
            .no_redirection_bitmap(true)
            .decorations(false)
            .shadow(false)
            .visible(false)
            .build()
            .map_err(|e| e.to_string())?;
            restore(&w)?;
            w
        }
    };
    w.show()
        .and_then(|_| w.unminimize())
        .and_then(|_| w.set_focus())
        .map_err(|e| e.to_string())?;
    if let Some(s) = section {
        w.emit("workmemo:settings-section", s)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn get_layout_settings(state: tauri::State<'_, WindowState>) -> Result<Layout, String> {
    Ok(state.data.lock().map_err(|_| "窗口设置锁异常")?.clone())
}
#[tauri::command]
pub fn set_layout_density(app: tauri::AppHandle, density: String) -> Result<(), String> {
    if !["compact", "comfortable"].contains(&density.as_str()) {
        return Err("间距无效".into());
    }
    let s = app.state::<WindowState>();
    s.data.lock().map_err(|_| "窗口设置锁异常")?.density = density;
    persist(&s)?;
    let _ = app.emit("workmemo:layout-changed", ());
    Ok(())
}
#[tauri::command]
pub fn reset_window_layout(app: tauri::AppHandle) -> Result<(), String> {
    let s = app.state::<WindowState>();
    *s.data.lock().map_err(|_| "窗口设置锁异常")? = Layout::default();
    persist(&s)?;
    for (_, w) in app.webview_windows() {
        if valid_label(w.label()) {
            restore(&w)?;
        }
    }
    let _ = app.emit("workmemo:layout-changed", ());
    Ok(())
}
#[tauri::command]
pub fn set_window_dirty(window: tauri::Window, dirty: bool) -> Result<(), String> {
    window
        .state::<WindowState>()
        .dirty
        .lock()
        .map_err(|_| "草稿状态锁异常")?
        .insert(window.label().into(), dirty);
    Ok(())
}
#[tauri::command]
pub fn close_panel(window: tauri::Window) -> Result<(), String> {
    if !matches!(window.label(), "settings" | "history" | "settlement") {
        return Err("窗口不匹配".into());
    }
    capture(&window)?;
    window.hide().map_err(|e| e.to_string())
}
pub fn has_drafts(app: &tauri::AppHandle) -> bool {
    app.state::<WindowState>()
        .dirty
        .lock()
        .map(|d| d.values().any(|v| *v))
        .unwrap_or(true)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn geometry_clamps_removed_monitor_and_high_dpi() {
        let g = bounded((9999, -300, 900.0, 680.0), (0, 0, 1280, 720), 1.5);
        assert!(g.x >= 0 && g.y >= 0);
        assert!(g.width * 1.5 <= 1280.0 && g.height * 1.5 <= 720.0);
    }
    #[test]
    fn geometry_keeps_negative_monitor_coordinates_and_fits_small_desktops() {
        let g = bounded((-1800, 100, 900.0, 680.0), (-1920, 0, 1920, 1080), 1.0);
        assert_eq!((g.x, g.y), (-1800, 100));
        let g = bounded((9000, 9000, 780.0, 560.0), (0, 0, 800, 600), 2.0);
        assert!(g.width * 2.0 <= 800.0 && g.height * 2.0 <= 600.0);
        assert!(g.x >= 0 && g.y >= 0);
    }
    #[test]
    fn persisted_layout_rejects_unknown_windows_and_invalid_sizes() {
        assert!(decode_layout(br#"{"density":"comfortable","windows":{"main":{"x":0,"y":0,"width":780,"height":560}}}"#).is_ok());
        assert!(decode_layout(br#"{"density":"comfortable","windows":{"main":{"x":0,"y":0,"width":0,"height":560}}}"#).is_err());
        assert!(decode_layout(br#"{"density":"unknown","windows":{}}"#).is_err());
    }
}

pub fn reload(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<WindowState>();
    *state.data.lock().map_err(|_| "窗口设置锁异常")? = load(&state.path)?;
    for (_, w) in app.webview_windows() {
        if valid_label(w.label()) {
            restore(&w)?;
        }
    }
    Ok(())
}
