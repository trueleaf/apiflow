use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use std::{collections::HashMap, sync::{Arc, Mutex}, time::Duration};
use tauri::{Emitter, State, Webview};
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::{client::IntoClientRequest, http::header::{HeaderName, HeaderValue}, Message}};
use tokio_util::sync::CancellationToken;

struct Connection {
    owner: String,
    node_id: String,
    state: u8,
    sender: mpsc::Sender<Message>,
    cancellation: CancellationToken,
}
#[derive(Default, Clone)]
pub struct Connections(Arc<Mutex<HashMap<String, Connection>>>);
fn notify(view: &Webview, kind: &str, payload: Value) {
    let _ = view.emit_to(tauri::EventTarget::Webview { label: view.label().to_owned() }, "desktop-message", json!({"channel":format!("websocket:main:to:renderer:{kind}"), "payload":payload}));
}
#[tauri::command]
pub async fn websocket_connect(view: Webview, connections: State<'_, Connections>, url: String, node_id: String, headers: HashMap<String, String>) -> Result<String, String> {
    let mut request = url.clone().into_client_request().map_err(|error| error.to_string())?;
    for (name, value) in headers {
        request.headers_mut().insert(HeaderName::from_bytes(name.as_bytes()).map_err(|error| error.to_string())?, HeaderValue::from_str(&value).map_err(|error| error.to_string())?);
    }
    let connection_id = uuid::Uuid::new_v4().to_string();
    let cancellation = CancellationToken::new();
    let (sender, mut receiver) = mpsc::channel(64);
    let state = connections.inner().clone();
    {
        let mut active = state.0.lock().map_err(|error| error.to_string())?;
        for connection in active.values().filter(|connection| connection.owner == view.label() && connection.node_id == node_id) { connection.cancellation.cancel(); }
        active.insert(connection_id.clone(), Connection { owner: view.label().to_owned(), node_id: node_id.clone(), state: 0, sender, cancellation: cancellation.clone() });
    }
    let id = connection_id.clone();
    tauri::async_runtime::spawn(async move {
        let result = tokio::select! {
            result = tokio::time::timeout(Duration::from_secs(30), connect_async(request)) => result.map_err(|_| "WEBSOCKET_CONNECT_TIMEOUT".to_owned()).and_then(|result| result.map_err(|error| error.to_string())),
            _ = cancellation.cancelled() => Err("WEBSOCKET_CANCELLED".into()),
        };
        match result {
            Ok((mut socket, _)) => {
                if let Ok(mut active) = state.0.lock() { if let Some(connection) = active.get_mut(&id) { connection.state = 1; } }
                notify(&view, "opened", json!({"connectionId":id, "nodeId":node_id, "url":url}));
                let mut close_code = 1000;
                let mut close_reason = String::new();
                loop {
                    tokio::select! {
                        _ = cancellation.cancelled() => { let _ = tokio::time::timeout(Duration::from_secs(2), socket.close(None)).await; break; }
                        outgoing = receiver.recv() => {
                            let Some(message) = outgoing else { break };
                            if let Err(error) = socket.send(message).await {
                                close_code = 1006;
                                close_reason = error.to_string();
                                notify(&view, "error", json!({"connectionId":id, "nodeId":node_id, "url":url, "error":close_reason}));
                                break;
                            }
                        }
                        incoming = socket.next() => match incoming {
                            Some(Ok(message)) if message.is_text() || message.is_binary() => {
                                let is_text = message.is_text();
                                let data = message.into_data();
                                let content_type = if is_text { "text" } else { "binary" };
                                let mime = if is_text {
                                    if serde_json::from_slice::<Value>(&data).is_ok() { "application/json" } else { "text/plain" }
                                } else { infer::get(&data).map(|kind| kind.mime_type()).unwrap_or("application/octet-stream") };
                                notify(&view, "message", json!({"connectionId":id, "nodeId":node_id, "url":url, "message":data.to_vec(), "mimeType":mime, "contentType":content_type}));
                            }
                            Some(Ok(Message::Close(frame))) => {
                                if let Some(frame) = frame { close_code = frame.code.into(); close_reason = frame.reason.to_string(); }
                                let _ = socket.flush().await;
                                break;
                            }
                            Some(Ok(Message::Ping(_))) => { let _ = socket.flush().await; }
                            Some(Err(error)) => {
                                close_code = 1006;
                                close_reason = error.to_string();
                                notify(&view, "error", json!({"connectionId":id, "nodeId":node_id, "url":url, "error":close_reason}));
                                break;
                            }
                            None => { close_code = 1006; break; }
                            _ => {}
                        }
                    }
                }
                notify(&view, "closed", json!({"connectionId":id, "nodeId":node_id, "url":url, "code":close_code, "reason":close_reason}));
            }
            Err(error) => notify(&view, "error", json!({"connectionId":id, "nodeId":node_id, "url":url, "error":error})),
        }
        if let Ok(mut active) = state.0.lock() { active.remove(&id); }
    });
    Ok(connection_id)
}
#[tauri::command]
pub async fn websocket_action(view: Webview, connections: State<'_, Connections>, action: String, connection_id: Option<String>, node_id: Option<String>, message: Option<String>) -> Result<Value, String> {
    if action == "send" {
        let sender = {
            let active = connections.0.lock().map_err(|error| error.to_string())?;
            let connection = active.get(connection_id.as_deref().ok_or("MISSING_CONNECTION_ID")?).filter(|connection| connection.owner == view.label()).ok_or("CONNECTION_NOT_FOUND")?;
            if connection.state != 1 || connection.cancellation.is_cancelled() { return Err("CONNECTION_NOT_OPEN".into()); }
            connection.sender.clone()
        };
        sender.send(Message::Text(message.ok_or("MISSING_MESSAGE")?.into())).await.map_err(|error| error.to_string())?;
        return Ok(Value::Null);
    }
    let mut active = connections.0.lock().map_err(|error| error.to_string())?;
    match action.as_str() {
        "list" => Ok(Value::Array(active.iter().filter(|(_, connection)| connection.owner == view.label()).map(|(id, connection)| json!({"connectionId":id, "state":connection.state, "nodeId":connection.node_id})).collect())),
        "state" => {
            let connection = active.get(connection_id.as_deref().ok_or("MISSING_CONNECTION_ID")?).filter(|connection| connection.owner == view.label()).ok_or("CONNECTION_NOT_FOUND")?;
            Ok(json!({"state":connection.state}))
        }
        "node" => Ok(active.iter().find(|(_, connection)| connection.owner == view.label() && Some(&connection.node_id) == node_id.as_ref() && !connection.cancellation.is_cancelled()).map(|(id, connection)| json!({"connected":connection.state == 1, "connectionId":id, "state":connection.state})).unwrap_or(json!({"connected":false}))),
        "disconnect" | "disconnect-node" | "clear" => {
            let mut count = 0;
            for (id, connection) in active.iter_mut().filter(|(_, connection)| connection.owner == view.label()) {
                if action == "clear" || connection_id.as_ref() == Some(id) || (action == "disconnect-node" && node_id.as_ref() == Some(&connection.node_id)) {
                    connection.state = 2;
                    connection.cancellation.cancel();
                    count += 1;
                }
            }
            if action != "clear" && count == 0 { return Err("CONNECTION_NOT_FOUND".into()); }
            Ok(json!({"closedCount":count}))
        }
        _ => Err("INVALID_WEBSOCKET_ACTION".into()),
    }
}
impl Connections {
    pub fn cancel_owner(&self, owner: &str) {
        if let Ok(active) = self.0.lock() { for connection in active.values().filter(|connection| connection.owner == owner) { connection.cancellation.cancel(); } }
    }
}
