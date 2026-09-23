fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(tauri_build::AppManifest::new().commands(&[
        "desktop_info", "is_app_store", "window_action", "window_state", "http_request", "http_cancel",
        "read_file", "stage_file", "temporary_file", "select_files", "file_info", "save_file",
        "websocket_connect", "websocket_action", "execute_script", "route_message", "executor_ready", "executor_reply", "mcp_action", "mock_action", "shell_query", "content_load", "update_action",
    ]))).expect("Failed to generate desktop capabilities");
}
