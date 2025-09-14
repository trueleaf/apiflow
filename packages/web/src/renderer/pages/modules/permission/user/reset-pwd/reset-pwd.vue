
<template>
  <SDialog :model-value="modelValue" title="重置密码" @close="handleClose">
    <SForm ref="form" v-loading="loading2" :edit-data="formInfo">
      <SFormItem label="新密码" prop="password" required :min-length="6" one-line></SFormItem>
    </SForm>
    <template #footer>
      <div>
        <el-button :loading="loading" type="primary" @click="handleEditUser">{{ t("确定") }}</el-button>
        <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
      </div>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { nextTick, ref } from 'vue';
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /*
    * 用户id
  */
  userId: {
    type: String,
    default: ''
  },
})
const emits = defineEmits(['success', 'update:modelValue'])
const formInfo = ref<Record<string, unknown>>({}); //用户基本信息
const { t } = useI18n()

const loading = ref(false); //-----------------------用户信息加载
const loading2 = ref(false); //----------------------修改用户加载
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//修改用户
const handleEditUser = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } = form.value as any;
      const params = {
        userId: props.userId,
        password: formInfo.password,
      };
      loading.value = true;
      request.put('/api/security/reset_password', params).then(() => {
        emits('success');
        ElMessage.success('重置成功')
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => (document.querySelector('.el-form-item.is-error input') as HTMLInputElement)?.focus());
      ElMessage.warning('请完善必填信息');
      loading.value = false;
    }
  });
}
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
</script>
