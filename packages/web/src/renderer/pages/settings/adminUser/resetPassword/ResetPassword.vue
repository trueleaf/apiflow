
<template>
  <el-dialog :model-value="modelValue" :title="t('重置密码')" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" v-loading="loading2">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="t('新密码') + '：'" prop="password">
            <el-input v-model="formData.password" :placeholder="t('请输入') + t('新密码')" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="handleClose">{{ t("取消") }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleEditUser">{{ t('确定/AdminUserResetPassword') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { nextTick, ref } from 'vue';
import { message } from '@/helper'

const modelValue = defineModel<boolean>({
  default: false
})
const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
})
const emits = defineEmits(['success'])
const { t } = useI18n()

const loading = ref(false);
const loading2 = ref(false);
const formRef = ref<FormInstance>()
const formData = ref({
  password: ''
})
const rules = {
  password: [
    { required: true, message: t('请输入') + t('新密码'), trigger: 'blur' },
    { min: 6, message: t('密码长度不能少于6位'), trigger: 'blur' }
  ]
}
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//修改用户
const handleEditUser = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const params = {
        userId: props.userId,
        password: formData.value.password,
      };
      loading.value = true;
      request.put('/api/security/reset_password', params).then(() => {
        emits('success');
        message.success(t('重置成功'))
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => (document.querySelector('.el-form-item.is-error input') as HTMLInputElement)?.focus());
      message.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
//关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}
</script>
