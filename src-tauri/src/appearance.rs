use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::{
        Mutex,
        atomic::{AtomicU64, Ordering},
    },
};
use tauri::{Emitter, Manager, State};

const VERSION: u32 = 1;
const MAX_BYTES: u64 = 65_536;
static NEXT_TEMP: AtomicU64 = AtomicU64::new(0);
type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Glass,
    Cream,
    Dark,
    Neon,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Appearance {
    pub version: u32,
    pub theme: Theme,
    pub opacity: u8,
}

impl Default for Appearance {
    fn default() -> Self {
        Self {
            version: VERSION,
            theme: Theme::Cream,
            opacity: 88,
        }
    }
}

impl Appearance {
    fn validate(&self) -> Result<()> {
        if self.version != VERSION {
            return Err("外观设置版本不受支持，请使用匹配的应用版本。".into());
        }
        if !(80..=100).contains(&self.opacity) {
            return Err("背景不透明度须在 80% 到 100% 之间。".into());
        }
        Ok(())
    }
}

fn io_error(error: std::io::Error) -> String {
    format!("外观设置读写失败：{error}")
}

fn read_bytes(path: &Path) -> Result<Option<Vec<u8>>> {
    let file = match File::open(path) {
        Ok(file) => file,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(io_error(error)),
    };
    let mut bytes = Vec::new();
    file.take(MAX_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(io_error)?;
    if bytes.len() as u64 > MAX_BYTES {
        return Err("外观配置文件过大，请检查配置后重试。".into());
    }
    Ok(Some(bytes))
}

fn decode(bytes: &[u8]) -> Result<Appearance> {
    let settings: Appearance =
        serde_json::from_slice(bytes).map_err(|e| format!("无法读取外观配置：{e}"))?;
    settings.validate()?;
    Ok(settings)
}

pub fn load(path: &Path) -> Result<Appearance> {
    match read_bytes(path)? {
        Some(bytes) => decode(&bytes),
        None => Ok(Appearance::default()),
    }
}

struct TemporaryFile(PathBuf);
impl Drop for TemporaryFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn write_unique(parent: &Path, label: &str, extension: &str, bytes: &[u8]) -> Result<PathBuf> {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
    let path = parent.join(format!(
        "appearance.{label}.{}.{nonce}.{sequence}.{extension}",
        std::process::id()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .map_err(io_error)?;
    if let Err(error) = file.write_all(bytes).and_then(|_| file.sync_all()) {
        drop(file);
        let _ = fs::remove_file(&path);
        return Err(io_error(error));
    }
    Ok(path)
}

pub fn save(path: &Path, settings: Appearance) -> Result<Appearance> {
    settings.validate()?;
    let previous = read_bytes(path)?;
    if let Some(bytes) = &previous {
        if let Ok(value) = serde_json::from_slice::<serde_json::Value>(bytes) {
            if value
                .get("version")
                .and_then(|v| v.as_u64())
                .is_some_and(|v| v > u64::from(VERSION))
            {
                return Err("外观配置来自较新版本，未覆盖文件。请升级应用。".into());
            }
        }
    }
    let parent = path.parent().ok_or("外观配置目录无效。")?;
    fs::create_dir_all(parent).map_err(io_error)?;
    // An explicit save can repair invalid settings, retaining the original bytes.
    if let Some(bytes) = &previous {
        if decode(bytes).is_err() {
            write_unique(parent, "recovery", "json", bytes)?;
        }
    }
    let mut bytes =
        serde_json::to_vec_pretty(&settings).map_err(|e| format!("无法编码外观配置：{e}"))?;
    bytes.push(b'\n');
    let temporary = TemporaryFile(write_unique(parent, "pending", "tmp", &bytes)?);
    // Same-directory replacement: never truncate the live configuration first.
    fs::rename(&temporary.0, path).map_err(io_error)?;
    Ok(settings)
}

pub struct AppearanceState {
    path: Result<PathBuf>,
    gate: Mutex<()>,
}

impl AppearanceState {
    pub fn initialize(app: &tauri::App) -> Self {
        Self {
            path: app
                .path()
                .app_config_dir()
                .map(|p| p.join("appearance.json"))
                .map_err(|e| format!("无法定位外观配置目录：{e}")),
            gate: Mutex::new(()),
        }
    }
}

#[tauri::command]
pub async fn get_appearance(app: tauri::AppHandle) -> Result<Appearance> {
    tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        load(state.path.as_ref().map_err(|e| e.clone())?)
    })
    .await
    .map_err(|e| format!("无法加载外观设置：{e}"))?
}

#[tauri::command]
pub async fn save_appearance(app: tauri::AppHandle, settings: Appearance) -> Result<Appearance> {
    let handle = app.clone();
    let saved = tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        save(state.path.as_ref().map_err(|e| e.clone())?, settings)
    })
    .await
    .map_err(|e| format!("无法保存外观设置：{e}"))??;
    let _ = handle.emit("workmemo:appearance-changed", ());
    Ok(saved)
}

#[cfg(test)]
#[path = "appearance_tests.rs"]
mod tests;
