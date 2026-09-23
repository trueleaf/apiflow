use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestBody {
    pub kind: String,
    #[serde(default)]
    pub text: String,
    #[serde(default)]
    pub path: String,
    #[serde(default)]
    pub fields: Vec<FormField>,
}
#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormField {
    pub id: String,
    pub key: String,
    pub value: String,
    pub kind: String,
    #[serde(default)]
    pub is_temp_file: bool,
}
#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub request_id: String,
    pub url: String,
    pub method: String,
    pub headers: BTreeMap<String, Option<String>>,
    pub body: Option<RequestBody>,
    pub timeout: u64,
    pub follow_redirect: bool,
    pub max_redirects: usize,
    pub max_send_file_size: u64,
}
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseHead {
    pub url: String,
    pub status: u16,
    pub status_text: String,
    pub headers: BTreeMap<String, Vec<String>>,
    pub request_headers: BTreeMap<String, String>,
    pub method: String,
    pub remote_address: String,
    pub timestamp: u64,
}
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpEvent {
    pub kind: &'static str,
    pub timestamp: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response: Option<ResponseHead>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_id: Option<String>,
}
