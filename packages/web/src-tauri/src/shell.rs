use serde_json::{json, Value};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State, Webview};
use base64::Engine;

#[derive(Default)]
pub struct ShellState {
    pub topbar_ready: bool,
    pub content_ready: bool,
    pub tabs: Option<Value>,
}
pub fn send(app: &AppHandle, label: &str, channel: &str, payload: Value) -> Result<(), String> {
    app.get_webview(label).ok_or("VIEW_NOT_FOUND")?;
    app.emit_to(tauri::EventTarget::Webview { label: label.to_owned() }, "desktop-message", json!({"channel": channel, "payload": payload})).map_err(|error| error.to_string())
}
#[tauri::command]
pub fn route_message(app: AppHandle, view: Webview, state: State<'_, Mutex<ShellState>>, channel: String, payload: Value) -> Result<(), String> {
    if !matches!(view.label(), "topbar" | "content") { return Err("INVALID_MESSAGE_SENDER".into()); }
    let mut state = state.lock().map_err(|error| error.to_string())?;
    match channel.as_str() {
        "apiflow:renderer:to:main:set-window-icon" => {
            let source = payload.as_str().ok_or("INVALID_ICON")?;
            if !source.starts_with("data:") { return Ok(()); }
            let (_, data) = source.split_once("base64,").ok_or("INVALID_ICON")?;
            let bytes = base64::engine::general_purpose::STANDARD.decode(data).map_err(|error| error.to_string())?;
            let icon = tauri::image::Image::from_bytes(&bytes).map_err(|error| error.to_string())?;
            return app.get_window("main").ok_or("WINDOW_NOT_FOUND")?.set_icon(icon).map_err(|error| error.to_string());
        }
        "apiflow:topbar:to:content:topbar-ready" => {
            if view.label() != "topbar" { return Err("INVALID_MESSAGE_SENDER".into()); }
            state.topbar_ready = true;
            if let Some(tabs) = &state.tabs { send(&app, "topbar", "apiflow:topbar:to:content:init-tabs-data", tabs.clone())?; }
        }
        "apiflow:content:to:topbar:content-ready" => {
            if view.label() != "content" { return Err("INVALID_MESSAGE_SENDER".into()); }
            state.content_ready = true;
            crate::content::ready(&app);
        }
        "apiflow:content:to:topbar:init-tabs" => {
            if view.label() != "content" { return Err("INVALID_MESSAGE_SENDER".into()); }
            state.tabs = Some(payload.clone());
            return send(&app, "topbar", "apiflow:topbar:to:content:init-tabs-data", payload);
        }
        "apiflow:content:to:topbar:app-settings-changed" => {
            if let (Some(window), Some(title)) = (app.get_window("main"), payload["appTitle"].as_str()) { window.set_title(title).map_err(|error| error.to_string())?; }
            return send(&app, "topbar", "apiflow:topbar:to:content:app-settings-changed", payload);
        }
        "apiflow:content:to:topbar:create-project" => return send(&app, "content", "apiflow:renderer:to:main:create-project", payload),
        "apiflow:content:to:topbar:show-ai-dialog" => return send(&app, "content", "apiflow:renderer:to:main:show-ai-dialog", payload),
        "apiflow:content:to:topbar:open-mcp-service" => return send(&app, "content", "apiflow:renderer:to:main:open-mcp-service", payload),
        "apiflow:content:to:topbar:switch-project" => return send(&app, "content", "apiflow:renderer:to:main:change-project", payload),
        "apiflow:topbar:to:content:navigate" => return send(&app, "content", "apiflow:renderer:to:main:change-route", payload),
        "apiflow:content:to:topbar:open-settings-tab" => return send(&app, "topbar", "apiflow:topbar:to:content:open-settings-tab", payload),
        "apiflow:content:to:topbar:language-changed" | "apiflow:topbar:to:content:network-mode-changed" => {
            let target = if channel.ends_with("language-changed") { "apiflow:topbar:to:content:language-changed" } else { "apiflow:topbar:to:content:network-mode-changed" };
            if channel.ends_with("language-changed") {
                if let Some(tabs) = state.tabs.as_mut() { tabs["language"] = payload.clone(); }
            }
            if channel.ends_with("network-mode-changed") {
                let mode = payload.as_str().filter(|mode| matches!(*mode, "offline" | "online")).ok_or("INVALID_NETWORK_MODE")?;
                app.state::<crate::settings::Store>().update(|settings| settings.network_mode = Some(mode.to_owned()))?;
                if let Some(tabs) = state.tabs.as_mut() { tabs["networkMode"] = payload.clone(); }
            }
            send(&app, "topbar", target, payload.clone())?;
            send(&app, "executor", target, payload.clone())?;
            return send(&app, "content", target, payload);
        }
        "apiflow:renderer:to:main:refresh-app" | "apiflow:topbar:to:content:reload-after-network-mode-change" => {
            state.topbar_ready = false;
            state.content_ready = false;
            drop(state);
            return super::window_action(app, "reload".into());
        }
        "apiflow:renderer:to:main:refresh-content-view" => {
            state.content_ready = false;
            drop(state);
            return app.get_webview("content").ok_or("VIEW_NOT_FOUND")?.reload().map_err(|error| error.to_string());
        }
        "apiflow:renderer:to:main:go-back" | "apiflow:renderer:to:main:go-forward" => return send(&app, "content", &channel, payload),
        _ => {
            let (target, outgoing) = if let Some(action) = channel.strip_prefix("apiflow:content:to:topbar:") {
                match action {
                    "project-created" | "project-changed" | "project-deleted" | "project-renamed" | "app-settings-changed" => ("topbar", format!("apiflow:topbar:to:content:{action}")),
                    "navigate-to-home" | "navigate-to-login" | "active-tab-updated" | "user-info-changed" | "header-tab-context-action" => ("topbar", channel.clone()),
                    "quick-login-credential-changed" => ("content", channel.clone()),
                    _ => return Err("UNKNOWN_SHELL_MESSAGE".into()),
                }
            } else if let Some(action) = channel.strip_prefix("apiflow:topbar:to:content:") {
                match action {
                    "tabs-updated" => { if let Some(tabs) = state.tabs.as_mut() { tabs["tabs"] = payload.clone(); } }
                    "active-tab-updated" => { if let Some(tabs) = state.tabs.as_mut() { tabs["activeTabId"] = payload.clone(); } }
                    "show-language-menu" | "hide-language-menu" | "show-user-menu" | "hide-user-menu" | "show-header-tab-contextmenu" | "hide-header-tab-contextmenu" | "open-settings-tab" => {}
                    _ => return Err("UNKNOWN_SHELL_MESSAGE".into()),
                }
                ("content", channel.clone())
            } else { return Err("UNKNOWN_SHELL_MESSAGE".into()); };
            return send(&app, target, &outgoing, payload);
        }
    }
    if state.content_ready && state.topbar_ready {
        send(&app, "content", "apiflow:renderer:to:main:topbar-is-ready", Value::Null)?;
        send(&app, "topbar", "apiflow:renderer:to:main:content-is-ready", Value::Null)?;
    }
    Ok(())
}
