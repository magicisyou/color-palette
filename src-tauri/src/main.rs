// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod state;

use state::{AppState, ServiceAccess};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
fn add_color(app_handle: AppHandle, hex: &str) {
    if let Ok(()) = app_handle.db(|db| database::add_item(hex, db)) {}
}

#[tauri::command]
fn get_all_colors(app_handle: AppHandle) -> Vec<String> {
    if let Ok(data) = app_handle.db(database::get_all) {
        data
    } else {
        vec![]
    }
}

#[tauri::command]
fn delete_color(app_handle: AppHandle, hex: &str) {
    if let Ok(()) = app_handle.db(|db| database::delete_item(db, hex)) {}
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Default::default(),
        })
        .setup(|app| {
            let handle = app.handle();
            let app_state: State<AppState> = handle.state();
            let db =
                database::initialize_database(&handle).expect("Database initialize should succeed");
            *app_state.db.lock().unwrap() = Some(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            add_color,
            get_all_colors,
            delete_color
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
