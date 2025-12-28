
<template>
  <div>
    <SSearch @change="handleChange">
      <SSearchItem :label="t('登录名称')" prop="loginName"></SSearchItem>
      <template #operation>
        <el-button type="success" @click="addUserDialog = true">{{ t('新增用户') }}</el-button>
      </template>
    </SSearch>
    <!-- 表格展示 -->
    <STable ref="table" url="/api/security/user_list" class="mt-5">
      <el-table-column prop="loginName" :label="t('登录名称')" align="center"></el-table-column>
      <el-table-column :label="t('创建日期')" align="center" width="200px">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('上次登录')" align="center" width="200px">
        <template #default="scope">
          {{ formatDate(scope.row.lastLogin) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('登录次数')" align="center" prop="loginTimes"></el-table-column>
      <el-table-column :label="t('角色信息')" align="center" width="200px">
        <template #default="scope">
          <el-tag v-for="(item, index) in scope.row.roleNames" :key="index" class="d-flex a-center j-center mb-1">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('状态')" align="center" width="80px">
        <template #default="scope">
          <el-tag v-if="scope.row.isEnabled" type="success">{{ t("启用") }}</el-tag>
          <el-tag v-else type="warning">{{ t("禁用") }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('操作')" align="center" width="300px">
        <template #default="scope">
          <el-button link type="primary" text @click="handleOpenEditUser(scope.row)">{{ t('修改') }}</el-button>
          <el-button link type="primary" text @click="handleResetPassword(scope.row)">{{ t('重置密码') }}</el-button>
          <el-button link type="primary" text @click="handleForbidRole(scope.row._id, scope.row.isEnabled)">
            {{ scope.row.isEnabled ? t("禁用") : t("启用") }}
          </el-button>
        </template>
      </el-table-column>
    </STable>
    <SAddUserDialog v-model="addUserDialog" @success="getData"></SAddUserDialog>
    <SEditUserDialog v-if="editUserDialog" v-model="editUserDialog" :user-id="editUserId" @success="getData"></SEditUserDialog>
    <SResetPasswordDialog v-if="resetPwdDialog" v-model="resetPwdDialog" :user-id="editUserId"></SResetPasswordDialog>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SAddUserDialog from './add/Add.vue'
import SEditUserDialog from './edit/Edit.vue'
import SResetPasswordDialog from './resetPassword/ResetPassword.vue'
import { ref } from 'vue';
import { formatDate } from '@/helper'
import { ElMessageBox } from 'element-plus';
import { request } from '@/api/api';
import SSearch from '@/components/common/forms/search/ClSearch.vue'
import SSearchItem from '@/components/common/forms/search/ClSearchItem.vue'     
import STable from '@/components/common/table/ClTable.vue'

const { t } = useI18n()
const addUserDialog = ref(false) //------------------新增用户弹窗
const editUserDialog = ref(false) //-----------------编辑用户弹窗
const resetPwdDialog = ref(false) //-----------------重置密码弹窗
const editUserId = ref('') //------------------------编辑时候用户id
const table = ref<{ getData: (params?: Record<string, unknown>) => void }>()    
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//获取用户基本信息
const getData = (params?: Record<string, unknown>) => {
  table.value?.getData(params);
}
//搜索用户
const handleChange = (params: Record<string, unknown>) => {
  getData(params)
}
//禁用角色
const handleForbidRole = (_id: string, isEnabled: boolean) => {
  const tipLabel = isEnabled ? t('禁用') : t('启用');
  ElMessageBox.confirm(t('确实要{action}该用户吗', { action: tipLabel }), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      _id,
      isEnabled: !isEnabled,
    };
    request.put('/api/security/user_state', params).then(() => {
      table.value?.getData();
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
const handleOpenEditUser = (row: { _id: string }) => {
  editUserId.value = row._id;
  editUserDialog.value = true;
}
//重置密码
const handleResetPassword = (row: { _id: string }) => {
  editUserId.value = row._id;
  resetPwdDialog.value = true;
}

</script>
