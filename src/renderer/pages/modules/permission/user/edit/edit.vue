
<template>
  <SDialog :model-value="modelValue" :title="t('修改')" @close="handleClose">
    <el-divider content-position="left">{{ t("基础信息") }}</el-divider>
    <SForm ref="form" v-loading="loading2" :edit-data="formInfo">
      <SFormItem :label="t('登录名称')" prop="loginName" required half-line></SFormItem>
      <SFormItem :label="t('昵称')" prop="realName" half-line></SFormItem>
      <SFormItem :label="t('手机号')" prop="phone" half-line></SFormItem>
    </SForm>
    <el-divider content-position="left">{{ t("角色选择") }}</el-divider>
    <el-checkbox-group v-model="roleIds">
      <el-checkbox v-for="(item, index) in roleEnum" :key="index" :value="item._id">{{ item.roleName }}</el-checkbox>
    </el-checkbox-group>
    <template #footer>
      <div>
        <el-button :loading="loading" type="primary" @click="handleEditUser">{{ t("确定") }}</el-button>
        <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
      </div>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { PermissionRoleEnum, Response } from '@src/types/global'
import { nextTick, onMounted, ref } from 'vue';
import { request } from '@/api/api';
import { ElMessage, FormInstance } from 'element-plus';
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
    default: ''
  },
})
const emits = defineEmits(['success', 'update:modelValue'])
const formInfo = ref<Record<string, unknown>>({}) //用户基本信息
const roleIds = ref<string[]>([]) //角色id列表
const roleEnum = ref<PermissionRoleEnum>([]) //角色枚举信息
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
      realName: res.data.realName,
      phone: res.data.phone,
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
  request.get<Response<PermissionRoleEnum>, Response<PermissionRoleEnum>>('/api/security/role_enum').then((res) => {
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
        realName: formInfo.realName,
        roleIds: roleIds.value,
        roleNames,
        phone: formInfo.phone,
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
      ElMessage.warning('请完善必填信息');
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
  getUserInfo(); //获取用户基本信息
})

</script>
