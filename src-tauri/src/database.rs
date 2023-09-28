use rusqlite::{named_params, Connection};
use std::fs;
use tauri::AppHandle;

const CURRENT_DB_VERSION: u32 = 1;

pub fn initialize_database(app_handle: &AppHandle) -> Result<Connection, rusqlite::Error> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist");
    fs::create_dir_all(&app_dir).expect("The app data directory should be created");
    let sqlite_path = app_dir.join("colors.sqlite");
    let mut db = Connection::open(sqlite_path)?;
    let mut user_pragma = db.prepare("PRAGMA user_version")?;
    let existing_user_version: u32 = user_pragma.query_row([], |row| row.get(0))?;
    drop(user_pragma);
    upgrade_database_if_needed(&mut db, existing_user_version)?;
    Ok(db)
}

pub fn upgrade_database_if_needed(
    db: &mut Connection,
    existing_version: u32,
) -> Result<(), rusqlite::Error> {
    if existing_version < CURRENT_DB_VERSION {
        db.pragma_update(None, "journal_mode", "WAL")?;
        let tx = db.transaction()?;
        tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;
        tx.execute_batch(
            "
      CREATE TABLE colors (
        hex TEXT NOT NULL
      );",
        )?;
        tx.commit()?;
    }
    Ok(())
}

pub fn add_item(hex: &str, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("INSERT INTO colors (hex) VALUES (@hex)")?;
    statement.execute(named_params! { "@hex": hex })?;
    Ok(())
}

pub fn get_all(db: &Connection) -> Result<Vec<String>, rusqlite::Error> {
    let mut statement = db.prepare("SELECT * FROM colors")?;
    let mut rows = statement.query([])?;
    let mut colors = Vec::new();
    while let Some(row) = rows.next()? {
        let hex: String = row.get("hex")?;
        colors.push(hex);
    }
    Ok(colors)
}

pub fn delete_item(db: &Connection, hex: &str) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("DELETE FROM colors where hex = (@hex)")?;
    statement.execute(named_params! { "@hex": hex })?;
    Ok(())
}
