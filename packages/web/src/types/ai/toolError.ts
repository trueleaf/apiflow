//工具执行错误类型
export type ToolErrorType = 
  | 'NETWORK_ERROR'           //网络请求失败
  | 'VALIDATION_ERROR'        //参数验证失败
  | 'NOT_FOUND'              //资源不存在
  | 'PERMISSION_DENIED'      //权限不足
  | 'LLM_PARSE_ERROR'        //LLM返回解析失败
  | 'DATABASE_ERROR'         //数据库操作失败
  | 'CONFLICT'               //资源冲突
  | 'UNKNOWN'                //未知错误

//工具执行错误响应
export type ToolErrorResponse = {
  code: 1
  error: {
    type: ToolErrorType
    message: string              //i18n key或具体错误消息
    details?: Record<string, unknown>
    retryable: boolean           //是否可重试
    suggestions?: string[]       //修复建议
  }
}

//工具执行成功响应
export type ToolSuccessResponse<T = unknown> = {
  code: 0
  data: T
}

//工具执行响应统一类型
export type ToolResponse<T = unknown> = ToolSuccessResponse<T> | ToolErrorResponse

//创建错误响应的辅助函数
export const createErrorResponse = (
  type: ToolErrorType,
  message: string,
  options?: {
    details?: Record<string, unknown>
    retryable?: boolean
    suggestions?: string[]
  }
): ToolErrorResponse => {
  return {
    code: 1,
    error: {
      type,
      message,
      details: options?.details,
      retryable: options?.retryable ?? (type === 'NETWORK_ERROR' || type === 'UNKNOWN'),
      suggestions: options?.suggestions
    }
  }
}

//创建成功响应的辅助函数
export const createSuccessResponse = <T>(data: T): ToolSuccessResponse<T> => {
  return {
    code: 0,
    data
  }
}
