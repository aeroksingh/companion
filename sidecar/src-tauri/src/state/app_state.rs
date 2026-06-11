use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub db_path: PathBuf,
}

impl AppState {
    pub fn new(db_path: PathBuf) -> Self {
        let conn = Connection::open(&db_path).expect("Failed to open DB in AppState");
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
            .expect("PRAGMA failed");
        Self {
            db: Mutex::new(conn),
            db_path,
        }
    }
}
