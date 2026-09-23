use crate::types::{HttpEvent, HttpRequest, ResponseHead};
use futures_util::StreamExt;
use reqwest::{header, multipart, Client, Method, Url};
use std::{collections::HashMap, path::Path, sync::Mutex, time::{Duration, SystemTime, UNIX_EPOCH}};
use tauri::{ipc::Channel, State, Webview};
use tokio_util::{io::ReaderStream, sync::CancellationToken};

#[derive(Default)]
pub struct Requests(pub Mutex<HashMap<(String, String), CancellationToken>>);
impl Requests {
    pub fn cancel_owner(&self, owner: &str) {
        if let Ok(requests) = self.0.lock() { for ((view, _), token) in requests.iter() { if view == owner { token.cancel(); } } }
    }
}
pub fn timestamp() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64
}
fn event(kind: &'static str) -> HttpEvent {
    HttpEvent { kind, timestamp: timestamp(), response: None, data: None, message: None, field_id: None }
}
async fn file_part(path: &str, limit: u64) -> Result<multipart::Part, String> {
    let file = tokio::fs::File::open(path).await.map_err(|error| error.to_string())?;
    let metadata = file.metadata().await.map_err(|error| error.to_string())?;
    if !metadata.is_file() { return Err("NOT_A_FILE".into()); }
    if limit != 0 && metadata.len() > limit { return Err("FILE_SIZE_LIMIT".into()); }
    let name = Path::new(path).file_name().and_then(|value| value.to_str()).ok_or("INVALID_FILE_NAME")?;
    let mime = if name.ends_with(".ts") { "text/plain".to_owned() } else { mime_guess::from_path(path).first_or_octet_stream().to_string() };
    multipart::Part::stream_with_length(reqwest::Body::wrap_stream(ReaderStream::new(file)), metadata.len())
        .file_name(name.to_owned()).mime_str(&mime).map_err(|error| error.to_string())
}
async fn run_request(options: HttpRequest, output: &Channel<HttpEvent>) -> Result<(), String> {
    let client = Client::builder().redirect(reqwest::redirect::Policy::none()).build().map_err(|error| error.to_string())?;
    let mut url = Url::parse(&options.url).map_err(|error| error.to_string())?;
    if !matches!(url.scheme(), "http" | "https") { return Err("UNSUPPORTED_URL_SCHEME".into()); }
    let mut method = Method::from_bytes(options.method.to_uppercase().as_bytes()).map_err(|error| error.to_string())?;
    let mut headers = header::HeaderMap::new();
    for (name, value) in &options.headers {
        if options.body.as_ref().is_some_and(|body| body.kind == "formdata") && name.eq_ignore_ascii_case("content-type") { continue; }
        if let Some(value) = value {
            headers.insert(header::HeaderName::from_bytes(name.as_bytes()).map_err(|error| error.to_string())?, header::HeaderValue::from_str(value).map_err(|error| error.to_string())?);
        }
    }
    let mut body = options.body.clone();
    let mut redirects = 0;
    loop {
        let mut request = client.request(method.clone(), url.clone()).headers(headers.clone());
        if let Some(body) = &body {
            match body.kind.as_str() {
                "formdata" => {
                    let mut form = multipart::Form::new();
                    for field in &body.fields {
                        if field.kind == "file" {
                            let part = match file_part(&field.value, options.max_send_file_size).await {
                                Ok(part) => part,
                                Err(message) => {
                                    let mut failure = event("file-error");
                                    failure.message = Some(message);
                                    failure.field_id = Some(field.id.clone());
                                    output.send(failure).map_err(|error| error.to_string())?;
                                    return Ok(());
                                }
                            };
                            form = form.part(field.key.clone(), part);
                        } else if field.is_temp_file {
                            let text = tokio::fs::read_to_string(&field.value).await.map_err(|error| error.to_string())?;
                            form = form.text(field.key.clone(), text);
                        } else {
                            form = form.text(field.key.clone(), field.value.clone());
                        }
                    }
                    request = request.multipart(form);
                }
                "binary" => {
                    let source = async {
                        let file = tokio::fs::File::open(&body.path).await.map_err(|error| error.to_string())?;
                        let metadata = file.metadata().await.map_err(|error| error.to_string())?;
                        if !metadata.is_file() { return Err("NOT_A_FILE".to_owned()); }
                        if options.max_send_file_size != 0 && metadata.len() > options.max_send_file_size { return Err("FILE_SIZE_LIMIT".to_owned()); }
                        Ok((file, metadata))
                    }.await;
                    let (file, metadata) = match source {
                        Ok(source) => source,
                        Err(message) => {
                            let mut failure = event("file-error");
                            failure.message = Some(message);
                            output.send(failure).map_err(|error| error.to_string())?;
                            return Ok(());
                        }
                    };
                    request = request.header(header::CONTENT_LENGTH, metadata.len()).body(reqwest::Body::wrap_stream(ReaderStream::new(file)));
                }
                "json" | "raw" | "urlencoded" => request = request.body(body.text.clone()),
                _ => return Err("INVALID_BODY_KIND".into()),
            }
        }
        let built = request.build().map_err(|error| error.to_string())?;
        let request_headers = built.headers().iter().map(|(name, value)| (name.to_string(), value.to_str().unwrap_or_default().to_owned())).collect();
        let response = client.execute(built).await.map_err(|error| error.to_string())?;
        let status = response.status();
        let response_headers = response.headers().keys().map(|name| {
            (name.to_string(), response.headers().get_all(name).iter().map(|value| String::from_utf8_lossy(value.as_bytes()).into_owned()).collect())
        }).collect();
        let head = ResponseHead {
            url: url.to_string(), status: status.as_u16(), status_text: status.canonical_reason().unwrap_or_default().into(),
            headers: response_headers, request_headers, method: method.to_string(),
            remote_address: response.remote_addr().map(|address| address.ip().to_string()).unwrap_or_default(), timestamp: timestamp(),
        };
        if options.follow_redirect && matches!(status.as_u16(), 301 | 302 | 303 | 307 | 308) {
            if let Some(location) = response.headers().get(header::LOCATION) {
                if redirects >= options.max_redirects { return Err("MAX_REDIRECTS_EXCEEDED".into()); }
                let next = url.join(location.to_str().map_err(|error| error.to_string())?).map_err(|error| error.to_string())?;
                if !matches!(next.scheme(), "http" | "https") { return Err("UNSUPPORTED_REDIRECT_SCHEME".into()); }
                let mut redirect = event("redirect");
                redirect.response = Some(head);
                output.send(redirect).map_err(|error| error.to_string())?;
                if url.origin() != next.origin() {
                    headers.remove(header::AUTHORIZATION);
                    headers.remove(header::COOKIE);
                    headers.remove(header::PROXY_AUTHORIZATION);
                }
                headers.remove(header::HOST);
                if (status.as_u16() == 303 && method != Method::HEAD) || (matches!(status.as_u16(), 301 | 302) && method == Method::POST) {
                    method = Method::GET;
                    body = None;
                    headers.remove(header::CONTENT_TYPE);
                    headers.remove(header::CONTENT_LENGTH);
                    headers.remove(header::TRANSFER_ENCODING);
                }
                redirects += 1;
                url = next;
                continue;
            }
        }
        let mut response_event = event("response");
        response_event.response = Some(head);
        output.send(response_event).map_err(|error| error.to_string())?;
        let mut stream = response.bytes_stream();
        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|error| error.to_string())?;
            let mut data = event("data");
            data.data = Some(chunk.to_vec());
            output.send(data).map_err(|error| error.to_string())?;
        }
        output.send(event("end")).map_err(|error| error.to_string())?;
        return Ok(());
    }
}
#[tauri::command]
pub async fn http_request(webview: Webview, requests: State<'_, Requests>, options: HttpRequest, output: Channel<HttpEvent>) -> Result<(), String> {
    if options.request_id.is_empty() { return Err("MISSING_REQUEST_ID".into()); }
    let key = (webview.label().to_owned(), options.request_id.clone());
    let cancellation = CancellationToken::new();
    {
        let mut active = requests.0.lock().map_err(|error| error.to_string())?;
        if active.contains_key(&key) { return Err("DUPLICATE_REQUEST_ID".into()); }
        active.insert(key.clone(), cancellation.clone());
    }
    if let Err(error) = output.send(event("start")) {
        requests.0.lock().map_err(|error| error.to_string())?.remove(&key);
        return Err(error.to_string());
    }
    let timeout = options.timeout;
    let run = async {
        if timeout == 0 { run_request(options, &output).await }
        else { tokio::time::timeout(Duration::from_millis(timeout), run_request(options, &output)).await.map_err(|_| "REQUEST_TIMEOUT".to_owned())? }
    };
    let result = tokio::select! {
        result = run => result,
        _ = cancellation.cancelled() => output.send(event("abort")).map_err(|error| error.to_string()),
    };
    requests.0.lock().map_err(|error| error.to_string())?.remove(&key);
    if let Err(message) = result {
        let mut failure = event("error");
        failure.message = Some(message);
        output.send(failure).map_err(|error| error.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn http_cancel(webview: Webview, requests: State<'_, Requests>, request_id: String) -> Result<(), String> {
    if let Some(cancellation) = requests.0.lock().map_err(|error| error.to_string())?.get(&(webview.label().to_owned(), request_id)) {
        cancellation.cancel();
    }
    Ok(())
}

#[cfg(test)]
#[path = "http_tests.rs"]
mod tests;
