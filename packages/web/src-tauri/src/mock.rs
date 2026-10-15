use serde_json::{json, Value};
use std::{collections::{HashMap, VecDeque}, sync::{Arc, Mutex}, time::Duration};
use tauri::{AppHandle, State};
use tokio::net::TcpListener;
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct MockNode {
    pub kind: String,
    pub data: Value,
    pub cancellation: CancellationToken,
}
impl MockNode {
    pub fn id(&self) -> &str { self.data["_id"].as_str().unwrap_or_default() }
    pub fn project(&self) -> &str { self.data["projectId"].as_str().unwrap_or_default() }
    pub fn port(&self) -> u16 { self.data["requestCondition"]["port"].as_u64().unwrap_or_default() as u16 }
    pub fn pattern(&self) -> &str { self.data["requestCondition"][if self.kind == "http" { "url" } else { "path" }].as_str().unwrap_or_default() }
}
struct Server {
    kind: String,
    cancellation: CancellationToken,
    task: tokio::task::JoinHandle<()>,
}
#[derive(Default)]
struct Inner {
    nodes: Vec<MockNode>,
    servers: HashMap<u16, Server>,
    variables: HashMap<String, Value>,
    logs: HashMap<String, VecDeque<Value>>,
    pending: HashMap<String, Vec<Value>>,
    flush_scheduled: bool,
}
#[derive(Default, Clone)]
pub struct Mocks {
    inner: Arc<Mutex<Inner>>,
    lifecycle: Arc<tokio::sync::Mutex<()>>,
}
impl Mocks {
    pub fn nodes(&self, port: u16, kind: &str) -> Vec<MockNode> {
        self.inner.lock().map(|inner| inner.nodes.iter().filter(|node| node.port() == port && node.kind == kind).cloned().collect()).unwrap_or_default()
    }
    pub fn variables(&self, project: &str) -> Value {
        self.inner.lock().ok().and_then(|inner| inner.variables.get(project).cloned()).unwrap_or_else(|| json!([]))
    }
    pub fn log(&self, app: &AppHandle, node: &MockNode, kind: &str, data: Value) {
        let log = json!({"id":uuid::Uuid::new_v4().to_string(),"type":kind,"nodeId":node.id(),"projectId":node.project(),"data":data,"timestamp":crate::http::timestamp()});
        let Ok(mut inner) = self.inner.lock() else { return };
        let logs = inner.logs.entry(format!("{}:{}", node.kind, node.id())).or_default();
        logs.push_back(log.clone());
        while logs.len() > 500 { logs.pop_front(); }
        inner.pending.entry(node.kind.clone()).or_default().push(log);
        if inner.flush_scheduled { return; }
        inner.flush_scheduled = true;
        let service = self.clone();
        let app = app.clone();
        tauri::async_runtime::spawn(async move {
            tokio::time::sleep(Duration::from_millis(50)).await;
            let batches = if let Ok(mut inner) = service.inner.lock() { inner.flush_scheduled = false; std::mem::take(&mut inner.pending) } else { return };
            for (kind, logs) in batches {
                let domain = if kind == "http" { "mock" } else { "websocket-mock" };
                let _ = crate::shell::send(&app, "content", &format!("{domain}:main:to:renderer:logs-batch"), json!(logs));
            }
        });
    }
    fn notify_state(&self, app: &AppHandle, node: &MockNode, state: &str) {
        let domain = if node.kind == "http" { "mock" } else { "websocket-mock" };
        let _ = crate::shell::send(app, "content", &format!("{domain}:main:to:renderer:status-changed"), json!({"nodeId":node.id(),"projectId":node.project(),"state":state,"port":node.port()}));
    }
    async fn ensure_server(&self, app: &AppHandle, node: &MockNode) -> Result<(), String> {
        {
            let inner = self.inner.lock().map_err(|error| error.to_string())?;
            if let Some(server) = inner.servers.get(&node.port()) {
                return if server.kind == node.kind { Ok(()) } else { Err("MOCK_PORT_IN_USE".into()) };
            }
        }
        let listener = TcpListener::bind(("0.0.0.0", node.port())).await.map_err(|error| error.to_string())?;
        let cancellation = CancellationToken::new();
        let shutdown = cancellation.clone();
        let context = crate::mock_http::Context { app: app.clone(), port: node.port(), kind: node.kind.clone(), cancellation: cancellation.clone() };
        let router = axum::Router::new().fallback(crate::mock_http::handle).with_state(context);
        let task = tokio::spawn(async move { let _ = axum::serve(listener, router.into_make_service_with_connect_info::<std::net::SocketAddr>()).with_graceful_shutdown(shutdown.cancelled_owned()).await; });
        self.inner.lock().map_err(|error| error.to_string())?.servers.insert(node.port(), Server { kind: node.kind.clone(), cancellation, task });
        Ok(())
    }
    async fn release_unused_port(&self, port: u16) {
        let server = {
            let Ok(mut inner) = self.inner.lock() else { return };
            if inner.nodes.iter().any(|node| node.port() == port) { return; }
            inner.servers.remove(&port)
        };
        if let Some(mut server) = server {
            server.cancellation.cancel();
            if tokio::time::timeout(Duration::from_secs(2), &mut server.task).await.is_err() { server.task.abort(); let _ = server.task.await; }
        }
    }
    pub fn shutdown(&self) {
        if let Ok(inner) = self.inner.lock() {
            for node in &inner.nodes { node.cancellation.cancel(); }
            for server in inner.servers.values() { server.cancellation.cancel(); }
        }
    }
}
#[tauri::command]
pub async fn mock_action(app: AppHandle, services: State<'_, Mocks>, kind: String, action: String, node_id: Option<String>, node: Option<Value>, project_id: Option<String>, variables: Option<Value>) -> Result<Value, String> {
    if !matches!(kind.as_str(), "http" | "websocket") { return Err("INVALID_MOCK_KIND".into()); }
    if matches!(action.as_str(), "get" | "states" | "logs" | "variables") {
        let mut inner = services.inner.lock().map_err(|error| error.to_string())?;
        return match action.as_str() {
            "get" => Ok(inner.nodes.iter().find(|node| node.kind == kind && Some(node.id()) == node_id.as_deref()).map(|node| node.data.clone()).unwrap_or(Value::Null)),
            "states" => Ok(inner.nodes.iter().filter(|node| node.kind == kind && Some(node.project()) == project_id.as_deref()).map(|node| json!({"nodeId":node.id(),"projectId":node.project(),"port":node.port(),"state":"running"})).collect()),
            "logs" => Ok(json!(inner.logs.get(&format!("{kind}:{}", node_id.ok_or("MISSING_NODE_ID")?)).cloned().unwrap_or_default())),
            "variables" => {
                let variables = variables.filter(Value::is_array).ok_or("INVALID_VARIABLES")?;
                inner.variables.insert(project_id.ok_or("MISSING_PROJECT_ID")?, variables);
                Ok(Value::Null)
            }
            _ => unreachable!(),
        };
    }
    let _lifecycle = services.lifecycle.lock().await;
    if action == "stop" {
        let removed = {
            let mut inner = services.inner.lock().map_err(|error| error.to_string())?;
            inner.nodes.iter().position(|node| node.kind == kind && Some(node.id()) == node_id.as_deref()).map(|index| inner.nodes.remove(index))
        };
        if let Some(node) = removed {
            node.cancellation.cancel();
            services.release_unused_port(node.port()).await;
            services.log(&app, &node, "stop", json!({"port":node.port()}));
            services.notify_state(&app, &node, "stopped");
        }
        return Ok(Value::Null);
    }
    if !matches!(action.as_str(), "start" | "replace") { return Err("INVALID_MOCK_ACTION".into()); }
    let data = node.ok_or("MISSING_MOCK_NODE")?;
    if data["_id"].as_str().is_none_or(str::is_empty) || data["projectId"].as_str().is_none_or(str::is_empty) { return Err("INVALID_MOCK_NODE".into()); }
    if action == "replace" && data["_id"].as_str() != node_id.as_deref() { return Err("MOCK_NODE_ID_MISMATCH".into()); }
    let port = data["requestCondition"]["port"].as_u64().filter(|port| *port > 0 && *port <= u16::MAX as u64).ok_or("INVALID_MOCK_PORT")? as u16;
    let next = MockNode { kind: kind.clone(), data, cancellation: CancellationToken::new() };
    if !next.pattern().starts_with('/') { return Err("INVALID_MOCK_PATH".into()); }
    if kind == "http" && (!next.data["response"].is_array() || !next.data["requestCondition"]["method"].is_array()) { return Err("INVALID_MOCK_RESPONSE".into()); }
    let path_in_use = {
        let inner = services.inner.lock().map_err(|error| error.to_string())?;
        kind == "websocket" && inner.nodes.iter().any(|node| node.kind == kind && node.port() == port && node.pattern() == next.pattern() && node.id() != next.id())
    };
    if path_in_use {
        if action == "start" { services.notify_state(&app, &next, "error"); }
        return Err("MOCK_PATH_IN_USE".into());
    }
    if let Err(error) = services.ensure_server(&app, &next).await {
        if action == "start" { services.notify_state(&app, &next, "error"); }
        return Err(error);
    }
    let previous = {
        let mut inner = services.inner.lock().map_err(|error| error.to_string())?;
        if let Some(index) = inner.nodes.iter().position(|node| node.kind == kind && node.id() == next.id()) { Some(std::mem::replace(&mut inner.nodes[index], next.clone())) }
        else { inner.nodes.push(next.clone()); None }
    };
    if let Some(previous) = previous { previous.cancellation.cancel(); services.release_unused_port(previous.port()).await; }
    services.log(&app, &next, "start", json!({"port":port,"path":next.pattern()}));
    services.notify_state(&app, &next, "running");
    Ok(Value::Null)
}
