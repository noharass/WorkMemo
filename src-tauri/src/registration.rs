use serde::{Deserialize, Serialize};
use std::{
    fs,
    io::Write,
    path::{Path, PathBuf},
};

pub const CHROME_ROOT: &str = "Software\\Google\\Chrome\\NativeMessagingHosts";
pub const OWNER_VALUE: &str = "WorkMemoExecutable";
pub const PROFILE_VALUE: &str = "WorkMemoProfile";
pub const MANIFEST_NAME: &str = "browser-host.json";
pub const EXTENSION_ORIGIN: &str = "chrome-extension://oljcealhccdhaddceacnokihjefloaih/";

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BridgeInfo {
    pub identifier: String,
    pub version: String,
    pub protocol: u32,
    #[serde(default)]
    pub test_overrides: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct NativeManifest {
    pub name: String,
    pub description: String,
    pub path: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub allowed_origins: Vec<String>,
}
#[derive(Clone, Debug, Serialize)]
pub struct RegistrationResult {
    pub registered: bool,
    pub changed: bool,
    pub host_name: String,
    pub manifest_path: String,
}
pub fn host_name(identifier: &str) -> Result<&'static str, String> {
    let valid = identifier.len() <= 128
        && identifier.split('.').all(|p| !p.is_empty())
        && identifier
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'.' || b == b'-' || b == b'_');
    if !valid {
        return Err("通信组件的数据标识无效。".into());
    }
    if identifier == "com.workmemo.desktop" {
        Ok("com.workmemo.browser_bridge")
    } else if identifier.starts_with("com.workmemo.test.") {
        Ok("com.workmemo.browser_bridge_test")
    } else {
        Err("不支持的 WorkMemo 数据标识。".into())
    }
}
pub fn profile_for(binary: &Path, compiled_identifier: &str) -> Result<String, String> {
    let mut identifier = compiled_identifier.to_string();
    let profile = binary.with_file_name("workmemo-browser.profile.json");
    match fs::read(profile) {
        Ok(bytes) => {
            if bytes.len() > 4096 {
                return Err("通信组件配置过大。".into());
            }
            #[derive(Deserialize)]
            #[serde(deny_unknown_fields)]
            struct Profile {
                identifier: String,
            }
            identifier = serde_json::from_slice::<Profile>(&bytes)
                .map_err(|_| "通信组件配置无效。")?
                .identifier;
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => (),
        Err(_) => return Err("无法读取通信组件配置。".into()),
    }
    #[cfg(debug_assertions)]
    if let Ok(value) = std::env::var("WORKMEMO_TEST_PROFILE") {
        if !value.starts_with("com.workmemo.test.") {
            return Err("test profile".into());
        }
        identifier = value;
    }
    host_name(&identifier)?;
    Ok(identifier)
}
pub fn regular_path(path: &Path) -> Result<String, String> {
    let value = path.to_str().ok_or("组件路径无法表示为 Unicode。")?;
    Ok(if let Some(tail) = value.strip_prefix(r"\\?\UNC\") {
        format!(r"\\{tail}")
    } else {
        value.strip_prefix(r"\\?\").unwrap_or(value).to_string()
    })
}
pub fn data_root() -> Result<PathBuf, String> {
    #[cfg(debug_assertions)]
    if std::env::var("WORKMEMO_TEST_REGISTRY_ROOT")
        .is_ok_and(|s| s.starts_with("Software\\WorkMemo\\RegistrationTests\\"))
    {
        if let Some(root) = std::env::var_os("WORKMEMO_TEST_DATA_ROOT") {
            return Ok(root.into());
        }
    }
    std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .ok_or("无法定位当前用户数据目录。".into())
}
pub fn registry_root() -> String {
    #[cfg(debug_assertions)]
    if let Ok(root) = std::env::var("WORKMEMO_TEST_REGISTRY_ROOT") {
        if root.starts_with("Software\\WorkMemo\\RegistrationTests\\") && !root.contains('\0') {
            return root;
        }
    }
    CHROME_ROOT.into()
}

#[cfg(windows)]
pub(crate) mod windows_registry {
    use windows_sys::Win32::System::Registry::*;
    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(Some(0)).collect()
    }
    pub struct Key(pub HKEY);
    impl Drop for Key {
        fn drop(&mut self) {
            unsafe {
                RegCloseKey(self.0);
            }
        }
    }
    impl Key {
        pub fn open(path: &str, create: bool, view: u32) -> Result<Option<Self>, String> {
            let path = wide(path);
            let mut key = std::ptr::null_mut();
            let code = unsafe {
                if create {
                    RegCreateKeyExW(
                        HKEY_CURRENT_USER,
                        path.as_ptr(),
                        0,
                        std::ptr::null(),
                        REG_OPTION_NON_VOLATILE,
                        KEY_READ | KEY_WRITE | view,
                        std::ptr::null(),
                        &mut key,
                        std::ptr::null_mut(),
                    )
                } else {
                    RegOpenKeyExW(
                        HKEY_CURRENT_USER,
                        path.as_ptr(),
                        0,
                        KEY_READ | KEY_WRITE | view,
                        &mut key,
                    )
                }
            };
            if !create && code == 2 {
                return Ok(None);
            }
            if code != 0 {
                return Err(format!(
                    "无法访问当前用户的 Chrome 主机注册（Windows {code}）。"
                ));
            }
            Ok(Some(Self(key)))
        }
        pub fn read(&self, name: &str) -> Result<Option<String>, String> {
            let name = wide(name);
            let mut kind = 0;
            let mut length = 0;
            let code = unsafe {
                RegQueryValueExW(
                    self.0,
                    name.as_ptr(),
                    std::ptr::null_mut(),
                    &mut kind,
                    std::ptr::null_mut(),
                    &mut length,
                )
            };
            if code == 2 {
                return Ok(None);
            }
            if code != 0 || kind != REG_SZ || length > 32768 {
                return Err("Chrome 主机注册数据无效。".into());
            }
            let mut data = vec![0u16; (length as usize).div_ceil(2)];
            let code = unsafe {
                RegQueryValueExW(
                    self.0,
                    name.as_ptr(),
                    std::ptr::null_mut(),
                    &mut kind,
                    data.as_mut_ptr().cast(),
                    &mut length,
                )
            };
            if code != 0 {
                return Err(format!("无法读取 Chrome 主机注册（Windows {code}）。"));
            }
            while data.last() == Some(&0) {
                data.pop();
            }
            String::from_utf16(&data)
                .map(Some)
                .map_err(|_| "Chrome 主机注册编码无效。".into())
        }
        pub fn write(&self, name: &str, value: &str) -> Result<(), String> {
            let name = wide(name);
            let value = wide(value);
            let code = unsafe {
                RegSetValueExW(
                    self.0,
                    name.as_ptr(),
                    0,
                    REG_SZ,
                    value.as_ptr().cast(),
                    (value.len() * 2) as u32,
                )
            };
            if code != 0 {
                return Err(format!(
                    "无法注册 Chrome 本机通信（Windows {code}），请在运行 Chrome 的同一 Windows 用户下操作。"
                ));
            }
            Ok(())
        }
        pub fn remove(&self, name: &str) -> Result<(), String> {
            let code = unsafe { RegDeleteValueW(self.0, wide(name).as_ptr()) };
            if code != 0 && code != 2 {
                return Err(format!("无法移除所属主机注册（Windows {code}）。"));
            }
            Ok(())
        }
    }
    pub fn remove_empty(path: &str, view: u32) {
        unsafe {
            RegDeleteKeyExW(HKEY_CURRENT_USER, wide(path).as_ptr(), view, 0);
        }
    }
}

pub fn registration_at(
    binary: &Path,
    identifier: &str,
    data: &Path,
    root: &str,
    repair: bool,
) -> Result<RegistrationResult, String> {
    let name = host_name(identifier)?.to_string();
    if !binary.is_file() {
        return Err("缺少配套通信组件，请完整解压或重新安装 WorkMemo。".into());
    }
    let executable = regular_path(&binary.canonicalize().map_err(|_| "无法定位通信组件。")?)?;
    let folder = data.join(identifier);
    let path = folder.join(MANIFEST_NAME);
    let path_text = regular_path(&path)?;
    let expected = NativeManifest {
        name: name.clone(),
        description: "WorkMemo local browser bridge".into(),
        path: executable.clone(),
        kind: "stdio".into(),
        allowed_origins: vec![EXTENSION_ORIGIN.into()],
    };
    #[cfg(windows)]
    {
        use windows_registry::Key;
        let key_path = format!("{root}\\{name}");
        let mut registered = true;
        for view in [
            windows_sys::Win32::System::Registry::KEY_WOW64_32KEY,
            windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
        ] {
            let previous = Key::open(&key_path, false, view)?;
            registered &= if let Some(key) = previous.as_ref() {
                key.read("")?
                    .is_some_and(|v| v.eq_ignore_ascii_case(&path_text))
                    && key
                        .read(OWNER_VALUE)?
                        .is_some_and(|v| v.eq_ignore_ascii_case(&executable))
                    && key.read(PROFILE_VALUE)?.as_deref() == Some(identifier)
            } else {
                false
            };
        }
        registered &= fs::read(&path)
            .ok()
            .and_then(|v| serde_json::from_slice::<NativeManifest>(&v).ok())
            .as_ref()
            == Some(&expected);
        if registered || !repair {
            return Ok(RegistrationResult {
                registered,
                changed: false,
                host_name: name,
                manifest_path: path_text,
            });
        }
        fs::create_dir_all(&folder).map_err(|_| "无法写入当前用户的通信配置目录。")?;
        let temporary = folder.join(format!("browser-host.{}.pending", std::process::id()));
        let bytes = serde_json::to_vec_pretty(&expected).map_err(|e| e.to_string())?;
        let saved = (|| -> Result<(), String> {
            let mut file = fs::File::create(&temporary).map_err(|_| "无法保存通信主机清单。")?;
            file.write_all(&bytes)
                .and_then(|_| file.sync_all())
                .map_err(|_| "无法保存通信主机清单。")?;
            drop(file);
            fs::rename(&temporary, &path).map_err(|_| "无法更新通信主机清单。")?;
            Ok(())
        })();
        if saved.is_err() {
            let _ = fs::remove_file(&temporary);
        }
        saved?;
        for view in [
            windows_sys::Win32::System::Registry::KEY_WOW64_32KEY,
            windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
        ] {
            let key = Key::open(&key_path, true, view)?.ok_or("无法创建 Chrome 主机注册。")?;
            key.write(OWNER_VALUE, &executable)?;
            key.write(PROFILE_VALUE, identifier)?;
            key.write("", &path_text)?;
        }
        Ok(RegistrationResult {
            registered: true,
            changed: true,
            host_name: name,
            manifest_path: path_text,
        })
    }
    #[cfg(not(windows))]
    {
        let _ = (expected, root, repair);
        Err("本机通信自动接入目前仅支持 Windows。".into())
    }
}

pub fn unregister_at(
    binary: &Path,
    identifier: &str,
    data: &Path,
    root: &str,
) -> Result<bool, String> {
    let name = host_name(identifier)?;
    let executable = regular_path(binary)?;
    let path = data.join(identifier).join(MANIFEST_NAME);
    let path_text = regular_path(&path)?;
    #[cfg(windows)]
    {
        use windows_registry::Key;
        let key_path = format!("{root}\\{name}");
        let owned = fs::read(&path)
            .ok()
            .and_then(|b| serde_json::from_slice::<NativeManifest>(&b).ok())
            .is_some_and(|m| m.path.eq_ignore_ascii_case(&executable));
        let mut removed = false;
        for view in [
            windows_sys::Win32::System::Registry::KEY_WOW64_32KEY,
            windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
        ] {
            let Some(key) = Key::open(&key_path, false, view)? else {
                continue;
            };
            if !key
                .read(OWNER_VALUE)?
                .is_some_and(|p| p.eq_ignore_ascii_case(&executable))
                || !key
                    .read("")?
                    .is_some_and(|p| p.eq_ignore_ascii_case(&path_text))
            {
                continue;
            }
            key.remove("")?;
            key.remove(OWNER_VALUE)?;
            key.remove(PROFILE_VALUE)?;
            drop(key);
            windows_registry::remove_empty(&key_path, view);
            removed = true;
        }
        if removed && owned {
            fs::remove_file(path).map_err(|_| "所属注册已移除，但旧主机清单未能清理。")?;
        }
        Ok(removed)
    }
    #[cfg(not(windows))]
    {
        let _ = (name, executable, path_text, root);
        Err("当前系统不支持此接入方式。".into())
    }
}
