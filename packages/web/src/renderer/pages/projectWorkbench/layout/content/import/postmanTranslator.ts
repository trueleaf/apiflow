import { BaseTranslator } from './baseTranslator'
import type { HttpNode, FolderNode } from '@src/types'
import type { ImportFormatType } from '@/composables/useImport'
import { PostmanTranslator as OriginalPostmanTranslator } from './postman'
import type { PostmanCollection } from '@/composables/useImport'

// Postman 格式解析器
export class PostmanTranslator extends BaseTranslator {
  type: ImportFormatType = 'postman'
  private collection: PostmanCollection
  private translator: OriginalPostmanTranslator
  
  constructor(projectId: string, data: unknown) {
    super(projectId, data)
    this.collection = data as PostmanCollection
    this.translator = new OriginalPostmanTranslator(projectId, this.collection)
  }
  
  // 校验数据格式
  validate(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }
    
    const collection = data as PostmanCollection
    
    // 必须包含 info 对象和 _postman_id
    if (!collection.info || typeof collection.info !== 'object') {
      return false
    }
    
    if (!collection.info._postman_id) {
      return false
    }
    
    // 必须包含 item 数组
    if (!Array.isArray(collection.item)) {
      return false
    }
    
    return true
  }
  
  // 解析数据
  parse(data?: unknown): (HttpNode | FolderNode)[] {
    try {
      if (data) {
        const newCollection = data as PostmanCollection
        this.translator = new OriginalPostmanTranslator(this.projectId, newCollection)
      }
      
      if (!this.validate(data || this.collection)) {
        this.handleError(new Error('Invalid Postman Collection'), '数据验证')
      }
      
      return this.translator.getDocsInfo()
    } catch (error) {
      this.handleError(error, '解析 Postman Collection')
    }
  }
  
  // 获取 Collection 信息
  getCollectionInfo(): { name: string; version: string } {
    return {
      name: this.collection.info.name,
      version: this.collection.info.schema || '2.1',
    }
  }
  
  getName(): string {
    return 'Postman Collection'
  }
  
  getVersion(): string {
    return this.collection.info.schema || '2.1'
  }
}
