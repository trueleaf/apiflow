use axum::{body::{to_bytes, Body}, extract::State as HttpState, http::{HeaderMap, Method, Request, StatusCode}, response::{IntoResponse, Response}, Router};
use serde_json::{json, Value};
use std::sync::Arc;
use subtle::ConstantTimeEq;
use tauri::{AppHandle, Manager, State};
use tokio::{net::TcpListener, sync::{Mutex, Semaphore}};
use tokio_util::sync::CancellationToken;
use crate::{executor::Executor, settings::{McpSettings, Store}};

#[derive(Default)]
pub struct McpService {
    lifecycle: Mutex<()>,
    running: Mutex<Option<(CancellationToken, tokio::task::JoinHandle<()>)>>,
    error: Mutex<Option<String>>,
}
#[derive(Clone)]
struct ServerContext {
    app: AppHandle,
    settings: McpSettings,
    permits: Arc<Semaphore>,
}
fn local_host(host: &str) -> bool {
    let host = host.to_ascii_lowercase();
    host == "localhost" || host == "127.0.0.1" || host == "[::1]" || host.starts_with("localhost:") || host.starts_with("127.0.0.1:") || host.starts_with("[::1]:")
}
fn authorize(headers: &HeaderMap, token: &str) -> Result<(), StatusCode> {
    if !headers.get("host").and_then(|value| value.to_str().ok()).is_some_and(local_host) { return Err(StatusCode::FORBIDDEN); }
    if let Some(origin) = headers.get("origin") {
        let allowed = origin.to_str().ok().and_then(|value| reqwest::Url::parse(value).ok()).is_some_and(|url| matches!(url.scheme(), "http" | "https") && url.host_str().is_some_and(local_host));
        if !allowed { return Err(StatusCode::FORBIDDEN); }
    }
    let actual = headers.get("authorization").map(|value| value.as_bytes()).unwrap_or_default();
    if !bool::from(actual.ct_eq(format!("Bearer {token}").as_bytes())) { return Err(StatusCode::UNAUTHORIZED); }
    Ok(())
}
async fn handle(HttpState(context): HttpState<ServerContext>, request: Request<Body>) -> Response {
    if let Err(status) = authorize(request.headers(), &context.settings.auth_token) { return (status, status.canonical_reason().unwrap_or_default()).into_response(); }
    if request.method() == Method::OPTIONS { return (StatusCode::NO_CONTENT, [("allow", "POST, OPTIONS")]).into_response(); }
    if request.method() != Method::POST { return (StatusCode::METHOD_NOT_ALLOWED, [("allow", "POST, OPTIONS")]).into_response(); }
    let Ok(_permit) = context.permits.try_acquire() else { return (StatusCode::TOO_MANY_REQUESTS, [("retry-after", "1")]).into_response() };
    let headers: Value = request.headers().iter().map(|(name, value)| (name.to_string(), Value::String(value.to_str().unwrap_or_default().to_owned()))).collect();
    let body = match to_bytes(request.into_body(), 4 * 1024 * 1024).await { Ok(body) => body, Err(_) => return StatusCode::PAYLOAD_TOO_LARGE.into_response() };
    let payload = json!({"body":String::from_utf8_lossy(&body), "headers":headers, "port":context.settings.port, "accessPolicy":{"readOnly":context.settings.read_only,"allowDestructive":context.settings.allow_destructive}});
    match context.app.state::<Executor>().request(&context.app, "mcp:http", payload).await {
        Ok(result) => {
            let status = result["status"].as_u64().and_then(|status| u16::try_from(status).ok()).and_then(|status| StatusCode::from_u16(status).ok()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
            let mut response = (status, result["body"].as_str().unwrap_or_default().to_owned()).into_response();
            if let Some(headers) = result["headers"].as_object() {
                for (name, value) in headers {
                    if let (Ok(name), Some(value)) = (name.parse::<axum::http::HeaderName>(), value.as_str()) {
                        if let Ok(value) = value.parse() { response.headers_mut().insert(name, value); }
                    }
                }
            }
            response
        }
        Err(error) => (StatusCode::SERVICE_UNAVAILABLE, axum::Json(json!({"jsonrpc":"2.0","id":null,"error":{"code":-32603,"message":error}}))).into_response(),
    }
}
impl McpService {
    pub async fn restart(&self, app: &AppHandle) -> Result<(), String> {
        let _lifecycle = self.lifecycle.lock().await;
        if let Some((cancellation, mut task)) = self.running.lock().await.take() {
            cancellation.cancel();
            if tokio::time::timeout(std::time::Duration::from_secs(2), &mut task).await.is_err() { task.abort(); let _ = task.await; }
        }
        *self.error.lock().await = None;
        let settings = app.state::<Store>().data.lock().map_err(|error| error.to_string())?.mcp.clone();
        if !settings.enabled { return Ok(()); }
        let listener = match TcpListener::bind(("127.0.0.1", settings.port)).await {
            Ok(listener) => listener,
            Err(error) => {
                let code = if error.kind() == std::io::ErrorKind::AddrInUse { "PORT_IN_USE" } else { "SERVER_START_FAILED" };
                let message = format!("{code}: {error}");
                *self.error.lock().await = Some(message.clone());
                return Err(message);
            }
        };
        let cancellation = CancellationToken::new();
        let shutdown = cancellation.clone();
        let context = ServerContext { app: app.clone(), settings, permits: Arc::new(Semaphore::new(64)) };
        let router = Router::new().route("/mcp", axum::routing::any(handle)).with_state(context);
        let task = tokio::spawn(async move { let _ = axum::serve(listener, router).with_graceful_shutdown(shutdown.cancelled_owned()).await; });
        *self.running.lock().await = Some((cancellation, task));
        Ok(())
    }
    async fn status(&self, app: &AppHandle) -> Result<Value, String> {
        let settings = app.state::<Store>().data.lock().map_err(|error| error.to_string())?.mcp.clone();
        let error = self.error.lock().await.clone();
        let state = if error.is_some() { "error" } else if self.running.lock().await.is_some() { "running" } else { "stopped" };
        let error_code = error.as_deref().and_then(|message| message.split_once(':')).map(|(code, _)| code).unwrap_or_default();
        Ok(json!({"enabled":settings.enabled,"port":settings.port,"endpoint":format!("http://127.0.0.1:{}/mcp",settings.port),"serverState":state,"executorState":if app.state::<Executor>().is_ready() { "ready" } else { "loading" },"errorCode":error_code,"errorMessage":error.as_deref().unwrap_or_default(),"readOnly":settings.read_only,"allowDestructive":settings.allow_destructive,"authToken":settings.auth_token}))
    }
}
#[tauri::command]
pub async fn mcp_action(app: AppHandle, service: State<'_, McpService>, action: String, settings: Option<Value>) -> Result<Value, String> {
    if action == "settings" {
        let settings = settings.ok_or("MISSING_MCP_SETTINGS")?;
        let port = settings["port"].as_u64().and_then(|port| u16::try_from(port).ok()).filter(|port| *port > 0).ok_or("INVALID_MCP_PORT")?;
        let enabled = settings["enabled"].as_bool().ok_or("INVALID_MCP_SETTINGS")?;
        app.state::<Store>().update(|stored| {
            stored.mcp.port = port;
            stored.mcp.enabled = enabled;
            if let Some(value) = settings["readOnly"].as_bool() { stored.mcp.read_only = value; }
            if let Some(value) = settings["allowDestructive"].as_bool() { stored.mcp.allow_destructive = value; }
        })?;
    }
    if matches!(action.as_str(), "restart" | "settings") { let _ = service.restart(&app).await; }
    else if action != "status" { return Err("INVALID_MCP_ACTION".into()); }
    service.status(&app).await
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_nonlocal_hosts_origins_and_invalid_tokens() {
        let mut headers = HeaderMap::new();
        headers.insert("host", "127.0.0.1:34180".parse().unwrap());
        headers.insert("authorization", "Bearer correct-token".parse().unwrap());
        assert!(authorize(&headers, "correct-token").is_ok());
        assert_eq!(authorize(&headers, "wrong-token"), Err(StatusCode::UNAUTHORIZED));
        headers.insert("origin", "https://untrusted.example".parse().unwrap());
        assert_eq!(authorize(&headers, "correct-token"), Err(StatusCode::FORBIDDEN));
        headers.remove("origin");
        headers.insert("host", "localhost.attacker.example".parse().unwrap());
        assert_eq!(authorize(&headers, "correct-token"), Err(StatusCode::FORBIDDEN));
    }
}
