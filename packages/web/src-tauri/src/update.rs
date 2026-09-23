use base64::Engine;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{path::PathBuf, sync::Arc, time::{Duration, Instant}};
use tauri::{AppHandle, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};
use tokio::{io::AsyncWriteExt, sync::Mutex};
use tokio_util::sync::CancellationToken;
use crate::{settings::Store, shell};

const MAX_ARTIFACT_BYTES: u64 = 2 * 1024 * 1024 * 1024;
#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Progress { percent: f64, bytes_per_second: f64, transferred: u64, total: u64 }
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Download {
    id: uuid::Uuid,
    url: String,
    signature: String,
    version: String,
    endpoint: String,
    state: String,
    progress: Progress,
    update_info: Value,
    etag: Option<String>,
    error: Option<String>,
    resumable: bool,
}
#[derive(Default)]
struct State {
    update: Option<Update>,
    endpoint: String,
    task: Option<Download>,
    running: Option<(CancellationToken, tauri::async_runtime::JoinHandle<()>)>,
}
#[derive(Default)]
pub struct Updates { state: Arc<Mutex<State>>, actions: Mutex<()> }
fn emit(app: &AppHandle, event: &str, payload: Value) {
    let _ = shell::send(app, "content", &format!("apiflow:update:{event}"), payload);
}
fn public_key(app: &AppHandle) -> Result<String, String> {
    let key = option_env!("TAURI_UPDATER_PUBLIC_KEY").filter(|value| !value.is_empty()).map(str::to_owned)
        .or_else(|| app.config().plugins.0.get("updater").and_then(|config| config.get("pubkey")).and_then(Value::as_str).filter(|value| !value.is_empty()).map(str::to_owned));
    key.ok_or_else(|| "UPDATER_PUBLIC_KEY_NOT_CONFIGURED".into())
}
fn endpoint(settings: &Value) -> Result<String, String> {
    let value = if settings["source"] == "custom" {
        let url = settings["customUrl"].as_str().unwrap_or_default().trim();
        if url.is_empty() { return Err("UPDATE_SOURCE_NOT_CONFIGURED".into()); }
        if url.ends_with(".json") || url.contains("{{") { url.to_owned() } else { format!("{}/latest.json", url.trim_end_matches('/')) }
    } else { "https://github.com/trueleaf/apiflow/releases/latest/download/latest.json".into() };
    let url = crate::content::validate_url(&value)?;
    if url.scheme() != "https" && !(cfg!(debug_assertions) && matches!(url.host_str(), Some("127.0.0.1" | "localhost" | "[::1]"))) { return Err("UPDATE_SOURCE_REQUIRES_HTTPS".into()); }
    Ok(value)
}
fn directory(app: &AppHandle) -> Result<PathBuf, String> {
    crate::settings::test_directory(app).map(Ok).unwrap_or_else(|| app.path().app_cache_dir().map_err(|error| error.to_string())).map(|path| path.join("updates"))
}
async fn persist(app: &AppHandle, download: &Download) -> Result<(), String> {
    let path = directory(app)?;
    tokio::fs::create_dir_all(&path).await.map_err(|error| error.to_string())?;
    let bytes = serde_json::to_vec(download).map_err(|error| error.to_string())?;
    tokio::fs::write(path.join("state.tmp"), bytes).await.map_err(|error| error.to_string())?;
    tokio::fs::rename(path.join("state.tmp"), path.join("state.json")).await.map_err(|error| error.to_string())
}
fn info(update: &Update) -> Value {
    json!({"version": update.version, "releaseDate": update.raw_json.get("pub_date").and_then(Value::as_str).unwrap_or_default(), "releaseNotes": update.body.as_deref().unwrap_or_default()})
}
fn verify(bytes: &[u8], signature: &str, key: &str, version: &str) -> Result<(), String> {
    let decode = |value: &str| -> Result<String, String> {
        String::from_utf8(base64::engine::general_purpose::STANDARD.decode(value.trim()).map_err(|error| error.to_string())?).map_err(|error| error.to_string())
    };
    let key = minisign_verify::PublicKey::decode(&decode(key)?).map_err(|error| error.to_string())?;
    let signature = minisign_verify::Signature::decode(&decode(signature)?).map_err(|error| error.to_string())?;
    key.verify(bytes, &signature, true).map_err(|error| error.to_string())?;
    let signed_version = signature.trusted_comment().split('\t').find_map(|field| field.strip_prefix("version:")).ok_or("MISSING_SIGNED_VERSION")?;
    if signed_version.trim_start_matches('v') != version.trim_start_matches('v') { return Err("SIGNED_VERSION_MISMATCH".into()); }
    Ok(())
}
async fn query(app: &AppHandle, endpoint: &str) -> Result<Option<Update>, String> {
    let key = public_key(app)?;
    app.updater_builder().pubkey(key).endpoints(vec![reqwest::Url::parse(endpoint).map_err(|error| error.to_string())?]).map_err(|error| error.to_string())?
        .timeout(Duration::from_secs(30)).build().map_err(|error| error.to_string())?.check().await.map_err(|error| error.to_string())
}
impl Updates {
    pub async fn restore(&self, app: &AppHandle) -> Result<(), String> {
        let path = directory(app)?;
        let bytes = match tokio::fs::read(path.join("state.json")).await { Ok(bytes) => bytes, Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(()), Err(error) => return Err(error.to_string()) };
        let mut download: Download = serde_json::from_slice(&bytes).map_err(|error| error.to_string())?;
        if download.state == "cancelled" { return Ok(()); }
        if download.state == "downloading" { download.state = "paused".into(); }
        download.progress.transferred = tokio::fs::metadata(path.join(format!("{}.artifact", download.id))).await.map(|metadata| metadata.len()).unwrap_or_default();
        if download.progress.transferred == 0 { download.state = "paused".into(); }
        download.progress.bytes_per_second = 0.0;
        self.state.lock().await.task = Some(download);
        Ok(())
    }
    pub async fn check(&self, app: &AppHandle) -> Result<Value, String> {
        let _action = self.actions.lock().await;
        {
            let mut state = self.state.lock().await;
            if state.running.as_ref().is_some_and(|(_, job)| !job.inner().is_finished()) { return Err("UPDATE_DOWNLOAD_IN_PROGRESS".into()); }
            state.running = None;
        }
        emit(app, "checking-for-update", Value::Null);
        let settings = app.state::<Store>().data.lock().map_err(|error| error.to_string())?.update.clone();
        let source = endpoint(&settings)?;
        let update = query(app, &source).await?;
        let result = json!({"hasUpdate":update.is_some(),"currentVersion":app.package_info().version.to_string(),"updateInfo":update.as_ref().map(info)});
        emit(app, if update.is_some() { "update-available" } else { "update-not-available" }, update.as_ref().map(info).unwrap_or(Value::Null));
        let mut state = self.state.lock().await;
        state.update = update;
        state.endpoint = source;
        Ok(result)
    }
    async fn stop(&self, app: &AppHandle, cancelled: bool) -> Result<(), String> {
        let _action = self.actions.lock().await;
        if self.state.lock().await.task.is_none() { return Err("NO_DOWNLOAD".into()); }
        let running = self.state.lock().await.running.take();
        if let Some((token, task)) = running { token.cancel(); task.await.map_err(|error| error.to_string())?; }
        let mut state = self.state.lock().await;
        if let Some(download) = &mut state.task {
            if download.state == "completed" && !cancelled { return Ok(()); }
            download.state = if cancelled { "cancelled" } else { "paused" }.into();
            download.progress.bytes_per_second = 0.0;
            persist(app, download).await?;
            if cancelled {
                let path = directory(app)?.join(format!("{}.artifact", download.id));
                match tokio::fs::remove_file(path).await { Ok(()) => {}, Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}, Err(error) => return Err(error.to_string()) }
            }
            emit(app, "download-state-changed", json!({"state":download.state}));
        }
        Ok(())
    }
    async fn start(&self, app: &AppHandle, resume: bool) -> Result<(), String> {
        let _action = self.actions.lock().await;
        let mut state = self.state.lock().await;
        if let Some((_, job)) = &state.running { if !job.inner().is_finished() { return Err("UPDATE_DOWNLOAD_IN_PROGRESS".into()); } }
        state.running = None;
        if resume {
            let saved = state.task.clone().ok_or("NO_DOWNLOAD_TO_RESUME")?;
            if saved.state == "completed" { return Ok(()); }
            if state.update.as_ref().is_none_or(|update| update.signature != saved.signature) {
                let update = query(app, &saved.endpoint).await?.ok_or("UPDATE_NO_LONGER_AVAILABLE")?;
                if update.signature != saved.signature || update.version != saved.version || update.download_url.as_str() != saved.url { return Err("UPDATE_CHANGED_CHECK_AGAIN".into()); }
                state.update = Some(update);
            }
        } else {
            let update = state.update.as_ref().ok_or("CHECK_UPDATE_FIRST")?;
            let download = Download { id: uuid::Uuid::new_v4(), url:update.download_url.to_string(), signature:update.signature.clone(), version:update.version.clone(), endpoint:state.endpoint.clone(), state:"downloading".into(), progress:Progress::default(), update_info:info(update), etag:None, error:None, resumable:true };
            if let Some(old) = &state.task { let _ = tokio::fs::remove_file(directory(app)?.join(format!("{}.artifact", old.id))).await; }
            state.task = Some(download);
        }
        let download = state.task.as_mut().ok_or("NO_DOWNLOAD")?;
        download.state = "downloading".into(); download.error = None;
        persist(app, download).await?;
        let download = download.clone();
        let token = CancellationToken::new();
        let cancellation = token.clone();
        let app = app.clone();
        let shared = self.state.clone();
        emit(&app, "download-state-changed", json!({"state":"downloading"}));
        let job = tauri::async_runtime::spawn(async move {
            let outcome = transfer(&app, &shared, &download, &cancellation).await;
            if cancellation.is_cancelled() { return; }
            let mut state = shared.lock().await;
            if let Some(download) = &mut state.task {
                match outcome {
                    Ok(()) => { download.state = "completed".into(); download.progress.percent = 100.0; emit(&app, "update-downloaded", download.update_info.clone()); }
                    Err(error) => { download.state = "error".into(); download.error = Some(error.clone()); emit(&app, "error", json!({"message":error})); }
                }
                if let Err(error) = persist(&app, download).await { emit(&app, "error", json!({"message":error})); }
                emit(&app, "download-state-changed", json!({"state":download.state,"error":download.error}));
            }
        });
        state.running = Some((token, job));
        Ok(())
    }
    async fn install(&self, app: &AppHandle) -> Result<(), String> {
        let _action = self.actions.lock().await;
        let (download, update) = { let state = self.state.lock().await; (state.task.clone().ok_or("NO_DOWNLOAD")?, state.update.clone()) };
        if download.state != "completed" { return Err("DOWNLOAD_NOT_COMPLETE".into()); }
        let update = match update.filter(|update| update.signature == download.signature) { Some(update) => update, None => query(app, &download.endpoint).await?.ok_or("UPDATE_NO_LONGER_AVAILABLE")? };
        if update.signature != download.signature || update.version != download.version { return Err("UPDATE_CHANGED_CHECK_AGAIN".into()); }
        let bytes = tokio::fs::read(directory(app)?.join(format!("{}.artifact", download.id))).await.map_err(|error| error.to_string())?;
        verify(&bytes, &download.signature, &public_key(app)?, &download.version)?;
        tauri::async_runtime::spawn_blocking(move || update.install(bytes)).await.map_err(|error| error.to_string())?.map_err(|error| error.to_string())?;
        app.restart();
    }
}
async fn transfer(app: &AppHandle, shared: &Arc<Mutex<State>>, download: &Download, cancellation: &CancellationToken) -> Result<(), String> {
    let path = directory(app)?.join(format!("{}.artifact", download.id));
    let mut offset = tokio::fs::metadata(&path).await.map(|metadata| metadata.len()).unwrap_or_default();
    let url = crate::content::validate_url(&download.url)?;
    if url.scheme() != "https" && !cfg!(debug_assertions) { return Err("UPDATE_DOWNLOAD_REQUIRES_HTTPS".into()); }
    let client = reqwest::Client::builder().gzip(false).brotli(false).deflate(false).connect_timeout(Duration::from_secs(30)).read_timeout(Duration::from_secs(30)).build().map_err(|error| error.to_string())?;
    let mut request = client.get(url).header("accept-encoding", "identity");
    if offset > 0 { request = request.header("range", format!("bytes={offset}-")); if let Some(etag) = &download.etag { request = request.header("if-range", etag); } }
    let response = tokio::select! { _ = cancellation.cancelled() => return Ok(()), response = request.send() => response.map_err(|error| error.to_string())? };
    if response.status() == reqwest::StatusCode::RANGE_NOT_SATISFIABLE && offset > 0 {
        let bytes = tokio::fs::read(&path).await.map_err(|error| error.to_string())?;
        return verify(&bytes, &download.signature, &public_key(app)?, &download.version);
    }
    if !response.status().is_success() { return Err(format!("UPDATE_HTTP_{}", response.status())); }
    let total = if response.status() == reqwest::StatusCode::PARTIAL_CONTENT {
        let range = response.headers().get("content-range").and_then(|value| value.to_str().ok()).ok_or("MISSING_CONTENT_RANGE")?;
        let (bounds, total) = range.strip_prefix("bytes ").and_then(|value| value.split_once('/')).ok_or("INVALID_CONTENT_RANGE")?;
        let (start, end) = bounds.split_once('-').ok_or("INVALID_CONTENT_RANGE")?;
        let start: u64 = start.parse().map_err(|_| "INVALID_CONTENT_RANGE")?;
        let end: u64 = end.parse().map_err(|_| "INVALID_CONTENT_RANGE")?;
        let total: u64 = total.parse().map_err(|_| "INVALID_CONTENT_RANGE")?;
        if start != offset || end < start || end >= total { return Err("INVALID_CONTENT_RANGE".into()); }
        total
    } else { offset = 0; response.content_length().unwrap_or_default() };
    if total > MAX_ARTIFACT_BYTES || offset > MAX_ARTIFACT_BYTES { return Err("UPDATE_TOO_LARGE".into()); }
    let etag = response.headers().get("etag").and_then(|value| value.to_str().ok()).map(str::to_owned);
    let mut file = tokio::fs::OpenOptions::new().create(true).write(true).truncate(offset == 0).append(offset > 0).open(&path).await.map_err(|error| error.to_string())?;
    { let mut state = shared.lock().await; if let Some(task) = &mut state.task { task.etag = etag; task.progress.total = total; task.progress.transferred = offset; persist(app, task).await?; } }
    let mut stream = response.bytes_stream();
    let started = Instant::now();
    let mut notified = Instant::now();
    let mut transferred = offset;
    loop {
        let next = tokio::select! { _ = cancellation.cancelled() => break, next = stream.next() => next };
        let Some(chunk) = next else { break };
        let chunk = chunk.map_err(|error| error.to_string())?;
        transferred += chunk.len() as u64;
        if transferred > MAX_ARTIFACT_BYTES { return Err("UPDATE_TOO_LARGE".into()); }
        file.write_all(&chunk).await.map_err(|error| error.to_string())?;
        let progress = Progress { percent:if total > 0 { (transferred as f64 / total as f64 * 100.0).min(99.9) } else { 0.0 }, bytes_per_second:(transferred - offset) as f64 / started.elapsed().as_secs_f64().max(0.001), transferred, total };
        { let mut state = shared.lock().await; if let Some(task) = &mut state.task { task.progress = progress.clone(); } }
        if notified.elapsed() >= Duration::from_millis(250) { emit(app, "download-progress", json!(progress)); notified = Instant::now(); }
    }
    file.flush().await.map_err(|error| error.to_string())?;
    drop(file);
    if cancellation.is_cancelled() { return Ok(()); }
    if total > 0 && transferred != total { return Err("INCOMPLETE_UPDATE_DOWNLOAD".into()); }
    let bytes = tokio::fs::read(&path).await.map_err(|error| error.to_string())?;
    verify(&bytes, &download.signature, &public_key(app)?, &download.version)
}
#[tauri::command]
pub async fn update_action(app: AppHandle, action: String, settings: Option<Value>, auto_check: Option<bool>, source: Option<String>, custom_url: Option<String>, url: Option<String>) -> Result<Value, String> {
    if cfg!(feature = "app-store") { return Err("STORE_MANAGED_UPDATES".into()); }
    let updates = app.state::<Updates>();
    let outcome: Result<Value, String> = async {
        match action.as_str() {
            "check" => updates.check(&app).await,
            "state" => Ok(updates.state.lock().await.task.as_ref().map(|task| json!(task)).unwrap_or(Value::Null)),
            "download" | "resume" => { updates.start(&app, action == "resume").await?; Ok(Value::Null) }
            "pause" | "cancel" => { updates.stop(&app, action == "cancel").await?; Ok(Value::Null) }
            "install" => { updates.install(&app).await?; Ok(Value::Null) }
            "settings" | "auto-check" | "source" => {
                let _action = updates.actions.lock().await;
                let mut next = app.state::<Store>().data.lock().map_err(|error| error.to_string())?.update.clone();
                if !next.is_object() { next = json!({"autoCheck":false,"source":"github","customUrl":""}); }
                if action == "settings" { next = settings.ok_or("MISSING_UPDATE_SETTINGS")?; }
                if action == "auto-check" { next["autoCheck"] = json!(auto_check.ok_or("MISSING_AUTO_CHECK")?); }
                if action == "source" { next["source"] = json!(source.ok_or("MISSING_UPDATE_SOURCE")?); next["customUrl"] = json!(custom_url.unwrap_or_default()); }
                if !next["autoCheck"].is_boolean() || !matches!(next["source"].as_str(), Some("custom" | "github")) || !next["customUrl"].is_string() { return Err("INVALID_UPDATE_SETTINGS".into()); }
                app.state::<Store>().update(|settings| settings.update = next)?;
                Ok(Value::Null)
            }
            "test" => {
                let source = endpoint(&json!({"source":"custom","customUrl":url.ok_or("MISSING_URL")?}))?;
                let _ = query(&app, &source).await?;
                Ok(Value::Null)
            }
            _ => Err("UNKNOWN_UPDATE_ACTION".into()),
        }
    }.await;
    if let Err(error) = &outcome { emit(&app, "error", json!({"message":error})); }
    outcome
}
