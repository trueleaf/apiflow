
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('新增菜单')" :before-close="handleClose">
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
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleAddMenu">{{ t('确定/AdminMenuAdd') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { CommonResponse } from '@src/types'
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
const formRef = ref<FormInstance>()
const formData = ref({
  name: '',
  path: ''
})
const rules = {
  name: [{ required: true, message: t('请输入') + t('菜单名称'), trigger: 'blur' }],
  path: [{ required: true, message: t('请输入') + t('路径'), trigger: 'blur' }]
}
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
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params = {
        ...formData.value,
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
