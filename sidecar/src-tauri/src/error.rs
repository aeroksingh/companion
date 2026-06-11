use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Pipeline failed: {0}")]
    Pipeline(String),

    #[error("Companion not found: {0}")]
    NotFound(String),

    #[error("Registry error: {0}")]
    Registry(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("Serialization error: {0}")]
    Serde(String),
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Serde(e.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
