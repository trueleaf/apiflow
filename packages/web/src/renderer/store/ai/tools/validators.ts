import type { ToolErrorResponse } from '@src/types/ai/toolError'
import { createErrorResponse } from '@src/types/ai/toolError'

//验证规则配置
export type ValidationSchema = {
  required?: string[]
  optional?: string[]
  validators?: Record<string, (value: unknown) => boolean | string>
}

//验证结果
export type ValidationResult<T = Record<string, unknown>> = {
  valid: boolean
  errors: string[]
  data: T
}

//通用参数验证函数
export const validateToolArgs = <T = Record<string, unknown>>(
  args: Record<string, unknown>,
  schema: ValidationSchema
): ValidationResult<T> => {
  const errors: string[] = []
  const data: Record<string, unknown> = {}
  
  //检查必填字段
  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in args) || args[key] === undefined || args[key] === null || args[key] === '') {
        errors.push(`Missing required parameter: ${key}`)
      } else {
        data[key] = args[key]
      }
    }
  }
  
  //复制可选字段
  if (schema.optional) {
    for (const key of schema.optional) {
      if (key in args && args[key] !== undefined && args[key] !== null) {
        data[key] = args[key]
      }
    }
  }
  
  //执行自定义验证
  if (schema.validators) {
    for (const [key, validator] of Object.entries(schema.validators)) {
      if (key in args && args[key] !== undefined && args[key] !== null) {
        const result = validator(args[key])
        if (result === false) {
          errors.push(`Invalid value for parameter: ${key}`)
        } else if (typeof result === 'string') {
          errors.push(result)
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: data as T
  }
}

//创建验证失败的错误响应
export const createValidationErrorResponse = (errors: string[]): ToolErrorResponse => {
  return createErrorResponse('VALIDATION_ERROR', 'tools.errors.validationFailed', {
    details: { errors },
    retryable: false,
    suggestions: errors.map(e => `Fix: ${e}`)
  })
}

//预定义的常用验证器
export const validators = {
  //非空字符串
  isNonEmptyString: (v: unknown): boolean | string => {
    if (typeof v !== 'string') return 'Expected string type'
    if (v.trim().length === 0) return 'String cannot be empty'
    return true
  },
  
  //有效的节点ID
  isValidNodeId: (v: unknown): boolean | string => {
    if (typeof v !== 'string') return 'Node ID must be string'
    if (v.length === 0) return 'Node ID cannot be empty'
    return true
  },
  
  //有效的项目ID
  isValidProjectId: (v: unknown): boolean | string => {
    if (typeof v !== 'string') return 'Project ID must be string'
    if (v.length === 0) return 'Project ID cannot be empty'
    return true
  },
  
  //有效的HTTP方法
  isValidMethod: (v: unknown): boolean | string => {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
    if (typeof v !== 'string') return 'HTTP method must be string'
    if (!validMethods.includes(v.toUpperCase())) {
      return `HTTP method must be one of: ${validMethods.join(', ')}`
    }
    return true
  },
  
  //有效的Content-Type
  isValidContentType: (v: unknown): boolean | string => {
    const validTypes = [
      '', 'application/json', 'application/x-www-form-urlencoded', 
      'multipart/form-data', 'text/plain', 'application/xml', 
      'text/html', 'text/javascript', 'application/octet-stream'
    ]
    if (typeof v !== 'string') return 'Content-Type must be string'
    if (!validTypes.includes(v)) {
      return `Content-Type must be one of: ${validTypes.join(', ')}`
    }
    return true
  },
  
  //有效的Body模式
  isValidBodyMode: (v: unknown): boolean | string => {
    const validModes = ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none']
    if (typeof v !== 'string') return 'Body mode must be string'
    if (!validModes.includes(v)) {
      return `Body mode must be one of: ${validModes.join(', ')}`
    }
    return true
  },
  
  //有效的URL路径
  isValidUrlPath: (v: unknown): boolean | string => {
    if (typeof v !== 'string') return 'URL path must be string'
    if (!v.startsWith('/')) return 'URL path must start with /'
    if (v.includes(' ')) return 'URL path cannot contain spaces'
    return true
  },
  
  //字符串长度限制
  maxLength: (max: number) => (v: unknown): boolean | string => {
    if (typeof v !== 'string') return 'Expected string type'
    if (v.length > max) return `String length cannot exceed ${max} characters`
    return true
  },
  
  //数组验证
  isArray: (v: unknown): boolean | string => {
    if (!Array.isArray(v)) return 'Expected array type'
    return true
  },
  
  //非空数组
  isNonEmptyArray: (v: unknown): boolean | string => {
    if (!Array.isArray(v)) return 'Expected array type'
    if (v.length === 0) return 'Array cannot be empty'
    return true
  },
  
  //对象验证
  isObject: (v: unknown): boolean | string => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) {
      return 'Expected object type'
    }
    return true
  },
  
  //布尔值验证
  isBoolean: (v: unknown): boolean | string => {
    if (typeof v !== 'boolean') return 'Expected boolean type'
    return true
  },
  
  //数字验证
  isNumber: (v: unknown): boolean | string => {
    if (typeof v !== 'number' || isNaN(v)) return 'Expected valid number'
    return true
  },
  
  //JSON字符串验证
  isValidJson: (v: unknown): boolean | string => {
    if (typeof v !== 'string') return 'Expected string type'
    try {
      JSON.parse(v)
      return true
    } catch {
      return 'Invalid JSON format'
    }
  }
}
