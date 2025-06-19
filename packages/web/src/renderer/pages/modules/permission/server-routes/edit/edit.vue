<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('修改服务端路由')" @close="handleClose">
    <SForm ref="form" :edit-data="formInfo">
      <SFormItem :label="t('名称')" prop="name" required one-line></SFormItem>
      <SFormItem :label="t('请求方法')" prop="method" required one-line></SFormItem>
      <SFormItem :label="t('路径')" prop="path" required one-line></SFormItem>
      <SFormItem :label="t('分组名称')" prop="groupName" required one-line></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSaveServerRoute">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref, watch } from 'vue'
import type { PermissionServerRoute } from '@src/types/global'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import { FormInstance } from 'element-plus'
import { request } from '@/api/api'
import { t } from 'i18next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object as PropType<PermissionServerRoute>,
    default: () => ({})
  },
})
const emits = defineEmits(['update:modelValue', 'success'])
const formInfo = ref({});
const loading = ref(false);
const form = ref<FormInstance>()
watch(props.editData, (val) => {
  formInfo.value = val;
}, {
  immediate: true
})
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
const handleSaveServerRoute = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } = form.value as any;
      const params = {
        ...formInfo,
      };
      loading.value = true;
      request.put('/api/security/server_routes', params).then(() => {
        emits('success');
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
          (input as HTMLInputElement).focus();
        }
      });
      loading.value = false;
    }
  });
}

</script>
