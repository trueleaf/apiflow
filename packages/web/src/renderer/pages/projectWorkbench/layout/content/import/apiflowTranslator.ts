import { BaseTranslator } from './baseTranslator'
import type { HttpNode, FolderNode } from '@src/types'
import type { ImportFormatType } from '@/composables/useImport'

// ApiFlow 文档格式
interface ApiflowDocument {
  type: 'apiflow'
  version?: string
  docs: (HttpNode | FolderNode)[]
  info?: {
    projectName: string
    version?: string
  }
  hosts?: Array<{
    _id: string
    name: string
    url: string
  }>
}

// ApiFlow 格式解析器
export class ApiflowTranslator extends BaseTranslator {
  type: ImportFormatType = 'apiflow'
  private document: ApiflowDocument
  
  constructor(projectId: string, data: unknown) {
    super(projectId, data)
    this.document = data as ApiflowDocument
  }
  
  // 校验数据格式
  validate(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }
    
    const doc = data as ApiflowDocument
    
    // 必须包含 type 字段且值为 'apiflow'
    if (doc.type !== 'apiflow') {
      return false
    }
    
    // 必须包含 docs 数组
    if (!Array.isArray(doc.docs)) {
      return false
    }
    
    return true
  }
  
  // 解析数据
  parse(data?: unknown): (HttpNode | FolderNode)[] {
    try {
      const document = (data || this.document) as ApiflowDocument
      
      if (!this.validate(document)) {
        this.handleError(new Error('Invalid ApiFlow document'), '数据验证')
      }
      
      // 更新节点的 projectId
      const nodes = document.docs.map(node => ({
        ...node,
        projectId: this.projectId,
      }))
      
      // 版本兼容处理
      return this.handleVersionCompatibility(nodes, document.version || '1.0')
    } catch (error) {
      this.handleError(error, '解析 ApiFlow 文档')
    }
  }
  
  // 处理版本兼容性
  private handleVersionCompatibility(
    nodes: (HttpNode | FolderNode)[],
    version: string
  ): (HttpNode | FolderNode)[] {
    // 当前版本为 1.0，暂时无需特殊处理
    // 未来版本升级时在此处添加兼容逻辑
    
    if (version.startsWith('1.')) {
      return nodes
    }
    
    console.warn(`ApiFlow 版本 ${version} 可能与当前版本不完全兼容`)
    return nodes
  }
  
  // 获取项目信息
  getProjectInfo(): { projectName: string; version: string } | null {
    if (!this.document.info) {
      return null
    }
    
    return {
      projectName: this.document.info.projectName,
      version: this.document.info.version || '1.0',
    }
  }
  
  getName(): string {
    return 'ApiFlow'
  }
  
  getVersion(): string {
    return this.document.version || '1.0'
  }
}
