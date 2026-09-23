use serde_json::{json, Value};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State, Webview, WebviewUrl};
use crate::{settings::Store, shell};

#[derive(Default)]
pub struct ContentState(pub Mutex<Load>);
#[derive(Default)]
pub struct Load {
    generation: u64,
    pub state: String,
    pub current_url: String,
    pub failure: Option<Value>,
    pub local_url: String,
    pub remote_url: String,
}
pub fn validate_url(value: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(value).map_err(|error| error.to_string())?;
    if !matches!(url.scheme(), "http" | "https") || url.host_str().is_none() || !url.username().is_empty() || url.password().is_some() { return Err("INVALID_ONLINE_URL".into()); }
    Ok(url)
}
pub fn configure(app: &AppHandle) -> Result<WebviewUrl, String> {
    let base = if tauri::is_dev() { app.config().build.dev_url.clone() } else { None };
    let local = base.unwrap_or_else(|| reqwest::Url::parse(if cfg!(windows) { "http://tauri.localhost/" } else { "tauri://localhost/" }).expect("Valid local origin")).join("index.html").map_err(|error| error.to_string())?;
    let remote = app.state::<Store>().data.lock().map_err(|error| error.to_string())?.online_url.clone();
    let target = if remote.is_empty() { WebviewUrl::App("index.html".into()) } else {
        let url = validate_url(&remote)?;
        let capability = json!({"identifier":"configured-content", "local":false, "webviews":["content", "executor"], "remote":{"urls":[format!("{}/*", url.origin().ascii_serialization())]}, "permissions":["core:default", "desktop-services"]});
        app.add_capability(capability.to_string()).map_err(|error| error.to_string())?;
        WebviewUrl::External(url)
    };
    let state = app.state::<ContentState>();
    let mut load = state.0.lock().map_err(|error| error.to_string())?;
    load.local_url = local.to_string();
    load.remote_url = remote;
    Ok(target)
}
pub fn executor_url(app: &AppHandle) -> Result<WebviewUrl, String> {
    let state = app.state::<ContentState>();
    let load = state.0.lock().map_err(|error| error.to_string())?;
    if load.remote_url.is_empty() { return Ok(WebviewUrl::App("mcp.html".into())); }
    Ok(WebviewUrl::External(validate_url(&load.remote_url)?.join("mcp.html").map_err(|error| error.to_string())?))
}
pub fn allow_navigation(app: &AppHandle, url: &reqwest::Url) -> bool {
    let state = app.state::<ContentState>();
    let Ok(load) = state.0.lock() else { return false };
    [&load.local_url, &load.remote_url].iter().filter_map(|value| reqwest::Url::parse(value).ok()).any(|allowed| allowed.scheme() == url.scheme() && allowed.host_str() == url.host_str() && allowed.port_or_known_default() == url.port_or_known_default())
}
pub fn started(app: &AppHandle, url: &str) {
    app.state::<crate::http::Requests>().cancel_owner("content");
    app.state::<crate::websocket::Connections>().cancel_owner("content");
    if let Ok(mut shell) = app.state::<Mutex<shell::ShellState>>().lock() { shell.content_ready = false; }
    let state = app.state::<ContentState>();
    let Ok(mut load) = state.0.lock() else { return };
    load.generation += 1;
    let generation = load.generation;
    load.current_url = url.to_owned();
    if url.contains("content-error.html") { return; }
    load.state = "loading".into();
    load.failure = None;
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(30)).await;
        let fallback = {
            let state = app.state::<ContentState>();
            let Ok(mut load) = state.0.lock() else { return };
            if load.generation != generation || load.state != "loading" { return; }
            load.state = "failed".into();
            load.failure = Some(json!({"errorCode":-7,"errorDescription":"PAGE_LOAD_TIMEOUT","validatedURL":load.current_url,"timestamp":crate::http::timestamp()}));
            reqwest::Url::parse(&load.local_url).ok().and_then(|url| url.join("content-error.html").ok())
        };
        if let (Some(view), Some(url)) = (app.get_webview("content"), fallback) { let _ = view.navigate(url); }
    });
}
pub fn ready(app: &AppHandle) {
    let executor_url = if let Ok(mut load) = app.state::<ContentState>().0.lock() {
        load.state = "loaded".into(); load.failure = None;
        reqwest::Url::parse(&load.current_url).ok().and_then(|url| url.join("mcp.html").ok())
    } else { None };
    if let (Some(executor), Some(url)) = (app.get_webview("executor"), executor_url) {
        if executor.url().is_ok_and(|current| current.scheme() != url.scheme() || current.host_str() != url.host_str() || current.port_or_known_default() != url.port_or_known_default()) { let _ = executor.navigate(url); }
    }
}
#[tauri::command]
pub fn content_load(app: AppHandle, state: State<'_, ContentState>, action: String) -> Result<Value, String> {
    let load = state.0.lock().map_err(|error| error.to_string())?;
    if action == "state" { return Ok(json!({"state":load.state,"failureInfo":load.failure,"currentUrl":load.current_url})); }
    let target = match action.as_str() {
        "retry" if !load.remote_url.is_empty() => &load.remote_url,
        "retry" | "fallback" => &load.local_url,
        _ => return Err("INVALID_CONTENT_ACTION".into()),
    };
    let url = reqwest::Url::parse(target).map_err(|error| error.to_string())?;
    drop(load);
    app.get_webview("content").ok_or("VIEW_NOT_FOUND")?.navigate(url).map_err(|error| error.to_string())?;
    Ok(Value::Null)
}
#[tauri::command]
pub async fn shell_query(app: AppHandle, view: Webview, channel: String, payload: Value) -> Result<Value, String> {
    if !matches!(view.label(), "content" | "topbar") { return Err("INVALID_MESSAGE_SENDER".into()); }
    match channel.as_str() {
        "apiflow:renderer:to:main:get-online-url" => Ok(json!(app.state::<Store>().data.lock().map_err(|error| error.to_string())?.online_url)),
        "apiflow:renderer:to:main:set-online-url" => {
            let url = payload.as_str().ok_or("INVALID_ONLINE_URL")?.trim().to_owned();
            if !url.is_empty() { validate_url(&url)?; }
            app.state::<Store>().update(|settings| settings.online_url = url)?;
            tauri::async_runtime::spawn(async move { tokio::time::sleep(std::time::Duration::from_millis(250)).await; app.restart(); });
            Ok(json!({"code":0,"msg":"success"}))
        }
        "apiflow:renderer:to:main:clear-desktop-store" => {
            let had_remote = !app.state::<Store>().data.lock().map_err(|error| error.to_string())?.online_url.is_empty();
            app.state::<Store>().update(|settings| *settings = Default::default())?;
            app.state::<crate::mcp::McpService>().restart(&app).await?;
            if had_remote { tauri::async_runtime::spawn(async move { tokio::time::sleep(std::time::Duration::from_millis(250)).await; app.restart(); }); }
            Ok(json!(had_remote))
        }
        _ => Err("UNKNOWN_SHELL_QUERY".into()),
    }
}
