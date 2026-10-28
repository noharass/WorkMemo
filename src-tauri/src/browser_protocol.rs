use serde::{Deserialize, Serialize};
use std::io::{self, BufRead, Read, Write};

#[allow(dead_code)] // Used by the standalone native host; the desktop serves TCP.
pub const ORIGIN: &str = "chrome-extension://oljcealhccdhaddceacnokihjefloaih/";
pub const MAX_MESSAGE: usize = 131_072;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BrowserFrame {
    #[serde(default)]
    pub page_activity: bool,
    pub version: u32,
    pub sequence: u64,
    pub config_revision: i64,
    pub focused: bool,
    pub ready: bool,
    pub rule_id: Option<i64>,
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WireRequest {
    pub token: String,
    pub frame: BrowserFrame,
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Endpoint {
    pub port: u16,
    pub token: String,
}

#[allow(dead_code)] // Shared with the separate host executable and protocol tests.
pub fn read_native(reader: &mut impl Read) -> io::Result<Option<serde_json::Value>> {
    let mut length = [0u8; 4];
    match reader.read(&mut length[..1])? {
        0 => return Ok(None),
        _ => reader.read_exact(&mut length[1..])?,
    }
    let length = u32::from_le_bytes(length) as usize;
    if length == 0 || length > MAX_MESSAGE {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "message length"));
    }
    let mut bytes = vec![0; length];
    reader.read_exact(&mut bytes)?;
    serde_json::from_slice(&bytes)
        .map(Some)
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "message JSON"))
}

#[allow(dead_code)] // Shared with the separate host executable and protocol tests.
pub fn write_native(writer: &mut impl Write, value: &serde_json::Value) -> io::Result<()> {
    let bytes = serde_json::to_vec(value)?;
    if bytes.len() > MAX_MESSAGE {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "reply length"));
    }
    writer.write_all(&(bytes.len() as u32).to_le_bytes())?;
    writer.write_all(&bytes)?;
    writer.flush()
}

pub fn read_line(reader: &mut impl BufRead) -> io::Result<Option<Vec<u8>>> {
    let mut bytes = Vec::new();
    reader
        .take((MAX_MESSAGE + 1) as u64)
        .read_until(b'\n', &mut bytes)?;
    if bytes.is_empty() {
        return Ok(None);
    }
    if bytes.len() > MAX_MESSAGE || bytes.last() != Some(&b'\n') {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "line length"));
    }
    Ok(Some(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn native_frames_are_bounded_and_binary_safe() {
        let value = serde_json::json!({"connected":true,"message":"本地连接"});
        let mut bytes = Vec::new();
        write_native(&mut bytes, &value).unwrap();
        assert_eq!(read_native(&mut bytes.as_slice()).unwrap(), Some(value));
        assert!(read_native(&mut ((MAX_MESSAGE + 1) as u32).to_le_bytes().as_slice()).is_err());
        assert!(read_native(&mut [3u8, 0, 0].as_slice()).is_err());
        assert_eq!(read_native(&mut [].as_slice()).unwrap(), None);
    }
    #[test]
    fn browser_payload_has_no_page_or_input_content_fields() {
        let mut value = serde_json::json!({"version":1,"sequence":1,"config_revision":0,"focused":true,"ready":true,"rule_id":null});
        assert!(serde_json::from_value::<BrowserFrame>(value.clone()).is_ok());
        value["url"] = serde_json::json!("https://unconfigured.invalid/private");
        assert!(serde_json::from_value::<BrowserFrame>(value).is_err());
    }
}
