/*
|--------------------------------------------------------------------------
| Agent 消息类型（用于 UI）
|--------------------------------------------------------------------------
*/
export type AskMessage = {
  id: string;
  type: "ask";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type TextResponseMessage = {
  id: string;
  type: "textResponse";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type LoadingMessage = {
  id: string;
  type: "loading";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type AgentMessage = AskMessage | LoadingMessage | TextResponseMessage;

