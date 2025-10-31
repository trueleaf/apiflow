
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('编辑菜单')" :before-close="handleClose">
    <SForm ref="form" :edit-data="data">
      <SFormItem :label="t('菜单名称')" prop="name" one-line required></SFormItem>
      <SFormItem :label="t('路径')" prop="path" one-line required></SFormItem>
    </SForm>
    <template #footer>
      <el-button @click="handleClose">{{ t('取消') }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleEditMenu">{{ t('确定') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref } from 'vue'
import SForm from '@/components/common/forms/form/GForm.vue'
import SFormItem from '@/components/common/forms/form/GFormItem.vue'
import { useI18n } from 'vue-i18n'
import { FormInstance } from 'element-plus'
import { request } from '@/api/api'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<any>,
    default: ( ) => null,
  },
})
const emits = defineEmits(['update:modelValue', 'success'])
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
//编辑菜单
const handleEditMenu = () => {
  const formData = (form.value as any).formInfo;
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params = {
        name: formData.name,
        path: formData.path,
        _id: formData._id,
      };
      request.put('/api/security/client_menu', params).then(() => {
        handleClose();
        emits('success');
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
