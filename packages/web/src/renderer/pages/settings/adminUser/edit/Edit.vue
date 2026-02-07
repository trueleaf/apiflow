
<template>
  <el-dialog :model-value="modelValue" :title="t('修改')" :before-close="handleClose">
    <el-divider content-position="left">{{ t("基础信息") }}</el-divider>
    <el-form ref="formRef" v-loading="loading2" :model="formInfo" :rules="rules" label-width="100px">
      <el-form-item :label="t('登录名称')" prop="loginName">
        <el-input v-model="formInfo.loginName" :placeholder="t('请输入登录名称')"></el-input>
      </el-form-item>
    </el-form>
    <el-divider content-position="left">{{ t("角色选择") }}</el-divider>
    <el-checkbox v-model="isAdmin">{{ t('是否为管理员') }}</el-checkbox>
    <template #footer>
      <div>
        <el-button @click="handleClose">{{ t("取消") }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleEditUser">{{ t('确定/AdminUserEdit') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { PermissionRoleEnum, CommonResponse } from '@src/types'
import { computed, nextTick, onMounted, ref } from 'vue'
import { request } from '@/api/api'
import { message } from '@/helper'
import type { FormInstance, FormRules } from 'element-plus'

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
const formInfo = ref<{ loginName: string }>({ loginName: '' })
const roleIds = ref<string[]>([])
const roleEnum = ref<PermissionRoleEnum>([])
const { t } = useI18n()
const loading = ref(false)
const loading2 = ref(false)
const formRef = ref<FormInstance>()
const rules: FormRules = {
  loginName: [{ required: true, message: t('请输入登录名称'), trigger: 'blur' }]
}
// 获取角色id
const getRoleIdByName = (roleName: '普通用户' | '管理员') => roleEnum.value.find(role => role.roleName === roleName)?._id
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
// 获取用户基本信息
const getUserInfo = () => {
  loading2.value = true
  request.get('/api/security/user_info_by_id', { params: { _id: props.userId } }).then((res) => {
    formInfo.value.loginName = res.data.loginName
    roleIds.value = res.data.roleIds
  }).catch((err) => {
    console.error(err)
  }).finally(() => {
    loading2.value = false
  })
}
// 获取角色枚举信息
const getRoleEnum = () => {
  request.get<CommonResponse<PermissionRoleEnum>, CommonResponse<PermissionRoleEnum>>('/api/security/role_enum').then((res) => {
    roleEnum.value = res.data
  }).catch((err) => {
    console.error(err)
  })
}
// 修改用户
const handleEditUser = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const roleNames = roleIds.value.map((val) => {
        const user = roleEnum.value.find((role) => role._id === val)
        return user ? user.roleName : ''
      })
      const params = {
        _id: props.userId,
        loginName: formInfo.value.loginName,
        roleIds: roleIds.value,
        roleNames,
      }
      loading.value = true
      request.put('/api/security/user_permission', params).then(() => {
        emits('success')
        handleClose()
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        loading.value = false
      })
    } else {
      nextTick(() => (document.querySelector('.el-form-item.is-error input') as HTMLInputElement)?.focus())
      message.warning(t('请完善必填信息'))
    }
  })
}
// 关闭弹窗
const handleClose = () => {
  modelValue.value = false
}
onMounted(() => {
  getRoleEnum()
  getUserInfo()
})

</script>
