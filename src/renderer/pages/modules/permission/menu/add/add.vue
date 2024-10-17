
<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('新增菜单')" @close="handleClose">
    <SForm ref="form">
      <SFormItem :label="t('菜单名称')" prop="name" one-line required></SFormItem>
      <SFormItem :label="t('路径')" prop="path" one-line required></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleAddMenu">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { Response } from '@src/types/global'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import { nextTick, ref } from 'vue';
import { t } from 'i18next'
import { FormInstance } from 'element-plus';
import { request } from '@/api/api';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pid: {
    type: String,
    default: '',
  },
})
const emits = defineEmits({
  'update:modelValue': null,
  success(payload: string) {
    return payload
  }
})
const loading = ref(false);
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
//新增菜单
const handleAddMenu = () => {
  const formData = (form.value as any).formInfo;
  console.log(form.value)
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params = {
        ...formData,
        pid: props.pid,
      };
      request.post<Response<{ _id: string }>, Response<{ _id: string }>>('/api/security/client_menu', params).then((res) => {
        handleClose();
        emits('success', res.data._id);
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input');
        if (input) {
          (input as HTMLInputElement).focus();
        }
      });
      loading.value = false;
    }
  });
}

</script>