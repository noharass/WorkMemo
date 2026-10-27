// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(debug_assertions)]
    if std::env::args().any(|arg| arg == "--monitor-probe") {
        println!("{}", workmemo_lib::monitor_probe());
        return;
    }
    workmemo_lib::run()
}
