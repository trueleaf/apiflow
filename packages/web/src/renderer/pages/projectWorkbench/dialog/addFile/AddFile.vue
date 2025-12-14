<template>
  <el-dialog 
    :model-value="modelValue" 
    top="10vh" 
    width="650px" 
    :title="t('新建接口')" 
    footer-class="add-file-dialog__footer"
    content-class="add-file-dialog__content"
    body-class="add-file-dialog__body"
    :before-close="handleClose"
    data-testid="add-file-dialog"
   >
    <el-form ref="form" :model="formData" :rules="formRules" @submit.prevent="handleAddFile">
      <el-form-item :label="t('接口名称')" prop="name">
        <el-input ref="nameInput" v-model="formData.name" :placeholder="t('请输入接口名称')" />
      </el-form-item>
      <el-form-item :label="t('接口类型')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio value="http">HTTP</el-radio>
          <el-radio value="websocket">WebSocket</el-radio>
          <el-radio value="httpMock">HTTP Mock</el-radio>
          <el-radio value="websocketMock">WebSocket Mock</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="isStandalone" prop="aiPrompt">
        <template #label>
          <div class="ai-prompt-label">
            <span>{{ t('AI提示词') }}</span>
            <button 
              v-if="!isAiConfigValid()" 
              class="ai-config-btn-inline" 
              type="button"
              @click.prevent="handleOpenAiSettings"
              :title="t('配置ApiKey')"
            >
              <span>{{ t('配置ApiKey') }}</span>
              <ArrowRight :size="12" />
            </button>
          </div>
        </template>
        <CodeEditor
          v-if="isAiConfigValid()" 
          data-testid="add-file-ai-prompt-editor"
          v-model="formData.aiPrompt"
          language="javascript"
          :auto-height="true"
          :min-height="120"
          :max-height="300"
          :config="editorConfig"
          :disable-validation="true"
          :placeholder="t('可自动识别自然语言描述、cURL请求、任意类型接口结构数据')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleAddFile">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CommonResponse, ApidocBanner } from '@src/types'
import { computed, ref, watch } from 'vue';
import { FormInstance, ElInput } from 'element-plus';
import { request } from '@/api/api';
import { message } from '@/helper'
import { useRoute, useRouter } from 'vue-router';
import { generateEmptyHttpMockNode, generateEmptyHttpNode, generateEmptyWebsocketNode, generateEmptyWebSocketMockNode, buildAiSystemPromptForNode, generateEmptyProperty, extractPathParams } from '@/helper';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { nanoid } from 'nanoid';
import { useRuntime } from '@/store/runtime/runtimeStore';
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue';
import type { ChatRequestBody } from '@src/types/ai/agent.type';
import type { HttpNode, WebSocketNode, HttpMockNode } from '@src/types';
import { ArrowRight } from 'lucide-vue-next';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { appState } from '@/cache/appState/appStateCache';
import { IPC_EVENTS } from '@src/types/ipc';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  //父元素id，没有则代表在根元素上新增节点
  pid: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['update:modelValue', 'success']);
const { t } = useI18n()

const runtimeStore = useRuntime();
const llmClientStore = useLLMClientStore()
const router = useRouter();
const loading = ref(false);
const form = ref<FormInstance>();
const nameInput = ref<InstanceType<typeof ElInput>>();
const route = useRoute()
const formData = ref({
  type: 'http',
  name: '',
  aiPrompt: ''
})
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const isAiConfigValid = () => {
  const provider = llmProviderCache.getLLMProvider()
  return !!(provider?.apiKey?.trim() && provider?.baseURL?.trim())
}
const formRules = {
  name: [
    { required: true, message: t('请输入接口名称'), trigger: 'change' }
  ]
}
const editorConfig = {
  editorOptions: {
    lineNumbers: 'off' as const,
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnCommitCharacter: false,
    acceptSuggestionOnEnter: 'off' as const,
    wordBasedSuggestions: 'off' as const,
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never' as const,
      seedSearchStringFromSelection: 'never' as const,
    },
  }
}

