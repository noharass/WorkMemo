#![cfg(all(windows, debug_assertions))]
#[allow(dead_code)]
#[path = "../src/connection.rs"]
mod connection;
#[allow(dead_code)]
#[path = "../src/registration.rs"]
mod registration;
use std::os::windows::process::CommandExt;
use std::{fs, path::PathBuf, process::Command};

#[test]
fn all_distribution_modes_share_registration_and_preserve_newer_owners_and_data() {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("target")
        .join(format!("registration-test-{nonce}"));
    let data = root.join("用户数据");
    let registry = format!("Software\\WorkMemo\\RegistrationTests\\rust-{nonce}");
    let profile = "com.workmemo.test.registration";
    let a = root.join("源码 & 空格 !");
    let b = root.join("移动后的 ZIP & 空格 !");
    for folder in [&a, &b] {
        fs::create_dir_all(folder).unwrap();
        fs::copy(
            env!("CARGO_BIN_EXE_workmemo-browser"),
            folder.join("workmemo-browser.exe"),
        )
        .unwrap();
        fs::write(
            folder.join("workmemo-browser.profile.json"),
            format!(r#"{{"identifier":"{profile}"}}"#),
        )
        .unwrap();
    }
    let binary = a.join("workmemo-browser.exe");
    let check = registration::registration_at(&binary, profile, &data, &registry, false).unwrap();
    assert!(!check.registered && !data.exists());
    let first = registration::registration_at(&binary, profile, &data, &registry, true).unwrap();
    assert!(first.registered && first.changed);
    let manifest = PathBuf::from(&first.manifest_path);
    let content: registration::NativeManifest =
        serde_json::from_slice(&fs::read(&manifest).unwrap()).unwrap();
    assert_eq!(content.path, binary.to_string_lossy());
    assert_eq!(
        content.allowed_origins,
        vec![registration::EXTENSION_ORIGIN]
    );
    let before = fs::metadata(&manifest).unwrap().modified().unwrap();
    assert!(
        !registration::registration_at(&binary, profile, &data, &registry, true)
            .unwrap()
            .changed
    );
    assert_eq!(fs::metadata(&manifest).unwrap().modified().unwrap(), before);
    // Corrupt config repairs atomically; work data is never rewritten.
    fs::write(
        data.join(profile).join("workmemo.sqlite3"),
        b"untouched test sentinel",
    )
    .unwrap();
    fs::write(&manifest, b"broken").unwrap();
    assert!(
        registration::registration_at(&binary, profile, &data, &registry, true)
            .unwrap()
            .changed
    );
    let moved = b.join("workmemo-browser.exe");
    assert!(
        registration::registration_at(&moved, profile, &data, &registry, true)
            .unwrap()
            .changed
    );
    assert!(!registration::unregister_at(&binary, profile, &data, &registry).unwrap());
    assert!(manifest.is_file());
    assert!(registration::unregister_at(&moved, profile, &data, &registry).unwrap());
    assert!(!manifest.exists());
    assert_eq!(
        fs::read(data.join(profile).join("workmemo.sqlite3")).unwrap(),
        b"untouched test sentinel"
    );
    assert!(
        registration::registration_at(&root.join("missing.exe"), profile, &data, &registry, true)
            .is_err()
    );
    assert!(registration::host_name("../bad").is_err());
    assert!(registration::host_name("com.workmemo.other").is_err());
    assert_eq!(
        registration::host_name("com.workmemo.desktop").unwrap(),
        "com.workmemo.browser_bridge"
    );
    // These test-only overrides are confined to this integration-test process.
    unsafe {
        std::env::set_var("WORKMEMO_TEST_REGISTRY_ROOT", &registry);
        std::env::set_var("WORKMEMO_TEST_DATA_ROOT", &data);
    }
    let status = connection::inspect(&b, profile, true);
    assert_eq!(status.state, "ready", "{}", status.message);
    let mismatch = connection::inspect(&b, "com.workmemo.desktop", true);
    assert_eq!(mismatch.state, "error");
    assert!(mismatch.message.contains("不匹配"));
    fs::write(b.join("workmemo-browser.profile.json"), b"invalid").unwrap();
    assert!(
        connection::inspect(&b, profile, true)
            .message
            .contains("配置无效")
    );
    fs::write(
        b.join("workmemo-browser.profile.json"),
        format!(r#"{{"identifier":"{profile}"}}"#),
    )
    .unwrap();
    let output = Command::new(&moved)
        .arg("--check")
        .creation_flags(0x08000000)
        .output()
        .unwrap();
    assert!(output.status.success());
    assert_eq!(
        serde_json::from_slice::<serde_json::Value>(&output.stdout).unwrap()["registered"],
        true
    );
    let output = Command::new(&moved)
        .arg("--unregister")
        .creation_flags(0x08000000)
        .output()
        .unwrap();
    assert!(output.status.success());
    fs::remove_file(&moved).unwrap();
    assert!(
        connection::inspect(&b, profile, true)
            .message
            .contains("缺少")
    );
    // Both aliases use the same engine, in a private registry namespace.
    assert!(
        registration::registration_at(&binary, "com.workmemo.desktop", &data, &registry, true)
            .unwrap()
            .registered
    );
    assert!(
        registration::unregister_at(&binary, "com.workmemo.desktop", &data, &registry).unwrap()
    );
    fs::remove_dir_all(&root).unwrap();
}
