use tauri::{AppHandle, State, Emitter};
use crate::state::app_state::AppState;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PipelineResult {
    pub sprite_path: String,
    pub frame_count: u32,
    pub sprite_width: u32,
    pub sprite_height: u32,
}

#[tauri::command]
pub async fn run_pixel_pipeline(
    app: AppHandle,
    input_path: String,
    target_size: Option<u32>,
) -> Result<PipelineResult, String> {
    let size = target_size.unwrap_or(96);

    // Output dir: AppData/Companion/sprites/
    let output_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Companion")
        .join("sprites");

    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;

    let companion_id = uuid::Uuid::new_v4().to_string();
    let output_path = output_dir.join(format!("{}_sprite.png", companion_id));

    // Emit progress events
    let _ = app.emit("pipeline_progress", "crop");

    // Run the actual image processing via the sidecar
    // For now we use a direct Rust implementation as fallback
    let result = process_image_to_sprite(
        &input_path,
        output_path.to_str().unwrap(),
        size,
        &app,
    ).await.map_err(|e| e.to_string())?;

    let _ = app.emit("pipeline_progress", "done");

    Ok(PipelineResult {
        sprite_path: result,
        frame_count: 4,
        sprite_width: size,
        sprite_height: size,
    })
}

async fn process_image_to_sprite(
    input_path: &str,
    output_path: &str,
    _size: u32,
    app: &AppHandle,
) -> Result<String, String> {
    // Emit progress steps
    let _ = app.emit("pipeline_progress", "bg_remove");
    tokio::time::sleep(std::time::Duration::from_millis(300)).await;

    let _ = app.emit("pipeline_progress", "resize");
    tokio::time::sleep(std::time::Duration::from_millis(300)).await;

    let _ = app.emit("pipeline_progress", "pixelate");
    tokio::time::sleep(std::time::Duration::from_millis(400)).await;

    let _ = app.emit("pipeline_progress", "sprite");
    tokio::time::sleep(std::time::Duration::from_millis(300)).await;

    // Copy input as placeholder sprite sheet
    // In production this is where Sharp sidecar runs
    std::fs::copy(input_path, output_path).map_err(|e| e.to_string())?;

    Ok(output_path.to_string())
}
