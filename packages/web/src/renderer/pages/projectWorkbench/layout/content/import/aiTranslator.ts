import { BaseTranslator } from './baseTranslator'
import type { HttpNode, FolderNode } from '@src/types'
import type { ImportFormatType } from '@/composables/useImport'
import { AiImportTranslator as OriginalAiImportTranslator } from './aiImport'

// AI 智能识别解析器
export class AiTranslator extends BaseTranslator {
  type: ImportFormatType = 'ai'
  private translator: OriginalAiImportTranslator
  private rawContent: string
  
  constructor(projectId: string, data: unknown) {
    super(projectId, data)
    this.rawContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    this.translator = new OriginalAiImportTranslator(projectId)
  }
  
  // 校验数据格式 (AI 可以处理任意格式)
  validate(data: unknown): boolean {
    if (!data) {
      return false
    }
    
    // AI 解析器可以处理任意格式的数据
    return true
  }
  
  // 检查 AI 是否可用
  isAvailable(): boolean {
    return this.translator.isAvailable()
  }
  
  // 解析数据
  async parse(data?: unknown): Promise<(HttpNode | FolderNode)[]> {
    try {
      const content = data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : this.rawContent
      
      if (!this.translator.isAvailable()) {
        this.handleError(new Error('AI service is not available'), 'AI 可用性检查')
      }
      
      return await this.translator.analyze(content)
    } catch (error) {
      this.handleError(error, 'AI 智能识别')
    }
  }
  
  getName(): string {
    return 'AI 智能识别'
  }
  
  getVersion(): string {
    return '1.0'
  }
}
