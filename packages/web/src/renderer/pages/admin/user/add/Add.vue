
<template>
    <el-dialog :model-value="modelValue" :title="t('新增用户')" :before-close="handleClose">
    <el-divider content-position="left">{{ t('基础信息') }}</el-divider>
    <SForm ref="form">
      <SFormItem :label="t('登录名称')" prop="loginName" required half-line></SFormItem>
    </SForm>
    <el-divider content-position="left">{{ t("角色选择") }}</el-divider>
    <el-checkbox v-model="isAdmin">{{ t('是否为管理员') }}</el-checkbox>
    <el-alert :title="t('新添加的用户默认密码：111111')" type="warning" :closable="false" />
    <template #footer>
      <div>
        <el-button @click="handleClose">{{ t("取消") }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleAddUser">{{ t('确定/AdminUserAdd') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { PermissionRoleEnum, CommonResponse } from '@src/types'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, onMounted, ref } from 'vue';
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'

import { message } from '@/helper'
type ClFormExpose = { validate: (callback: (valid: boolean) => void) => void; formInfo: { value: Record<string, unknown> } }
const modelValue = defineModel<boolean>({
  default: false
})
const emits = defineEmits(['success']);
const roleIds = ref<string[]>([]);
const roleEnum = ref<PermissionRoleEnum>([]);
const { t } = useI18n()

const loading = ref(false);
const form = ref<ClFormExpose | null>(null);
// 获取角色id
const getRoleIdByName = (roleName: '普通用户' | '管理员') => roleEnum.value.find(role => role.roleName === roleName)?._id
// 初始化默认角色
const initDefaultRoleIds = () => {
  const userRoleId = getRoleIdByName('普通用户')
  if (!userRoleId || roleIds.value.length > 0) {
    return
  }
  roleIds.value = [userRoleId]
}
// 更新管理员权限
const updateRoleIdsByAdmin = (checked: boolean) => {
  const userRoleId = getRoleIdByName('普通用户')
  const adminRoleId = getRoleIdByName('管理员')
  if (!userRoleId) {
    return
  }
  const roleIdSet = new Set(roleIds.value)
  roleIdSet.add(userRoleId)
  if (checked) {
    if (adminRoleId) {
      roleIdSet.add(adminRoleId)
    }
  } else if (adminRoleId) {
    roleIdSet.delete(adminRoleId)
  }
  roleIds.value = Array.from(roleIdSet)
}
const isAdmin = computed({
  get: () => {
    const adminRoleId = getRoleIdByName('管理员')
    if (!adminRoleId) {
      return false
    }
    return roleIds.value.includes(adminRoleId)
  },
  set: (checked: boolean) => {
    updateRoleIdsByAdmin(checked)
  },
})
// 获取角色枚举信息
const getRoleEnum = () => {
  request.get<CommonResponse<PermissionRoleEnum>, CommonResponse<PermissionRoleEnum>>('/api/security/role_enum').then((res) => {
    roleEnum.value = res.data;
    initDefaultRoleIds();
  }).catch((err) => {
    console.error(err);
  });
}
// 新增用户
const handleAddUser = ()  => {
  form.value?.validate((valid) => {
    if (valid) {
      const formModel = form.value?.formInfo.value
      const loginName = typeof formModel?.loginName === 'string' ? formModel.loginName : ''
      const roleNames = roleIds.value.map((val) => {
        const user = roleEnum.value.find((role) => role._id === val);
        return user ? user.roleName : '';
      });
      const params = {
        loginName,
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
// 关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}

onMounted(() => {
  getRoleEnum(); // 获取角色枚举信息
})


</script>
