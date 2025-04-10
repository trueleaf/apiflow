<template>
  <div v-loading="loading" class="tab-b">
    <!-- <el-button :icon="Plus" @click="dialogVisible = true" type="success">{{ t('创建团队') }}</el-button> -->
    <div v-if="groupList.length === 0 && !loading" class="empty-state-card">
      <div class="illustration-wrapper">
        <el-icon :size="80" color="#409EFF">
          <User />
        </el-icon>
      </div>
      <h2 class="prompt-title">开始创建您的第一个团队</h2>
      <p class="prompt-subtitle">点击下方按钮立即创建团队，开启协作之旅</p>

      <el-button :icon="Plus" @click="dialogVisible = true" type="success">{{ t('创建团队') }}</el-button>
    </div>
    <div class="d-flex">
      <!-- banner -->
      <div class="side-menu-container">
        <div class="menu-title f-mid">团队列表</div>
        <div class="search-box">
          <el-input v-model="searchText" placeholder="搜索团队" clearable :prefix-icon="Search" />
        </div>
        <div class="group-title f-mid">
          <div>全部团队</div>
          <el-icon title="创建团队" class="create-icon" @click="dialogVisible = true">
            <Plus />
          </el-icon>
        </div>
        <el-menu :default-active="selectedGroup" class="vertical-menu" @select="handleSelectGroup">
          <el-menu-item v-for="item in groupList" :key="item._id" :index="item._id">
            <span>{{ item.groupName }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      <!-- content -->
      <div class="group-content">
        <el-form v-if="groupInfo" :mode="groupInfo" label-width="auto" label-position='top'>
          <el-form-item label="团队名称">
            <el-input v-model="groupInfo.groupName" class="w-40" show-word-limit maxlength="50" />
          </el-form-item>
          <el-form-item label="团队描述">
            <el-input type="textarea" v-model="groupInfo.description" class="w-40" show-word-limit maxlength="255" />
          </el-form-item>
          <el-form-item label="团队创建者">
            <span>{{ groupInfo.creator.userName }}</span>
          </el-form-item>
          <el-form-item>
            <template #label>
              <div class="d-flex a-center">
                <span>团队成员</span>
                <span class="f-xs gray-500">(权限修改和成员增加不需要保存，修改后立即生效)</span>
              </div>
            </template>
            <div v-for="member in groupInfo.members" :key="member.userId" class="user-item">
              <el-avatar :size="40" shape="circle">
                <span class="f-bg">{{ member.loginName.charAt(0) }}</span>
              </el-avatar>
              <div class="user-info">
                <div class="name">{{ member.loginName }}</div>
                <el-popover placement="bottom-start" :popper-style="{ padding: '0'}" :hide-after="0" :width="200" trigger="click">
                  <template #reference>
                    <div class="permission">
                      <span v-if="member.permission === 'readOnly'" class="f-xs">只读</span>
                      <span v-if="member.permission === 'readAndWrite'" class="f-xs">可编辑</span>
                      <span v-if="member.permission === 'admin'" class="f-xs">管理员</span>
                      <el-icon class="icon">
                        <ArrowDown />
                      </el-icon>
                    </div>
                  </template>
                  <template #default>
                    <div class="permission-list">
                      <div class="permission-item" :class="{ active: member.permission === 'readOnly' }">
                        <span>只读</span>
                        <el-icon v-if="member.permission === 'readOnly'"><Check /></el-icon>
                      </div>
                      <div class="permission-item" :class="{ active: member.permission === 'readAndWrite' }">
                        <span>可编辑</span>
                        <el-icon v-if="member.permission === 'readAndWrite'"><Check /></el-icon>
                      </div>
                      <div class="permission-item" :class="{ active: member.permission === 'admin' }">
                        <span>管理员</span>
                        <el-icon v-if="member.permission === 'admin'"><Check /></el-icon>
                      </div>
                    </div>
                  </template>
                </el-popover>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :title="isEdited ? '' : '修改数据后可以保存'" :disabled="!isEdited" class="w-40" @click="handleSaveGroupInfo">保存修改</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible"></AddProjectDialog>
  </div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { Plus, User, Search, ArrowDown, Check } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue';
import AddProjectDialog from './dialog/add-group/add-group.vue'
import { request } from '@/api/api';
import { Response } from '@src/types/global';
import { cloneDeep } from '@/helper';
import { ElMessage } from 'element-plus';

type GroupItem = {
  _id: string;
  groupName: string;
  description: string;
  creator: {
    userId: string;
    userName: string;
    _id: string;
  },
  members: {
    loginName: string;
    userId: string;
    permission: "admin" | "readOnly" | "readAndWrite",
    expireAt: string;
  }[];
}

const searchText = ref('')
const selectedGroup = ref('')
const groupList = ref<GroupItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const groupInfo = ref<GroupItem | null>(null)
const originGroupInfo = ref<GroupItem | null>(null)
//
const handleSelectGroup = (groupId: string) => {
  const groupItem = groupList.value.find(item => item._id === groupId)!;
  groupInfo.value = groupItem;
  originGroupInfo.value = cloneDeep(groupItem);
}

const getGroupList = () => {
  loading.value = true
  request.get<Response<GroupItem[]>, Response<GroupItem[]>>('/api/group/list').then(res => {
    groupList.value = res.data;
    selectedGroup.value = res.data[0]._id;
    groupInfo.value = res.data[0];
    originGroupInfo.value = cloneDeep(res.data[0])
  }).catch(err => {
    console.log(err)
  }).finally(() => {
    loading.value = false
  })
}

const isEdited = computed(() => {
  if (!groupInfo.value || !originGroupInfo.value) return false;
  return JSON.stringify(groupInfo.value) !== JSON.stringify(originGroupInfo.value)
})
//保存修改
const handleSaveGroupInfo = () => {
  if (!groupInfo.value) return;
  const { _id, groupName, description, members } = groupInfo.value;
  request.put<Response<GroupItem>, Response<GroupItem>>('/api/group/update', {
    _id,
    groupName,
    description,
    members
  }).then(res => {
    ElMessage.success('保存成功')
    originGroupInfo.value = cloneDeep(groupInfo.value)
  }).catch(err => {
    console.log(err)
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
}


.side-menu-container {
  width: size(250);
  height: calc(100vh - #{size(150)});
  // box-shadow: $box-shadow-sm;
  border: 1px solid $gray-300;
  padding: size(10) size(0);

  .menu-title {
    padding: 0 size(15);
    margin-bottom: size(10);
  }

  .search-box {
    padding: 0 size(15);
  }

  .group-title {
    padding: 0 size(15);
    margin-top: size(10);
    display: flex;
    align-items: center;
    height: size(40);

    .create-icon {
      margin-left: auto;
      cursor: pointer;
      width: size(20);
      height: size(20);
      border-radius: 50%;

      &:hover {
        background-color: $gray-200;
      }
    }
  }

  .el-menu-item {
    height: size(35);

    &:hover {
      background-color: $gray-200;
    }

    &.is-active {
      background-color: lighten($theme-color, 30%);
      color: $gray-800;
    }
  }
}

.group-content {
  flex: 1;
  height: calc(100vh - #{size(150)});
  // box-shadow: $box-shadow-sm;
  border-top: 1px solid $gray-300;
  border-right: 1px solid $gray-300;
  border-bottom: 1px solid $gray-300;
  padding: size(10) size(20);

  .user-item {
    display: flex;
    align-items: center;
    padding: size(5) size(20);
    // border: 1px dashed $gray-300;
    margin-right: size(15);
    border-radius: $border-radius-base;
    transition: all 0.3s;

    .user-info {
      margin-left: size(10);

      .name {
        line-height: normal;
        font-weight: bold;
      }

      .permission {
        &:hover {
          color: $gray-600;
        }

        color: $gray-500;
        line-height: normal;
        height: size(25);
        display: flex;
        align-items: center;
        cursor: pointer;

        .icon {}
      }
    }
  }
}
.permission-list {
  padding: size(5) size(0);
  .permission-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: size(6) size(10);
    cursor: pointer;
    &.active {
      color: $theme-color;
    }
    &:hover {
      background-color: $gray-200;
    }
  }
}
</style>
