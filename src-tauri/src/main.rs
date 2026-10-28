// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if std::env::args().any(|a| a == "--prepare-demo") {
        match workmemo_lib::prepare_demo_data() {
            Ok(result) => println!("{result}"),
            Err(error) => {
                eprintln!("{error}");
                std::process::exit(1);
            }
        }
        return;
    }
    #[cfg(debug_assertions)]
    if std::env::args().any(|arg| arg == "--monitor-probe") {
        println!("{}", workmemo_lib::monitor_probe());
        return;
    }
    workmemo_lib::run()
}
