<template>
  <div class="online-link">
    <!-- 头部 -->
    <div class="online-link-header w-70 m-auto">
      <div class="header-content d-flex j-between a-center">
        <div class="header-left">
          <div class="d-flex a-center">
            <span class="title-text">{{ t('项目分享') }}</span>
          </div>
          <div class="desc">{{ t('管理项目的在线分享链接，方便外部人员访问') }}</div>
        </div>
        <div class="header-right d-flex a-center">
          <el-input
            v-model="searchKeyword"
            :placeholder="t('请输入链接名称')"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleAdd">
            {{ t('创建链接') }}
          </el-button>
        </div>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="content-area">
      <div class="w-70 m-auto">
        <el-table :data="filteredTableData" border  v-loading="loading">
          <el-table-column prop="shareName" :label="t('链接名称')" align="center"></el-table-column>
          <el-table-column prop="projectName" :label="t('项目名称')" align="center"></el-table-column>
          <el-table-column :label="t('过期倒计时')" align="center">
            <template #default="scope">
              <span :key="countdownKey">{{ formatCountdown(scope.row.expire) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('操作')" width="200" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <div class="action-btn" v-copy="generateUrlAndPassword(scope.row)">{{ t("复制") }}</div>
                <div class="action-btn" @click="handleOpenEditDialog(scope.row)">{{ t("修改") }}</div>
                <div class="action-btn" @click="handleDeleteItem(scope.row.projectId, scope.row._id)">{{ t("删除") }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <SAddDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></SAddDialog>
    <SEditDialog v-if="dialogVisible2 && editData" v-model="dialogVisible2" :data="editData" @success="handleEditSuccess"></SEditDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed, onMounted, onUnmounted } from 'vue'
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus'
import { request } from '@/api/api'
// import { CirclePlus, Link, Search } from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n'
import SAddDialog from './dialog/Add.vue'
import SEditDialog from './dialog/Edit.vue'
// import { usePermissionStore } from '@/store/permission/permissionStore';


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
const editData: Ref<LinkInfo | null> = ref(null);
const { t } = useI18n()

const dialogVisible = ref(false); //是否显示弹窗
const dialogVisible2 = ref(false); //编辑弹窗
// const permissionStore = usePermissionStore()

// 新增状态管理
const tableData = ref<LinkInfo[]>([]);
const loading = ref(false);
const searchKeyword = ref('');
//倒计时相关
const countdownKey = ref(0);
let countdownTimer: number | null = null;
//格式化倒计时显示
const formatCountdown = (expireTime: number) => {
  const restTime = Math.max(0, expireTime - Date.now());
  if (restTime === 0) {
    return t('已过期');
  }
  const hasFullDay = restTime > 86400000;
  const day = hasFullDay ? Math.floor(restTime / 86400000) : 0;
  const remainderAfterDay = hasFullDay ? restTime % 86400000 : restTime;
  const hasFullHour = remainderAfterDay > 3600000;
  const hour = hasFullHour ? Math.floor(remainderAfterDay / 3600000) : 0;
  const remainderAfterHour = hasFullHour ? remainderAfterDay % 3600000 : remainderAfterDay;
  const hasFullMinute = remainderAfterHour > 60000;
  const minute = hasFullMinute ? Math.floor(remainderAfterHour / 60000) : 0;
  const second = Math.floor((hasFullMinute ? remainderAfterHour % 60000 : remainderAfterHour) / 1000);
  return `${day}${t('天')}${hour}${t('小时')}${minute}${t('分')}${second}${t('秒')}`;
}
//启动倒计时定时器
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  countdownTimer = window.setInterval(() => {
    countdownKey.value++;
  }, 1000);
}

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchKeyword.value) {
    return tableData.value;
  }
  return tableData.value.filter(item => 
    item.shareName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 获取表格数据
const getTableData = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/project/export/online_list', {
      params: { projectId }
    });
    tableData.value = response.data.rows;
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
};

// 新增按钮点击
const handleAdd = () => {
  dialogVisible.value = true;
};

//生成链接和密码
const generateUrlAndPassword = (linkInfo: LinkInfo) => {
  const url = `${location.origin}/#/share?share_id=${linkInfo.shareId}&id=${projectId}`;
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
      getTableData();
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
  getTableData();
}
//编辑成功刷新页面
const handleEditSuccess = () => {
  getTableData();
}

// 页面加载时获取数据
onMounted(() => {
  getTableData();
  startCountdown();
});
//清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});

</script>

<style lang='scss' scoped>
.online-link {
  padding: 0 20px 10px;
  height: calc(100vh - 100px);
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  // 头部
  .online-link-header {
    display: flex;
    flex-direction: column;
    padding: 15px 0;

    .header-content {
      .header-left {
        .el-icon {
          font-size: 26px;
        }

        .title-text {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .desc {
          color: #888;
          font-size: 14px;
        }
      }

      .header-right {
        gap: 12px;
      }
    }
  }

  // 内容区域
  .content-area {
    flex: 1;
    overflow-y: auto;
  }

  // 操作按钮样式
  .action-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    
    .action-btn {
      color: #409eff;
      cursor: pointer;
      margin-right: 8px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
