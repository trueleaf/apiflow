
<template>
  <SDialog :model-value="modelValue" :title="t('新增用户')" @close="handleClose">
    <el-divider content-position="left">{{ t('基础信息') }}</el-divider>
    <SForm ref="form">
      <SFormItem :label="t('登录名称')" prop="loginName" required half-line></SFormItem>
      <SFormItem :label="t('昵称')" prop="realName" half-line></SFormItem>
      <SFormItem :label="t('手机号')" prop="phone" half-line></SFormItem>
    </SForm>
    <el-divider content-position="left">{{ t("角色选择") }}</el-divider>
    <el-checkbox-group v-model="roleIds">
      <el-checkbox v-for="(item, index) in roleEnum" :key="index" :value="item._id">{{ item.roleName }}</el-checkbox>
    </el-checkbox-group>
    <el-alert title="新添加用户默认密码：111111" type="warning" :closable="false" />
    <template #footer>
      <div>
        <el-button :loading="loading" type="primary" @click="handleAddUser">{{ t("确定") }}</el-button>
        <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
      </div>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { PermissionRoleEnum, Response } from '@src/types/global'
import { ElMessage, FormInstance } from 'element-plus';
import { t } from 'i18next'
import { nextTick, onMounted, ref } from 'vue';
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['success', 'update:modelValue']);
const roleIds = ref<string[]>([]);
const roleEnum = ref<PermissionRoleEnum>([]);
const loading = ref(false);
const form = ref<FormInstance>();
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取角色枚举信息
const getRoleEnum = () => {
  request.get<Response<PermissionRoleEnum>, Response<PermissionRoleEnum>>('/api/security/role_enum').then((res) => {
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
        realName: formInfo.realName,
        phone: formInfo.phone,
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
      ElMessage.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}

onMounted(() => {
  getRoleEnum(); //获取角色枚举信息
})


</script>
