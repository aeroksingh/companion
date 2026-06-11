use rusqlite::params;
use serde::{Deserialize, Serialize};
use crate::error::{AppError, Result};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub hover_count: i64,
    pub pet_count: i64,
    pub click_count: i64,
    pub double_click_count: i64,
    pub total_interaction_count: i64,
    pub last_interacted_at: Option<String>,
}

pub fn get(conn: &rusqlite::Connection, companion_id: &str) -> Result<Stats> {
    // Ensure row exists
    conn.execute(
        "INSERT OR IGNORE INTO statistics (companion_id) VALUES (?1)",
        params![companion_id],
    )?;

    conn.query_row(
        "SELECT hover_count, pet_count, click_count, double_click_count,
                total_interaction_count, last_interacted_at
         FROM statistics WHERE companion_id = ?1",
        params![companion_id],
        |row| Ok(Stats {
            hover_count: row.get(0)?,
            pet_count: row.get(1)?,
            click_count: row.get(2)?,
            double_click_count: row.get(3)?,
            total_interaction_count: row.get(4)?,
            last_interacted_at: row.get(5)?,
        }),
    ).map_err(|e| AppError::Database(e.to_string()))
}

pub fn increment(conn: &rusqlite::Connection, companion_id: &str, field: &str) -> Result<()> {
    let allowed = ["hover_count", "pet_count", "click_count",
                   "double_click_count", "total_interaction_count"];
    if !allowed.contains(&field) {
        return Err(AppError::Database(format!("Invalid field: {}", field)));
    }

    conn.execute(
        "INSERT INTO statistics (companion_id) VALUES (?1)
         ON CONFLICT(companion_id) DO NOTHING",
        params![companion_id],
    )?;

    let sql = format!(
        "UPDATE statistics SET {} = {} + 1, last_interacted_at = datetime('now')
         WHERE companion_id = ?1",
        field, field
    );
    conn.execute(&sql, params![companion_id])?;
    Ok(())
}
