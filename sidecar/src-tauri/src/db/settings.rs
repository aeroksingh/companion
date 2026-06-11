use rusqlite::params;
use crate::error::{AppError, Result};
use crate::state::app_state::AppState;
use std::collections::HashMap;

pub fn get_all(conn: &rusqlite::Connection) -> Result<HashMap<String, String>> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
    let map = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?.collect::<std::result::Result<HashMap<_, _>, _>>()?;
    Ok(map)
}

pub fn get_one(conn: &rusqlite::Connection, key: &str) -> Result<String> {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |r| r.get(0),
    ).map_err(|e| AppError::Database(e.to_string()))
}

pub fn set(conn: &rusqlite::Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
        params![key, value],
    )?;
    Ok(())
}

pub fn set_many(conn: &rusqlite::Connection, map: &HashMap<String, String>) -> Result<()> {
    for (k, v) in map {
        set(conn, k, v)?;
    }
    Ok(())
}

// Sync version for setup (before managed state is ready)
pub fn get_setting_sync(state: &AppState, key: &str) -> Result<String> {
    let conn = state.db.lock().map_err(|e| AppError::Database(e.to_string()))?;
    get_one(&conn, key)
}
