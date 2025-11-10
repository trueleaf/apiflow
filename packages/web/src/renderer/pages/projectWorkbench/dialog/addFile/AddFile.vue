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
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="isStandalone" :label="t('AI提示词')" prop="aiPrompt">
        <CodeEditor
          v-model="formData.aiPrompt"
          language="javascript"
          :auto-height="true"
          :min-height="120"
          :max-height="300"
          :config="editorConfig"
          placeholder="可自动识别自然语言描述、cURL请求、任意类型接口结构数据"
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
import { useRoute } from 'vue-router';
import { generateEmptyHttpMockNode, generateEmptyHttpNode, generateEmptyWebsocketNode } from '@/helper';
import { apiNodesCache } from '@/cache/index';
import { nanoid } from 'nanoid';
import { useRuntime } from '@/store/runtime/runtimeStore';
import CodeEditor from '@/components/common/codeEditor/CodeEditor.vue';

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
      //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
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
    
    } else if (isStandalone.value && formData.value.type === 'websocket') {
      const websocketNode = generateEmptyWebsocketNode(nanoid())
      websocketNode.info.name = formData.value.name
      websocketNode.projectId = route.query.id as string
      websocketNode.pid = props.pid
      websocketNode.sort = Date.now()
      websocketNode.isDeleted = false;
      websocketNode.createdAt = new Date().toISOString()
      websocketNode.updatedAt = websocketNode.createdAt
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
</style>
