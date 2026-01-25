<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('修改服务端路由')" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="t('名称') + '：'" prop="name">
            <el-input v-model="formData.name" :placeholder="t('请输入名称')" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('请求方法') + '：'" prop="method">
            <el-input v-model="formData.method" :placeholder="t('请输入请求方法')" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('路径') + '：'" prop="path">
            <el-input v-model="formData.path" :placeholder="t('请输入路径')" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('分组名称') + '：'" prop="groupName">
            <el-input v-model="formData.groupName" :placeholder="t('请输入分组名称')" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleSaveServerRoute">{{ t('确定/AdminServerRoutesEdit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref, watch } from 'vue'
import type { PermissionServerRoute } from '@src/types'
import { FormInstance, FormRules } from 'element-plus'
import { request } from '@/api/api'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  editData: {
    type: Object as PropType<PermissionServerRoute>,
    default: () => ({})
  },
})
const modelValue = defineModel<boolean>({
  default: false
})
const emits = defineEmits(['success'])
const { t } = useI18n()

const formData = ref({
  name: '',
  method: '',
  path: '',
  groupName: '',
  _id: ''
});
const rules: FormRules = {
  name: [{ required: true, message: t('请输入名称'), trigger: 'blur' }],
  method: [{ required: true, message: t('请输入请求方法'), trigger: 'blur' }],
  path: [{ required: true, message: t('请输入路径'), trigger: 'blur' }],
  groupName: [{ required: true, message: t('请输入分组名称'), trigger: 'blur' }],
}
const loading = ref(false);
const formRef = ref<FormInstance>()
watch(() => props.editData, (val) => {
  if (val) {
    formData.value.name = val.name || ''
    formData.value.method = (val as typeof val & { method?: string }).method || ''
    formData.value.path = val.path || ''
    formData.value.groupName = val.groupName || ''
    formData.value._id = val._id || ''
  }
}, {
  immediate: true,
  deep: true
})
//关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}
//保存服务端路由
const handleSaveServerRoute = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const params = {
        ...formData.value,
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
