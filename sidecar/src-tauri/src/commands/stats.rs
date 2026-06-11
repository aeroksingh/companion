use tauri::State;
use crate::state::app_state::AppState;
use crate::db::stats::{self, Stats};

#[tauri::command]
pub fn get_stats(state: State<AppState>, companion_id: String) -> Result<Stats, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    stats::get(&conn, &companion_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn increment_stat(
    state: State<AppState>,
    companion_id: String,
    field: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    stats::increment(&conn, &companion_id, &field).map_err(|e| e.to_string())
}
