// ============================================================================
// 基础工具类型模块
// 只包含最基础的、无依赖的工具类型
// ============================================================================

// ============================================================================
// 基础工具类型
// ============================================================================

export type Property = {
  _id: string;
  key: string;
  value: string;
  type: "string" | "file";
  description: string;
  select: boolean;
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type JsonData = string | number | boolean | null | JsonData[] | { [key: string]: JsonData };

// ============================================================================
// 语言类型
// ============================================================================

export type Language = 'zh-cn' | 'zh-tw' | 'en' | 'ja';

// ============================================================================
// 沙箱通信类型
// ============================================================================

export type SandboxEvalMessage = {
  type: "eval",
  code: string;
}

export type SandboxEvalSuccessMessage = {
  type: "evalSuccess",
  data: string;
}

export type SandboxErrorMessage = {
  type: "error",
  msg: string;
}

export type SandboxReceiveMessage = SandboxEvalMessage
export type SandboxPostMessage = SandboxErrorMessage | SandboxEvalSuccessMessage
