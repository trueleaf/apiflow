import { BaseTranslator } from './baseTranslator'
import type { HttpNode, FolderNode } from '@src/types'
import type { ImportFormatType } from '@/composables/useImport'
import { OpenApiTranslator as OriginalOpenApiTranslator, type OpenApiFolderNamedType } from './openapi'
import type { OpenAPIV3, OpenAPIV2 } from 'openapi-types'

// OpenAPI/Swagger 格式解析器
export class OpenApiTranslator extends BaseTranslator {
  type: ImportFormatType
  private document: OpenAPIV3.Document | OpenAPIV2.Document
  private translator: OriginalOpenApiTranslator
  private folderNamedType: OpenApiFolderNamedType = 'tag'
  
  constructor(projectId: string, data: unknown, folderNamedType: OpenApiFolderNamedType = 'tag') {
    super(projectId, data)
    this.document = data as OpenAPIV3.Document | OpenAPIV2.Document
    this.translator = new OriginalOpenApiTranslator(projectId, this.document)
    this.folderNamedType = folderNamedType
    
    // 根据文档类型设置 type
    if ('openapi' in this.document) {
      this.type = 'openapi'
    } else if ('swagger' in this.document) {
      this.type = 'swagger'
    } else {
      this.type = 'unknown'
    }
  }
  
  // 校验数据格式
  validate(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }
    
    const doc = data as OpenAPIV3.Document | OpenAPIV2.Document
    
    // 必须包含 openapi 或 swagger 字段
    if (!('openapi' in doc) && !('swagger' in doc)) {
      return false
    }
    
    // 必须包含 paths 对象
    if (!doc.paths || typeof doc.paths !== 'object') {
      return false
    }
    
    return true
  }
  
  // 解析数据
  parse(data?: unknown): (HttpNode | FolderNode)[] {
    try {
      if (data) {
        const newDocument = data as OpenAPIV3.Document | OpenAPIV2.Document
        this.translator = new OriginalOpenApiTranslator(this.projectId, newDocument)
      }
      
      if (!this.validate(data || this.document)) {
        this.handleError(new Error('Invalid OpenAPI/Swagger document'), '数据验证')
      }
      
      return this.translator.getDocsInfo(this.folderNamedType)
    } catch (error) {
      this.handleError(error, '解析 OpenAPI/Swagger 文档')
    }
  }
  
  // 设置文件夹命名方式
  setFolderNamedType(type: OpenApiFolderNamedType): void {
    this.folderNamedType = type
  }
  
  // 获取基础 URL
  getBaseUrl(): string {
    return this.translator.getBaseUrl()
  }
  
  getName(): string {
    return 'openapi' in this.document ? 'OpenAPI' : 'Swagger'
  }
  
  getVersion(): string {
    if ('openapi' in this.document) {
      return this.document.openapi
    }
    if ('swagger' in this.document) {
      return this.document.swagger
    }
    return 'unknown'
  }
}
