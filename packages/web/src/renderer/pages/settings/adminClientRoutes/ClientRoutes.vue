
<template>
  <div>
    <!-- 搜索条件 -->
    <SSearch auto-request @change="handleChange">
      <SSearchItem :label="t('名称&地址')" prop="name"></SSearchItem>
      <SSearchItem :label="t('分组名称')" prop="groupName" type="select" :select-enum="groupEnum"></SSearchItem>
      <template #operation>
        <el-button type="success" @click="handleOpenAddRouteDialog">{{ t("新增路由") }}</el-button>
        <el-button :disabled="selectedData.length === 0" type="success" @click="handleOpenMultiEditTypeDialog">{{ t("批量修改类型") }}</el-button>
      </template>
    </SSearch>
    <!-- 表格展示 -->
    <STable ref="table" url="/api/security/client_routes" :res-hook="hookRequest" :paging="false" selection @select="handleSelect">
      <el-table-column prop="name" :label="t('路由名称')" align="center"></el-table-column>
      <el-table-column prop="path" :label="t('路由地址')" align="center"></el-table-column>
      <el-table-column prop="groupName" :label="t('分组名称')" align="center"></el-table-column>
      <el-table-column :label="t('操作')" align="center">
        <template #default="scope">
          <el-button link type="primary" text @click.stop="handleOpenClientEditDialog(scope.row)">{{ t("修改") }}</el-button>
          <el-button link type="primary" text @click.stop="handleDeleteClientRoute(scope.row)">{{ t("删除") }}</el-button>
        </template>
      </el-table-column>
    </STable>
    <SAddClientRoute v-if="dialogVisible" v-model="dialogVisible" @success="getData"></SAddClientRoute>
    <SEditClientRoute v-if="dialogVisible2" v-model="dialogVisible2" :edit-data="editData" @success="getData"></SEditClientRoute>
    <SMultiEditClientRoute v-if="dialogVisible3" v-model="dialogVisible3" :edit-data="selectedData" @success="getData"></SMultiEditClientRoute>
  </div>
</template>

<script lang="ts" setup>
import { CommonResponse, PermissionClientRoute } from '@src/types'
import SAddClientRoute from './add/Add.vue'
import SEditClientRoute from './edit/Edit.vue'
import SMultiEditClientRoute from './edit/Edit2.vue'
import { Ref, ref } from 'vue';
import { uniqueByKey } from '@/helper';
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import { useI18n } from 'vue-i18n'
import { request } from '@/api/api';
import SSearch from '@/components/common/forms/search/ClSearch.vue'
import SSearchItem from '@/components/common/forms/search/ClSearchItem.vue'
import STable from '@/components/common/table/ClTable.vue'



type HookThis = {
  tableData: Ref<PermissionClientRoute[]>,
  total: Ref<number>,
}
const selectedData = ref<PermissionClientRoute[]>([]); //-------当前被选中的表单数据
const editData = ref<PermissionClientRoute>({
  _id: '',
  name: '',
  path: '',
  groupName: '',
}); //-------------需要编辑的数据
const originTableData = ref<PermissionClientRoute[]>([]); //----原始表单数据
const groupEnum = ref<{ id: string, name: string }[]>([]); //---分组信息
const { t } = useI18n()

const dialogVisible = ref(false); //----------------------------新增路由信息弹窗
const dialogVisible2 = ref(false); //---------------------------修改路由信息弹窗
const dialogVisible3 = ref(false); //---------------------------批量修改路由信息弹窗
const table = ref<{ getData: () => void, tableData: any }>()
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//=====================================数据获取====================================//
//获取表格数据
const getData = () => {
  table.value?.getData();
}
//搜索数据
const handleChange = (params: { name: string, groupName: string }) => {
  const { name, groupName } = params;
  table.value!.tableData = originTableData.value.filter((val) => {
    const matchedName = name ? val.name.match(name) : true;
    const matchedPath = name ? val.path.match(name) : true;
    const matchedGroupName = groupName ? val.groupName.match(groupName) : true;
    return (matchedName || matchedPath) && matchedGroupName;
  })
}
//获取前端路由信息
const hookRequest = (res: CommonResponse<PermissionClientRoute[]>, _this: HookThis) => {
  originTableData.value = res.data;
  _this.tableData.value = res.data;
  _this.total.value = res.data.length;
  const uniqueData = uniqueByKey(res.data, 'groupName');
  groupEnum.value = uniqueData.map((v) => ({ id: v.groupName, name: v.groupName })).sort((a, b) => {
    const unicodeOfA = a.name.charCodeAt(0);
    const unicodeOfB = b.name.charCodeAt(0)
    return unicodeOfA - unicodeOfB;
  })
}
//=========================================================================//
const handleSelect = (routeList: PermissionClientRoute[]) => {
  selectedData.value = routeList;
}
//删除前端路由组件
const handleDeleteClientRoute = (row: PermissionClientRoute) => {
  ClConfirm({
    content: t('此操作将永久删除此条记录, 是否继续?'),
    title: t('提示'),
    confirmButtonText: t('确定/AdminClientRoutesDelete'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = { ids: [row._id] };
    request.delete('/api/security/client_routes', { data: params }).then(() => {
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
//=====================================其他操作====================================//
//打开新增前端路由
const handleOpenAddRouteDialog = () => {
  dialogVisible.value = true;
}
//打开修改前端路由
const handleOpenClientEditDialog = (row: PermissionClientRoute)  =>{
  editData.value = row;
  dialogVisible2.value = true;
}
//打开批量修改前端路由类型
const handleOpenMultiEditTypeDialog = () => {
  dialogVisible3.value = true;
}
</script>
