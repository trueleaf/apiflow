
<template>
  <SDialog :model-value="modelValue" width="30%" title="保存用例" @close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px" :inline="false">
      <el-form-item label="用例名称：" prop="name">
        <el-input v-model="formInfo.name" v-focus-select></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSave">{{ t("保存") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { ref, Ref, nextTick } from 'vue'
import { router } from '@/router';
import { FormInstance, FormRules } from 'element-plus';
import { t } from 'i18next'
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { request } from '@/api/api';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue'])
const apidocStore = useApidoc();
const apidocBaseInfoStore = useApidocBaseInfo()
const loading = ref(false);
const formInfo = ref({ name: '' });
const rules: Ref<FormRules> = ref({
  name: [
    { required: true, message: '请填写用例名称', trigger: 'blur' },
  ],
});
const formInstance: Ref<(FormInstance & { fomrInfo: Record<string, unknown> }) | null> = ref(null);
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
//保存为用例
const handleSave = () => {
  formInstance.value?.validate((valid) => {
    if (valid) {
      const bodyParams = apidocStore.apidoc.item.requestBody.rawJson
      const params = {
        name: formInfo.value.name,
        presetParamsType: 'bodyParams',
        projectId: router.currentRoute.value.query.id,
        items: bodyParams,
      };
      loading.value = true;
      request.post('/api/project/doc_preset_params', params).then((res) => {
        apidocBaseInfoStore.addParamsTemplate(res.data);
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input');
        if (input) {
          (input as HTMLElement).focus();
        }
      });
    }
  });
}
</script>
