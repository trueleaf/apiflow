use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};
use tauri::{AppHandle, Manager};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct McpSettings {
    pub enabled: bool,
    pub port: u16,
    pub read_only: bool,
    pub allow_destructive: bool,
    pub auth_token: String,
}
impl Default for McpSettings {
    fn default() -> Self {
        Self { enabled: true, port: 34180, read_only: false, allow_destructive: false, auth_token: format!("{}{}", uuid::Uuid::new_v4().simple(), uuid::Uuid::new_v4().simple()) }
    }
}
#[derive(Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub online_url: String,
    pub network_mode: Option<String>,
    pub mcp: McpSettings,
    pub update: serde_json::Value,
}
pub struct Store {
    pub data: Mutex<Settings>,
    path: PathBuf,
}
pub fn test_directory(app: &AppHandle) -> Option<PathBuf> {
    if cfg!(debug_assertions) && app.config().identifier == "cn.apiflow.test" {
        std::env::var_os("APIFLOW_TEST_DATA_DIR").map(PathBuf::from).filter(|path| path.is_absolute())
    } else { None }
}
impl Store {
    pub fn load(app: &AppHandle) -> Result<Self, String> {
        let directory = test_directory(app).map(Ok).unwrap_or_else(|| app.path().app_config_dir().map_err(|error| error.to_string()))?;
        std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
        let path = directory.join("desktop.json");
        let data = if path.exists() { serde_json::from_slice(&std::fs::read(&path).map_err(|error| error.to_string())?).map_err(|error| error.to_string())? } else { Settings::default() };
        let store = Self { data: Mutex::new(data), path };
        store.update(|_| {})?;
        Ok(store)
    }
    pub fn update(&self, change: impl FnOnce(&mut Settings)) -> Result<Settings, String> {
        let mut stored = self.data.lock().map_err(|error| error.to_string())?;
        let mut next = stored.clone();
        change(&mut next);
        let bytes = serde_json::to_vec_pretty(&next).map_err(|error| error.to_string())?;
        let temporary = self.path.with_extension("tmp");
        std::fs::write(&temporary, bytes).map_err(|error| error.to_string())?;
        std::fs::rename(&temporary, &self.path).map_err(|error| error.to_string())?;
        *stored = next.clone();
        Ok(next)
    }
}
