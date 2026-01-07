<template>
  <div class="doc-import">
    <!-- 导入方式选择 -->
    <SFieldset :title="t('数据来源')">
      <div class="source-wrap">
        <div
          v-for="item in importSources"
          :key="item.value"
          :class="['source-item', { active: currentSourceType === item.value }]"
          @click="handleSelectSourceType(item.value)"
        >
          <component :is="item.icon" :size="32" :stroke-width="1.5" class="source-icon" />
          <div class="source-info">
            <div class="source-name">{{ t(item.label) }}</div>
            <div class="source-desc">{{ t(item.desc) }}</div>
          </div>
        </div>
      </div>
    </SFieldset>

    <!-- 数据输入区域 -->
    <SFieldset :title="t('数据输入')">
      <!-- 本地文件上传 -->
      <FileImport v-if="currentSourceType === 'file'" @success="handleDataLoaded" @error="handleError" />
      <!-- URL导入 -->
      <UrlImport v-else-if="currentSourceType === 'url'" @success="handleDataLoaded" @error="handleError" />
      <!-- 粘贴导入 -->
      <PasteImport v-else-if="currentSourceType === 'paste'" @success="handleDataLoaded" @error="handleError" />
      <!-- AI智能识别 -->
      <AiImport v-else-if="currentSourceType === 'ai'" :project-id="projectId" @success="handleAiDataLoaded" @error="handleError" />
      <!-- 代码仓库识别 -->
      <RepoImport v-else-if="currentSourceType === 'repository'" :project-id="projectId" @success="handleAiDataLoaded" @error="handleError" />
    </SFieldset>

    <!-- 文档格式选择 -->
    <SFieldset v-if="importTypeInfo.name !== 'unknown'" :title="t('文档格式')">
      <FormatSelector
        v-model="selectedFormat"
        :detected-format="importTypeInfo.name"
        :format-version="importTypeInfo.version"
        @update:model-value="handleFormatChange"
      />
    </SFieldset>

    <!-- 导入数据预览 -->
    <SFieldset :title="t('导入数据预览')">
      <div class="preview-stats">
        <SLableValue :label="`${t('文档数')}：`" label-width="auto" class="mr-4">
          {{ stats.docCount }}
        </SLableValue>
        <SLableValue :label="`${t('文件夹数')}：`" label-width="auto">
          {{ stats.folderCount }}
        </SLableValue>
      </div>
      <el-tree
        v-if="previewNavTreeData.length > 0"
        ref="docTree"
        :data="previewNavTreeData"
        node-key="_id"
        :expand-on-click-node="true"
        default-expand-all
      >
        <template #default="scope">
          <div class="custom-tree-node" tabindex="0">
            <template v-if="scope.data.info.type !== 'folder'">
              <template v-for="req in requestMethods" :key="req.name">
                <span
                  v-if="scope.data.item?.method?.toLowerCase() === req.value.toLowerCase()"
                  class="file-icon"
                  :style="{ color: req.iconColor }"
                >{{ req.name }}</span>
              </template>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.info.name" :value="scope.data.info.name" />
              </div>
            </template>
            <template v-else>
              <Folder :size="16" class="folder-icon" />
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.info.name" :value="scope.data.info.name" />
              </div>
            </template>
          </div>
        </template>
      </el-tree>
      <div v-else class="empty-preview">
        <FileQuestion :size="48" :stroke-width="1" class="empty-icon" />
        <div class="empty-text">{{ t('暂无数据，请先上传或输入文档') }}</div>
      </div>
    </SFieldset>

    <!-- 额外配置信息 -->
    <SFieldset v-if="!importAsProject" :title="t('额外配置')">
      <div>
        <SConfig
          v-if="selectedFormat === 'openapi' || selectedFormat === 'swagger'"
          :has-check="false"
          :label="t('文件夹命名方式')"
          :description="t('none代表不存在文件夹，所有节点扁平放置')"
        >
          <el-radio-group v-model="openapiFolderNamedType" @change="handleChangeNamedType">
            <el-radio value="tag">Tag</el-radio>
            <el-radio value="url">Url</el-radio>
            <el-radio value="none">none</el-radio>
          </el-radio-group>
        </SConfig>
        <SConfig :has-check="false" :label="t('导入方式')" :description="t('请谨慎选择导入方式')">
          <el-radio-group v-model="formInfo.cover" @change="handleChangeIsCover">
            <el-radio :value="false">{{ t('追加方式') }}</el-radio>
            <el-radio :value="true">{{ t('覆盖方式') }}</el-radio>
          </el-radio-group>
        </SConfig>
        <SConfig
          :label="t('目标目录')"
          :description="t('选择需要挂载的节点，不选择则默认挂载到根目录')"
          @change="handleToggleTargetFolder"
        >
          <template #default="prop">
            <SLoading :loading="loading2">
              <div v-show="prop.isEnabled" class="doc-nav">
                <el-tree
                  ref="docTree2"
                  :data="navTreeData"
                  node-key="_id"
                  show-checkbox
                  :expand-on-click-node="true"
                  :check-strictly="true"
                  @check="handleCheckChange"
                >
                  <template #default="scope">
                    <div class="custom-tree-node" tabindex="0">
                      <img :src="folderIcon" width="16px" height="16px" alt="folder">
                      <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                    </div>
                  </template>
                </el-tree>
              </div>
            </SLoading>
          </template>
        </SConfig>
      </div>
      <div class="submit-wrap">
        <el-button :loading="loading" type="primary" :disabled="stats.docCount === 0" @click="handleSubmit">
          {{ t('确定导入') }}
        </el-button>
      </div>
    </SFieldset>
  </div>
