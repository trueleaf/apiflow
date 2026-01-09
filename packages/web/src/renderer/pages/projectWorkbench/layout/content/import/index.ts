// 导出所有解析器类和相关类型
export * from './baseTranslator'
export * from './translatorFactory'
export * from './apiflowTranslator'
export * from './openApiTranslator'
export * from './postmanTranslator'
export * from './aiTranslator'

// 自动注册所有解析器
import { translatorFactory } from './translatorFactory'
import { ApiflowTranslator } from './apiflowTranslator'
import { OpenApiTranslator } from './openApiTranslator'
import { PostmanTranslator } from './postmanTranslator'

// 注册标准解析器（AI 解析器不注册，作为兜底方案）
translatorFactory.register('apiflow', ApiflowTranslator)
translatorFactory.register('openapi', OpenApiTranslator)
translatorFactory.register('swagger', OpenApiTranslator)
translatorFactory.register('postman', PostmanTranslator)
