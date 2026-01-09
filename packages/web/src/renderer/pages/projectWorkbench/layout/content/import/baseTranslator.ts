import type { HttpNode, FolderNode } from '@src/types'
import type { ImportFormatType } from '@/composables/useImport'

// 解析器接口
export interface ITranslator {
  // 解析器类型
  type: ImportFormatType
  // 解析数据并返回节点列表
  parse(data: unknown): Promise<(HttpNode | FolderNode)[]> | (HttpNode | FolderNode)[]
  // 校验数据格式是否符合当前解析器
  validate(data: unknown): boolean
  // 获取解析器名称
  getName(): string
  // 获取解析器版本
  getVersion(): string
}

// 解析器基类
export abstract class BaseTranslator implements ITranslator {
  abstract type: ImportFormatType
  protected projectId: string
  protected rawData: unknown
  
  constructor(projectId: string, data?: unknown) {
    this.projectId = projectId
    this.rawData = data
  }
  
  abstract parse(data?: unknown): Promise<(HttpNode | FolderNode)[]> | (HttpNode | FolderNode)[]
  abstract validate(data: unknown): boolean
  abstract getName(): string
  abstract getVersion(): string
  
  // 处理错误
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[${this.getName()}] ${context}: ${message}`)
  }
}
