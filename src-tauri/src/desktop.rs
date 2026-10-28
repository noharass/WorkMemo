use serde::{Deserialize, Serialize};
use std::{
    path::PathBuf,
    sync::{Mutex, atomic::Ordering},
};
use tauri::{
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct IslandSettings {
    version: u32,
    enabled: bool,
    position: Option<(i32, i32)>,
}
pub fn validate_island(bytes: &[u8]) -> Result<(), String> {
    let value: IslandSettings = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if value.version != 1 {
        return Err("状态岛配置版本不受支持".into());
    }
    Ok(())
}
impl Default for IslandSettings {
    fn default() -> Self {
        Self {
            version: 1,
            enabled: true,
            position: None,
        }
    }
}
pub struct IslandState {
    path: Result<PathBuf, String>,
    data: Mutex<(IslandSettings, bool)>,
}
impl IslandState {
    pub fn initialize(app: &tauri::App) -> Self {
        let path = app
            .path()
            .app_config_dir()
            .map(|p| p.join("island.json"))
            .map_err(|e| e.to_string());
        let loaded =
            path.as_ref()
                .map_err(|e| e.clone())
                .and_then(|path| match std::fs::read(path) {
                    Ok(bytes) => serde_json::from_slice::<IslandSettings>(&bytes)
                        .map_err(|e| e.to_string())
                        .and_then(|v| {
                            if v.version == 1 {
                                Ok(v)
                            } else {
                                Err("状态岛配置版本不受支持".into())
                            }
                        }),
                    Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                        Ok(IslandSettings::default())
                    }
                    Err(e) => Err(e.to_string()),
                });
        let (path, settings) = match loaded {
            Ok(settings) => (path, settings),
            Err(error) => (
                Err(format!("状态岛配置无法读取，未覆盖原文件：{error}")),
                IslandSettings::default(),
            ),
        };
        Self {
            path,
            data: Mutex::new((settings, false)),
        }
    }
    pub fn enabled(&self) -> bool {
        self.data.lock().map(|d| d.0.enabled).unwrap_or(true)
    }
    fn toggle(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        data.0.enabled = !data.0.enabled;
        data.1 = true;
        drop(data);
        self.flush()
    }
    pub fn disable(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        data.0.enabled = false;
        data.1 = true;
        drop(data);
        self.flush()
    }
    pub fn moved(&self, p: tauri::PhysicalPosition<i32>) {
        if let Ok(mut data) = self.data.lock() {
            if data.0.position != Some((p.x, p.y)) {
                data.0.position = Some((p.x, p.y));
                data.1 = true;
            }
        }
    }
    pub fn flush(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        if !data.1 {
            return Ok(());
        }
        let path = self.path.as_ref().map_err(|e| e.clone())?;
        let parent = path.parent().ok_or("状态岛设置目录无效")?;
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        let temp = path.with_extension("pending");
        std::fs::write(
            &temp,
            serde_json::to_vec(&data.0).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;
        std::fs::rename(&temp, path).map_err(|e| e.to_string())?;
        data.1 = false;
        Ok(())
    }
    fn position(&self) -> Option<(i32, i32)> {
        self.data.lock().ok().and_then(|d| d.0.position)
    }
}

pub fn show_main(app: &tauri::AppHandle, settlement: bool) -> Result<(), String> {
    if settlement {
        let handle = app.clone();
        // Tray callbacks run on the UI thread; WebView creation must not block it.
        tauri::async_runtime::spawn_blocking(move || {
            if let Err(error) = crate::windows::show_panel(&handle, "settlement", None) {
                let _ = show_main(&handle, false);
                let _ = handle.emit("workmemo:runtime-error", error);
            }
        });
        return Ok(());
    }
    let window = app.get_webview_window("main").ok_or("主窗口不可用。")?;
    set_visibility(&window.as_ref().window(), true, true)?;
    window
        .show()
        .and_then(|_| window.unminimize())
        .and_then(|_| window.set_focus())
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "打开 WorkMemo", true, None::<&str>)?;
    let pending = MenuItem::with_id(app, "pending", "待补全工作量", true, None::<&str>)?;
    let island = MenuItem::with_id(app, "island", "显示 / 隐藏状态岛", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出 WorkMemo", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &pending, &island, &quit])?;
    let mut builder = TrayIconBuilder::with_id("workmemo-tray")
        .tooltip("WorkMemo · 后台工作记录")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main(app, false);
            }
            "pending" => {
                let _ = show_main(app, true);
            }
            "island" => {
                if let Err(error) = app.state::<IslandState>().toggle() {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
            }
            "quit" => {
                if let Err(error) = save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if crate::windows::has_drafts(app) {
                    let _ = app.emit("workmemo:request-close", ());
                    return;
                }
                let backend = app.state::<crate::service::Backend>();
                match backend.save_on_exit() {
                    Ok(()) => {
                        backend.exiting.store(true, Ordering::Relaxed);
                        app.exit(0);
                    }
                    Err(error) => {
                        let _ = show_main(app, false);
                        let _ = app.emit("workmemo:storage-error", error);
                    }
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                }
            ) {
                let _ = show_main(tray.app_handle(), false);
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    app.state::<crate::service::Backend>()
        .tray_ready
        .store(true, Ordering::Relaxed);
    Ok(())
}

pub fn save_island_position(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<IslandState>();
    if let Some(window) = app.get_webview_window("notice") {
        state.moved(window.outer_position().map_err(|e| e.to_string())?);
    }
    state.flush()
}

pub fn present_notice(
    app: &tauri::AppHandle,
    visible: bool,
    expanded: bool,
    confirming: bool,
) -> Result<(), String> {
    if !visible {
        if let Some(window) = app.get_webview_window("notice") {
            set_visibility(&window.as_ref().window(), false, false)?;
        }
        return Ok(());
    }
    let window = match app.get_webview_window("notice") {
        Some(window) => window,
        None => {
            let saved_position = app.state::<IslandState>().position();
            let window = WebviewWindowBuilder::new(
                app,
                "notice",
                WebviewUrl::App("index.html?notice=1".into()),
            )
            .title("WorkMemo 工作提醒")
            .inner_size(320.0, 56.0)
            .resizable(false)
            .transparent(true)
            .no_redirection_bitmap(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .focused(false)
            .visible(false)
            .background_color(tauri::window::Color(0, 0, 0, 0))
            .build()
            .map_err(|e| e.to_string())?;
            if let Some((x, y)) = saved_position {
                window
                    .set_position(tauri::PhysicalPosition::new(x, y))
                    .map_err(|e| e.to_string())?;
            } else if let Some(monitor) = window.primary_monitor().map_err(|e| e.to_string())? {
                let scale = monitor.scale_factor();
                let origin = &monitor.work_area().position;
                let size = &monitor.work_area().size;
                let width = (320.0 * scale) as i32;
                let x = origin.x + ((size.width as i32 - width) / 2).max(0);
                let y = origin.y + (16.0 * scale) as i32;
                window
                    .set_position(tauri::PhysicalPosition::new(x, y))
                    .map_err(|e| e.to_string())?;
            }
            window
        }
    };
    // Tao's creation-only focused(false) marker is cleared after creation;
    // a later generic show() may activate the window. Use the native no-activate
    // command consistently for both showing and hiding this auxiliary window.
    let (width, height) = if expanded {
        (420.0, 460.0)
    } else if confirming {
        (320.0, 88.0)
    } else {
        (320.0, 56.0)
    };
    window
        .set_size(tauri::LogicalSize::new(width, height))
        .map_err(|e| e.to_string())?;
    let position = window.outer_position().map_err(|e| e.to_string())?;
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;
    let monitor = monitors
        .iter()
        .find(|m| {
            let a = m.work_area();
            position.x >= a.position.x
                && position.y >= a.position.y
                && i64::from(position.x) < i64::from(a.position.x) + i64::from(a.size.width)
                && i64::from(position.y) < i64::from(a.position.y) + i64::from(a.size.height)
        })
        .or_else(|| monitors.first());
    if let Some(monitor) = monitor {
        let a = monitor.work_area();
        let scale = monitor.scale_factor();
        let max_x = (i64::from(a.position.x) + i64::from(a.size.width) - (width * scale) as i64)
            .max(i64::from(a.position.x));
        let max_y = (i64::from(a.position.y) + i64::from(a.size.height) - (height * scale) as i64)
            .max(i64::from(a.position.y));
        let x = i64::from(position.x).clamp(i64::from(a.position.x), max_x) as i32;
        let y = i64::from(position.y).clamp(i64::from(a.position.y), max_y) as i32;
        if (x, y) != (position.x, position.y) {
            window
                .set_position(tauri::PhysicalPosition::new(x, y))
                .map_err(|e| e.to_string())?;
        }
    }
    set_visibility(&window.as_ref().window(), true, false)
}

pub fn set_visibility(window: &tauri::Window, visible: bool, activate: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SW_HIDE, SW_SHOWNOACTIVATE, SW_SHOWNORMAL, ShowWindowAsync,
        };
        let handle = window.hwnd().map_err(|e| e.to_string())?;
        let command = if !visible {
            SW_HIDE
        } else if activate {
            SW_SHOWNORMAL
        } else {
            SW_SHOWNOACTIVATE
        };
        if unsafe { ShowWindowAsync(handle.0 as _, command) } == 0 {
            return Err(format!(
                "原生窗口显示请求失败：{}",
                std::io::Error::last_os_error()
            ));
        }
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = activate;
        if visible {
            window.show()
        } else {
            window.hide()
        }
        .map_err(|e| e.to_string())
    }
}

pub fn reload_island(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<IslandState>();
    let p = state.path.as_ref().map_err(|e| e.clone())?;
    let settings = if p.exists() {
        serde_json::from_slice::<IslandSettings>(&std::fs::read(p).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?
    } else {
        IslandSettings::default()
    };
    if settings.version != 1 {
        return Err("状态岛版本无效".into());
    }
    *state.data.lock().map_err(|_| "状态岛设置锁异常")? = (settings, false);
    Ok(())
}
