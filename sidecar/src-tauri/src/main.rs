// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod commands;
mod db;
mod error;
mod overlay;
mod startup;
mod state;
mod tray;

pub use companion_lib::run;

fn main() {
    run();
}
