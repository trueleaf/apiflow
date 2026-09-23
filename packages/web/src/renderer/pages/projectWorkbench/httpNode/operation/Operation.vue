<template>
  <div class="api-operation">
    <!-- 请求地址，发送请求 -->
    <div class="op-wrap">
      <div class="request-method">
        <el-select v-model="requestMethod" :size="config.renderConfig.layout.size" value-key="name" data-testid="method-select">
          <el-option v-for="(item, index) in requestMethodEnum" :key="index" :value="item.value" :label="item.name">
          </el-option>
        </el-select>
      </div>
      <ClRichInput
        ref="urlRichInputRef"
        v-model="requestPath"
        class="url-rich-input"
        data-testid="url-input"
        :placeholder="t('path参数') + ' (' + t('如') + ' http://test.com/{id}' + ')'"
        :trim-on-paste="true"
        :min-height="30"
        :expand-on-focus="true"
        disable-history
        @update:modelValue="handleChangeUrl"
        @blur="handleFormatUrl"
        @before-paste="handleBeforePaste"
      >
        <template #variable="{ label }">
          <div v-if="getVariableSource(label)" class="variable-popover">
            <div class="variable-name">{{ t('变量名称') }}：{{ label }}</div>
            <div class="variable-scope">{{ getVariableScope(label) }}</div>
            <template v-if="getVariableSource(label) === 'project' && getProjectVariable(label)?.type === 'string'">
              <div class="variable-field">
                <span>{{ t('变量值') }}</span>
                <ElInput
                  :model-value="getQuickVariableValue(label)"
                  data-testid="url-variable-value-input"
                  :maxlength="config.variableConfig.maxStringSize"
                  @update:modelValue="(value: string) => updateQuickVariableValue(label, value)"
                  @keydown.enter.stop.prevent="handleSaveQuickVariable(label)"
                />
              </div>
              <div class="variable-actions">
                <ElButton data-testid="url-variable-save-btn" size="small" type="primary" :loading="quickVariableSaving" @click="handleSaveQuickVariable(label)">
                  {{ t('保存') }}
                </ElButton>
                <ElButton size="small" link @click="handleGoToVariableManage">
                  {{ t('前往变量管理') }}
                </ElButton>
              </div>
            </template>
            <template v-else>
              <div class="variable-value">{{ t('变量值') }}：{{ getResolvedVariableValue(label) }}</div>
              <el-button size="small" type="primary" link @click="handleGoToVariableManage">
                {{ t('前往变量管理') }}
              </el-button>
            </template>
          </div>
          <div v-else-if="isDirectVariable(label)" class="variable-popover">
            <div class="variable-warning">{{ t('变量未定义', { name: label }) }}</div>
            <div class="variable-scope">{{ t('项目变量中未找到') }}</div>
            <div class="variable-description">{{ t('发送请求时变量将无法解析') }}</div>
            <div class="variable-field">
              <span>{{ t('变量值') }}</span>
              <ElInput
                :model-value="getQuickVariableValue(label)"
                data-testid="url-variable-create-input"
                :maxlength="config.variableConfig.maxStringSize"
                @update:modelValue="(value: string) => updateQuickVariableValue(label, value)"
                @keydown.enter.stop.prevent="handleSaveQuickVariable(label)"
              />
            </div>
            <div class="variable-actions">
              <ElButton data-testid="url-variable-temporary-btn" size="small" @click="handleSetRequestTemporaryVariable(label)">
                {{ t('设为请求临时变量') }}
              </ElButton>
              <ElButton data-testid="url-variable-create-btn" size="small" type="primary" :loading="quickVariableSaving" @click="handleSaveQuickVariable(label)">
                {{ t('创建项目变量') }}
              </ElButton>
              <ElButton size="small" link @click="handleGoToVariableManage">
                {{ t('前往变量管理') }}
              </ElButton>
            </div>
          </div>
          <div v-else class="variable-popover">
            <div class="variable-warning">{{ t('变量未定义', { name: label }) }}</div>
            <el-button size="small" type="primary" link @click="handleGoToVariableManage">
              {{ t('前往变量管理') }}
            </el-button>
          </div>
        </template>
      </ClRichInput>
      <el-button :icon="Sparkles" data-testid="url-ai-parser" @click="openAiParser()">{{ t('AI 解析') }}</el-button>
      <el-button 
        v-if="requestState === 'waiting' || requestState === 'finish'" 
        type="success" 
        data-testid="operation-send-btn"
        @click="handleSendRequest"
      >
        {{ t("发送请求") }}
      </el-button>
      <el-button v-if="requestState === 'sending' || requestState === 'response'" type="danger" data-testid="operation-cancel-btn" @click="handleStopRequest">{{ t("取消请求") }}</el-button>
      <el-button :loading="loading2" type="primary" data-testid="operation-save-btn" @click="handleSaveHttpNode">{{ t("保存接口") }}</el-button>
      <el-button :loading="loading3" type="primary" :icon="RefreshCw" data-testid="operation-refresh-btn" @click="handleFreshApidoc">{{ t("刷新") }}</el-button>
    </div>
    <div class="pre-url-wrap">
      <span class="label">{{ t("请求地址") }}：</span>
      <span class="url">{{ encodedFullUrl }}</span>
      <el-tooltip :content="urlValidation.errorMessage" :show-after="500" :effect="Effect.LIGHT" placement="top">
        <span v-show="!urlValidation.isValid && httpNodeRequestStore.fullUrl" class="tip">
          <CircleAlert :size="14" />
        </span>
      </el-tooltip>
    </div>
  </div>
  <SSaveDocDialog v-if="saveDocDialogVisible" v-model="saveDocDialogVisible"></SSaveDocDialog>
  <AiRequestParser v-if="aiParserVisible" mode="request" :initial-text="aiParserText" @close="aiParserVisible = false" />
