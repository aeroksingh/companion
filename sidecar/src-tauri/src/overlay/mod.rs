use tauri::{AppHandle, Manager};

pub fn restore_and_show(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let state = app.state::<crate::state::app_state::AppState>();
    let (x, y) = {
        let conn = state.db.lock()?;
        conn.query_row(
            "SELECT pos_x, pos_y FROM overlay_state WHERE id = 1",
            [],
            |row| Ok((row.get::<_, i32>(0)?, row.get::<_, i32>(1)?)),
        )?
    };

    if let Some(w) = app.get_webview_window("overlay") {
        w.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))?;
        // Small delay to avoid flicker on startup
        std::thread::sleep(std::time::Duration::from_millis(300));
        w.show()?;
    }

    Ok(())
}
