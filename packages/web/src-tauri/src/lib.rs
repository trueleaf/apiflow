mod files;
mod http;
mod types;
mod websocket;
mod script;
mod shell;
mod executor;
mod settings;
mod mcp;
mod mock;
mod mock_http;
mod content;
mod update;

use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Emitter, LogicalPosition, LogicalSize, Manager, WebviewUrl};
use tauri_plugin_opener::OpenerExt;

const TOPBAR_HEIGHT: f64 = 35.0;
#[tauri::command]
fn desktop_info(app: tauri::AppHandle, webview: tauri::Webview) -> serde_json::Value {
    let ip = std::net::UdpSocket::bind("0.0.0.0:0").and_then(|socket| { socket.connect("192.0.2.1:80")?; socket.local_addr() }).map(|address| address.ip().to_string()).unwrap_or_else(|_| "127.0.0.1".into());
    let mode = app.state::<settings::Store>().data.lock().ok().and_then(|settings| settings.network_mode.clone());
    serde_json::json!({ "version": app.package_info().version.to_string(), "platform": std::env::consts::OS, "view": webview.label(), "ip": ip, "networkMode": mode, "testDataDirectory": settings::test_directory(&app) })
}
#[tauri::command]
fn is_app_store() -> bool { cfg!(feature = "app-store") }
#[tauri::command]
fn window_action(app: tauri::AppHandle, action: String) -> Result<(), String> {
    let window = app.get_window("main").ok_or("WINDOW_NOT_FOUND")?;
    let result = match action.as_str() {
        "minimize" => window.minimize(),
        "maximize" => window.maximize(),
        "unmaximize" => window.unmaximize(),
        "close" => { let _ = shell::send(&app, "content", "desktop:window-hidden", serde_json::Value::Null); window.hide() },
        "drag" => window.start_dragging(),
        "show" => window.unminimize().and_then(|_| window.show()).and_then(|_| window.set_focus()),
        "reload" => {
            for label in ["topbar", "content"] {
                if let Some(view) = app.get_webview(label) { view.reload().map_err(|error| error.to_string())?; }
            }
            Ok(())
        }
        "devtools" => {
            #[cfg(debug_assertions)]
            if let Some(view) = app.get_webview("content") { view.open_devtools(); }
            Ok(())
        }
        _ => return Err("INVALID_WINDOW_ACTION".into()),
    };
    result.map_err(|error| error.to_string())
}
#[tauri::command]
fn window_state(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let window = app.get_window("main").ok_or("WINDOW_NOT_FOUND")?;
    let scale = window.scale_factor().map_err(|error| error.to_string())?;
    let size = window.inner_size().map_err(|error| error.to_string())?.to_logical::<f64>(scale);
    let position = window.outer_position().map_err(|error| error.to_string())?.to_logical::<f64>(scale);
    let maximized = window.is_maximized().map_err(|error| error.to_string())?;
    let minimized = window.is_minimized().map_err(|error| error.to_string())?;
    let fullscreen = window.is_fullscreen().map_err(|error| error.to_string())?;
    Ok(serde_json::json!({ "isMaximized": maximized, "isMinimized": minimized, "isFullScreen": fullscreen,
        "isNormal": !maximized && !minimized && !fullscreen, "isVisible": window.is_visible().unwrap_or(false),
        "isFocused": window.is_focused().unwrap_or(false), "x": position.x, "y": position.y, "width": size.width, "height": size.height }))
}
fn create_window(app: &tauri::App) -> tauri::Result<()> {
    let target = content::configure(app.handle()).map_err(std::io::Error::other)?;
    let executor_target = content::executor_url(app.handle()).map_err(std::io::Error::other)?;
    let mut executor = tauri::WebviewWindowBuilder::new(app, "executor", executor_target).visible(false).skip_taskbar(true).on_page_load(|view, payload| {
        if matches!(payload.event(), tauri::webview::PageLoadEvent::Started) { view.state::<executor::Executor>().reset(); }
    });
    if let Some(directory) = settings::test_directory(app.handle()) { executor = executor.data_directory(directory.join("webview")); }
    executor.build()?;
    let name = app.config().product_name.as_deref().unwrap_or("ApiFlow");
    let window = tauri::window::WindowBuilder::new(app, "main").title(name).decorations(false).maximized(true)
        .inner_size(1280.0, 900.0).min_inner_size(1200.0, 900.0).build()?;
    let size = window.inner_size()?.to_logical::<f64>(window.scale_factor()?);
    let mut topbar = tauri::webview::WebviewBuilder::new("topbar", WebviewUrl::App("header.html".into())).disable_drag_drop_handler();
    if let Some(directory) = settings::test_directory(app.handle()) { topbar = topbar.data_directory(directory.join("webview")); }
    window.add_child(topbar, LogicalPosition::new(0.0, 0.0), LogicalSize::new(size.width, TOPBAR_HEIGHT))?;
    let navigation_app = app.handle().clone();
    let external_app = app.handle().clone();
    let mut content = tauri::webview::WebviewBuilder::new("content", target)
        .on_navigation(move |url| content::allow_navigation(&navigation_app, url))
        .on_new_window(move |url, _| {
            if matches!(url.scheme(), "https" | "http" | "mailto") { let _ = external_app.opener().open_url(url.to_string(), None::<&str>); }
            tauri::webview::NewWindowResponse::Deny
        })
        .on_page_load(|view, payload| {
            if matches!(payload.event(), tauri::webview::PageLoadEvent::Started) { content::started(view.app_handle(), payload.url().as_str()); }
        });
    if let Some(directory) = settings::test_directory(app.handle()) { content = content.data_directory(directory.join("webview")); }
    window.add_child(content, LogicalPosition::new(0.0, TOPBAR_HEIGHT), LogicalSize::new(size.width, size.height - TOPBAR_HEIGHT))?;
    let handle = app.handle().clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = shell::send(&handle, "content", "desktop:window-hidden", serde_json::Value::Null);
            if let Some(window) = handle.get_window("main") { let _ = window.hide(); }
        }
        if matches!(event, tauri::WindowEvent::Resized(_) | tauri::WindowEvent::ScaleFactorChanged { .. }) {
            if let Some(window) = handle.get_window("main") {
                if window.is_minimized().unwrap_or(false) { return; }
                if let (Ok(size), Ok(scale)) = (window.inner_size(), window.scale_factor()) {
                    let logical = size.to_logical::<f64>(scale);
                    if let Some(topbar) = handle.get_webview("topbar") { let _ = topbar.set_size(LogicalSize::new(logical.width, TOPBAR_HEIGHT)); }
                    if let Some(content) = handle.get_webview("content") {
                        let _ = content.set_position(LogicalPosition::new(0.0, TOPBAR_HEIGHT));
                        let _ = content.set_size(LogicalSize::new(logical.width, (logical.height - TOPBAR_HEIGHT).max(0.0)));
                    }
                }
            }
            if let Ok(state) = window_state(handle.clone()) { let _ = handle.emit("desktop-window-state", state); }
        }
    });
    let show = MenuItem::with_id(app, "show", name, true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出 / Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &quit])?;
    let mut tray = TrayIconBuilder::new().menu(&menu).tooltip(name).on_menu_event(|app, event| {
        match event.id.as_ref() {
            "show" => { let _ = window_action(app.clone(), "show".into()); }
            "quit" => app.exit(0),
            _ => {}
        }
    });
    if let Some(icon) = app.default_window_icon() { tray = tray.icon(icon.clone()); }
    tray.build(app)?;
    Ok(())
}
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| { let _ = window_action(app.clone(), "show".into()); }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(http::Requests::default())
        .manage(websocket::Connections::default())
        .manage(executor::Executor::default())
        .manage(mcp::McpService::default())
        .manage(mock::Mocks::default())
        .manage(content::ContentState::default())
        .manage(update::Updates::default())
        .manage(std::sync::Mutex::new(shell::ShellState::default()))
        .invoke_handler(tauri::generate_handler![desktop_info, is_app_store, window_action, window_state, http::http_request, http::http_cancel, files::read_file, files::stage_file, files::temporary_file, files::select_files, files::file_info, files::save_file, websocket::websocket_connect, websocket::websocket_action, script::execute_script, shell::route_message, executor::executor_ready, executor::executor_reply, mcp::mcp_action, mock::mock_action, content::shell_query, content::content_load, update::update_action])
        .setup(|app| {
            app.manage(settings::Store::load(app.handle()).map_err(std::io::Error::other)?);
            tauri::async_runtime::block_on(app.state::<update::Updates>().restore(app.handle())).map_err(std::io::Error::other)?;
            create_window(app)?;
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                let auto_check = handle.state::<settings::Store>().data.lock().is_ok_and(|settings| settings.update["autoCheck"] == true);
                if auto_check && !cfg!(feature = "app-store") { if let Err(error) = handle.state::<update::Updates>().check(&handle).await { let _ = shell::send(&handle, "content", "apiflow:update:error", serde_json::json!({"message":error})); } }
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Failed to build ApiFlow desktop")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                app.state::<mock::Mocks>().shutdown();
                for owner in ["content", "topbar", "executor"] { app.state::<websocket::Connections>().cancel_owner(owner); }
                if let Ok(requests) = app.state::<http::Requests>().0.lock() { for cancellation in requests.values() { cancellation.cancel(); } }
            }
        });
}