</template>

<script lang="ts" setup>
import { computed, ref, watch, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { CircleAlert, RefreshCw, Sparkles } from 'lucide-vue-next'
import AiRequestParser from '../components/AiRequestParser.vue'
import { isNaturalLanguageRequest } from '@/helper/aiRequestParser'
import { Effect, ElMessage } from 'element-plus'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import { config } from '@src/config/config'
import { validateUrl, type UrlValidationResult } from '@/helper'
import { router } from '@/router/index'
import SSaveDocDialog from '@/pages/projectWorkbench/dialog/saveDoc/SaveDoc.vue'
import ClRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue'
import { handleFormatUrl, handleChangeUrl } from './composables/url'
import { restoreUrlVariableOnPaste } from './composables/urlVariablePaste'
import getMethodPart from './composables/method'
import getOperationPart from './composables/operation'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { useHttpNodeResponse } from '@/store/httpNode/httpNodeResponseStore'
import { useHttpNodeRequest } from '@/store/httpNode/httpNodeRequestStore'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { isCurlCommand, parseCurlToHttpNode } from '@/helper/curlParser'
import { request } from '@/api/api'
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useEnvironment } from '@/store/projectWorkbench/environmentStore'
import type { ApidocVariable, CommonResponse } from '@src/types'

