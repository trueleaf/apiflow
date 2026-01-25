
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('编辑菜单')" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="t('菜单名称') + '：'" prop="name">
            <el-input v-model="formData.name" :placeholder="t('请输入') + t('菜单名称')" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('路径') + '：'" prop="path">
            <el-input v-model="formData.path" :placeholder="t('请输入') + t('路径')" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ t('取消') }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleEditMenu">{{ t('确定/AdminMenuEdit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FormInstance } from 'element-plus'
import { request } from '@/api/api'

const modelValue = defineModel<boolean>({
  default: false
})
const props = defineProps({
  data: {
    type: Object as PropType<any>,
    default: ( ) => null,
  },
})
const emits = defineEmits(['success'])
const { t } = useI18n()

const loading = ref(false);
const formRef = ref<FormInstance>()
const formData = ref({
  _id: '',
  name: '',
  path: ''
})
const rules = {
  name: [{ required: true, message: t('请输入') + t('菜单名称'), trigger: 'blur' }],
  path: [{ required: true, message: t('请输入') + t('路径'), trigger: 'blur' }]
}
watch(() => props.data, (newData) => {
  if (newData) {
    formData.value._id = newData._id || ''
    formData.value.name = newData.name || ''
    formData.value.path = newData.path || ''
  }
}, { deep: true, immediate: true })
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}
//编辑菜单
const handleEditMenu = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params = {
        name: formData.value.name,
        path: formData.value.path,
        _id: formData.value._id,
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
