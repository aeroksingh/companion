mod commands;
mod db;
mod error;
mod overlay;
mod startup;
mod state;
mod tray;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Initialize database
            let db_path = db::schema::get_db_path();
            db::schema::init_db(&db_path).expect("Failed to init database");

            // Store db path in managed state
            app.manage(state::app_state::AppState::new(db_path));

            // Setup tray
            tray::setup_tray(app)?;

            // Check first launch
            let app_state = app.state::<state::app_state::AppState>();
            let first_launch_done = db::settings::get_setting_sync(
                &app_state,
                "first_launch_done",
            ).unwrap_or_else(|_| "false".to_string());

            if first_launch_done == "false" {
                // Show onboarding
                if let Some(w) = app.get_webview_window("onboarding") {
                    w.show().ok();
                }
            } else {
                // Restore overlay
                overlay::restore_and_show(&app.handle().clone()).ok();
                // Start FSM
                state::fsm::start_fsm(app_handle);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::companion::get_companions,
            commands::companion::create_companion,
            commands::companion::set_active_companion,
            commands::companion::delete_companion,
            commands::companion::rename_companion,
            commands::companion::get_active_companion,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_setting,
            commands::stats::get_stats,
            commands::stats::increment_stat,
            commands::overlay::get_overlay_state,
            commands::overlay::save_overlay_position,
            commands::overlay::set_overlay_visible,
            commands::overlay::open_companion_center,
            commands::overlay::close_companion_center,
            commands::overlay::open_onboarding,
            commands::overlay::finish_onboarding,
            commands::overlay::start_drag_window,
            commands::overlay::get_window_position,
            commands::overlay::enable_click_capture,
            commands::overlay::disable_click_capture,
            commands::overlay::resize_overlay_for_size,
            commands::pipeline::run_pixel_pipeline,
            startup::toggle_autostart,
            startup::is_autostart_enabled,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Companion");
}
