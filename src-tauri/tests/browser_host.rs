#![cfg(all(windows, debug_assertions))]
use std::{
    fs,
    io::{BufRead, BufReader, Read, Write},
    net::TcpListener,
    os::windows::process::CommandExt,
    path::PathBuf,
    process::{Command, Stdio},
};
const ORIGIN: &str = "chrome-extension://oljcealhccdhaddceacnokihjefloaih/";
struct Profile {
    path: PathBuf,
    id: String,
}
impl Profile {
    fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let id = format!("com.workmemo.test.host.{}.{nonce}", std::process::id());
        let base = PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap());
        let path = base.join(&id);
        assert_eq!(path.parent(), Some(base.as_path()));
        fs::create_dir(&path).unwrap();
        Self { path, id }
    }
}
impl Drop for Profile {
    fn drop(&mut self) {
        let _ = fs::remove_file(self.path.join("browser-bridge.endpoint.json"));
        let _ = fs::remove_dir(&self.path);
    }
}
fn host(profile: &Profile, origin: &str) -> std::process::Child {
    Command::new(env!("CARGO_BIN_EXE_workmemo-browser"))
        .arg(origin)
        .env("WORKMEMO_TEST_PROFILE", &profile.id)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000)
        .spawn()
        .unwrap()
}

#[test]
fn actual_native_host_round_trip_authenticates_and_forwards_only_metadata() {
    let profile = Profile::new();
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let token = "1a".repeat(32);
    fs::write(
        profile.path.join("browser-bridge.endpoint.json"),
        serde_json::to_vec(
            &serde_json::json!({"port":listener.local_addr().unwrap().port(),"token":token}),
        )
        .unwrap(),
    )
    .unwrap();
    let server = std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        let mut reader = BufReader::new(stream.try_clone().unwrap());
        let mut line = String::new();
        reader.read_line(&mut line).unwrap();
        let request: serde_json::Value = serde_json::from_str(&line).unwrap();
        assert_eq!(request["token"], token);
        assert_eq!(request["frame"].as_object().unwrap().len(), 7);
        assert_eq!(request["frame"]["page_activity"], false);
        assert!(request["frame"].get("url").is_none());
        stream.write_all(b"{\"connected\":true,\"config\":{\"enabled\":false,\"revision\":0,\"rules\":[]}}\n").unwrap();
    });
    let mut child = host(&profile, ORIGIN);
    let frame=serde_json::to_vec(&serde_json::json!({"version":1,"sequence":1,"config_revision":0,"focused":false,"ready":false,"rule_id":null})).unwrap();
    let mut input = child.stdin.take().unwrap();
    input
        .write_all(&(frame.len() as u32).to_le_bytes())
        .unwrap();
    input.write_all(&frame).unwrap();
    input.flush().unwrap();
    let output = child.stdout.as_mut().unwrap();
    let mut length = [0; 4];
    output.read_exact(&mut length).unwrap();
    let length = u32::from_le_bytes(length) as usize;
    assert!(length < 131072);
    let mut response = vec![0; length];
    output.read_exact(&mut response).unwrap();
    let response: serde_json::Value = serde_json::from_slice(&response).unwrap();
    assert_eq!(
        response["connected"], true,
        "native host response: {response}"
    );
    drop(input);
    assert!(child.wait().unwrap().success());
    server.join().unwrap();
}

#[test]
fn native_host_rejects_another_extension_and_unexpected_page_content() {
    let profile = Profile::new();
    let mut wrong = host(
        &profile,
        "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/",
    );
    drop(wrong.stdin.take());
    assert!(!wrong.wait().unwrap().success());
    let mut child = host(&profile, ORIGIN);
    let frame=b"{\"version\":1,\"sequence\":1,\"config_revision\":0,\"focused\":false,\"ready\":false,\"rule_id\":null,\"url\":\"https://private.invalid\"}";
    let mut input = child.stdin.take().unwrap();
    input
        .write_all(&(frame.len() as u32).to_le_bytes())
        .unwrap();
    input.write_all(frame).unwrap();
    drop(input);
    assert!(!child.wait().unwrap().success());
}
