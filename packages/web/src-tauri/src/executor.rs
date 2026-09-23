use serde_json::{json, Value};
use std::{collections::HashMap, sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}}, time::Duration};
use tauri::{AppHandle, State, Webview};
use tokio::sync::oneshot;

#[derive(Default, Clone)]
pub struct Executor {
    ready: Arc<AtomicBool>,
    pending: Arc<Mutex<HashMap<String, oneshot::Sender<Result<Value, String>>>>>,
}
struct PendingRequest {
    id: String,
    executor: Executor,
}
impl Drop for PendingRequest {
    fn drop(&mut self) {
        if let Ok(mut pending) = self.executor.pending.lock() { pending.remove(&self.id); }
    }
}
impl Executor {
    pub fn is_ready(&self) -> bool { self.ready.load(Ordering::Acquire) }
    pub async fn request(&self, app: &AppHandle, operation: &str, payload: Value) -> Result<Value, String> {
        if !self.ready.load(Ordering::Acquire) { return Err("EXECUTOR_NOT_READY".into()); }
        let id = uuid::Uuid::new_v4().to_string();
        let (sender, receiver) = oneshot::channel();
        {
            let mut pending = self.pending.lock().map_err(|error| error.to_string())?;
            if pending.len() >= 256 { return Err("EXECUTOR_BUSY".into()); }
            pending.insert(id.clone(), sender);
        }
        let _pending = PendingRequest { id: id.clone(), executor: self.clone() };
        crate::shell::send(app, "executor", "desktop:executor:request", json!({"id":id,"operation":operation,"payload":payload}))?;
        tokio::time::timeout(Duration::from_secs(120), receiver).await.map_err(|_| "EXECUTOR_TIMEOUT".to_owned())?.map_err(|_| "EXECUTOR_DISCONNECTED".to_owned())?
    }
    pub fn reset(&self) {
        self.ready.store(false, Ordering::Release);
        if let Ok(mut pending) = self.pending.lock() { pending.clear(); }
    }
}
#[tauri::command]
pub fn executor_ready(app: AppHandle, view: Webview, executor: State<'_, Executor>) -> Result<(), String> {
    if view.label() != "executor" { return Err("INVALID_EXECUTOR".into()); }
    executor.ready.store(true, Ordering::Release);
    tauri::async_runtime::spawn(async move {
        use tauri::Manager;
        let _ = app.state::<crate::mcp::McpService>().restart(&app).await;
    });
    Ok(())
}
#[tauri::command]
pub fn executor_reply(view: Webview, executor: State<'_, Executor>, id: String, result: Option<Value>, error: Option<String>) -> Result<(), String> {
    if view.label() != "executor" { return Err("INVALID_EXECUTOR".into()); }
    if let Some(sender) = executor.pending.lock().map_err(|error| error.to_string())?.remove(&id) {
        let _ = sender.send(match error { Some(error) => Err(error), None => Ok(result.unwrap_or(Value::Null)) });
    }
    Ok(())
}
