<template>
  <STable ref="table" url="/api/security/role_list">
    <el-table-column prop="roleName" :label="t('角色名称')" align="center"></el-table-column>
    <el-table-column prop="remark" :label="t('备注')" align="center"></el-table-column>
    <el-table-column :label="t('创建时间')" align="center">
      <template #default="scope">
        {{ formatDate(scope.row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column :label="t('操作')" align="center">
      <template #default="scope">
        <el-button link type="primary" text @click="handleOpenEditRole(scope.row._id)">{{ t("修改") }}</el-button>
        <el-button link type="primary" text @click="handleDeleteRole(scope.row._id)">{{ t("删除") }}</el-button>
      </template>
    </el-table-column>
    <template #operation>
      <el-button type="success" @click="addRoleDialog = true">{{ t("新增角色") }}</el-button>
    </template>
  </STable>
  <SAddRole v-if="addRoleDialog" v-model="addRoleDialog" @success="getData"></SAddRole>
  <SEditRole v-if="editRoleDialog" v-model="editRoleDialog" :user-id="userId" @success="getData"></SEditRole>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SAddRole from './add/Add.vue'
import SEditRole from './edit/Edit.vue'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm.ts';
import { useI18n } from 'vue-i18n'
import STable from '@/components/common/table/ClTable.vue'
import { request } from '@/api/api';
import { formatDate } from '@/helper'


const { t } = useI18n()

const userId = ref('');
const addRoleDialog = ref(false);
const editRoleDialog = ref(false);
const table = ref<{ getData: () => void}>()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取数据
const getData = () => {
  table.value?.getData();
}
//修改角色
const handleOpenEditRole = (id: string) => {
  userId.value = id;
  editRoleDialog.value = true;
}
//删除角色
const handleDeleteRole = (_id: string) => {
  ClConfirm({
    content: t('此操作将永久删除此条记录, 是否继续?'),
    title: t('提示'),
    confirmButtonText: t('确定/AdminRoleDelete'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      ids: [_id],
    };
    request.delete('/api/security/role', { data: params }).then(() => {
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
</script>
