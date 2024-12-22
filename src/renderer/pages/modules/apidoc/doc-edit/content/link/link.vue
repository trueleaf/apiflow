<template>
  <div class="online-link">
    <div class="w-70 m-auto">
      <SFieldset>
        <template #title>
          <span>{{ t("在线链接") }}</span>
          <span class="orange f-sm ml-2 text-normal cursor-pointer d-inline-flex a-center" @click="dialogVisible = true">
            <el-icon :size="16">
              <circle-plus />
            </el-icon>
            <span>{{ t("生成链接") }}</span>
          </span>
        </template>
        <STable ref="table" url="/api/project/export/online_list" :params="{ projectId }" plain>
          <el-table-column prop="shareName" :label="t('链接名称')" align="center"></el-table-column>
          <el-table-column prop="projectName" :label="t('项目名称')" align="center"></el-table-column>
          <el-table-column :label="t('过期截至')" align="center">
            <template #default="scope">
              <span v-countdown="scope.row.expire"></span>
            </template>
          </el-table-column>
          <el-table-column :label="t('操作')" align="center">
            <template #default="scope">
              <el-button v-copy="generateUrlAndPassword(scope.row)" type="primary" text>{{ t("复制") }}</el-button>
              <el-button link type="primary" text @click="handleOpenEditDialog(scope.row)">{{ t("修改") }}</el-button>
              <el-button link type="primary" text @click="handleDeleteItem(scope.row.projectId, scope.row._id)">{{ t("删除") }}</el-button>
            </template>
          </el-table-column>
        </STable>
      </SFieldset>
    </div>
    <SAddDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></SAddDialog>
    <SEditDialog v-if="dialogVisible2 && editData" v-model="dialogVisible2" :data="editData" @success="handleEditSuccess"></SEditDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref } from 'vue'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import STable from '@/components/common/table/g-table.vue'
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus'
import { request } from '@/api/api'
import { CirclePlus } from '@element-plus/icons-vue'
import { router } from '@/router'
import { t } from 'i18next'
import SAddDialog from './dialog/add.vue'
import SEditDialog from './dialog/edit.vue'
import { usePermissionStore } from '@/store/permission';

type LinkInfo = {
  expire: number,
  projectId: string,
  shareName: string,
  password: string,
  projectName: string,
  selectedDocs: string[],
  shareId: string,
  _id: string,
}
const projectId = router.currentRoute.value.query.id as string; //项目id
const table: Ref<{ getData: () => void } | null> = ref(null); //table实例
const editData: Ref<LinkInfo | null> = ref(null);
const dialogVisible = ref(false); //是否显示弹窗
const dialogVisible2 = ref(false); //编辑弹窗
const permissionStore = usePermissionStore()

//生成链接和密码
const generateUrlAndPassword = (linkInfo: LinkInfo) => {
  const url = `${permissionStore.globalConfig.shareUrl}/#/?share_id=${linkInfo.shareId}&id=${projectId}`;
  return `
    ${t('链接')}：${url}   
    ${t('密码')}：${linkInfo.password || `${t('不需要密码')}`}
    `
}
//删除某个链接
const handleDeleteItem = (pid: string, _id: string) => {
  ElMessageBox.confirm(t('此操作将永久删除此条记录, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning'
  }).then(() => {
    const params = {
      projectId: pid,
      _id,
    };
    request.delete('/api/project/export/online', { data: params }).then(() => {
      table.value?.getData();
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
//打开生成链接弹窗
const handleOpenEditDialog = (row: LinkInfo) => {
  editData.value = row;
  dialogVisible2.value = true;
}
//添加成功刷新页面
const handleAddSuccess = () => {
  table.value?.getData();
}
//编辑成功刷新页面
const handleEditSuccess = () => {
  table.value?.getData();
}

</script>

<style  scoped>
.online-link {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 100%;
}
</style>
