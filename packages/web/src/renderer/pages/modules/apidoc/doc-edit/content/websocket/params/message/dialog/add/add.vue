<template>
  <el-dialog
    v-model="visible"
    :title="t('创建消息模板')"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="templateFormRef"
      :model="templateForm"
      :rules="templateFormRules"
      label-width="80px"
    >
      <el-form-item :label="t('消息模板名称')" prop="name">
        <el-input
          v-model="templateForm.name"
          :placeholder="t('请输入消息模板名称')"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item :label="t('消息数据类型')" prop="messageType">
        <el-select v-model="templateForm.messageType" style="width: 100%">
          <el-option value="text" :label="t('文本')" />
          <el-option value="json" label="JSON" />
          <el-option value="xml" label="XML" />
          <el-option value="html" label="HTML" />
          <el-option value="binary-base64" :label="t('二进制(Base64)')" />
          <el-option value="binary-hex" :label="t('二进制(Hex)')" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('消息数据值')" prop="sendMessage">
        <el-input
          v-model="templateForm.sendMessage"
          type="textarea"
          :rows="6"
          :placeholder="t('请输入消息数据值')"
          maxlength="10000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('取消') }}</el-button>
        <el-button type="primary" @click="handleCreateTemplate" :loading="createTemplateLoading">
          {{ t('确定') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWebSocket } from '@/store/websocket/websocket';
import { uuid } from '@/helper';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { MessageType, WebsocketSendMessageTemplate } from '@src/types/websocket/websocket';

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
const { t } = useI18n();
const websocketStore = useWebSocket();
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const createTemplateLoading = ref(false);
const templateFormRef = ref<FormInstance>();
const templateForm = reactive({
  name: '',
  messageType: 'text' as MessageType,
  sendMessage: ''
});

// 模板表单验证规则
const templateFormRules: FormRules = {
  name: [
    { required: true, message: t('消息模板名称不能为空'), trigger: 'blur' },
    { min: 1, max: 50, message: t('模板名称长度在 1 到 50 个字符'), trigger: 'blur' }
  ],
  messageType: [
    { required: true, message: t('请选择数据类型'), trigger: 'change' }
  ],
  sendMessage: [
    { required: true, message: t('请输入消息数据值'), trigger: 'blur' }
  ]
};

// 监听弹窗打开状态，设置默认值
watch(() => props.modelValue, (newValue: boolean) => {
  if (newValue) {
    templateForm.name = '';
    templateForm.messageType = websocketStore.websocket.config.messageType;
    templateForm.sendMessage = websocketStore.websocket.item.sendMessage;
  }
});

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false);
  templateForm.name = '';
  templateForm.messageType = 'text';
  templateForm.sendMessage = '';
  templateFormRef.value?.resetFields();
};

// 创建模板
const handleCreateTemplate = async () => {
  if (!templateFormRef.value) return;

  try {
    await templateFormRef.value.validate();

    createTemplateLoading.value = true;

    const newTemplate: WebsocketSendMessageTemplate = {
      id: uuid(),
      name: templateForm.name,
      sendMessage: templateForm.sendMessage,
      messageType: templateForm.messageType,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    websocketStore.addMessageTemplate(newTemplate);
    handleClose();
  } catch (error) {
    console.error('创建模板失败:', error);
    ElMessage.error(t('模板创建失败'));
  } finally {
    createTemplateLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
</style>
