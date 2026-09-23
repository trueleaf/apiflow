use axum::{body::{to_bytes, Body}, extract::{ConnectInfo, State, ws::{WebSocketUpgrade, WebSocket, Message, rejection::WebSocketUpgradeRejection}}, http::{Request, StatusCode}, response::{IntoResponse, Response}};
use base64::Engine;
use futures_util::{StreamExt, FutureExt, stream::FuturesUnordered, future::BoxFuture};
use serde_json::{json, Value};
use std::{net::SocketAddr, time::Duration};
use tauri::{AppHandle, Manager};
use tokio_util::{io::ReaderStream, sync::CancellationToken};
use crate::{executor::Executor, mock::{MockNode, Mocks}};

#[derive(Clone)]
pub struct Context {
    pub app: AppHandle,
    pub port: u16,
    pub kind: String,
    pub cancellation: CancellationToken,
}
pub fn match_path(pattern: &str, path: &str) -> Option<(u32, Value)> {
    if pattern == path { return Some((0, json!({}))); }
    let mut expression = String::from("^");
    let mut names = Vec::new();
    let mut score = 0;
    let mut chars = pattern.chars().peekable();
    while let Some(character) = chars.next() {
        if character == ':' {
            let mut name = String::new();
            while chars.peek().is_some_and(|character| *character != '/') { name.push(chars.next().unwrap()); }
            names.push(name);
            expression.push_str("([^/]+)");
            score += 10;
        } else if character == '*' {
            if chars.peek() == Some(&'*') { chars.next(); expression.push_str(".*"); score += 1000; }
            else { expression.push_str("[^/]*"); score += 100; }
        } else { expression.push_str(&regex::escape(&character.to_string())); }
    }
    expression.push('$');
    let regex = regex::Regex::new(&expression).ok()?;
    let matched = regex.captures(path)?;
    let params = names.into_iter().enumerate().map(|(index, name)| (name, Value::String(matched.get(index + 1).map(|value| value.as_str()).unwrap_or_default().into()))).collect();
    Some((score, Value::Object(params)))
}
pub async fn handle(State(context): State<Context>, ConnectInfo(peer): ConnectInfo<SocketAddr>, upgrade: Result<WebSocketUpgrade, WebSocketUpgradeRejection>, request: Request<Body>) -> Response {
    let services = context.app.state::<Mocks>();
    let mut matches: Vec<_> = services.nodes(context.port, &context.kind).into_iter().filter_map(|node| {
        if node.kind == "http" && !node.data["requestCondition"]["method"].as_array().is_some_and(|methods| methods.iter().any(|method| method.as_str() == Some("ALL") || method.as_str().is_some_and(|method| method.eq_ignore_ascii_case(request.method().as_str())))) { return None; }
        match_path(node.pattern(), request.uri().path()).map(|(priority, params)| (priority, node, params))
    }).collect();
    matches.sort_by_key(|(priority, _, _)| *priority);
    let Some((_, node, params)) = matches.into_iter().next() else { return StatusCode::NOT_FOUND.into_response() };
    if context.kind == "websocket" {
        return match upgrade {
            Ok(upgrade) => upgrade.on_upgrade(move |socket| websocket(context, node, peer, socket)).into_response(),
            Err(error) => error.into_response(),
        };
    }
    let start = crate::http::timestamp();
    let (parts, body) = request.into_parts();
    let body = match to_bytes(body, 64 * 1024 * 1024).await { Ok(body) => body, Err(_) => return StatusCode::PAYLOAD_TOO_LARGE.into_response() };
    let headers: Value = parts.headers.iter().map(|(name, value)| (name.to_string(), Value::String(String::from_utf8_lossy(value.as_bytes()).into_owned()))).collect();
    let host = parts.headers.get("host").and_then(|value| value.to_str().ok()).unwrap_or("localhost");
    let url = match reqwest::Url::parse(&format!("http://{host}{}", parts.uri)) { Ok(url) => url, Err(_) => return StatusCode::BAD_REQUEST.into_response() };
    let query: Value = url.query_pairs().map(|(key, value)| (key.into_owned(), Value::String(value.into_owned()))).collect();
    let body_text = String::from_utf8_lossy(&body).into_owned();
    let request_type = headers["content-type"].as_str().unwrap_or_default();
    let parsed_body: Value = if request_type.contains("json") { serde_json::from_slice(&body).unwrap_or_else(|_| Value::String(body_text.clone())) }
        else if request_type.starts_with("application/x-www-form-urlencoded") { reqwest::Url::parse(&format!("http://localhost/?{body_text}")).map(|url| url.query_pairs().map(|(key, value)| (key.into_owned(), Value::String(value.into_owned()))).collect()).unwrap_or(Value::Null) }
        else { Value::String(body_text.clone()) };
    let cookies: Value = headers["cookie"].as_str().unwrap_or_default().split(';').filter_map(|cookie| cookie.trim().split_once('=')).map(|(name, value)| (name.to_owned(), Value::String(value.to_owned()))).collect();
    let delay = node.data["config"]["delay"].as_u64().unwrap_or_default();
    let req = json!({"method":parts.method.as_str(),"url":parts.uri.to_string(),"originalUrl":parts.uri.to_string(),"path":parts.uri.path(),"search":url.query().map(|query| format!("?{query}")).unwrap_or_default(),"query":query,"headers":headers,"body":parsed_body,"cookies":cookies,"ip":peer.ip().to_string(),"protocol":"http","secure":false,"xhr":headers["x-requested-with"] == "XMLHttpRequest","hostname":url.host_str(),"host":host,"origin":url.origin().ascii_serialization(),"userAgent":headers["user-agent"],"contentType":request_type,"referer":headers["referer"],"authorization":headers["authorization"],"accept":headers["accept"],"acceptLanguage":headers["accept-language"],"acceptEncoding":headers["accept-encoding"],"contentLength":body.len(),"timestamp":start,"params":params});
    let variables = services.variables(node.project());
    let operation = async {
        tokio::time::sleep(Duration::from_millis(delay)).await;
        let result = context.app.state::<Executor>().request(&context.app, "mock:response", json!({"node":node.data,"variables":variables,"request":req})).await?;
        let response = make_response(&context, &node, &variables, &result).await?;
        Ok::<_, String>((response, result))
    };
    let (response, result) = tokio::select! {
        result = operation => match result { Ok(result) => result, Err(error) => {
            services.log(&context.app, &node, "error", json!({"errorType":"unknownError","errorMsg":error}));
            ((StatusCode::INTERNAL_SERVER_ERROR, axum::Json(json!({"error":error}))).into_response(), Value::Null)
        }},
        _ = node.cancellation.cancelled() => return StatusCode::SERVICE_UNAVAILABLE.into_response(),
        _ = context.cancellation.cancelled() => return StatusCode::SERVICE_UNAVAILABLE.into_response(),
    };
    let mut log = json!({"ip":peer.ip().to_string(),"method":parts.method.as_str(),"url":parts.uri.to_string(),"path":parts.uri.path(),"query":url.query().unwrap_or_default(),"httpVersion":format!("{:?}",parts.version).replace("HTTP/", ""),"statusCode":response.status().as_u16(),"bytesSent":0,"referer":headers["referer"].as_str().unwrap_or_default(),"userAgent":headers["user-agent"].as_str().unwrap_or_default(),"responseTime":crate::http::timestamp()-start,"mockDelay":delay,"matchedRoute":node.pattern(),"protocol":"http","hostname":url.host_str(),"contentType":request_type,"contentLength":body.len(),"headers":headers,"body":body_text,"consoleLogs":result["consoleLogs"].as_array().cloned().unwrap_or_default()});
    if request_type.starts_with("image/") || request_type.starts_with("application/octet-stream") { log["bodyRaw"] = Value::String(base64::engine::general_purpose::STANDARD.encode(&body)); }
    services.log(&context.app, &node, "request", log);
    response
}
async fn make_response(context: &Context, node: &MockNode, variables: &Value, result: &Value) -> Result<Response, String> {
    let status = result["status"].as_u64().and_then(|status| u16::try_from(status).ok()).and_then(|status| StatusCode::from_u16(status).ok()).ok_or("INVALID_MOCK_STATUS")?;
    let body = if result["sse"].is_object() {
        let config = result["sse"].clone();
        let interval = config["interval"].as_u64().filter(|value| *value > 0).unwrap_or(100).max(100);
        let maximum = config["maxNum"].as_u64().filter(|value| *value > 0).unwrap_or(10);
        let app = context.app.clone();
        let cancellation = node.cancellation.clone();
        let variables = variables.clone();
        let (sender, receiver) = tokio::sync::mpsc::channel::<Result<String, std::io::Error>>(1);
        tokio::spawn(async move {
            let deadline = tokio::time::sleep(Duration::from_secs(3600));
            tokio::pin!(deadline);
            for index in 0..maximum {
                let step = async {
                    tokio::time::sleep(Duration::from_millis(interval)).await;
                    let text = app.state::<Executor>().request(&app, "mock:sse", json!({"config":config,"variables":variables,"index":index})).await?;
                    sender.send(Ok(text.as_str().unwrap_or_default().to_owned())).await.map_err(|error| error.to_string())
                };
                tokio::select! { result = step => { if result.is_err() { break; } }, _ = sender.closed() => break, _ = cancellation.cancelled() => break, _ = &mut deadline => break }
            }
        });
        Body::from_stream(tokio_stream::wrappers::ReceiverStream::new(receiver))
    } else if result["filePath"].is_string() || result["sample"].is_string() {
        let path = if let Some(extension) = result["sample"].as_str() {
            if !["doc", "docx", "xls", "xlsx", "pdf", "ppt", "pptx", "zip", "7z"].contains(&extension) { return Err("INVALID_SAMPLE_TYPE".into()); }
            context.app.path().resolve(format!("static/sample.{extension}"), tauri::path::BaseDirectory::Resource).map_err(|error| error.to_string())?
        } else { std::path::PathBuf::from(result["filePath"].as_str().unwrap_or_default()) };
        let file = tokio::fs::File::open(path).await.map_err(|error| error.to_string())?;
        Body::from_stream(ReaderStream::new(file))
    } else if let Some(bytes) = result["bytes"].as_array() {
        let bytes: Result<Vec<u8>, _> = bytes.iter().map(|value| value.as_u64().and_then(|value| u8::try_from(value).ok()).ok_or("INVALID_RESPONSE_BYTE")).collect();
        Body::from(bytes?)
    } else { Body::from(result["body"].as_str().unwrap_or_default().to_owned()) };
    let mut response = Response::new(body);
    *response.status_mut() = status;
    if let Some(headers) = result["headers"].as_object() {
        for (name, value) in headers {
            let name = name.parse::<axum::http::HeaderName>().map_err(|error| error.to_string())?;
            let value = value.as_str().ok_or("INVALID_MOCK_HEADER")?.parse::<axum::http::HeaderValue>().map_err(|error| error.to_string())?;
            response.headers_mut().insert(name, value);
        }
    }
    Ok(response)
}
async fn websocket(context: Context, node: MockNode, peer: SocketAddr, mut socket: WebSocket) {
    let services = context.app.state::<Mocks>();
    let client = uuid::Uuid::new_v4().to_string();
    services.log(&context.app, &node, "connect", json!({"clientId":client,"ip":peer.ip().to_string()}));
    let mut pending: FuturesUnordered<BoxFuture<'static, Result<(String, &'static str), String>>> = FuturesUnordered::new();
    let mut close = (1000, String::new());
    loop {
        tokio::select! {
            _ = node.cancellation.cancelled() => { let _ = socket.send(Message::Close(None)).await; break; }
            _ = context.cancellation.cancelled() => break,
            result = pending.next(), if !pending.is_empty() => {
                match result {
                    Some(Ok((message, kind))) => {
                        if socket.send(Message::Text(message.clone().into())).await.is_err() { break; }
                        services.log(&context.app, &node, "send", json!({"clientId":client,"content":message,"size":message.len(),"messageType":kind}));
                    }
                    Some(Err(error)) => services.log(&context.app, &node, "error", json!({"errorType":"unknownError","errorMsg":error})),
                    None => {}
                }
            }
            message = socket.next(), if pending.len() < 64 => match message {
                Some(Ok(Message::Text(message))) => queue_message(&mut pending, &context, &node, &client, message.to_string()),
                Some(Ok(Message::Binary(message))) => queue_message(&mut pending, &context, &node, &client, String::from_utf8_lossy(&message).into_owned()),
                Some(Ok(Message::Close(frame))) => { if let Some(frame) = frame { close = (frame.code, frame.reason.to_string()); } break; }
                Some(Err(error)) => { close = (1006, error.to_string()); break; }
                None => break,
                _ => {}
            }
        }
    }
    services.log(&context.app, &node, "disconnect", json!({"clientId":client,"code":close.0,"reason":close.1}));
}
fn queue_message(pending: &mut FuturesUnordered<BoxFuture<'static, Result<(String, &'static str), String>>>, context: &Context, node: &MockNode, client: &str, message: String) {
    context.app.state::<Mocks>().log(&context.app, node, "receive", json!({"clientId":client,"content":message,"size":message.len()}));
    let echo = node.data["config"]["echoMode"].as_bool().unwrap_or(false);
    let template = node.data["response"]["content"].as_str().unwrap_or_default().to_owned();
    if !echo && template.is_empty() { return; }
    let delay = node.data["config"]["delay"].as_u64().unwrap_or_default();
    let app = context.app.clone();
    let variables = app.state::<Mocks>().variables(node.project());
    pending.push(async move {
        tokio::time::sleep(Duration::from_millis(delay)).await;
        if echo { return Ok((message, "echo")); }
        let result = app.state::<Executor>().request(&app, "mock:template", json!({"template":template,"variables":variables})).await?;
        Ok((result.as_str().unwrap_or_default().to_owned(), "response"))
    }.boxed());
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn matches_parameters_and_wildcards_with_explicit_precedence() {
        assert_eq!(match_path("/users/me", "/users/me"), Some((0, json!({}))));
        assert_eq!(match_path("/users/:id", "/users/42"), Some((10, json!({"id":"42"}))));
        assert!(match_path("/files/*", "/files/a/b").is_none());
        assert_eq!(match_path("/files/**", "/files/a/b"), Some((1000, json!({}))));
        assert!(match_path("/file.json", "/fileXjson").is_none());
    }
}
