use std::sync::atomic::Ordering;
use tauri::{
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

pub fn show_main(app: &tauri::AppHandle, settlement: bool) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("主窗口不可用。")?;
    set_visibility(&window.as_ref().window(), true, true)?;
    window
        .show()
        .and_then(|_| window.unminimize())
        .and_then(|_| window.set_focus())
        .map_err(|e| e.to_string())?;
    if settlement {
        window
            .emit("workmemo:open-settlement", ())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "打开 WorkMemo", true, None::<&str>)?;
    let pending = MenuItem::with_id(app, "pending", "待补全工作量", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出 WorkMemo", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &pending, &quit])?;
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
            "quit" => {
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

pub fn present_notice(app: &tauri::AppHandle, visible: bool) -> Result<(), String> {
    if !visible {
        if let Some(window) = app.get_webview_window("notice") {
            set_visibility(&window.as_ref().window(), false, false)?;
        }
        return Ok(());
    }
    let window = match app.get_webview_window("notice") {
        Some(window) => window,
        None => {
            WebviewWindowBuilder::new(app, "notice", WebviewUrl::App("index.html?notice=1".into()))
                .title("WorkMemo 工作提醒")
                .inner_size(420.0, 460.0)
                .min_inner_size(340.0, 320.0)
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
                .map_err(|e| e.to_string())?
        }
    };
    // Tao's creation-only focused(false) marker is cleared after creation;
    // a later generic show() may activate the window. Use the native no-activate
    // command consistently for both showing and hiding this auxiliary window.
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
