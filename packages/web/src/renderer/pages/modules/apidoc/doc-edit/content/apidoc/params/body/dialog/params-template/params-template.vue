<template>
  <SDialog :model-value="modelValue" width="30%" :title="t('保存参数为模板')" @close="handleClose">
    <SForm ref="form">
      <SFormItem label="模板名称" prop="name" one-line required></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSave">{{ t("保存") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import { nextTick, ref } from 'vue';
import { FormInstance } from 'element-plus';
import { useApidoc } from '@/store/apidoc/apidoc';
import { useRoute } from 'vue-router';
import { request } from '@/api/api';
import { useTranslation } from 'i18next-vue' 
import { useApidocBaseInfo } from '@/store/apidoc/base-info';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue'])
const { t } = useTranslation()

const loading = ref(false);
const form = ref<FormInstance>();
const apidocStore = useApidoc()
const apidocBaseStore = useApidocBaseInfo()
const route = useRoute()

const handleSave = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } = form.value as any;
      const bodyParams = apidocStore.apidoc.item.requestBody.rawJson
      const params = {
        name: formInfo.name,
        presetParamsType: 'bodyParams',
        projectId: route.query.id as string,
        items: bodyParams,
      };
      loading.value = true;
      request.post('/api/project/doc_preset_params', params).then((res) => {
        apidocBaseStore.addParamsTemplate(res.data);
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input');
        if (input) {
          (input as HTMLElement).focus();
        }
      });
    }
  });
}
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
</script>
