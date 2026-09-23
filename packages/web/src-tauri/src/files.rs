use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;

fn temporary_directory(app: &AppHandle) -> Result<PathBuf, String> {
    crate::settings::test_directory(app).map(Ok).unwrap_or_else(|| app.path().app_cache_dir().map_err(|error| error.to_string())).map(|path| path.join("temporary"))
}
#[tauri::command]
pub async fn read_file(path: String) -> Result<Vec<u8>, String> {
    let metadata = tokio::fs::metadata(&path).await.map_err(|error| error.to_string())?;
    if !metadata.is_file() { return Err("NOT_A_FILE".into()); }
    tokio::fs::read(path).await.map_err(|error| error.to_string())
}
#[tauri::command]
pub async fn stage_file(app: AppHandle, name: String, data: Vec<u8>) -> Result<String, String> {
    let directory = temporary_directory(&app)?;
    tokio::fs::create_dir_all(&directory).await.map_err(|error| error.to_string())?;
    let file_name = Path::new(&name).file_name().and_then(|name| name.to_str()).ok_or("INVALID_FILE_NAME")?;
    let path = directory.join(format!("{}-{file_name}", uuid::Uuid::new_v4()));
    tokio::fs::write(&path, data).await.map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}
#[tauri::command]
pub async fn temporary_file(app: AppHandle, action: String, path: Option<String>, content: Option<String>) -> Result<serde_json::Value, String> {
    if action == "create" {
        let content = content.ok_or("MISSING_CONTENT")?;
        let size = content.len();
        let path = stage_file(app, "body.txt".into(), content.into_bytes()).await?;
        return Ok(serde_json::json!({"path": path, "size": size}));
    }
    let directory = tokio::fs::canonicalize(temporary_directory(&app)?).await.map_err(|error| error.to_string())?;
    let path = tokio::fs::canonicalize(path.ok_or("MISSING_PATH")?).await.map_err(|error| error.to_string())?;
    if !path.starts_with(&directory) || path == directory { return Err("INVALID_TEMPORARY_PATH".into()); }
    match action.as_str() {
        "read" => Ok(serde_json::json!({"content": tokio::fs::read_to_string(path).await.map_err(|error| error.to_string())?})),
        "delete" => {
            tokio::fs::remove_file(path).await.map_err(|error| error.to_string())?;
            Ok(serde_json::Value::Null)
        }
        _ => Err("INVALID_FILE_ACTION".into()),
    }
}
#[tauri::command]
pub async fn select_files(app: AppHandle, multiple: bool, extensions: Option<Vec<String>>) -> Result<Vec<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut dialog = app.dialog().file();
        if let Some(extensions) = extensions.filter(|extensions| !extensions.is_empty()) {
            let extensions: Vec<&str> = extensions.iter().map(String::as_str).collect();
            dialog = dialog.add_filter("Files", &extensions);
        }
        let selected = if multiple { dialog.blocking_pick_files().unwrap_or_default() } else { dialog.blocking_pick_file().into_iter().collect() };
        selected.into_iter().map(|path| path.into_path().map(|path| path.to_string_lossy().into_owned()).map_err(|error| error.to_string())).collect()
    }).await.map_err(|error| error.to_string())?
}
#[tauri::command]
pub async fn file_info(path: String) -> Result<serde_json::Value, String> {
    let metadata = tokio::fs::metadata(&path).await.map_err(|error| error.to_string())?;
    if !metadata.is_file() { return Err("NOT_A_FILE".into()); }
    let file_name = Path::new(&path).file_name().and_then(|name| name.to_str()).ok_or("INVALID_FILE_NAME")?;
    Ok(serde_json::json!({"path":path,"name":file_name,"size":metadata.len(),"type":mime_guess::from_path(&path).first_or_octet_stream().to_string()}))
}
#[tauri::command]
pub async fn save_file(app: AppHandle, name: String, data: Vec<u8>) -> Result<Option<String>, String> {
    let path = tauri::async_runtime::spawn_blocking(move || app.dialog().file().set_file_name(name).blocking_save_file()).await.map_err(|error| error.to_string())?;
    let Some(path) = path else { return Ok(None) };
    let path = path.into_path().map_err(|error| error.to_string())?;
    tokio::fs::write(&path, data).await.map_err(|error| error.to_string())?;
    Ok(Some(path.to_string_lossy().into_owned()))
}
