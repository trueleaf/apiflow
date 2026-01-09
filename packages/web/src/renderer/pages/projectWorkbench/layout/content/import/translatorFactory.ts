import type { ITranslator } from './baseTranslator'
import type { ImportFormatType } from '@/composables/useImport'
import type { HttpNode, FolderNode } from '@src/types'
import { config } from '@src/config/config'
import jsyaml from 'js-yaml'

// 解析器注册表
type TranslatorConstructor = new (projectId: string, data?: unknown) => ITranslator

class TranslatorFactory {
  private translators: Map<ImportFormatType, TranslatorConstructor> = new Map()
  
  // 注册解析器
  register(type: ImportFormatType, translator: TranslatorConstructor): void {
    if (this.translators.has(type)) {
      console.warn(`解析器 ${type} 已存在，将被覆盖`)
    }
    this.translators.set(type, translator)
  }
  
  // 注销解析器
  unregister(type: ImportFormatType): boolean {
    return this.translators.delete(type)
  }
  
  // 获取所有已注册的解析器类型
  getSupportedTypes(): ImportFormatType[] {
    return Array.from(this.translators.keys())
  }
  
  // 检测数据格式
  detectFormat(data: unknown): ImportFormatType {
    if (!data || typeof data !== 'object') {
      return 'unknown'
    }
    
    const obj = data as Record<string, unknown>
    
    // 检测 ApiFlow 格式
    if (obj.type === 'apiflow' && Array.isArray(obj.docs)) {
      return 'apiflow'
    }
    
    // 检测 OpenAPI 3.x
    if (obj.openapi && typeof obj.openapi === 'string') {
      return 'openapi'
    }
    
    // 检测 Swagger 2.x
    if (obj.swagger && typeof obj.swagger === 'string') {
      return 'swagger'
    }
    
    // 检测 Postman Collection
    if (obj.info && typeof obj.info === 'object') {
      const info = obj.info as Record<string, unknown>
      if (info._postman_id) {
        return 'postman'
      }
    }
    
    return 'unknown'
  }
  
  // 解析文件内容（YAML 自动转为 JSON）
  parseFileContent(content: string, fileType: string): unknown {
    try {
      // YAML 格式
      if (fileType === 'yaml' || fileType === 'application/x-yaml' || fileType === 'text/yaml' || fileType === 'yml') {
        return jsyaml.load(content)
      }
      // JSON 格式
      return JSON.parse(content)
    } catch (error) {
      throw new Error(`文件解析失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // 创建解析器实例
  create(projectId: string, data: unknown): ITranslator | null {
    const type = this.detectFormat(data)
    
    if (type === 'unknown') {
      return null
    }
    
    const TranslatorClass = this.translators.get(type)
    if (!TranslatorClass) {
      console.warn(`未找到类型为 ${type} 的解析器`)
      return null
    }
    
    return new TranslatorClass(projectId, data)
  }
  
  // 解析数据
  async parse(projectId: string, data: unknown): Promise<{
    success: boolean
    nodes?: (HttpNode | FolderNode)[]
    error?: string
    type?: ImportFormatType
  }> {
    try {
      const translator = this.create(projectId, data)
      
      if (!translator) {
        return {
          success: false,
          error: '不支持的文档格式',
          type: 'unknown',
        }
      }
      
      // 验证数据
      if (!translator.validate(data)) {
        return {
          success: false,
          error: `${translator.getName()} 格式验证失败`,
          type: translator.type,
        }
      }
      
      // 解析数据
      const nodes = await translator.parse(data)
      
      return {
        success: true,
        nodes,
        type: translator.type,
      }
    } catch (error) {
      const isDev = config.renderConfig.env === 'development' || import.meta.env.DEV
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      return {
        success: false,
        error: isDev ? errorMessage : '文档解析失败，请检查文档格式是否正确',
      }
    }
  }
  
  // 检查 AI 解析是否可用
  checkAiAvailable(): { available: boolean; reason?: string } {
    try {
      const { llmProviderCache } = require('@/cache/ai/llmProviderCache')
      const config = llmProviderCache.getLLMProvider()
      
      if (!config) {
        return {
          available: false,
          reason: '未配置 AI 服务',
        }
      }
      
      if (!config.apiKey || !config.apiKey.trim()) {
        return {
          available: false,
          reason: '未配置 API Key',
        }
      }
      
      if (!config.baseURL || !config.baseURL.trim()) {
        return {
          available: false,
          reason: '未配置 API 地址',
        }
      }
      
      return { available: true }
    } catch (error) {
      return {
        available: false,
        reason: '无法获取 AI 配置',
      }
    }
  }
  
  // 尝试使用 AI 解析（兜底方案）
  async tryAiParse(projectId: string, data: unknown): Promise<{
    success: boolean
    nodes?: (HttpNode | FolderNode)[]
    error?: string
  }> {
    const aiCheck = this.checkAiAvailable()
    
    if (!aiCheck.available) {
      return {
        success: false,
        error: `无法使用 AI 解析: ${aiCheck.reason}。建议前往设置页面配置 AI 服务。`,
      }
    }
    
    try {
      const { AiImportTranslator } = await import('./aiImport')
      const translator = new AiImportTranslator(projectId)
      
      if (!translator.isAvailable()) {
        return {
          success: false,
          error: 'AI 服务暂时不可用',
        }
      }
      
      const nodes = await translator.analyze(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
      
      return {
        success: true,
        nodes,
      }
    } catch (error) {
      const isDev = config.renderConfig.env === 'development' || import.meta.env.DEV
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      return {
        success: false,
        error: isDev ? `AI 解析失败: ${errorMessage}` : 'AI 智能识别失败，请检查文档格式或联系技术支持',
      }
    }
  }
}

// 导出单例
export const translatorFactory = new TranslatorFactory()
