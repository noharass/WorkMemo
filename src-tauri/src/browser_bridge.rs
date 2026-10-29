use crate::{
    browser_protocol::*,
    clock::{Clock, SystemClock},
    monitor::PageSample,
    service::SharedStore,
};
use std::{
    fs,
    io::{BufReader, Write},
    net::{TcpListener, TcpStream},
    path::Path,
    sync::{
        Arc,
        atomic::{AtomicU64, AtomicUsize, Ordering},
    },
    time::Duration,
};

static NEXT_CLIENT: AtomicU64 = AtomicU64::new(1);
pub fn start(shared: SharedStore, directory: &Path) -> Result<(), String> {
    let listener =
        TcpListener::bind(("127.0.0.1", 0)).map_err(|e| format!("无法创建本机浏览器连接：{e}"))?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    let mut random = [0u8; 32];
    #[cfg(windows)]
    if unsafe {
        windows_sys::Win32::Security::Cryptography::BCryptGenRandom(
            std::ptr::null_mut(),
            random.as_mut_ptr(),
            random.len() as u32,
            windows_sys::Win32::Security::Cryptography::BCRYPT_USE_SYSTEM_PREFERRED_RNG,
        )
    } < 0
    {
        return Err("无法生成本机连接校验值。".into());
    }
    #[cfg(not(windows))]
    return Err("浏览器连接当前仅支持 Windows。".into());
    let token: String = random.iter().map(|byte| format!("{byte:02x}")).collect();
    let endpoint = Endpoint {
        port: listener.local_addr().map_err(|e| e.to_string())?.port(),
        token: token.clone(),
    };
    let path = directory.join("browser-bridge.endpoint.json");
    let temporary = directory.join(format!("browser-bridge.{}.pending", std::process::id()));
    let bytes = serde_json::to_vec(&endpoint).map_err(|e| e.to_string())?;
    let mut file = fs::File::create(&temporary).map_err(|e| e.to_string())?;
    file.write_all(&bytes)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    fs::rename(&temporary, &path).map_err(|e| e.to_string())?;
    let weak = Arc::downgrade(&shared);
    let connections = Arc::new(AtomicUsize::new(0));
    std::thread::spawn(move || {
        while weak.strong_count() > 0 {
            match listener.accept() {
                Ok((stream, address)) => {
                    if !address.ip().is_loopback() || connections.load(Ordering::Relaxed) >= 4 {
                        continue;
                    }
                    let weak = weak.clone();
                    let token = token.clone();
                    let count = connections.clone();
                    count.fetch_add(1, Ordering::Relaxed);
                    let client = NEXT_CLIENT.fetch_add(1, Ordering::Relaxed);
                    std::thread::spawn(move || {
                        let _ = serve(stream, weak.clone(), token, client);
                        if let Some(shared) = weak.upgrade() {
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.browser_disconnected(client);
                                }
                            }
                        }
                        count.fetch_sub(1, Ordering::Relaxed);
                    });
                }
                Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                    std::thread::sleep(Duration::from_millis(100))
                }
                Err(_) => break,
            }
        }
        // Never remove an endpoint belonging to a replacement process.
        if fs::read(&path).ok().is_some_and(|v| {
            serde_json::from_slice::<Endpoint>(&v)
                .ok()
                .is_some_and(|v| v.token == token)
        }) {
            let _ = fs::remove_file(path);
        }
    });
    Ok(())
}

fn serve(
    mut stream: TcpStream,
    weak: std::sync::Weak<std::sync::Mutex<crate::database::Result<crate::database::Store>>>,
    token: String,
    client: u64,
) -> Result<(), String> {
    // Windows accepted sockets inherit the listener's nonblocking mode.
    // The per-client worker must block between browser heartbeats.
    stream.set_nonblocking(false).map_err(|e| e.to_string())?;
    stream
        .set_read_timeout(Some(Duration::from_secs(20)))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(stream.try_clone().map_err(|e| e.to_string())?);
    let mut sequence = None;
    while let Some(bytes) = read_line(&mut reader).map_err(|e| e.to_string())? {
        let request: WireRequest =
            serde_json::from_slice(&bytes).map_err(|_| "浏览器消息格式无效。")?;
        if request.token != token
            || request.frame.version != 1
            || sequence.is_some_and(|old| request.frame.sequence <= old)
        {
            return Err("浏览器连接校验失败。".into());
        }
        sequence = Some(request.frame.sequence);
        let Some(shared) = weak.upgrade() else {
            return Ok(());
        };
        let reply = {
            let mut guard = shared.lock().map_err(|_| "数据服务锁异常。")?;
            let store = guard.as_mut().map_err(|e| e.clone())?;
            let config = store.monitor_config()?;
            let frame = request.frame;
            if frame
                .rule_id
                .is_some_and(|id| !config.rules.iter().any(|r| r.id == id))
                && frame.config_revision == config.revision
            {
                return Err("浏览器规则标识无效。".into());
            }
            let compatible = crate::monitor::supports_match_modes(frame.match_modes, &config.rules);
            if !compatible {
                store.warning = Some(
                    "浏览器扩展不支持新网址匹配模式，请更新配套扩展至 0.2.2 并同步站点授权。"
                        .into(),
                );
            } else if store.warning.as_deref()
                == Some("浏览器扩展不支持新网址匹配模式，请更新配套扩展至 0.2.2 并同步站点授权。")
            {
                store.warning = None;
            }
            store.observe_browser_page(
                client,
                PageSample {
                    at: SystemClock::new().now(),
                    focused: frame.focused,
                    rule_id: if compatible { frame.rule_id } else { None },
                    revision: frame.config_revision,
                    ready: frame.ready && compatible,
                },
            );
            if frame.page_activity && compatible {
                store.observe_browser_activity(client);
            }
            serde_json::json!({"connected":true,"config":config,"category_names":store.category_names()?.names,"app":{"identifier":env!("WORKMEMO_IDENTIFIER"),"version":env!("CARGO_PKG_VERSION"),"protocol":1,"page_activity":true,"match_modes":true,"update_required":!compatible}})
        };
        let mut response = serde_json::to_vec(&reply).map_err(|e| e.to_string())?;
        response.push(b'\n');
        stream
            .write_all(&response)
            .and_then(|_| stream.flush())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