let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading.value) {
        const target = e.target as HTMLElement;
        const isInMonaco = target.closest('.monaco-editor');
        if (isInMonaco) {
          return;
        }
        e.preventDefault();
        handleAddFile();
      }
    };
    document.addEventListener('keydown', keydownHandler);
    setTimeout(() => {
      nameInput.value?.focus();
    }, 100);
  } else {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
  }
}, {
  immediate: true,
});
/*
|--------------------------------------------------------------------------
| AI 辅助函数
|--------------------------------------------------------------------------
*/
const callAiToGenerateNodeData = async (nodeType: 'http' | 'websocket' | 'httpMock', userPrompt: string) => {
  const systemPrompt = buildAiSystemPromptForNode(nodeType)
  const requestBody: ChatRequestBody = {
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    response_format: {
      type: 'json_object'
    }
  }

  try {
    const response = await llmClientStore.chat(requestBody)

    const aiContent = response.choices?.[0]?.message?.content
    if (!aiContent) {
      throw new Error('AI返回内容为空')
    }

    const parsedData = JSON.parse(aiContent)
    return { success: true, data: parsedData }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'AI生成失败' }
  }
}
const mergeAiDataToHttpNode = (node: HttpNode, aiData: any) => {
  if (aiData.description) {
    node.info.description = aiData.description
  }
  if (aiData.method) {
    node.item.method = aiData.method
  }
  if (aiData.urlPrefix) {
    node.item.url.prefix = aiData.urlPrefix
  }
  if (aiData.urlPath) {
    node.item.url.path = aiData.urlPath
  }
  if (aiData.queryParams && Array.isArray(aiData.queryParams)) {
    node.item.queryParams = aiData.queryParams.map((param: any) => ({
      _id: nanoid(),
      key: param.key || '',
      value: param.value || '',
      type: param.type || 'string',
      description: param.description || '',
      required: param.required ?? true,
      select: param.select ?? param.enabled ?? true
    }))
    node.item.queryParams.push(generateEmptyProperty())
  }
  if (aiData.headers && Array.isArray(aiData.headers)) {
    node.item.headers = aiData.headers.map((header: any) => ({
      _id: nanoid(),
      key: header.key || '',
      value: header.value || '',
      type: header.type || 'string',
      description: header.description || '',
      required: header.required ?? false,
      select: header.select ?? header.enabled ?? true
    }))
    node.item.headers.push(generateEmptyProperty())
  }
  if (aiData.urlPath) {
    const pathParams = extractPathParams(aiData.urlPath)
    if (pathParams.length > 0) {
      node.item.paths = pathParams
      node.item.paths.push(generateEmptyProperty())
    }
  }
  if (aiData.requestBodyMode) {
    node.item.requestBody.mode = aiData.requestBodyMode
    switch (aiData.requestBodyMode) {
      case 'json':
        if (aiData.requestBodyJson) {
          node.item.requestBody.rawJson = aiData.requestBodyJson
        }
        node.item.contentType = 'application/json'
        break
      case 'formdata':
        if (aiData.requestBodyFormdata && Array.isArray(aiData.requestBodyFormdata)) {
          node.item.requestBody.formdata = aiData.requestBodyFormdata.map((param: any) => ({
            _id: nanoid(),
            key: param.key || '',
            value: param.value || '',
            type: param.type || 'string',
            description: param.description || '',
            required: param.required ?? true,
            select: param.select ?? true
          }))
          node.item.requestBody.formdata.push(generateEmptyProperty())
        }
        node.item.contentType = 'multipart/form-data'
        break
      case 'urlencoded':
        if (aiData.requestBodyUrlencoded && Array.isArray(aiData.requestBodyUrlencoded)) {
          node.item.requestBody.urlencoded = aiData.requestBodyUrlencoded.map((param: any) => ({
            _id: nanoid(),
            key: param.key || '',
            value: param.value || '',
            type: 'string',
            description: param.description || '',
            required: param.required ?? true,
            select: param.select ?? true
          }))
          node.item.requestBody.urlencoded.push(generateEmptyProperty())
        }
        node.item.contentType = 'application/x-www-form-urlencoded'
        break
      case 'raw':
        if (aiData.requestBodyRaw) {
          node.item.requestBody.raw.data = aiData.requestBodyRaw.data || ''
          node.item.requestBody.raw.dataType = aiData.requestBodyRaw.dataType || 'text/plain'
        }
        node.item.contentType = aiData.contentType || 'text/plain'
        break
      case 'binary':
        if (aiData.requestBodyBinary) {
          node.item.requestBody.binary.mode = aiData.requestBodyBinary.mode || 'file'
          node.item.requestBody.binary.varValue = aiData.requestBodyBinary.varValue || ''
        }
        node.item.contentType = 'application/octet-stream'
        break
      case 'none':
        node.item.contentType = ''
        break
      default:
        if (aiData.contentType) {
          node.item.contentType = aiData.contentType
        }
    }
  } else if (aiData.contentType) {
    node.item.contentType = aiData.contentType
  }
  if (aiData.responseParams && Array.isArray(aiData.responseParams)) {
    node.item.responseParams = [{
      _id: nanoid(),
      title: '成功返回',
      statusCode: 200,
      value: {
        file: { url: '', raw: '' },
        strJson: JSON.stringify(
          aiData.responseParams.reduce((acc: any, param: any) => {
            acc[param.key] = param.type === 'string' ? '' :
                            param.type === 'number' ? 0 :
                            param.type === 'boolean' ? false :
                            param.type === 'array' ? [] : {}
            return acc
          }, {}),
          null,
          2
        ),
        dataType: 'application/json',
        text: ''
      }
    }]
  }
}
const mergeAiDataToWebSocketNode = (node: WebSocketNode, aiData: any) => {
  if (aiData.description) {
    node.info.description = aiData.description
  }
  if (aiData.protocol) {
    node.item.protocol = aiData.protocol
  }
  if (aiData.urlPrefix) {
    node.item.url.prefix = aiData.urlPrefix
  }
  if (aiData.urlPath) {
    node.item.url.path = aiData.urlPath
  }
  if (aiData.queryParams && Array.isArray(aiData.queryParams)) {
    node.item.queryParams = aiData.queryParams.map((param: any) => ({
      _id: nanoid(),
      key: param.key || '',
      value: param.value || '',
      type: param.type || 'string',
      description: param.description || '',
      required: param.required ?? true,
      select: param.select ?? param.enabled ?? true
    }))
    node.item.queryParams.push(generateEmptyProperty())
  }
  if (aiData.headers && Array.isArray(aiData.headers)) {
    node.item.headers = aiData.headers.map((header: any) => ({
      _id: nanoid(),
      key: header.key || '',
      value: header.value || '',
      type: header.type || 'string',
      description: header.description || '',
      required: header.required ?? false,
      select: header.select ?? header.enabled ?? true
    }))
    node.item.headers.push(generateEmptyProperty())
  }
  if (aiData.sendMessage) {
    node.item.messageBlocks = [{
      id: nanoid(),
      name: '',
      content: aiData.sendMessage,
      messageType: 'json',
      order: 0
    }]
  }
}
const mergeAiDataToHttpMockNode = (node: HttpMockNode, aiData: any) => {
  if (aiData.description) {
    node.info.description = aiData.description
  }
  if (aiData.methods && Array.isArray(aiData.methods)) {
    node.requestCondition.method = aiData.methods
  }
  if (aiData.url) {
    node.requestCondition.url = aiData.url
  }
  if (aiData.port && typeof aiData.port === 'number') {
    node.requestCondition.port = aiData.port
  }
  if (aiData.statusCode && typeof aiData.statusCode === 'number' && node.response[0]) {
    node.response[0].statusCode = aiData.statusCode
  }
  if (aiData.responseData && node.response[0]) {
    node.response[0].jsonConfig.fixedData = aiData.responseData
  }
}
/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
const handleAddFile = () => {
  form.value?.validate(async (valid) => {
    if (!valid) {
      message.warning(t('请完善必填信息'));
      return;
    }
    loading.value = true;
    if(isStandalone.value && formData.value.type === 'http'){
      const nodeInfo = generateEmptyHttpNode(nanoid())
      nodeInfo.info.name = formData.value.name
      nodeInfo.projectId = route.query.id as string
      nodeInfo.pid = props.pid
      nodeInfo.sort = Date.now()
      nodeInfo.isDeleted = false;
      nodeInfo.createdAt = new Date().toISOString()
      nodeInfo.updatedAt = nodeInfo.createdAt

      if (formData.value.aiPrompt.trim()) {
        const aiResult = await callAiToGenerateNodeData('http', formData.value.aiPrompt)
        if (aiResult.success && aiResult.data) {
          mergeAiDataToHttpNode(nodeInfo, aiResult.data)
        } else {
          console.log(aiResult)
          message.warning(t('AI生成接口数据失败,已创建空接口') + (aiResult.error ? `: ${aiResult.error}` : ''))
        }
      }

      await apiNodesCache.addNode(nodeInfo)
      emits('success', {
        _id: nodeInfo._id,
        pid: nodeInfo.pid,
        sort: nodeInfo.sort,
        name: nodeInfo.info.name,
        type: formData.value.type,
        method: nodeInfo.item.method,
        url: nodeInfo.item.url ? nodeInfo.item.url.path : '',
        maintainer: nodeInfo.info.maintainer,
        updatedAt: nodeInfo.updatedAt,
      });
      handleClose();
      loading.value = false;
      return;
    } else if (isStandalone.value && formData.value.type === 'httpMock') {
      const mockNode = generateEmptyHttpMockNode(nanoid())
      mockNode.info.name = formData.value.name
      mockNode.projectId = route.query.id as string
      mockNode.pid = props.pid
      mockNode.sort = Date.now()
      mockNode.isDeleted = false;
      mockNode.createdAt = new Date().toISOString()
      mockNode.updatedAt = mockNode.createdAt

      if (formData.value.aiPrompt.trim()) {
        const aiResult = await callAiToGenerateNodeData('httpMock', formData.value.aiPrompt)
        if (aiResult.success && aiResult.data) {
          mergeAiDataToHttpMockNode(mockNode, aiResult.data)
        } else {
          message.warning(t('AI生成接口数据失败,已创建空接口') + (aiResult.error ? `: ${aiResult.error}` : ''))
        }
      }

      await apiNodesCache.addNode(mockNode)
      emits('success', {
        _id: mockNode._id,
        pid: mockNode.pid,
        sort: mockNode.sort,
        name: mockNode.info.name,
        type: formData.value.type,
        method: mockNode.requestCondition.method,
        url: mockNode.requestCondition.url,
        port: mockNode.requestCondition.port,
        maintainer: mockNode.info.maintainer,
        updatedAt: mockNode.updatedAt,
      });
      handleClose();
      loading.value = false;
      return;
    } else if (isStandalone.value && formData.value.type === 'websocketMock') {
      const wsMockNode = generateEmptyWebSocketMockNode(nanoid())
      wsMockNode.info.name = formData.value.name
      wsMockNode.projectId = route.query.id as string
      wsMockNode.pid = props.pid
      wsMockNode.sort = Date.now()
      wsMockNode.isDeleted = false
      wsMockNode.createdAt = new Date().toISOString()
      wsMockNode.updatedAt = wsMockNode.createdAt
      await apiNodesCache.addNode(wsMockNode)
      emits('success', {
        _id: wsMockNode._id,
        pid: wsMockNode.pid,
        sort: wsMockNode.sort,
        name: wsMockNode.info.name,
        type: formData.value.type,
        port: wsMockNode.requestCondition.port,
        path: wsMockNode.requestCondition.path,
        maintainer: wsMockNode.info.maintainer,
        updatedAt: wsMockNode.updatedAt,
      })
      handleClose()
      loading.value = false
      return
    } else if (isStandalone.value && formData.value.type === 'websocket') {
      const websocketNode = generateEmptyWebsocketNode(nanoid())
      websocketNode.info.name = formData.value.name
      websocketNode.projectId = route.query.id as string
      websocketNode.pid = props.pid
      websocketNode.sort = Date.now()
      websocketNode.isDeleted = false;
      websocketNode.createdAt = new Date().toISOString()
      websocketNode.updatedAt = websocketNode.createdAt

      if (formData.value.aiPrompt.trim()) {
        const aiResult = await callAiToGenerateNodeData('websocket', formData.value.aiPrompt)
        if (aiResult.success && aiResult.data) {
          mergeAiDataToWebSocketNode(websocketNode, aiResult.data)
        } else {
          message.warning(t('AI生成接口数据失败,已创建空接口') + (aiResult.error ? `: ${aiResult.error}` : ''))
        }
      }

      await apiNodesCache.addNode(websocketNode)
      emits('success', {
        _id: websocketNode._id,
        pid: websocketNode.pid,
        sort: websocketNode.sort,
        name: websocketNode.info.name,
        type: formData.value.type,
        protocol: websocketNode.item.protocol,
        url: websocketNode.item.url ? websocketNode.item.url.path : '',
        maintainer: websocketNode.info.maintainer,
        updatedAt: websocketNode.updatedAt,
      });
      handleClose();
      loading.value = false;
      return
    }

    if (valid) {
      loading.value = true;
      const params = {
        name: formData.value.name,
        type: formData.value.type,
        projectId: route.query.id as string,
        pid: props.pid,
      };
      request.post<CommonResponse<ApidocBanner>, CommonResponse<ApidocBanner>>('/api/project/new_doc', params).then((res) => {
        emits('success', res.data); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
        handleClose();
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        loading.value = false;
      });
    } else {
      message.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
const handleOpenAiSettings = () => {
  appState.setActiveLocalDataMenu('ai-settings')
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.openSettingsTab)
  router.push('/settings')
}
const handleClose = () => {
  formData.value.type = 'http';
  formData.value.name = '';
  formData.value.aiPrompt = '';
  form.value?.resetFields();
  emits('update:modelValue', false);
}

</script>

<style lang='scss'>
.add-file-dialog__footer {
  padding-top: 0;
}
.add-file-dialog__content {
  .el-form-item {
    margin-bottom: 10px;
  }
}
.el-dialog__body.add-file-dialog__body {
  padding-bottom: 0;
}
.ai-prompt-label {
  display: flex;
  align-items: center;
}
.ai-config-btn-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 2px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-base);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}
.ai-config-btn-inline:hover {
  background: var(--bg-hover);
  border-color: var(--theme-color);
}
</style>
