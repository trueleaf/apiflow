use rquickjs::{Context, Object, Runtime, Value};
use std::time::{Duration, Instant};

pub fn evaluate(code: String, variables: serde_json::Value, timeout: Duration) -> Result<serde_json::Value, String> {
    if !variables.is_object() { return Err("SCRIPT_VARIABLES_MUST_BE_AN_OBJECT".into()); }
    let runtime = Runtime::new().map_err(|error| error.to_string())?;
    runtime.set_memory_limit(64 * 1024 * 1024);
    runtime.set_max_stack_size(1024 * 1024);
    let deadline = Instant::now() + timeout;
    runtime.set_interrupt_handler(Some(Box::new(move || Instant::now() >= deadline)));
    let context = Context::full(&runtime).map_err(|error| error.to_string())?;
    context.with(|context| {
        let input: Object = context.json_parse(variables.to_string()).and_then(|value| Object::from_value(value)).map_err(|error| error.to_string())?;
        for property in input.props::<String, Value>() {
            let (key, value) = property.map_err(|error| error.to_string())?;
            context.globals().set(key, value).map_err(|error| error.to_string())?;
        }
        let result: Value = context.eval(code.as_bytes()).map_err(|error| {
            if Instant::now() >= deadline { return "SCRIPT_TIMEOUT".to_owned(); }
            let exception = context.catch();
            exception.as_object().and_then(|object| object.get::<_, String>("message").ok()).unwrap_or_else(|| error.to_string())
        })?;
        let serialized = context.json_stringify(result).map_err(|error| error.to_string())?;
        match serialized {
            Some(value) => serde_json::from_str(&value.to_string().map_err(|error| error.to_string())?).map_err(|error| error.to_string()),
            None => Ok(serde_json::Value::Null),
        }
    })
}
#[tauri::command]
pub async fn execute_script(code: String, variables: serde_json::Value) -> Result<serde_json::Value, String> {
    tauri::async_runtime::spawn_blocking(move || evaluate(code, variables, Duration::from_secs(1))).await.map_err(|error| error.to_string())?
}
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn evaluates_variables_and_modern_javascript() {
        let result = evaluate("({ total: values.reduce((sum, value) => sum + value, 0), name: user?.name ?? 'unknown' })".into(), json!({"values":[1,2,3], "user":{"name":"ApiFlow"}}), Duration::from_secs(1)).unwrap();
        assert_eq!(result, json!({"total":6,"name":"ApiFlow"}));
    }
    #[test]
    fn interrupts_infinite_loops() {
        let started = Instant::now();
        let error = evaluate("while (true) {}".into(), json!({}), Duration::from_millis(30)).unwrap_err();
        assert_eq!(error, "SCRIPT_TIMEOUT");
        assert!(started.elapsed() < Duration::from_secs(2));
    }
    #[test]
    fn does_not_expose_host_process_or_file_access() {
        let result = evaluate("[typeof process, typeof require, typeof fetch, typeof window]".into(), json!({}), Duration::from_secs(1)).unwrap();
        assert_eq!(result, json!(["undefined", "undefined", "undefined", "undefined"]));
    }
}
