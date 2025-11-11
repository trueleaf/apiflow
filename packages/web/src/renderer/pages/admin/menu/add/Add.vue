
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('新增菜单')" :before-close="handleClose">
    <SForm ref="form">
      <SFormItem :label="t('菜单名称')" prop="name" one-line required></SFormItem>
      <SFormItem :label="t('路径')" prop="path" one-line required></SFormItem>
    </SForm>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleAddMenu">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { CommonResponse } from '@src/types'
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

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
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params = {
        ...formData,
        pid: props.pid,
      };
      request.post<CommonResponse<{ _id: string }>, CommonResponse<{ _id: string }>>('/api/security/client_menu', params).then((res) => {
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