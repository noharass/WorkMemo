use crate::registration::{self, BridgeInfo};
use serde::Serialize;
use std::{
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{Arc, Mutex},
};
use tauri::{Manager, State};

#[derive(Clone, Serialize)]
pub struct ConnectionStatus {
    pub state: String,
    pub message: String,
    pub identifier: String,
    pub version: String,
    pub host_name: String,
    pub manifest_path: Option<String>,
    pub extension_path: Option<String>,
}
pub struct ConnectionState {
    pub status: Arc<Mutex<ConnectionStatus>>,
    pub gate: Mutex<()>,
    directory: PathBuf,
    identifier: String,
}
fn command(path: &Path) -> Command {
    let mut command = Command::new(path);
    command.stdin(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    command
}
pub fn inspect(directory: &Path, identifier: &str, repair: bool) -> ConnectionStatus {
    let extension = directory.join("extension");
    let mut status = ConnectionStatus {
        state: "error".into(),
        message: String::new(),
        identifier: identifier.into(),
        version: env!("CARGO_PKG_VERSION").into(),
        host_name: registration::host_name(identifier).unwrap_or("").into(),
        manifest_path: None,
        extension_path: extension
            .join("manifest.json")
            .is_file()
            .then(|| extension.to_string_lossy().into_owned()),
    };
    let result = (|| -> Result<(), String> {
        let binary = directory.join("workmemo-browser.exe");
        if !binary.is_file() {
            return Err("缺少 workmemo-browser.exe，请完整解压 ZIP 或重新安装完整 EXE。".into());
        }
        let info = command(&binary)
            .arg("--bridge-info")
            .output()
            .map_err(|_| "无法运行配套通信组件。")?;
        if !info.status.success() {
            return Err("通信组件配置无效，请重新安装或完整解压同一版本。".into());
        }
        let info: BridgeInfo = serde_json::from_slice(&info.stdout)
            .map_err(|_| "通信组件过旧，请完整更新同一版本的程序和扩展。")?;
        if info.identifier != identifier {
            return Err(format!(
                "通信组件数据配置不匹配：软件 {identifier}，组件 {}。请勿混用源码、正式版和预览版文件。",
                info.identifier
            ));
        }
        if info.version != env!("CARGO_PKG_VERSION") || info.protocol != 1 {
            return Err(format!(
                "通信组件版本不匹配：软件 {}，组件 {}。请完整更新。",
                env!("CARGO_PKG_VERSION"),
                info.version
            ));
        }
        let result = registration::registration_at(
            &binary,
            identifier,
            &registration::data_root()?,
            &registration::registry_root(),
            repair,
        )?;
        status.manifest_path = Some(result.manifest_path);
        if !result.registered {
            return Err("本机主机尚未正确注册，请点击“修复本机连接”。".into());
        }
        status.state = "ready".into();
        status.message = if result.changed {
            "本机主机已修复。请在 Chrome 扩展刷新连接，再同步工作站点授权。"
        } else {
            "本机主机注册正常。浏览器实际连接状态请查看主界面或扩展面板。"
        }
        .into();
        Ok(())
    })();
    if let Err(error) = result {
        status.message = error;
    }
    status
}
impl ConnectionState {
    pub fn initialize(app: &tauri::App) -> Self {
        let directory = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(Path::to_path_buf))
            .unwrap_or_default();
        let identifier = app.config().identifier.clone();
        Self {
            status: Arc::new(Mutex::new(ConnectionStatus {
                state: "waiting".into(),
                message: "等待本机服务就绪后检查连接。".into(),
                identifier: identifier.clone(),
                version: env!("CARGO_PKG_VERSION").into(),
                host_name: registration::host_name(&identifier).unwrap_or("").into(),
                manifest_path: None,
                extension_path: None,
            })),
            gate: Mutex::new(()),
            directory,
            identifier,
        }
    }
    pub fn refresh(&self, repair: bool) -> Result<ConnectionStatus, String> {
        let _guard = self.gate.lock().map_err(|_| "连接检查锁异常。")?;
        let status = inspect(&self.directory, &self.identifier, repair);
        *self.status.lock().map_err(|_| "连接状态锁异常。")? = status.clone();
        Ok(status)
    }
}
#[tauri::command]
pub async fn get_connection_status(app: tauri::AppHandle) -> Result<ConnectionStatus, String> {
    tauri::async_runtime::spawn_blocking(move || app.state::<ConnectionState>().refresh(false))
        .await
        .map_err(|e| e.to_string())?
}
#[tauri::command]
pub async fn repair_browser_connection(app: tauri::AppHandle) -> Result<ConnectionStatus, String> {
    tauri::async_runtime::spawn_blocking(move || app.state::<ConnectionState>().refresh(true))
        .await
        .map_err(|e| e.to_string())?
}
#[tauri::command]
pub fn open_browser_extension(state: State<ConnectionState>) -> Result<(), String> {
    let folder = state.directory.join("extension");
    if !folder.join("manifest.json").is_file() {
        return Err("缺少 extension 文件夹，请完整解压或重新安装。".into());
    }
    command(Path::new("explorer.exe"))
        .arg(folder)
        .spawn()
        .map_err(|_| "无法打开扩展目录。")?;
    Ok(())
}
