
<template>
    <el-dialog :model-value="modelValue" :title="t('新增用户')" :before-close="handleClose">
    <el-divider content-position="left">{{ t('基础信息') }}</el-divider>
    <SForm ref="form">
      <SFormItem :label="t('登录名称')" prop="loginName" required half-line></SFormItem>
    </SForm>
    <el-divider content-position="left">{{ t("角色选择") }}</el-divider>
    <el-checkbox-group v-model="roleIds">
      <el-checkbox v-for="(item, index) in roleEnum" :key="index" :value="item._id">{{ item.roleName }}</el-checkbox>
    </el-checkbox-group>
    <el-alert :title="t('新添加的用户默认密码：111111')" type="warning" :closable="false" />
    <template #footer>
      <div>
        <el-button @click="handleClose">{{ t("取消") }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleAddUser">{{ t("确定") }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { PermissionRoleEnum, CommonResponse } from '@src/types'
import { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { nextTick, onMounted, ref } from 'vue';
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'


import { message } from '@/helper'
const modelValue = defineModel<boolean>({
  default: false
})
const emits = defineEmits(['success']);
const roleIds = ref<string[]>([]);
const roleEnum = ref<PermissionRoleEnum>([]);
const { t } = useI18n()

const loading = ref(false);
const form = ref<FormInstance>();
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取角色枚举信息
const getRoleEnum = () => {
  request.get<CommonResponse<PermissionRoleEnum>, CommonResponse<PermissionRoleEnum>>('/api/security/role_enum').then((res) => {
    roleEnum.value = res.data;
  }).catch((err) => {
    console.error(err);
  });
}
//新增用户
const handleAddUser = ()  => {
  form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } = form.value as any;
      const roleNames = roleIds.value.map((val) => {
        const user = roleEnum.value.find((role) => role._id === val);
        return user ? user.roleName : '';
      });
      const params = {
        loginName: formInfo.loginName,
        roleIds: roleIds.value,
        roleNames,
      };
      loading.value = true;
      request.post('/api/security/useradd', params).then(() => {
        emits('success');
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

onMounted(() => {
  getRoleEnum(); //获取角色枚举信息
})


</script>
