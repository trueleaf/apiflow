use super::*;
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::{io::{AsyncReadExt, AsyncWriteExt}, net::TcpListener};

#[tokio::test]
async fn reuses_tcp_connection_across_requests_without_leaking_headers() {
    let client = create_client().unwrap();
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    let counts = Arc::new(Mutex::new(HashMap::new()));
    // 由服务端按真实 TCP 对端计数，验证默认及显式 keep-alive 共用连接
    let app = axum::Router::new().route("/", axum::routing::get(move |axum::extract::ConnectInfo(peer): axum::extract::ConnectInfo<std::net::SocketAddr>, headers: axum::http::HeaderMap| {
        let counts = counts.clone();
        async move {
            let count = {
                let mut counts = counts.lock().unwrap();
                let count = counts.entry(peer).or_insert(0_usize);
                *count += 1;
                *count
            };
            axum::Json(json!({"port":peer.port(), "count":count, "marker":headers.get("x-marker").and_then(|value| value.to_str().ok())}))
        }
    }));
    let server = tokio::spawn(async move { axum::serve(listener, app.into_make_service_with_connect_info::<std::net::SocketAddr>()).await.unwrap(); });
    let mut port = None;
    for (index, headers) in [json!({"X-Marker":"first"}), json!({"Connection":"keep-alive", "X-Marker":"second"}), json!({})].into_iter().enumerate() {
        let messages = Arc::new(Mutex::new(Vec::<Value>::new()));
        let captured = messages.clone();
        let output = Channel::new(move |body| { captured.lock().unwrap().push(body.deserialize::<Value>().unwrap()); Ok(()) });
        let options = serde_json::from_value(json!({"requestId":format!("keep-alive-{index}"), "url":format!("http://{address}/"), "method":"GET", "headers":headers, "timeout":5000, "followRedirect":false, "maxRedirects":0, "maxSendFileSize":0})).unwrap();
        tokio::time::timeout(Duration::from_secs(5), run_request(&client, options, &output)).await.unwrap().unwrap();
        let messages = messages.lock().unwrap();
        let bytes: Vec<u8> = messages.iter().filter_map(|item| item["data"].as_array()).flatten().map(|byte| byte.as_u64().unwrap() as u8).collect();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["count"], index + 1, "连续请求应复用同一条 TCP 连接");
        if let Some(port) = port { assert_eq!(body["port"].as_u64(), Some(port)); }
        else { port = body["port"].as_u64(); }
        assert_eq!(body["marker"], [json!("first"), json!("second"), Value::Null][index], "请求头不得在共享客户端上残留");
        assert_eq!(messages.last().unwrap()["kind"], "end");
    }
    server.abort();
    let _ = server.await;
}
#[tokio::test]
async fn respects_connection_close_from_client_and_server() {
    let client = create_client().unwrap();
    for close_source in ["client", "server"] {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let counts = Arc::new(Mutex::new(HashMap::new()));
        // 分别由请求头和响应头关闭连接，后续请求应新建连接并继续复用
        let app = axum::Router::new().route("/{action}", axum::routing::get(move |axum::extract::ConnectInfo(peer): axum::extract::ConnectInfo<std::net::SocketAddr>, axum::extract::Path(action): axum::extract::Path<String>| {
            let counts = counts.clone();
            async move {
                let count = {
                    let mut counts = counts.lock().unwrap();
                    let count = counts.entry(peer).or_insert(0_usize);
                    *count += 1;
                    *count
                };
                let mut headers = axum::http::HeaderMap::new();
                if action == "server" { headers.insert(axum::http::header::CONNECTION, axum::http::HeaderValue::from_static("close")); }
                (headers, axum::Json(json!({"port":peer.port(), "count":count})))
            }
        }));
        let server = tokio::spawn(async move { axum::serve(listener, app.into_make_service_with_connect_info::<std::net::SocketAddr>()).await.unwrap(); });
        let mut responses = Vec::new();
        for index in 0..3 {
            let messages = Arc::new(Mutex::new(Vec::<Value>::new()));
            let captured = messages.clone();
            let output = Channel::new(move |body| { captured.lock().unwrap().push(body.deserialize::<Value>().unwrap()); Ok(()) });
            let action = if index == 0 { close_source } else { "keep" };
            let headers = if index == 0 && close_source == "client" { json!({"Connection":"close"}) } else { json!({}) };
            let options = serde_json::from_value(json!({"requestId":format!("close-{index}"), "url":format!("http://{address}/{action}"), "method":"GET", "headers":headers, "timeout":5000, "followRedirect":false, "maxRedirects":0, "maxSendFileSize":0})).unwrap();
            tokio::time::timeout(Duration::from_secs(5), run_request(&client, options, &output)).await.unwrap().unwrap();
            let messages = messages.lock().unwrap();
            let bytes: Vec<u8> = messages.iter().filter_map(|item| item["data"].as_array()).flatten().map(|byte| byte.as_u64().unwrap() as u8).collect();
            responses.push(serde_json::from_slice::<Value>(&bytes).unwrap());
            assert_eq!(messages.last().unwrap()["kind"], "end");
        }
        assert_eq!(responses[0]["count"], 1);
        assert_eq!(responses[1]["count"], 1);
        assert_eq!(responses[2]["count"], 2, "重建后的 TCP 连接应能继续复用");
        assert_ne!(responses[0]["port"], responses[1]["port"], "Connection: close 后必须重新建连");
        assert_eq!(responses[1]["port"], responses[2]["port"]);
        server.abort();
        let _ = server.await;
    }
}
#[tokio::test]
async fn receives_http_errors_and_duplicate_cookies_without_losing_body() {
    let client = create_client().unwrap();
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    // 返回 HTTP 错误及多个 Cookie，验证错误响应仍可被 API 调试器查看
    let server = tokio::spawn(async move {
        let (mut socket, _) = listener.accept().await.unwrap();
        let mut request = [0_u8; 4096];
        socket.read(&mut request).await.unwrap();
        socket.write_all(b"HTTP/1.1 422 Unprocessable Entity\r\nContent-Length: 7\r\nContent-Type: application/json\r\nSet-Cookie: first=1\r\nSet-Cookie: second=2\r\nConnection: close\r\n\r\n{\"a\":1}").await.unwrap();
    });
    let messages = Arc::new(Mutex::new(Vec::<Value>::new()));
    let captured = messages.clone();
    let output = Channel::new(move |body| { captured.lock().unwrap().push(body.deserialize::<Value>().unwrap()); Ok(()) });
    let options = serde_json::from_value(json!({"requestId":"cookies", "url":format!("http://{address}/"), "method":"GET", "headers":{}, "timeout":5000, "followRedirect":true, "maxRedirects":5, "maxSendFileSize":0})).unwrap();
    tokio::time::timeout(Duration::from_secs(5), run_request(&client, options, &output)).await.unwrap().unwrap();
    server.await.unwrap();
    let messages = messages.lock().unwrap();
    assert_eq!(messages[0]["response"]["status"], 422);
    assert_eq!(messages[0]["response"]["headers"]["set-cookie"], json!(["first=1", "second=2"]));
    let bytes: Vec<u8> = messages.iter().filter_map(|item| item["data"].as_array()).flatten().map(|byte| byte.as_u64().unwrap() as u8).collect();
    assert_eq!(bytes, b"{\"a\":1}");
    assert_eq!(messages.last().unwrap()["kind"], "end");
}
#[tokio::test]
async fn follows_post_redirect_without_leaking_credentials_to_another_origin() {
    let client = create_client().unwrap();
    let source = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let destination = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let source_address = source.local_addr().unwrap();
    let destination_address = destination.local_addr().unwrap();
    // 跨端口重定向属于跨来源，目标服务不得收到原来源凭据
    let first = tokio::spawn(async move {
        let (mut socket, _) = source.accept().await.unwrap();
        let mut buffer = [0_u8; 4096];
        socket.read(&mut buffer).await.unwrap();
        socket.write_all(format!("HTTP/1.1 302 Found\r\nLocation: http://{destination_address}/next\r\nContent-Length: 0\r\nConnection: close\r\n\r\n").as_bytes()).await.unwrap();
    });
    let second = tokio::spawn(async move {
        let (mut socket, _) = destination.accept().await.unwrap();
        let mut buffer = [0_u8; 4096];
        let size = socket.read(&mut buffer).await.unwrap();
        let request = String::from_utf8_lossy(&buffer[..size]).to_lowercase();
        assert!(request.starts_with("get /next http/1.1"));
        assert!(!request.contains("authorization:"));
        assert!(!request.contains("cookie:"));
        assert!(!request.contains("content-type:"));
        socket.write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok").await.unwrap();
    });
    let messages = Arc::new(Mutex::new(Vec::<Value>::new()));
    let captured = messages.clone();
    let output = Channel::new(move |body| { captured.lock().unwrap().push(body.deserialize::<Value>().unwrap()); Ok(()) });
    let options = serde_json::from_value(json!({"requestId":"redirect", "url":format!("http://{source_address}/"), "method":"POST", "headers":{"Authorization":"secret", "Cookie":"session=secret", "Content-Type":"application/json"}, "body":{"kind":"json", "text":"{}"}, "timeout":5000, "followRedirect":true, "maxRedirects":5, "maxSendFileSize":0})).unwrap();
    tokio::time::timeout(Duration::from_secs(5), run_request(&client, options, &output)).await.unwrap().unwrap();
    first.await.unwrap();
    second.await.unwrap();
    let messages = messages.lock().unwrap();
    assert_eq!(messages[0]["kind"], "redirect");
    assert_eq!(messages[1]["response"]["status"], 200);
}
#[tokio::test]
async fn streams_sse_before_the_server_finishes() {
    let client = create_client().unwrap();
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    let (continue_sender, continue_receiver) = tokio::sync::oneshot::channel();
    // 服务端必须等客户端收到首段数据后才能完成，避免把缓冲整包误当成流式响应
    let server = tokio::spawn(async move {
        let (mut socket, _) = listener.accept().await.unwrap();
        let mut request = [0_u8; 4096];
        socket.read(&mut request).await.unwrap();
        socket.write_all(b"HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nTransfer-Encoding: chunked\r\nConnection: close\r\n\r\n9\r\ndata: 1\n\n\r\n").await.unwrap();
        continue_receiver.await.unwrap();
        socket.write_all(b"9\r\ndata: 2\n\n\r\n0\r\n\r\n").await.unwrap();
    });
    let sender = Mutex::new(Some(continue_sender));
    let messages = Arc::new(Mutex::new(Vec::<Value>::new()));
    let captured = messages.clone();
    let output = Channel::new(move |body| {
        let value: Value = body.deserialize().unwrap();
        if value["kind"] == "data" { if let Some(sender) = sender.lock().unwrap().take() { sender.send(()).unwrap(); } }
        captured.lock().unwrap().push(value);
        Ok(())
    });
    let options = serde_json::from_value(json!({"requestId":"stream", "url":format!("http://{address}/"), "method":"GET", "headers":{}, "timeout":5000, "followRedirect":false, "maxRedirects":0, "maxSendFileSize":0})).unwrap();
    tokio::time::timeout(Duration::from_secs(5), run_request(&client, options, &output)).await.unwrap().unwrap();
    server.await.unwrap();
    let messages = messages.lock().unwrap();
    assert!(messages.iter().filter(|item| item["kind"] == "data").count() >= 2);
    assert_eq!(messages.last().unwrap()["kind"], "end");
}
#[tokio::test]
async fn multipart_generates_a_matching_boundary_and_repeated_fields() {
    let client = create_client().unwrap();
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    // 用户提供的 Content-Type 不得覆盖原生 multipart 自动生成的 boundary
    let server = tokio::spawn(async move {
        let (mut socket, _) = listener.accept().await.unwrap();
        let mut request = Vec::new();
        loop {
            let mut buffer = [0_u8; 4096];
            let count = socket.read(&mut buffer).await.unwrap();
            assert!(count > 0);
            request.extend_from_slice(&buffer[..count]);
            if let Some(end) = request.windows(4).position(|window| window == b"\r\n\r\n") {
                let header = String::from_utf8_lossy(&request[..end]);
                let length: usize = header.lines().find_map(|line| line.to_lowercase().strip_prefix("content-length: ").map(str::to_owned)).unwrap().parse().unwrap();
                if request.len() >= end + 4 + length { break; }
            }
        }
        let text = String::from_utf8(request).unwrap();
        let content_type = text.lines().find(|line| line.to_lowercase().starts_with("content-type:")).unwrap();
        let boundary = content_type.split("boundary=").nth(1).unwrap();
        assert!(text.contains(&format!("--{boundary}\r\n")));
        assert_eq!(text.matches("name=\"tag\"").count(), 2);
        assert!(text.contains("\r\n\r\none\r\n"));
        assert!(text.contains("\r\n\r\ntwo\r\n"));
        socket.write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n").await.unwrap();
    });
    let output = Channel::new(|_| Ok(()));
    let options = serde_json::from_value(json!({"requestId":"multipart", "url":format!("http://{address}/"), "method":"POST", "headers":{"Content-Type":"multipart/form-data"}, "body":{"kind":"formdata", "fields":[{"id":"1", "key":"tag", "kind":"string", "value":"one"}, {"id":"2", "key":"tag", "kind":"string", "value":"two"}]}, "timeout":5000, "followRedirect":false, "maxRedirects":0, "maxSendFileSize":0})).unwrap();
    tokio::time::timeout(Duration::from_secs(5), run_request(&client, options, &output)).await.unwrap().unwrap();
    server.await.unwrap();
}
