use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod browser_bridge;
mod browser_protocol;
mod clock;
mod connection;
mod database;
mod desktop;
mod monitor;
mod native_activity;
#[allow(dead_code)] // Shared with the separately built native host CLI.
mod registration;
mod service;
mod windows;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(database::data_tools::ArchiveSelection(
                std::sync::Mutex::new(None),
            ));
            app.manage(connection::ConnectionState::initialize(app));
            app.manage(service::Backend::initialize(app));
            app.manage(desktop::IslandState::initialize(app));
            windows::initialize(app)?;
            app.manage(appearance::AppearanceState::initialize(app));
            desktop::setup(app)?;
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            database::data_tools::detect_preview_data,
            database::data_tools::inspect_backup,
            database::data_tools::create_backup,
            database::data_tools::restore_backup,
            database::data_tools::preview_migration,
            database::data_tools::import_preview,
            windows::open_panel,
            windows::get_layout_settings,
            windows::set_layout_density,
            windows::reset_window_layout,
            windows::set_window_dirty,
            windows::close_panel,
            connection::get_connection_status,
            connection::repair_browser_connection,
            connection::open_browser_extension,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
            service::query_history,
            service::delete_record,
            service::get_pending_records,
            service::settle_record,
            service::get_monitor_config,
            service::save_monitor_config,
            service::get_notice,
            service::defer_notice,
            service::show_main,
            service::exit_app,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if windows::has_drafts(app) {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:request-close", ());
                    return;
                }
                for (_, w) in app.webview_windows() {
                    let _ = windows::capture(&w.as_ref().window());
                }
                if let Err(error) = desktop::save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                }
            }
        });
}

#[cfg(debug_assertions)]
pub fn monitor_probe() -> String {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let application_id = &context.config().identifier;
    match native_activity::sample() {
        Ok(sample)=>serde_json::json!({"application_id":application_id,"native_available":sample.reliable,"unlocked":sample.unlocked,
            "chrome_foreground":sample.chrome_foreground,"last_input_age_ms":sample.at.ticks_ms.saturating_sub(sample.last_input_ticks)}).to_string(),
        Err(error)=>serde_json::json!({"application_id":application_id,"native_available":false,"error":error}).to_string(),
    }
}