const projectNavStore = useProjectNav()
const variableStore = useVariable()
const httpNodeStore = useHttpNode()
const httpNodeResponseStore = useHttpNodeResponse()
const httpNodeRequestStore = useHttpNodeRequest()
const httpRedoUndoStore = useHttpRedoUndo()
const runtimeStore = useRuntime()
const environmentStore = useEnvironment()
const projectId = router.currentRoute.value.query.id as string;
const { t } = useI18n()
const urlRichInputRef = ref<InstanceType<typeof ClRichInput> | null>(null)
const quickVariableValue = ref('')
const quickVariableLabel = ref('')
const quickVariableSaving = ref(false)
const aiParserVisible = ref(false)
const aiParserText = ref('')
// 打开自然语言请求解析
const openAiParser = (text = '') => {
  aiParserText.value = text || (isNaturalLanguageRequest(httpNodeStore.httpNodeInfo.item.url.path) ? httpNodeStore.httpNodeInfo.item.url.path : '')
  aiParserVisible.value = true
}
const currentSelectNav = computed(() => {
  const navs = projectNavStore.navs[projectId];
  return navs?.find((nav) => nav.selected) || null;
})
/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
// 获取当前项目变量
const getProjectVariable = (label: string) => {
  return variableStore.variables.find(item => item.name === label)
}
// 获取当前环境变量
const getEnvironmentVariable = (label: string) => {
  return environmentStore.buildCurrentEnvironmentApidocVariables().find(item => item.name === label)
}
// 获取请求临时变量
const getRequestTemporaryVariable = (label: string): string | undefined => {
  const nodeId = currentSelectNav.value?._id
  if (!nodeId) {
    return undefined
  }
  return variableStore.getRequestTemporaryVariables(nodeId)[label]
}
// 获取变量来源
const getVariableSource = (label: string): 'request' | 'environment' | 'project' | null => {
  if (getRequestTemporaryVariable(label) !== undefined) {
    return 'request'
  }
  if (getEnvironmentVariable(label)) {
    return 'environment'
  }
  if (getProjectVariable(label)) {
    return 'project'
  }
  return null
}
// 获取变量作用域名称
const getVariableScope = (label: string): string => {
  const source = getVariableSource(label)
  if (source === 'request') {
    return t('请求临时变量')
  }
  if (source === 'environment') {
    return t('当前环境变量')
  }
  return t('当前项目变量')
}
// 获取变量最终值
const getResolvedVariableValue = (label: string): string => {
  const source = getVariableSource(label)
  if (source === 'request') {
    return getRequestTemporaryVariable(label) || ''
  }
  if (source === 'environment') {
    return getEnvironmentVariable(label)?.value || ''
  }
  return getProjectVariable(label)?.value || ''
}
// 判断是否为可快速创建的直接变量
const isDirectVariable = (label: string) => {
  return label.trim().length > 0 && !/[{}()[\].+\-*/%<>=!&|?:,;'"\s]/.test(label)
}
// 获取变量浮层编辑值
const getQuickVariableValue = (label: string) => {
  if (quickVariableLabel.value === label) {
    return quickVariableValue.value
  }
  return getProjectVariable(label)?.value ?? ''
}
// 更新变量浮层编辑值
const updateQuickVariableValue = (label: string, value: string) => {
  quickVariableLabel.value = label
  quickVariableValue.value = value
}
// 设置请求临时变量
const handleSetRequestTemporaryVariable = (label: string): void => {
  const nodeId = currentSelectNav.value?._id
  if (!nodeId) {
    return
  }
  variableStore.setRequestTemporaryVariable(nodeId, label, getQuickVariableValue(label))
  quickVariableLabel.value = ''
  quickVariableValue.value = ''
  urlRichInputRef.value?.hideVariablePopover()
  ElMessage.success(t('保存成功'))
}
// 同步在线项目变量
const syncOnlineProjectVariables = async () => {
  const response = await request.get<CommonResponse<ApidocVariable[]>, CommonResponse<ApidocVariable[]>>('/api/project/project_variable_enum', {
    params: { projectId },
  })
  await variableStore.replaceVariables(response.data)
}
// 创建当前项目文本变量
const createQuickVariable = async (label: string, value: string) => {
  const variable: Omit<ApidocVariable, '_id'> = {
    projectId,
    name: label,
    type: 'string',
    value,
    fileValue: {
      name: '',
      path: '',
      fileType: '',
    },
  }
  if (runtimeStore.networkMode === 'offline') {
    const response = await nodeVariableCache.addVariable(variable)
    if (response.code !== 0) {
      throw new Error(response.msg)
    }
    await variableStore.replaceVariables(variableStore.variables.concat(response.data))
    return
  }
  await request.post('/api/project/project_variable', variable)
  await syncOnlineProjectVariables()
}
// 更新当前项目文本变量
const updateQuickVariable = async (variable: ApidocVariable, value: string) => {
  const nextVariable: ApidocVariable = {
    ...variable,
    value,
  }
  if (runtimeStore.networkMode === 'offline') {
    const response = await nodeVariableCache.updateVariableById(variable._id, nextVariable)
    if (response.code !== 0) {
      throw new Error(response.msg)
    }
  } else {
    await request.put('/api/project/project_variable', nextVariable)
  }
  await variableStore.changeVariableById(variable._id, nextVariable)
}
// 保存变量浮层内容
const handleSaveQuickVariable = async (label: string) => {
  const variable = getProjectVariable(label)
  const value = getQuickVariableValue(label)
  if (!variable && !value.trim()) {
    ElMessage.warning(t('请输入变量值'))
    return
  }
  quickVariableSaving.value = true
  try {
    if (variable) {
      await updateQuickVariable(variable, value)
    } else {
      await createQuickVariable(label, value.trim())
    }
    quickVariableLabel.value = ''
    quickVariableValue.value = ''
    urlRichInputRef.value?.hideVariablePopover()
    ElMessage.success(t('保存成功'))
  } catch {
    ElMessage.error(t('保存失败'))
  } finally {
    quickVariableSaving.value = false
  }
}
// 打开变量管理页
const handleGoToVariableManage = () => {
  urlRichInputRef.value?.hideVariablePopover()
  projectNavStore.addNav({
    _id: 'variable',
    projectId,
    tabType: 'variable',
    label: t('变量'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  })
}
/*
|--------------------------------------------------------------------------
| curl 解析相关
|--------------------------------------------------------------------------
*/
const handleBeforePaste = async (text: string, shouldPrevent: { value: boolean }) => {
  if (isCurlCommand(text)) {
    shouldPrevent.value = true
    try {
      await ClConfirm({
        content: t('是否解析为请求？'),
        title: t('检测到 cURL 命令'),
        confirmButtonText: t('确定/OperationParseCurl'),
        cancelButtonText: t('取消'),
      })
      const parsedData = parseCurlToHttpNode(text)
      if (parsedData) {
        httpNodeStore.updateHttpNodeFromCurl(parsedData)
        ElMessage.success(t('解析成功'))
      } else {
        ElMessage.error(t('解析失败，请检查 cURL 格式'))
      }
    } catch {
      urlRichInputRef.value?.insertText(text, false)
    }
    return
  }
  if (isNaturalLanguageRequest(text)) {
    shouldPrevent.value = true
    openAiParser(text)
    return
  }
  const restoredUrl = restoreUrlVariableOnPaste(text, requestPath.value, variableStore.objectVariable)
  if (restoredUrl !== text) {
    shouldPrevent.value = true
    urlRichInputRef.value?.insertText(restoredUrl, true)
  }
}
/*
|--------------------------------------------------------------------------
| URL校验
|--------------------------------------------------------------------------
*/
const urlValidation = reactive<UrlValidationResult>({
  isValid: true,
  errorMessage: '',
})
/*
|--------------------------------------------------------------------------
| host相关
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| 请求方法
|--------------------------------------------------------------------------
*/
const methodPart = getMethodPart();
const { requestMethod, requestMethodEnum } = methodPart;
/*
|--------------------------------------------------------------------------
| 发送请求、保存接口、刷新接口
|--------------------------------------------------------------------------
*/
const { requestState } = storeToRefs(httpNodeResponseStore)
const { saveHttpNodeLoading: loading2 } = storeToRefs(httpNodeStore)
const saveDocDialogVisible = computed({
  get() {
    return httpNodeStore.saveDocDialogVisible;
  },
  set(val) {
    httpNodeStore.changeSaveDocDialogVisible(val)
    httpNodeStore.changeSavedDocId(currentSelectNav.value?._id || '');
  }
});
const operationPart = getOperationPart();
// 保留未解析的变量占位符，仅编码普通 URL 片段
const encodedFullUrl = computed(() => (httpNodeRequestStore.fullUrl || '')
  .split(/(\{\{[^}]+\}\})/g)
  .map((part, index) => index % 2 === 1 ? part : encodeURI(part))
  .join(''));
const handleSaveHttpNode = () => {
  if (currentSelectNav.value?._id.includes('local_')) {
    saveDocDialogVisible.value = true;
  } else {
    httpNodeStore.saveHttpNode();
  }
}
const { loading3, handleSendRequest, handleStopRequest, handleFreshApidoc } = operationPart;
//请求url、完整url
const requestPath = computed({
  get() {
    return httpNodeStore.httpNodeInfo.item.url.path;
  },
  set(path) {
    if (!currentSelectNav.value) return;
    const oldValue = httpNodeStore.httpNodeInfo.item.url.path;
    if (oldValue !== path) {
      // 记录URL路径变化操作
      httpRedoUndoStore.recordOperation({
        nodeId: currentSelectNav.value._id,
        type: "pathOperation",
        operationName: "修改URL路径",
        affectedModuleName: "path",
        oldValue,
        newValue: path,
        timestamp: Date.now()
      });
    }
    httpNodeStore.changeHttpNodeUrl(path);
  },
});
/*
|--------------------------------------------------------------------------
| 监听fullUrl变化并校验
|--------------------------------------------------------------------------
*/
watch(
  () => httpNodeRequestStore.fullUrl,
  (newUrl) => {
    const result = validateUrl(newUrl);
    urlValidation.isValid = result.isValid;
    urlValidation.errorMessage = result.errorMessage;
  },
  {
    immediate: true,
  }
);
</script>

<style lang='scss' scoped>
.api-operation {
  position: sticky;
  top: 0;
  padding: 0 20px;
  box-shadow: 0 3px 2px var(--gray-400);
  background: var(--white);
  z-index: var(--zIndex-request-info-wrap);
  height: var(--apiflow-apidoc-operation-height);
  display: flex;
  flex-direction: column;
  justify-content: center;
  &.prefix {
    height: 130px;
  }

  .proxy-wrap {
    margin-left: auto;
  }

  .el-checkbox {
    margin-right: 10px;
  }

  .op-wrap {
    display: flex;
    margin-top: 10px;
    width: 100%;
    .request-method {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-right: -1px;

      :deep(.el-select) {
        width: 100px;
      }

      :deep(.el-input__wrapper) {
        border-radius: 4px 0 0 4px;
      }
    }

    .url-rich-input {
      flex: 1;
      height: 30px;
      position: relative;
      :deep(.cl-rich-input__editor) {
        border: 1px solid var(--el-border-color);
      }
      :deep(.cl-rich-input__editor .ProseMirror p) {
        font-size: 13px;
        line-height: 28px;
      }
      &:focus-within {
        z-index: var(--cl-rich-input-pinned-z-index);
        :deep(.cl-rich-input__editor) {
          border-color: var(--el-color-primary);
        }
      }
    }

    .variable-token {
      color: var(--el-color-warning);
      cursor: pointer;
      &.undefined {
        color: var(--el-color-danger);
        text-decoration: underline dashed;
      }
    }
    .variable-popover {
      max-width: 400px;
      .variable-name {
        font-weight: 500;
        color: var(--gray-800);
        margin-bottom: 6px;
        word-break: break-all;
      }
      .variable-scope {
        margin-bottom: 8px;
        color: var(--text-secondary);
        font-size: 12px;
      }
      .variable-description {
        margin-bottom: 8px;
        color: var(--text-secondary);
        font-size: 12px;
      }
      .variable-value {
        font-family: monospace;
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
        padding: 4px 8px;
        background: var(--gray-200);
        border-radius: 4px;
        color: var(--gray-800);
      }
      .variable-field {
        display: grid;
        gap: 4px;
        color: var(--text-secondary);
        font-size: 12px;
      }
      .variable-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 10px;
      }
      .variable-warning {
        color: var(--el-color-danger);
        margin-bottom: 8px;
      }
    }
  }

  .pre-url-wrap {
    height: 30px;
    width: 100%;
    white-space: nowrap;
    display: flex;
    margin: 0;
    align-items: center;
    overflow: hidden;
    padding: 0 10px;
    border: 1px solid var(--code-preview-border);
    border-radius: 4px;
    background-color: var(--code-preview-bg);
    white-space: pre-wrap;
    color: var(--code-preview-text);
    font-size: 12px;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono,Courier New, monospace;
    &::-webkit-scrollbar {
      height: 0px;
    }
    .label {
      font-family: var(--font-family);
      user-select: none;
      flex: 0 0 auto;
    }
    .url {
      display: flex;
      align-items: center;
      height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-x: auto;
      &::-webkit-scrollbar {
        height: 0px;
      }
    }
    .tip {
      flex: 0 0 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 5px;
      color: var(--orange);
    }
  }
}

.env-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 500px;
}
</style>

