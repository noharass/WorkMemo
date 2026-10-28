use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{Emitter, Manager};
type Result<T> = std::result::Result<T, String>;
pub const CATEGORIES: [&str; 4] = ["评测", "质检", "开发", "文档"];
pub const ICONS: [&str; 16] = [
    "checkSquare",
    "safety",
    "code",
    "note",
    "search",
    "chart",
    "list",
    "clock",
    "star",
    "rocket",
    "bulb",
    "tool",
    "read",
    "check",
    "home",
    "settings",
];
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryVisual {
    pub icon: String,
    pub color: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Background {
    pub file: String,
    pub opacity: u8,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Presentation {
    pub version: u8,
    pub revision: u64,
    pub categories: BTreeMap<String, CategoryVisual>,
    pub background: Option<Background>,
}
impl Default for Presentation {
    fn default() -> Self {
        let colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
        let icons = ["checkSquare", "safety", "code", "note"];
        Self {
            version: 1,
            revision: 0,
            categories: CATEGORIES
                .into_iter()
                .enumerate()
                .map(|(i, c)| {
                    (
                        c.into(),
                        CategoryVisual {
                            icon: icons[i].into(),
                            color: colors[i].into(),
                        },
                    )
                })
                .collect(),
            background: None,
        }
    }
}
pub fn image_name(name: &str) -> bool {
    name.len() < 100
        && name.starts_with("bg-")
        && [".png", ".jpg", ".webp"].iter().any(|e| name.ends_with(e))
        && name
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'.')
}
impl Presentation {
    pub fn validate(&self) -> Result<()> {
        if self.version != 1 || self.categories.len() != 4 {
            return Err("界面配置版本或类别无效。".into());
        }
        for name in CATEGORIES {
            let v = self.categories.get(name).ok_or("工作类别配置不完整")?;
            if !ICONS.contains(&v.icon.as_str())
                || v.color.len() != 7
                || !v.color.starts_with('#')
                || !v.color.as_bytes()[1..]
                    .iter()
                    .all(|b| b.is_ascii_hexdigit())
            {
                return Err("请选择有效的图标和颜色。".into());
            }
        }
        if self
            .background
            .as_ref()
            .is_some_and(|b| !image_name(&b.file) || b.opacity > 100)
        {
            return Err("背景配置无效。".into());
        }
        Ok(())
    }
}
pub fn load(dir: &Path) -> Result<Presentation> {
    match std::fs::read(dir.join("presentation.json")) {
        Ok(b) => {
            let v: Presentation = serde_json::from_slice(&b).map_err(|e| e.to_string())?;
            v.validate()?;
            Ok(v)
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Presentation::default()),
        Err(e) => Err(e.to_string()),
    }
}
pub struct PresentationState {
    pub dir: PathBuf,
    pub gate: Mutex<()>,
}
pub fn initialize(app: &tauri::App) -> Result<PresentationState> {
    Ok(PresentationState {
        dir: app.path().app_config_dir().map_err(|e| e.to_string())?,
        gate: Mutex::new(()),
    })
}
pub fn validate_image(bytes: &[u8]) -> Result<&'static str> {
    if bytes.len() > 10 * 1024 * 1024 {
        return Err("背景图片不能超过10 MiB。".into());
    }
    let format = image::guess_format(bytes).map_err(|_| "无法识别图片格式")?;
    let ext = match format {
        image::ImageFormat::Png => "png",
        image::ImageFormat::Jpeg => "jpg",
        image::ImageFormat::WebP => "webp",
        _ => return Err("仅支持PNG、JPEG和WebP图片。".into()),
    };
    let (w, h) = image::ImageReader::with_format(std::io::Cursor::new(bytes), format)
        .into_dimensions()
        .map_err(|_| "图片文件损坏")?;
    if w == 0 || h == 0 || u64::from(w) * u64::from(h) > 16_000_000 {
        return Err("背景图片最多1600万像素。".into());
    }
    image::load_from_memory_with_format(bytes, format).map_err(|_| "图片解码失败")?;
    Ok(ext)
}
#[tauri::command]
pub async fn get_presentation(app: tauri::AppHandle) -> Result<Presentation> {
    tauri::async_runtime::spawn_blocking(move || {
        let s = app.state::<PresentationState>();
        let _lock = s.gate.lock().map_err(|_| "界面设置锁异常")?;
        load(&s.dir)
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub async fn save_presentation(
    app: tauri::AppHandle,
    mut settings: Presentation,
) -> Result<Presentation> {
    let handle = app.clone();
    let saved = tauri::async_runtime::spawn_blocking(move || {
        let s = app.state::<PresentationState>();
        let _lock = s.gate.lock().map_err(|_| "界面设置锁异常")?;
        settings.validate()?;
        let current = load(&s.dir)?;
        if current.revision != settings.revision {
            return Err("界面设置已变化，请重新读取后保存。".into());
        }
        if let Some(bg) = &settings.background {
            let bytes = std::fs::read(s.dir.join("backgrounds").join(&bg.file))
                .map_err(|_| "背景文件不存在，请重新选择。")?;
            validate_image(&bytes)?;
        }
        settings.revision += 1;
        std::fs::create_dir_all(&s.dir).map_err(|e| e.to_string())?;
        let pending = s.dir.join("presentation.pending");
        use std::io::Write;
        let mut f = std::fs::File::create(&pending).map_err(|e| e.to_string())?;
        f.write_all(&serde_json::to_vec(&settings).map_err(|e| e.to_string())?)
            .and_then(|_| f.sync_all())
            .map_err(|e| e.to_string())?;
        drop(f);
        std::fs::rename(pending, s.dir.join("presentation.json")).map_err(|e| e.to_string())?;
        Ok::<_, String>(settings)
    })
    .await
    .map_err(|e| e.to_string())??;
    let _ = handle.emit("workmemo:presentation-changed", ());
    Ok(saved)
}
#[tauri::command]
pub async fn import_background(app: tauri::AppHandle) -> Result<Option<Background>> {
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = choose_image()? else {
            return Ok(None);
        };
        if std::fs::metadata(&path).map_err(|e| e.to_string())?.len() > 10 * 1024 * 1024 {
            return Err("背景图片不能超过10 MiB。".into());
        }
        let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
        let ext = validate_image(&bytes)?;
        let stamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_nanos();
        let file = format!("bg-{}-{stamp}.{ext}", std::process::id());
        let dir = app.state::<PresentationState>().dir.join("backgrounds");
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        use std::io::Write;
        let mut f = std::fs::OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(dir.join(&file))
            .map_err(|e| e.to_string())?;
        f.write_all(&bytes)
            .and_then(|_| f.sync_all())
            .map_err(|e| e.to_string())?;
        Ok(Some(Background { file, opacity: 25 }))
    })
    .await
    .map_err(|e| e.to_string())?
}
fn choose_image() -> Result<Option<PathBuf>> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::Controls::Dialogs::*;
        let mut name = vec![0u16; 32768];
        let filter: Vec<u16> = "Images (PNG, JPEG, WebP)\0*.png;*.jpg;*.jpeg;*.webp\0\0"
            .encode_utf16()
            .collect();
        let mut ofn: OPENFILENAMEW = unsafe { std::mem::zeroed() };
        ofn.lStructSize = std::mem::size_of::<OPENFILENAMEW>() as u32;
        ofn.lpstrFile = name.as_mut_ptr();
        ofn.nMaxFile = name.len() as u32;
        ofn.lpstrFilter = filter.as_ptr();
        ofn.Flags = OFN_EXPLORER | OFN_NOCHANGEDIR | OFN_FILEMUSTEXIST;
        if unsafe { GetOpenFileNameW(&mut ofn) } == 0 {
            let err = unsafe { CommDlgExtendedError() };
            return if err == 0 {
                Ok(None)
            } else {
                Err(format!("图片选择失败：{err}"))
            };
        }
        let n = name.iter().position(|c| *c == 0).ok_or("路径无效")?;
        Ok(Some(PathBuf::from(
            String::from_utf16(&name[..n]).map_err(|e| e.to_string())?,
        )))
    }
    #[cfg(not(windows))]
    {
        Err("图片选择仅支持Windows".into())
    }
}
pub fn background_response(app: &tauri::AppHandle, path: &str) -> tauri::http::Response<Vec<u8>> {
    let file = path.trim_start_matches('/');
    let result = (|| -> Result<(Vec<u8>, String)> {
        if !image_name(file) {
            return Err("invalid image".into());
        }
        let bytes = std::fs::read(
            app.state::<PresentationState>()
                .dir
                .join("backgrounds")
                .join(file),
        )
        .map_err(|e| e.to_string())?;
        if bytes.len() > 10 * 1024 * 1024 {
            return Err("image too large".into());
        }
        let mime = if file.ends_with(".png") {
            "image/png"
        } else if file.ends_with(".jpg") {
            "image/jpeg"
        } else {
            "image/webp"
        };
        Ok((bytes, mime.into()))
    })();
    match result {
        Ok((b, m)) => tauri::http::Response::builder()
            .header("Content-Type", m)
            .header("Cache-Control", "private, max-age=3600")
            .body(b)
            .unwrap(),
        Err(_) => tauri::http::Response::builder()
            .status(404)
            .body(Vec::new())
            .unwrap(),
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn invalid_visuals_and_image_paths_are_rejected() {
        let mut p = Presentation::default();
        p.validate().unwrap();
        p.categories.get_mut("开发").unwrap().color = "url(x)".into();
        assert!(p.validate().is_err());
        assert!(!image_name("../bg-a.png"));
        assert!(!image_name("bg-a.svg"));
        assert!(validate_image(b"not an image").is_err());
    }
    #[test]
    fn decoded_images_and_opacity_are_validated_before_saving() {
        let image = image::DynamicImage::new_rgba8(2, 2);
        let mut bytes = std::io::Cursor::new(Vec::new());
        image.write_to(&mut bytes, image::ImageFormat::Png).unwrap();
        assert_eq!(validate_image(bytes.get_ref()).unwrap(), "png");
        assert!(validate_image(&vec![0u8; 10 * 1024 * 1024 + 1]).is_err());
        let mut p = Presentation::default();
        p.background = Some(Background {
            file: "bg-test.png".into(),
            opacity: 101,
        });
        assert!(p.validate().is_err());
        p.background.as_mut().unwrap().opacity = 0;
        p.validate().unwrap();
        p.background.as_mut().unwrap().opacity = 100;
        p.validate().unwrap();
    }
}
