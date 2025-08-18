<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('批量修改服务端路由类型')" @close="handleClose">
    <SForm ref="form">
      <SFormItem :label="t('分组名称')" prop="groupName" required one-line></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSaveServerRoute">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref } from 'vue'
import type { PermissionServerRoute } from '@src/types'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import { FormInstance } from 'element-plus'
import { request } from '@/api/api'
import { useTranslation } from 'i18next-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object as PropType<PermissionServerRoute[]>,
    default: () => [],
  },
})
const emits = defineEmits(['update:modelValue', 'success']);
const { t } = useTranslation()

const loading = ref(false);
const form = ref<FormInstance>();
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
const handleSaveServerRoute = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } = form.value as any;
      const params = {
        ids: props.editData.map((v) => v._id),
        groupName: formInfo.groupName,
      };
      loading.value = true;
      request.put('/api/security/server_routes_type', params).then(() => {
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
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
</script>
