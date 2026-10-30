use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};
use tauri::{Emitter, Manager};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Preference {
    version: u8,
    enabled: bool,
}

pub struct StartupState {
    path: PathBuf,
    gate: Mutex<()>,
    initial_error: Mutex<Option<String>>,
}

#[derive(Serialize)]
pub struct StartupStatus {
    enabled: bool,
    available: bool,
    error: Option<String>,
}

fn decode(bytes: &[u8]) -> Result<Preference, String> {
    let value: Preference = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if value.version != 1 {
        return Err("开机启动设置版本不受支持，原文件已保留。".into());
    }
    Ok(value)
}

fn persist(path: &std::path::Path, enabled: bool) -> Result<(), String> {
    use std::io::Write;
    std::fs::create_dir_all(path.parent().ok_or("启动配置目录无效")?).map_err(|e| e.to_string())?;
    let temporary = path.with_extension("pending");
    let mut file = std::fs::File::create(&temporary).map_err(|e| e.to_string())?;
    file.write_all(
        &serde_json::to_vec(&Preference {
            version: 1,
            enabled,
        })
        .map_err(|e| e.to_string())?,
    )
    .and_then(|_| file.sync_all())
    .map_err(|e| e.to_string())?;
    drop(file);
    std::fs::rename(temporary, path).map_err(|e| e.to_string())
}

fn available(app: &tauri::AppHandle) -> bool {
    cfg!(windows) && !cfg!(debug_assertions) && app.config().identifier == "com.workmemo.desktop"
}

#[cfg(windows)]
fn register(app: &tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let manager = app.autolaunch();
    let previous = startup_key(false)?
        .map(|key| key.read("WorkMemo"))
        .transpose()?
        .flatten();
    if enabled {
        let result = manager
            .enable()
            .map_err(|e| e.to_string())
            .and_then(|_| refresh_path());
        if let Err(error) = result {
            let restored = (|| {
                if let Some(key) = startup_key(previous.is_some())? {
                    if let Some(value) = previous {
                        key.write("WorkMemo", &value)?;
                    } else {
                        key.remove("WorkMemo")?;
                    }
                }
                Ok::<_, String>(())
            })();
            return Err(match restored {
                Ok(()) => error,
                Err(restore) => format!("{error}；原启动项恢复失败：{restore}"),
            });
        }
    } else if previous.is_some() {
        manager.disable().map_err(|e| e.to_string())?;
    }
    if manager.is_enabled().map_err(|e| e.to_string())? != enabled {
        return Err("系统启动项未能应用，请重试。".into());
    }
    Ok(())
}

#[cfg(windows)]
fn startup_key(create: bool) -> Result<Option<crate::registration::windows_registry::Key>, String> {
    crate::registration::windows_registry::Key::open(
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        create,
        windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
    )
    .map_err(|e| format!("无法访问当前用户的开机启动项：{e}"))
}

fn startup_command(executable: &std::path::Path) -> String {
    format!("\"{}\" --autostart", executable.display())
}

#[cfg(windows)]
fn refresh_path() -> Result<(), String> {
    let key = startup_key(true)?.ok_or("启动项不可用")?;
    let command = startup_command(&std::env::current_exe().map_err(|e| e.to_string())?);
    key.write("WorkMemo", &command)?;
    if key.read("WorkMemo")?.as_deref() != Some(command.as_str()) {
        return Err("开机启动路径写入后校验失败".into());
    }
    Ok(())
}

pub fn initialize(app: &tauri::App) -> Result<StartupState, String> {
    let path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("startup.json");
    let mut initial_error = None;
    if available(app.handle()) {
        let result = (|| {
            let mut first_run = false;
            let preference = match std::fs::read(&path) {
                Ok(bytes) => decode(&bytes)?,
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                    first_run = true;
                    persist(&path, true)?;
                    Preference {
                        version: 1,
                        enabled: true,
                    }
                }
                Err(e) => return Err(e.to_string()),
            };
            #[cfg(windows)]
            {
                use tauri_plugin_autostart::ManagerExt;
                if first_run || !preference.enabled {
                    register(app.handle(), preference.enabled)?;
                } else if app.autolaunch().is_enabled().map_err(|e| e.to_string())? {
                    // Update moved/updated executables without overriding Task Manager's choice.
                    refresh_path()?;
                } else {
                    persist(&path, false)?;
                }
            }
            let _ = preference;
            Ok::<_, String>(())
        })();
        initial_error = result.err();
    }
    Ok(StartupState {
        path,
        gate: Mutex::new(()),
        initial_error: Mutex::new(initial_error),
    })
}

#[tauri::command]
pub fn get_startup_status(
    app: tauri::AppHandle,
    window: tauri::Window,
) -> Result<StartupStatus, String> {
    if !matches!(window.label(), "settings" | "main") {
        return Err("窗口不匹配".into());
    }
    let state = app.state::<StartupState>();
    let available = available(&app);
    let mut enabled = false;
    let mut error = state
        .initial_error
        .lock()
        .map_err(|_| "启动状态锁异常")?
        .clone();
    #[cfg(windows)]
    if available {
        use tauri_plugin_autostart::ManagerExt;
        match app.autolaunch().is_enabled() {
            Ok(value) => enabled = value,
            Err(e) => error = Some(e.to_string()),
        }
    }
    Ok(StartupStatus {
        enabled,
        available,
        error,
    })
}

#[tauri::command]
pub fn set_startup_enabled(
    app: tauri::AppHandle,
    window: tauri::Window,
    enabled: bool,
) -> Result<StartupStatus, String> {
    if window.label() != "settings" || !available(&app) {
        return Err("仅正式 Windows 版本的设置窗口可以修改开机启动。".into());
    }
    let state = app.state::<StartupState>();
    let _guard = state.gate.lock().map_err(|_| "启动设置锁异常")?;
    let result = (|| {
        // Never replace a malformed preference, including when a toggle is retried.
        if state.path.exists() {
            decode(&std::fs::read(&state.path).map_err(|e| e.to_string())?)?;
        }
        persist(&state.path, enabled)?;
        #[cfg(windows)]
        register(&app, enabled)?;
        Ok::<_, String>(())
    })();
    *state.initial_error.lock().map_err(|_| "启动状态锁异常")? = result.as_ref().err().cloned();
    let _ = app.emit("workmemo:startup-changed", ());
    result?;
    Ok(StartupStatus {
        enabled,
        available: true,
        error: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn startup_preference_preserves_disabled_and_rejects_corruption() {
        assert!(!decode(br#"{"version":1,"enabled":false}"#).unwrap().enabled);
        assert!(decode(br#"{"version":1,"enabled":true}"#).unwrap().enabled);
        assert!(decode(br#"{"version":2,"enabled":true}"#).is_err());
        assert!(decode(br#"{"version":1}"#).is_err());
        assert!(decode(b"broken").is_err());
    }
    #[test]
    fn login_command_quotes_paths_with_spaces() {
        assert_eq!(
            startup_command(std::path::Path::new(r"C:\Work Memo\workmemo.exe")),
            "\"C:\\Work Memo\\workmemo.exe\" --autostart"
        );
    }
}
