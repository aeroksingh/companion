use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn get_db_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Companion")
        .join("companion.db")
}

pub fn init_db(path: &PathBuf) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).ok();
    }

    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
    conn.execute_batch(MIGRATION_001)?;
    Ok(())
}

const MIGRATION_001: &str = r#"
CREATE TABLE IF NOT EXISTS companions (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    source_type     TEXT NOT NULL CHECK(source_type IN ('builtin','uploaded')),
    builtin_key     TEXT,
    sprite_path     TEXT NOT NULL,
    sprite_width    INTEGER NOT NULL DEFAULT 96,
    sprite_height   INTEGER NOT NULL DEFAULT 96,
    frame_count     INTEGER NOT NULL DEFAULT 4,
    row_idle        INTEGER NOT NULL DEFAULT 0,
    row_happy       INTEGER NOT NULL DEFAULT 1,
    row_sleeping    INTEGER NOT NULL DEFAULT 2,
    row_curious     INTEGER NOT NULL DEFAULT 3,
    is_active       INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS overlay_state (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    pos_x       INTEGER NOT NULL DEFAULT 100,
    pos_y       INTEGER NOT NULL DEFAULT 100,
    is_visible  INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO overlay_state (id, pos_x, pos_y) VALUES (1, 100, 100);

CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('companion_size',    'medium'),
    ('opacity',           '100'),
    ('animation_speed',   'normal'),
    ('idle_timeout_sec',  '300'),
    ('sleep_timeout_sec', '600'),
    ('autostart_enabled', 'true'),
    ('first_launch_done', 'false');

CREATE TABLE IF NOT EXISTS statistics (
    companion_id            TEXT PRIMARY KEY REFERENCES companions(id) ON DELETE CASCADE,
    hover_count             INTEGER NOT NULL DEFAULT 0,
    pet_count               INTEGER NOT NULL DEFAULT 0,
    click_count             INTEGER NOT NULL DEFAULT 0,
    double_click_count      INTEGER NOT NULL DEFAULT 0,
    total_interaction_count INTEGER NOT NULL DEFAULT 0,
    last_interacted_at      TEXT
);

CREATE TRIGGER IF NOT EXISTS companions_updated
AFTER UPDATE ON companions
BEGIN
    UPDATE companions SET updated_at = datetime('now') WHERE id = NEW.id;
END;
"#;