</template>

<script lang="ts" setup>
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'
import SLoading from '@/components/common/loading/ClLoading.vue'
import SLableValue from '@/components/common/labelValue/ClLabelValue.vue'
import SConfig from '@/components/common/config/ClConfig.vue'
import SEmphasize from '@/components/common/emphasize/ClEmphasize.vue'
import FileImport from './components/FileImport.vue'
import UrlImport from './components/UrlImport.vue'
import PasteImport from './components/PasteImport.vue'
import AiImport from './components/AiImport.vue'
import RepoImport from './components/RepoImport.vue'
import FormatSelector from './components/FormatSelector.vue'
import { ref, computed, type Ref } from 'vue'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm'
import { FileUp, Link, ClipboardCopy, Folder, FileQuestion, Sparkles, GitBranch } from 'lucide-vue-next'
import type { ApidocBanner, HttpNode, FolderNode } from '@src/types'
import type { OpenAPIV3, OpenAPIV2 } from 'openapi-types'
import { router } from '@/router/index'
import { request } from '@/api/api'
import { useI18n } from 'vue-i18n'
import { message } from '@/helper'
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import { OpenApiTranslator, type OpenApiFolderNamedType } from './openapi'
import { PostmanTranslator } from './postman'
import { requestMethods } from '@/data/data'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { useRuntime } from '@/store/runtime/runtimeStore'
import {
  detectDocumentFormat,
  type ImportSourceType,
  type ImportFormatType,
  type ApiflowDocument,
  type PostmanCollection,
} from '@/composables/useImport'

