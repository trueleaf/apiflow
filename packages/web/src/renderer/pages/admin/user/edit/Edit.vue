
<template>
    <el-dialog :model-value="modelValue" :title="t('修改')" :before-close="handleClose">
    <el-divider content-position="left">{{ t("基础信息") }}</el-divider>
    <SForm ref="form" v-loading="loading2" :edit-data="formInfo">
      <SFormItem :label="t('登录名称')" prop="loginName" required half-line></SFormItem>
    </SForm>
    <el-divider content-position="left">{{ t("角色选择") }}</el-divider>
    <el-checkbox-group v-model="roleIds">
      <el-checkbox v-for="(item, index) in roleEnum" :key="index" :value="item._id">{{ item.roleName }}</el-checkbox>
    </el-checkbox-group>
    <template #footer>
      <div>
        <el-button @click="handleClose">{{ t("取消") }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleEditUser">{{ t("确定") }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { PermissionRoleEnum, CommonResponse } from '@src/types'
import { nextTick, onMounted, ref } from 'vue';
import { request } from '@/api/api';
import { FormInstance } from 'element-plus';
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'


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
const formInfo = ref<Record<string, unknown>>({}) //用户基本信息
const roleIds = ref<string[]>([]) //角色id列表
const roleEnum = ref<PermissionRoleEnum>([]) //角色枚举信息
const { t } = useI18n()

const loading = ref(false) //用户信息加载
const loading2 = ref(false) //修改用户加载
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取用户基本信息
const getUserInfo = () => {
  loading2.value = true;
  request.get('/api/security/user_info_by_id', { params: { _id: props.userId } }).then((res) => {
    formInfo.value = {
      loginName: res.data.loginName,
      isAdmin: res.data.isAdmin2,
    };
    roleIds.value = res.data.roleIds;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading2.value = false;
  });
}
//获取角色枚举信息
const getRoleEnum = () => {
  request.get<CommonResponse<PermissionRoleEnum>, CommonResponse<PermissionRoleEnum>>('/api/security/role_enum').then((res) => {
    roleEnum.value = res.data;
  }).catch((err) => {
    console.error(err);
  });
}
//修改用户
const handleEditUser = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const { formInfo } = form.value as any;
      const roleNames = roleIds.value.map((val) => {
        const user = roleEnum.value.find((role) => role._id === val);
        return user ? user.roleName : '';
      });
      const params = {
        _id: props.userId,
        loginName: formInfo.loginName,
        roleIds: roleIds.value,
        roleNames,
      };
      loading.value = true;
      request.put('/api/security/user_permission', params).then(() => {
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
  getUserInfo(); //获取用户基本信息
})

</script>
