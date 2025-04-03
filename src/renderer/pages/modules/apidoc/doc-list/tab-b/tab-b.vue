<template>
  <div v-loading="loading" class="tab-b">
    <!-- <el-button :icon="Plus" @click="dialogVisible = true" type="success">{{ t('创建团队') }}</el-button> -->
    <div v-if="groupList.length > 0 && !loading" class="empty-state-card">
      <div class="illustration-wrapper">
        <el-icon :size="80" color="#409EFF">
          <User />
        </el-icon>
      </div>
      <h2 class="prompt-title">开始创建您的第一个团队</h2>
      <p class="prompt-subtitle">点击下方按钮立即创建团队，开启协作之旅</p>

      <el-button :icon="Plus" @click="dialogVisible = true" type="success">{{ t('创建团队') }}</el-button>
    </div>
    <div>
      <div class="side-menu-container">
        <div class="menu-title">团队列表</div>
        <div class="search-box">
          <el-input v-model="searchText" placeholder="搜索团队" clearable :prefix-icon="Search" />
        </div>
        <el-menu :default-active="selectedGroup" class="vertical-menu" @select="handleSelectGroup">
          <el-menu-item v-for="item in [{ title: 'xxxx', index: '1' }, { title: 'aaa', index: '2' }]" :key="item.index"
            :index="item.index">
            <el-icon>
              <!-- <component :is="item.icon" /> -->
            </el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </div>
    </div>
    <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible"></AddProjectDialog>
  </div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { Plus, User, Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue';
import AddProjectDialog from './dialog/add-group/add-group.vue'
import { request } from '@/api/api';
import { Response } from '@src/types/global';

type GroupItem = {
  _id: string;
  groupName: string;
  description: string;
  members: {
    username: string;
    userId: string;
    permission: "admin" | "readOnly" | "readAndWrite",
    expireAt: string;
  }[];
}

const searchText = ref('')
const selectedGroup = ref('1')
const groupList = ref<GroupItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);


//
const handleSelectGroup = () => { }

const getGroupList = () => {
  loading.value = true
  request.get<Response<GroupItem[]>, Response<GroupItem[]>>('/api/group/list').then(res => {
    groupList.value = res.data
  }).catch(err => {
    console.log(err)
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getGroupList()
})

</script>

<style lang='scss' scoped>
.tab-b {
  height: calc(100vh - #{size(150)});
}

.empty-state-card {
  background: white;
  border-radius: $border-radius-sm;
  box-shadow: 0 5px 35px rgba(0, 0, 0, 0.06);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - #{size(170)});
}

.illustration-wrapper {
  margin-bottom: 1.5rem;
}


.prompt-title {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.prompt-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.side-menu-container {
  width: size(250);
  height: calc(100vh - #{size(150)});
  box-shadow: $box-shadow-sm;
  padding: size(10);
  .menu-title {
    font-size: fz(15);
  }

  .el-menu-item {
    height: 48px;
    margin: 4px 8px;
    border-radius: 4px;
  }

  .el-menu-item.is-active {
    background-color: #f5f7ff;
    color: #409eff;
    font-weight: 500;
  }

  .el-menu-item:hover {
    background-color: #f5f5f5;
  }

  .el-menu-item span {
    margin-left: 8px;
  }
}

</style>