type FormInfo = {
  moyuData: {
    docs: (HttpNode | FolderNode)[]
  }
  type: ImportFormatType
  cover: boolean
}
defineProps({
  importAsProject: {
    type: Boolean,
    default: false,
  },
})
const { t } = useI18n()
const runtimeStore = useRuntime()
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const bannerStore = useBanner()
const projectId = router.currentRoute.value.query.id as string
const folderIcon = new URL('@/assets/imgs/apidoc/folder.png', import.meta.url).href
// 数据来源类型
const currentSourceType: Ref<ImportSourceType | 'ai' | 'repository'> = ref('file')
const importSources = [
  { label: '本地文件', value: 'file' as const, icon: FileUp, desc: '上传 JSON/YAML 文件' },
  { label: 'URL导入', value: 'url' as const, icon: Link, desc: '从远程 URL 获取' },
  { label: '粘贴内容', value: 'paste' as const, icon: ClipboardCopy, desc: '直接粘贴内容' },
  { label: 'AI智能识别', value: 'ai' as const, icon: Sparkles, desc: 'AI 自动识别格式' },
  { label: '代码仓库识别', value: 'repository' as const, icon: GitBranch, desc: '从代码提取 API' },
]
// 目标树
const docTree2: Ref<TreeNodeOptions['store'] | null> = ref(null)
// 加载状态
const loading = ref(false)
const loading2 = ref(false)
// OpenAPI 文件夹命名方式
const openapiFolderNamedType: Ref<OpenApiFolderNamedType> = ref('tag')
// 表单信息
const formInfo: Ref<FormInfo> = ref({
  moyuData: { docs: [] },
  type: 'unknown',
  cover: false,
})
// 导入类型信息
const importTypeInfo = ref<{ name: ImportFormatType; version: string }>({
  name: 'unknown',
  version: '',
})
// 选中的格式
const selectedFormat: Ref<ImportFormatType> = ref('unknown')
// 原始解析数据
const parsedData: Ref<unknown> = ref(null)
// 导航树数据
const navTreeData = ref<ApidocBanner[]>([])
// 当前挂载节点
const currentMountedNode: Ref<HttpNode | null> = ref(null)
// 统计信息
const stats = computed(() => {
  const docs = formInfo.value.moyuData.docs || []
  return {
    docCount: docs.filter(v => v.info.type !== 'folder').length,
    folderCount: docs.filter(v => v.info.type === 'folder').length,
  }
})
// 预览树形数据
const previewNavTreeData = computed(() => {
  const docs = formInfo.value.moyuData.docs || []
  const result: ((HttpNode | FolderNode) & { children?: (HttpNode | FolderNode)[] })[] = []
  for (let i = 0; i < docs.length; i += 1) {
    const docInfo = docs[i] as (HttpNode | FolderNode) & { children?: (HttpNode | FolderNode)[] }
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
        docInfo.children.push(docs[j])
      }
    }
  }
  const sortItems = (items: typeof result) => {
    return items.sort((a, b) => {
      if (a.info.type === 'folder' && b.info.type !== 'folder') return -1
      if (a.info.type !== 'folder' && b.info.type === 'folder') return 1
      const aSort = a.sort ?? Number.MAX_SAFE_INTEGER
      const bSort = b.sort ?? Number.MAX_SAFE_INTEGER
      if (aSort !== bSort) return aSort - bSort
      return (a.info?.name || '').localeCompare(b.info?.name || '')
    })
  }
  const sortRecursively = (items: typeof result): typeof result => {
    const sorted = sortItems(items)
    sorted.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children = sortRecursively(item.children as typeof result)
      }
    })
    return sorted
  }
  return sortRecursively(result)
})
// 选择数据来源
const handleSelectSourceType = (type: ImportSourceType | 'ai' | 'repository') => {
  currentSourceType.value = type
  resetData()
}
// 重置数据
const resetData = () => {
  formInfo.value = { moyuData: { docs: [] }, type: 'unknown', cover: false }
  importTypeInfo.value = { name: 'unknown', version: '' }
  selectedFormat.value = 'unknown'
  parsedData.value = null
}
// 数据加载成功
const handleDataLoaded = (data: unknown) => {
  parsedData.value = data
  const typeInfo = detectDocumentFormat(data)
  importTypeInfo.value = typeInfo
  selectedFormat.value = typeInfo.name
  formInfo.value.type = typeInfo.name
  convertData(typeInfo.name)
}
// AI 数据加载成功
const handleAiDataLoaded = (data: { docs: (HttpNode | FolderNode)[]; type: 'ai' | 'repository' }) => {
  formInfo.value.moyuData.docs = data.docs
  formInfo.value.type = data.type
  importTypeInfo.value = { name: data.type, version: '' }
  selectedFormat.value = data.type
}
// 转换数据
const convertData = (format: ImportFormatType) => {
  if (!parsedData.value) return
  try {
    if (format === 'apiflow') {
      const apiflowData = parsedData.value as ApiflowDocument
      formInfo.value.moyuData.docs = apiflowData.docs || []
    } else if (format === 'openapi' || format === 'swagger') {
      const translator = new OpenApiTranslator(
        projectId,
        parsedData.value as OpenAPIV3.Document | OpenAPIV2.Document
      )
      formInfo.value.moyuData.docs = translator.getDocsInfo(openapiFolderNamedType.value)
    } else if (format === 'postman') {
      const translator = new PostmanTranslator(projectId, parsedData.value as PostmanCollection)
      formInfo.value.moyuData.docs = translator.getDocsInfo()
    }
  } catch (err) {
    message.error(t('数据转换失败'))
  }
}
// 格式变化
const handleFormatChange = (format: ImportFormatType) => {
  formInfo.value.type = format
  convertData(format)
}
// 错误处理
const handleError = () => {
  resetData()
}
// 改变命名方式
const handleChangeNamedType = () => {
  convertData(selectedFormat.value)
}
// 改变导入方式
const handleChangeIsCover = (val: string | number | boolean | undefined) => {
  if (val) {
    ClConfirm({
      content: t('覆盖后的数据将无法还原'),
      title: t('提示'),
      confirmButtonText: t('确定/ImportCoverOverwrite'),
      cancelButtonText: t('取消'),
      type: 'warning',
    }).catch(err => {
      if (err === 'cancel' || err === 'close') {
        formInfo.value.cover = false
      }
    })
  }
}
// 节点选中状态改变
const handleCheckChange = (data: any, checkedInfo: { checkedKeys: (string | number)[] }) => {
  docTree2.value?.setCheckedKeys([])
  if (checkedInfo.checkedKeys.length > 0) {
    docTree2.value?.setCheckedKeys([data._id])
  }
  currentMountedNode.value = data
}
// 切换目标文件夹
const handleToggleTargetFolder = async (val: boolean) => {
  currentMountedNode.value = null
  if (val) {
    if (isStandalone.value) {
      const banner = await apiNodesCache.getApiNodesAsTree(projectId)
      navTreeData.value = banner
      return
    }
    loading2.value = true
    const params = { projectId }
    request
      .get('/api/project/doc_tree_folder_node', { params })
      .then(res => {
        navTreeData.value = res.data
      })
      .catch(() => {})
      .finally(() => {
        loading2.value = false
      })
  }
}
// 确定导入
const handleSubmit = async () => {
  try {
    if (!formInfo.value.moyuData.docs || formInfo.value.moyuData.docs.length === 0) {
      message.warning(t('请选择需要导入的文件'))
      return
    }
    const mountedId = currentMountedNode.value?._id
    const docs = formInfo.value.moyuData.docs.map(val => ({
      ...val,
      pid: !val.pid && mountedId ? mountedId : val.pid,
    }))
    if (isStandalone.value && formInfo.value.cover) {
      const copiedDocs = JSON.parse(JSON.stringify(docs)) as HttpNode[]
      await apiNodesCache.replaceAllNodes(copiedDocs, projectId)
      bannerStore.getDocBanner({ projectId })
      message.success(t('导入成功'))
      return
    } else if (isStandalone.value && !formInfo.value.cover) {
      const copiedDocs = JSON.parse(JSON.stringify(docs)) as HttpNode[]
      await apiNodesCache.appendNodes(copiedDocs, projectId)
      bannerStore.getDocBanner({ projectId })
      message.success(t('导入成功'))
      return
    }
    loading.value = true
    const params = {
      projectId,
      cover: formInfo.value.cover,
      moyuData: { ...formInfo.value.moyuData, docs },
    }
    request
      .post('/api/project/import/moyu', params)
      .then(() => {
        bannerStore.getDocBanner({ projectId })
        message.success(t('导入成功'))
      })
      .catch(() => {})
      .finally(() => {
        loading.value = false
      })
  } catch (error) {
    message.warning((error as Error).message)
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.doc-import {
  overflow-y: auto;
  height: calc(100vh - var(--apiflow-doc-nav-height));
  width: 70%;
  min-width: 768px;
  margin: 0 auto;
  padding-bottom: 40px;

  .source-wrap {
    display: flex;
    gap: 16px;

    .source-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border: 2px solid var(--gray-200);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s;
      min-width: 200px;

      &:hover {
        border-color: var(--gray-400);
        background: var(--gray-50);
      }

      &.active {
        border-color: var(--theme-color);
        background: var(--theme-color-light);

        .source-icon {
          color: var(--theme-color);
        }

        .source-name {
          color: var(--theme-color);
        }
      }

      .source-icon {
        color: var(--gray-500);
      }

      .source-info {
        .source-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-800);
        }

        .source-desc {
          font-size: 12px;
          color: var(--gray-500);
          margin-top: 2px;
        }
      }
    }
  }

  .preview-stats {
    margin-bottom: 12px;
  }

  .empty-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--gray-400);

    .empty-icon {
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 14px;
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    height: 30px;

    &>img {
      width: 16px;
      height: 16px;
    }

    .file-icon {
      font-size: 14px;
      margin-right: 5px;
      font-weight: 500;
    }

    .folder-icon {
      color: var(--yellow);
      flex: 0 0 auto;
      margin-right: 5px;
    }

    .node-label-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;

      .node-top {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .submit-wrap {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  :deep(.el-tree-node__content) {
    height: 30px;
    display: flex;
    align-items: center;
  }

  :deep(.el-tree-node__content > .el-tree-node__expand-icon) {
    transition: none;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: -1px;
  }
}
</style>
