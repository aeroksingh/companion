use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use crate::error::{AppError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Companion {
    pub id: String,
    pub name: String,
    pub source_type: String,
    pub builtin_key: Option<String>,
    pub sprite_path: String,
    pub sprite_width: i64,
    pub sprite_height: i64,
    pub frame_count: i64,
    pub row_idle: i64,
    pub row_happy: i64,
    pub row_sleeping: i64,
    pub row_curious: i64,
    pub is_active: bool,
    pub created_at: String,
}

pub fn get_all(conn: &Connection) -> Result<Vec<Companion>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, source_type, builtin_key, sprite_path,
                sprite_width, sprite_height, frame_count,
                row_idle, row_happy, row_sleeping, row_curious,
                is_active, created_at
         FROM companions ORDER BY created_at ASC"
    )?;

    let companions = stmt.query_map([], |row| {
        Ok(Companion {
            id: row.get(0)?,
            name: row.get(1)?,
            source_type: row.get(2)?,
            builtin_key: row.get(3)?,
            sprite_path: row.get(4)?,
            sprite_width: row.get(5)?,
            sprite_height: row.get(6)?,
            frame_count: row.get(7)?,
            row_idle: row.get(8)?,
            row_happy: row.get(9)?,
            row_sleeping: row.get(10)?,
            row_curious: row.get(11)?,
            is_active: row.get::<_, i64>(12)? == 1,
            created_at: row.get(13)?,
        })
    })?.collect::<std::result::Result<Vec<_>, _>>()?;

    Ok(companions)
}

pub fn get_active(conn: &Connection) -> Result<Option<Companion>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, source_type, builtin_key, sprite_path,
                sprite_width, sprite_height, frame_count,
                row_idle, row_happy, row_sleeping, row_curious,
                is_active, created_at
         FROM companions WHERE is_active = 1 LIMIT 1"
    )?;

    let result = stmt.query_row([], |row| {
        Ok(Companion {
            id: row.get(0)?,
            name: row.get(1)?,
            source_type: row.get(2)?,
            builtin_key: row.get(3)?,
            sprite_path: row.get(4)?,
            sprite_width: row.get(5)?,
            sprite_height: row.get(6)?,
            frame_count: row.get(7)?,
            row_idle: row.get(8)?,
            row_happy: row.get(9)?,
            row_sleeping: row.get(10)?,
            row_curious: row.get(11)?,
            is_active: true,
            created_at: row.get(13)?,
        })
    });

    match result {
        Ok(c) => Ok(Some(c)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(AppError::Database(e.to_string())),
    }
}

pub fn insert(conn: &Connection, c: &Companion) -> Result<()> {
    conn.execute(
        "INSERT INTO companions
         (id, name, source_type, builtin_key, sprite_path,
          sprite_width, sprite_height, frame_count,
          row_idle, row_happy, row_sleeping, row_curious, is_active)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)",
        params![
            c.id, c.name, c.source_type, c.builtin_key, c.sprite_path,
            c.sprite_width, c.sprite_height, c.frame_count,
            c.row_idle, c.row_happy, c.row_sleeping, c.row_curious,
            c.is_active as i64
        ],
    )?;

    // Insert stats row
    conn.execute(
        "INSERT OR IGNORE INTO statistics (companion_id) VALUES (?1)",
        params![c.id],
    )?;

    Ok(())
}

pub fn set_active(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("UPDATE companions SET is_active = 0", [])?;
    conn.execute(
        "UPDATE companions SET is_active = 1 WHERE id = ?1",
        params![id],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: &str) -> Result<()> {
    // Get sprite path to delete file
    let path: Option<String> = conn.query_row(
        "SELECT sprite_path FROM companions WHERE id = ?1 AND source_type = 'uploaded'",
        params![id],
        |r| r.get(0),
    ).ok();

    conn.execute("DELETE FROM companions WHERE id = ?1", params![id])?;

    if let Some(p) = path {
        std::fs::remove_file(&p).ok();
    }

    Ok(())
}

pub fn rename(conn: &Connection, id: &str, name: &str) -> Result<()> {
    conn.execute(
        "UPDATE companions SET name = ?1 WHERE id = ?2",
        params![name, id],
    )?;
    Ok(())
}
