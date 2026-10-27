#![cfg_attr(not(test), windows_subsystem = "windows")]
#[path = "../browser_protocol.rs"]
mod browser_protocol;
use browser_protocol::*;
use std::{
    io::{self, BufReader, Write},
    net::{Ipv4Addr, SocketAddrV4, TcpStream},
    path::PathBuf,
    time::Duration,
};

// Opt-in local event codes only; never record frames, URLs, or endpoint tokens.
fn diagnostic(event: &str) {
    let Ok(binary) = std::env::current_exe() else {
        return;
    };
    if !binary
        .with_file_name("workmemo-browser.diagnostics")
        .is_file()
    {
        return;
    }
    let path = binary.with_file_name("workmemo-browser.diagnostics.log");
    if std::fs::metadata(&path).is_ok_and(|m| m.len() > 65_536) {
        return;
    }
    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
    {
        let at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let _ = writeln!(file, "{at} {event}");
    }
}

fn endpoint_path() -> Result<PathBuf, String> {
    let mut identifier = env!("WORKMEMO_IDENTIFIER").to_string();
    #[cfg(debug_assertions)]
    if let Ok(test_profile) = std::env::var("WORKMEMO_TEST_PROFILE") {
        if !test_profile.starts_with("com.workmemo.test.") {
            return Err("test profile".into());
        }
        identifier = test_profile;
    }
    let profile = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .with_file_name("workmemo-browser.profile.json");
    if let Ok(bytes) = std::fs::read(profile) {
        if bytes.len() > 4096 {
            return Err("profile size".into());
        }
        let value: serde_json::Value =
            serde_json::from_slice(&bytes).map_err(|_| "profile JSON")?;
        identifier = value["identifier"]
            .as_str()
            .ok_or("profile identifier")?
            .to_string();
    }
    if !identifier.starts_with("com.workmemo.")
        || identifier.split('.').any(|part| part.is_empty())
        || identifier.is_empty()
        || identifier.len() > 128
        || !identifier
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'.' || b == b'-' || b == b'_')
    {
        return Err("profile identifier".into());
    }
    Ok(
        PathBuf::from(std::env::var_os("LOCALAPPDATA").ok_or("local data directory")?)
            .join(identifier)
            .join("browser-bridge.endpoint.json"),
    )
}

fn connect(path: &PathBuf) -> Result<(TcpStream, String), String> {
    let bytes = std::fs::read(path).map_err(|_| "WorkMemo 尚未运行")?;
    if bytes.len() > 4096 {
        return Err("endpoint size".into());
    }
    let endpoint: Endpoint = serde_json::from_slice(&bytes).map_err(|_| "endpoint JSON")?;
    if endpoint.token.len() != 64 || !endpoint.token.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err("endpoint token".into());
    }
    let socket = SocketAddrV4::new(Ipv4Addr::LOCALHOST, endpoint.port);
    let stream = TcpStream::connect_timeout(&socket.into(), Duration::from_millis(500))
        .map_err(|_| "WorkMemo 连接尚未就绪")?;
    stream
        .set_read_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    Ok((stream, endpoint.token))
}

fn run() -> Result<(), String> {
    diagnostic("started");
    let origin = std::env::args()
        .nth(1)
        .ok_or("Only the WorkMemo Chrome extension may start this host")?;
    if origin.trim_end_matches('/') != ORIGIN.trim_end_matches('/') {
        return Err("extension origin".into());
    }
    let path = endpoint_path()?;
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut input = stdin.lock();
    let mut output = stdout.lock();
    let mut connection: Option<(BufReader<TcpStream>, String)> = None;
    while let Some(value) = read_native(&mut input).map_err(|e| e.to_string())? {
        diagnostic("native_frame_received");
        let frame: BrowserFrame = serde_json::from_value(value).map_err(|_| "browser frame")?;
        if frame.version != 1 {
            return Err("protocol version".into());
        }
        if connection.is_none() {
            connection = connect(&path).ok().map(|(s, t)| (BufReader::new(s), t));
            diagnostic(if connection.is_some() {
                "desktop_connected"
            } else {
                "desktop_unavailable"
            });
        }
        let reply = if let Some((reader, token)) = connection.as_mut() {
            let request = WireRequest {
                token: token.clone(),
                frame,
            };
            let result = (|| -> Result<serde_json::Value, String> {
                let mut bytes = serde_json::to_vec(&request).map_err(|e| e.to_string())?;
                bytes.push(b'\n');
                reader
                    .get_mut()
                    .write_all(&bytes)
                    .and_then(|_| reader.get_mut().flush())
                    .map_err(|e| format!("write {:?} {:?}", e.kind(), e.raw_os_error()))?;
                let bytes = read_line(reader)
                    .map_err(|e| format!("read {:?} {:?}", e.kind(), e.raw_os_error()))?
                    .ok_or("closed bridge")?;
                serde_json::from_slice(&bytes).map_err(|_| "bridge response".into())
            })();
            match result {
                Ok(value) => {
                    diagnostic("desktop_reply_received");
                    value
                }
                Err(error) => {
                    diagnostic(&format!("desktop_failure {error}"));
                    diagnostic(if error == "closed bridge" {
                        "desktop_closed"
                    } else if error == "bridge response" {
                        "desktop_invalid_response"
                    } else {
                        "desktop_io_failed"
                    });
                    connection = None;
                    serde_json::json!({"connected":false,"config":null,"error":"desktop_io"})
                }
            }
        } else {
            serde_json::json!({"connected":false,"config":null,"error":"desktop_unavailable"})
        };
        write_native(&mut output, &reply).map_err(|e| e.to_string())?;
        diagnostic("native_reply_sent");
    }
    diagnostic("native_eof");
    Ok(())
}
fn main() {
    if run().is_err() {
        diagnostic("host_failed");
        eprintln!("WorkMemo 浏览器连接已关闭；未记录网页或输入内容。");
        std::process::exit(1);
    }
}
