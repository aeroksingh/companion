use tauri::{AppHandle, Manager, State, Emitter};
use crate::state::app_state::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverlayState {
    pub pos_x: i64,
    pub pos_y: i64,
    pub is_visible: bool,
}

#[tauri::command]
pub fn get_overlay_state(state: State<AppState>) -> Result<OverlayState, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT pos_x, pos_y, is_visible FROM overlay_state WHERE id = 1",
        [],
        |row| Ok(OverlayState {
            pos_x: row.get(0)?,
            pos_y: row.get(1)?,
            is_visible: row.get::<_, i64>(2)? == 1,
        }),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_overlay_position(
    state: State<AppState>,
    x: i64,
    y: i64,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE overlay_state SET pos_x = ?1, pos_y = ?2, updated_at = datetime('now') WHERE id = 1",
        rusqlite::params![x, y],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_overlay_visible(
    app: AppHandle,
    state: State<AppState>,
    visible: bool,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE overlay_state SET is_visible = ?1 WHERE id = 1",
        rusqlite::params![visible as i64],
    ).map_err(|e| e.to_string())?;
    drop(conn);

    if let Some(w) = app.get_webview_window("overlay") {
        if visible { w.show().ok(); } else { w.hide().ok(); }
    }
    Ok(())
}

#[tauri::command]
pub fn open_companion_center(app: AppHandle) -> Result<(), String> {
    let _ = app.emit("overlay_ghost", true);
    if let Some(center) = app.get_webview_window("center") {
        center.show().map_err(|e| e.to_string())?;
        center.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn close_companion_center(app: AppHandle) -> Result<(), String> {
    if let Some(center) = app.get_webview_window("center") {
        center.hide().map_err(|e| e.to_string())?;
    }
    let _ = app.emit("overlay_ghost", false);
    Ok(())
}

#[tauri::command]
pub fn open_onboarding(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("onboarding") {
        w.show().map_err(|e| e.to_string())?;
        w.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn finish_onboarding(
    app: AppHandle,
    state: State<AppState>,
) -> Result<(), String> {
    {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE settings SET value = 'true' WHERE key = 'first_launch_done'",
            [],
        ).map_err(|e| e.to_string())?;
    }

    if let Some(w) = app.get_webview_window("onboarding") {
        w.hide().ok();
    }

    crate::overlay::restore_and_show(&app).map_err(|e| e.to_string())?;
    crate::state::fsm::start_fsm(app.clone());

    #[cfg(target_os = "windows")]
    {
        if let Ok(exe) = std::env::current_exe() {
            let exe_str = format!("\"{}\" --minimized", exe.to_string_lossy());
            crate::startup::write_autostart(&exe_str).ok();
        }
    }

    Ok(())
}

#[tauri::command]
pub fn start_drag_window(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("overlay") {
        w.start_dragging().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_window_position(app: AppHandle) -> Result<(i32, i32), String> {
    if let Some(w) = app.get_webview_window("overlay") {
        let pos = w.outer_position().map_err(|e| e.to_string())?;
        return Ok((pos.x, pos.y));
    }
    Ok((100, 100))
}

#[tauri::command]
pub fn enable_click_capture(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("overlay") {
        w.set_ignore_cursor_events(false).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn disable_click_capture(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("overlay") {
        w.set_ignore_cursor_events(true).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn resize_overlay_for_size(app: AppHandle, size: String) -> Result<(), String> {
    let (w, h) = match size.as_str() {
        "small" => (120u32, 120u32),
        "large" => (200u32, 200u32),
        _       => (160u32, 160u32),
    };
    if let Some(win) = app.get_webview_window("overlay") {
        win.set_size(tauri::Size::Physical(tauri::PhysicalSize { width: w, height: h }))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
