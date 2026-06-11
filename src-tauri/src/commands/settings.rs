use std::collections::HashMap;
use tauri::State;
use crate::state::app_state::AppState;
use crate::db::settings;

#[tauri::command]
pub fn get_settings(state: State<AppState>) -> Result<HashMap<String, String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    settings::get_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_setting(state: State<AppState>, key: String) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    settings::get_one(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_settings(
    state: State<AppState>,
    settings: HashMap<String, String>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::db::settings::set_many(&conn, &settings).map_err(|e| e.to_string())
}
