import { ref, computed, type Ref } from 'vue'
import jsyaml from 'js-yaml'
import type { HttpNode, FolderNode } from '@src/types'
import { config } from '@src/config/config'
import { nanoid } from 'nanoid'
import { useI18n } from 'vue-i18n'

// 支持的导入来源类型
export type ImportSourceType = 'file' | 'url' | 'paste'
// 支持的文档格式类型
export type ImportFormatType = 'apiflow' | 'openapi' | 'swagger' | 'postman' | 'ai' | 'repository' | 'unknown'
// ApiFlow 标准格式
export type ApiflowDocument = {
  type: 'apiflow'
  docs: HttpNode[]
  info: {
    projectName: string
  }
}
// Postman Collection 格式
export type PostmanCollection = {
  info: {
    _postman_id: string
    name: string
    schema: string
  }
  item: PostmanItem[]
  variable?: PostmanVariable[]
}
export type PostmanItem = {
  name: string
  request?: {
    method: string
    header: { key: string; value: string; disabled?: boolean }[]
    url: {
      raw: string
      host?: string[]
      path?: string[]
      query?: { key: string; value: string; disabled?: boolean }[]
    }
    body?: {
      mode: string
      raw?: string
      formdata?: { key: string; value: string; type: string }[]
      urlencoded?: { key: string; value: string }[]
    }
  }
  item?: PostmanItem[]
  response?: unknown[]
}
export type PostmanVariable = {
  key: string
  value: string
}
// 导入类型信息
export type ImportTypeInfo = {
  name: ImportFormatType
  version: string
}
// 表单信息
export type ImportFormInfo = {
  moyuData: {
    docs: (HttpNode | FolderNode)[]
  }
  type: ImportFormatType
  cover: boolean
}
// 识别文档格式
export const detectDocumentFormat = (data: unknown): ImportTypeInfo => {
  if (!data || typeof data !== 'object') {
    return { name: 'unknown', version: '' }
  }
  const doc = data as Record<string, unknown>
  if (doc.type === 'apiflow') {
    return { name: 'apiflow', version: '1.0' }
  }
  if (doc.openapi && typeof doc.openapi === 'string') {
    return { name: 'openapi', version: doc.openapi }
  }
  if (doc.swagger && typeof doc.swagger === 'string') {
    return { name: 'swagger', version: doc.swagger }
  }
  if (doc.info && typeof doc.info === 'object') {
    const info = doc.info as Record<string, unknown>
    if (info._postman_id) {
      return { name: 'postman', version: '2.1' }
    }
  }
  return { name: 'unknown', version: '' }
}
// 解析文件内容（支持 JSON 和 YAML）
export const parseFileContent = (content: string, fileType: string): unknown => {
  if (fileType === 'yaml' || fileType === 'application/x-yaml' || fileType === 'text/yaml') {
    return jsyaml.load(content)
  }
  return JSON.parse(content)
}
// 验证文件大小和格式
export const validateFile = (file: File, t: (key: string) => string): { valid: boolean; error?: string; fileType: string } => {
  const standardFileType = file.type
  const matchSuffix = file.name.match(/(?<=\.)[^.]+$/)
  const suffixFileType = matchSuffix ? matchSuffix[0] : ''
  const fileType = standardFileType || suffixFileType
  if (!standardFileType && !suffixFileType) {
    return { valid: false, error: t('未知的文件格式，无法解析'), fileType: '' }
  }
  const supportedTypes = ['application/json', 'json', 'yaml', 'application/x-yaml', 'text/yaml', 'yml']
  if (!supportedTypes.includes(fileType)) {
    return { valid: false, error: t('仅支持JSON格式或者YAML格式文件'), fileType: '' }
  }
  if (file.size > config.renderConfig.importProjectConfig.maxSize) {
    const maxSizeMB = config.renderConfig.importProjectConfig.maxSize / 1024 / 1024
    return { valid: false, error: `${t('文件大小不超过')}${maxSizeMB}M`, fileType: '' }
  }
  return { valid: true, fileType }
}
// 生成唯一ID
export const generateId = (): string => nanoid()
// 创建空的 HttpNode
export const createEmptyHttpNode = (projectId: string, pid = ''): HttpNode => ({
  _id: generateId(),
  pid,
  projectId,
  sort: 0,
  info: {
    name: '',
    description: '',
    version: '',
    type: 'http',
    creator: '',
    maintainer: '',
    deletePerson: '',
  },
  item: {
    method: 'get',
    url: {
      prefix: '',
      path: '',
    },
    paths: [],
    queryParams: [],
    requestBody: {
      mode: 'none',
      rawJson: '',
      formdata: [],
      urlencoded: [],
      raw: {
        data: '',
        dataType: 'text/plain',
      },
      binary: {
        mode: 'file',
        varValue: '',
        binaryValue: {
          path: '',
          raw: '',
          id: '',
        },
      },
    },
    responseParams: [],
    headers: [],
    contentType: '',
  },
  preRequest: {
    raw: '',
  },
  afterRequest: {
    raw: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
})
// 创建空的 FolderNode
export const createEmptyFolderNode = (projectId: string, name: string, pid = ''): FolderNode => ({
  _id: generateId(),
  pid,
  projectId,
  sort: 0,
  info: {
    name,
    description: '',
    version: '',
    type: 'folder',
    creator: '',
    maintainer: '',
    deletePerson: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
})
// 树节点类型（带 children 属性）
type TreeNode = (HttpNode | FolderNode) & { children?: TreeNode[] }
// useImport composable
export const useImport = () => {
  const { t } = useI18n()
  const currentSourceType: Ref<ImportSourceType> = ref('file')
  const importTypeInfo: Ref<ImportTypeInfo> = ref({ name: 'unknown', version: '' })
  const formInfo: Ref<ImportFormInfo> = ref({
    moyuData: { docs: [] },
    type: 'unknown',
    cover: false,
  })
  const rawContent: Ref<string> = ref('')
  const parsedData: Ref<unknown> = ref(null)
  const loading = ref(false)
  const error: Ref<string> = ref('')
  // 统计信息
  const stats = computed(() => {
    const docs = formInfo.value.moyuData.docs || []
    return {
      docCount: docs.filter(v => v.info.type !== 'folder').length,
      folderCount: docs.filter(v => v.info.type === 'folder').length,
    }
  })
  // 预览树形数据
  const previewTreeData = computed(() => {
    const docs = formInfo.value.moyuData.docs || []
    const result: TreeNode[] = []
    for (let i = 0; i < docs.length; i += 1) {
      const docInfo = docs[i] as TreeNode
      if (!docInfo.pid) {
        docInfo.children = []
        result.push(docInfo)
      }
      const id = docInfo._id.toString()
      for (let j = 0; j < docs.length; j += 1) {
        if (id === docs[j].pid) {
          if (!docInfo.children) {
            docInfo.children = []
          }
          docInfo.children.push(docs[j] as TreeNode)
        }
      }
    }
    const sortItems = (items: TreeNode[]) => {
      return items.sort((a, b) => {
        if (a.info.type === 'folder' && b.info.type !== 'folder') return -1
        if (a.info.type !== 'folder' && b.info.type === 'folder') return 1
        const aSort = a.sort ?? Number.MAX_SAFE_INTEGER
        const bSort = b.sort ?? Number.MAX_SAFE_INTEGER
        if (aSort !== bSort) {
          return aSort - bSort
        }
        return (a.info?.name || '').localeCompare(b.info?.name || '')
      })
    }
    const sortRecursively = (items: TreeNode[]): TreeNode[] => {
      const sorted = sortItems(items)
      sorted.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.children = sortRecursively(item.children)
        }
      })
      return sorted
    }
    return sortRecursively(result)
  })
  // 切换导入来源
  const setSourceType = (type: ImportSourceType) => {
    currentSourceType.value = type
    resetState()
  }
  // 重置状态
  const resetState = () => {
    importTypeInfo.value = { name: 'unknown', version: '' }
    formInfo.value = {
      moyuData: { docs: [] },
      type: 'unknown',
      cover: false,
    }
    rawContent.value = ''
    parsedData.value = null
    error.value = ''
  }
  // 处理解析后的数据
  const processData = (data: unknown) => {
    parsedData.value = data
    const typeInfo = detectDocumentFormat(data)
    importTypeInfo.value = typeInfo
    formInfo.value.type = typeInfo.name
    if (typeInfo.name === 'apiflow') {
      const apiflowData = data as ApiflowDocument
      formInfo.value.moyuData.docs = apiflowData.docs || []
    }
  }
  // 处理文件上传
  const handleFileUpload = async (file: File): Promise<boolean> => {
    error.value = ''
    const validation = validateFile(file, t)
    if (!validation.valid) {
      error.value = validation.error || ''
      ElMessage.error(validation.error || '')
      return false
    }
    try {
      loading.value = true
      const content = await file.text()
      rawContent.value = content
      const data = parseFileContent(content, validation.fileType)
      processData(data)
      return true
    } catch (err) {
      error.value = t('文件解析失败')
      ElMessage.error(t('文件解析失败'))
      return false
    } finally {
      loading.value = false
    }
  }
  // 处理 URL 导入
  const handleUrlImport = async (url: string): Promise<boolean> => {
    if (!url) {
      error.value = t('请输入URL地址')
      return false
    }
    try {
      loading.value = true
      error.value = ''
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const content = await response.text()
      rawContent.value = content
      const fileType = url.endsWith('.yaml') || url.endsWith('.yml') ? 'yaml' : 'json'
      const data = parseFileContent(content, fileType)
      processData(data)
      return true
    } catch (err) {
      error.value = t('URL获取失败')
      ElMessage.error(t('URL获取失败'))
      return false
    } finally {
      loading.value = false
    }
  }
  // 处理粘贴内容
  const handlePasteContent = (content: string): boolean => {
    if (!content.trim()) {
      error.value = t('请输入内容')
      return false
    }
    try {
      error.value = ''
      rawContent.value = content
      let data: unknown
      try {
        data = JSON.parse(content)
      } catch {
        data = jsyaml.load(content)
      }
      processData(data)
      return true
    } catch (err) {
      error.value = t('内容解析失败')
      ElMessage.error(t('内容解析失败'))
      return false
    }
  }
  // 设置转换后的文档
  const setConvertedDocs = (docs: (HttpNode | FolderNode)[]) => {
    formInfo.value.moyuData.docs = docs
  }
  return {
    currentSourceType,
    importTypeInfo,
    formInfo,
    rawContent,
    parsedData,
    loading,
    error,
    stats,
    previewTreeData,
    setSourceType,
    resetState,
    processData,
    handleFileUpload,
    handleUrlImport,
    handlePasteContent,
    setConvertedDocs,
  }
}
