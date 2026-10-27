fn main() {
    // Bundling fills this directory after compilation; clean source checkouts
    // must also compile the helper before it can be staged.
    std::fs::create_dir_all("target/browser-resources")
        .expect("browser resource staging directory");
    println!("cargo:rerun-if-env-changed=TAURI_CONFIG");
    let base: serde_json::Value =
        serde_json::from_str(include_str!("tauri.conf.json")).expect("valid Tauri configuration");
    let overlay = std::env::var("TAURI_CONFIG")
        .ok()
        .and_then(|v| serde_json::from_str::<serde_json::Value>(&v).ok());
    let identifier = overlay
        .as_ref()
        .and_then(|v| v.get("identifier"))
        .and_then(|v| v.as_str())
        .or_else(|| base["identifier"].as_str())
        .expect("application identifier");
    println!("cargo:rustc-env=WORKMEMO_IDENTIFIER={identifier}");
    tauri_build::build()
}
