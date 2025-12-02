<template>
  <el-dialog :model-value="modelValue" top="10vh" width="35vw" :title="t('修改项目')" :before-close="handleClose" @opened="handleDialogOpened">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px" @submit.prevent="() => {}">
      <el-form-item :label="`${t('项目名称')}`" prop="projectName">
        <el-input ref="projectNameInput" v-model="formInfo.projectName" :size="config.renderConfig.layout.size"
          :placeholder="t('请输入项目名称')" @keydown.enter="handleEditProject"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleEditProject">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { config } from '@src/config/config';
import { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { nextTick, ref, watch } from 'vue';
import { useProjectStore } from '@/store/project/projectStore';
import { message } from '@/helper'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: String,
    default: '',
  },
  projectName: {
    type: String,
    default: '',
  },
  isFocus: {
    type: Boolean,
    default: true,
  },
})
const emits = defineEmits(['update:modelValue', 'success'])
const { t } = useI18n()

const projectStore = useProjectStore();
const projectNameInput = ref()
const formInfo = ref({
  projectName: '',
})
//对话框打开后聚焦并选中输入框
const handleDialogOpened = () => {
  if (props.isFocus) {
    nextTick(() => {
      const inputEl = projectNameInput.value?.$el?.querySelector('input') || projectNameInput.value?.$el;
      if (inputEl && inputEl.tagName === 'INPUT') {
        inputEl.focus();
        inputEl.select();
      }
    });
  }
};
const rules = ref({
  projectName: [
    { required: true, trigger: 'blur', message: t('请填写项目名称') },
    { 
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value || !value.trim()) {
          callback(new Error(t('项目名称不能为空或仅包含空格')));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
})
const loading = ref(false);
const form = ref<FormInstance>();

watch(() => props.projectName, (val) => {
  formInfo.value.projectName = val
}, { immediate: true })

const handleClose = () => {
  emits('update:modelValue', false)
}
//修改项目
const handleEditProject = () => {
  form.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const success = await projectStore.updateProject(props.projectId, formInfo.value.projectName);
        if (success) {
          handleClose();
          emits('success', {
            id: props.projectId,
            name: formInfo.value.projectName,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    } else {
      nextTick(() => {
        const input: HTMLInputElement = document.querySelector('.el-form-item.is-error input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
      message.warning(t('请完善必填信息'));
      loading.value = false;
    }
  })
}
</script>
