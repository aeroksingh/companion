use tauri::State;
use crate::state::app_state::AppState;
use crate::db::companions::{self, Companion};
use crate::error::AppError;
use uuid::Uuid;

#[tauri::command]
pub fn get_companions(state: State<AppState>) -> Result<Vec<Companion>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    companions::get_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_companion(state: State<AppState>) -> Result<Option<Companion>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    companions::get_active(&conn).map_err(|e| e.to_string())
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCompanionArgs {
    pub name: String,
    pub source_type: String,
    pub builtin_key: Option<String>,
    pub sprite_path: String,
    pub sprite_width: Option<i64>,
    pub sprite_height: Option<i64>,
    pub frame_count: Option<i64>,
}

#[tauri::command]
pub fn create_companion(
    state: State<AppState>,
    args: CreateCompanionArgs,
) -> Result<Companion, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // If no companion exists yet, make this one active
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM companions", [], |r| r.get(0))
        .unwrap_or(0);

    let companion = Companion {
        id: Uuid::new_v4().to_string(),
        name: args.name,
        source_type: args.source_type,
        builtin_key: args.builtin_key,
        sprite_path: args.sprite_path,
        sprite_width: args.sprite_width.unwrap_or(96),
        sprite_height: args.sprite_height.unwrap_or(96),
        frame_count: args.frame_count.unwrap_or(4),
        row_idle: 0,
        row_happy: 1,
        row_sleeping: 2,
        row_curious: 3,
        is_active: count == 0,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    if count == 0 {
        conn.execute("UPDATE companions SET is_active = 0", [])
            .map_err(|e| e.to_string())?;
    }

    companions::insert(&conn, &companion).map_err(|e| e.to_string())?;
    Ok(companion)
}

#[tauri::command]
pub fn set_active_companion(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    companions::set_active(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_companion(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    companions::delete(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_companion(state: State<AppState>, id: String, name: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    companions::rename(&conn, &id, &name).map_err(|e| e.to_string())
}
