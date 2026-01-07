<template>
  <div v-loading="loading" class="project-group">
    <div class="d-flex">
      <!-- banner -->
      <div class="side-menu-container">
        <div class="menu-title f-mid">{{ t('团队列表') }}</div>
        <div class="search-ElMessageBox">
          <el-input v-model="searchText" :placeholder="t('搜索团队')" clearable :prefix-icon="Search" />
        </div>
        <div class="group-title f-mid">
          <div>{{ t('全部团队') }}</div>
          <el-icon :title="t('创建团队')" class="create-icon" @click="dialogVisible = true">
            <Plus />
          </el-icon>
        </div>
        <el-menu :default-active="selectedGroupId" class="vertical-menu" @select="handleSelectGroup">
          <el-menu-item v-for="item in groupList.filter(item => item.groupName.includes(searchText))" :key="item._id" :index="item._id">
            <div class="text-ellipsis" :title="item.groupName">{{ item.groupName }}</div>
            <el-icon class="del-icon" @click="() => handleDeleteGroup(item._id)">
              <Delete />
            </el-icon>
          </el-menu-item>
        </el-menu>
      </div>
      <!-- content -->
      <div class="group-content">
        <!-- empty -->
        <div v-if="groupList.length === 0 && !loading" class="empty-state-card">
          <div class="illustration-wrapper">
            <el-icon :size="80" color="var(--el-color-primary)">
              <User />
            </el-icon>
          </div>
          <h2 class="prompt-title">{{ t('开始创建您的第一个团队') }}</h2>
          <p class="prompt-subtitle">{{ t('点击下方按钮立即创建团队，开启协作之旅') }}</p>
          <el-button :icon="Plus" @click="dialogVisible = true" type="success">{{ t('创建团队') }}</el-button>
        </div>
        <!-- 配置界面 -->
        <el-form v-else-if="groupInfo" :mode="groupInfo" label-width="auto" label-position='top' @submit.prevent>
          <el-form-item :label="t('团队名称')">
            <el-input v-model="groupInfo.groupName" class="w-40" show-word-limit maxlength="30" />
          </el-form-item>
          <el-form-item :label="t('团队描述')">
            <el-input type="textarea" v-model="groupInfo.description" class="w-40" show-word-limit maxlength="255" />
          </el-form-item>
          <el-form-item :label="t('团队邀请限制')">
            <el-checkbox v-model="groupInfo.isAllowInvite">{{ t('允许被非项目成员邀请到项目中') }}</el-checkbox>
            <div class="d-flex flex-column">
            </div>
          </el-form-item>
          <el-form-item :label="t('团队信息')">
            <div class="ml-2 gray-600">
              <div>{{ `${t('由')}【${groupInfo.creator.userName}】${t('创建于')} ${dayjs(groupInfo.createdAt).format('YYYY-MM-DD HH:mm')}` }}</div>
              <div v-if="groupInfo.updator">{{ `${t('由')}【${groupInfo.updator.userName}】${t('更新于')} ${dayjs(groupInfo.updatedAt).format('YYYY-MM-DD HH:mm')}` }}</div>
            </div>
          </el-form-item>
          <el-form-item>
            <template #label>
              <div>
                <span>{{ t('团队成员') }}</span>
                <!-- <span class="f-xs ml-1 theme-color cursor-pointer" @click="() => {memberMode = memberMode === 'card' ? 'list' : 'card'}">{{ t('切换列表展示') }}</span> -->
              </div>
              <div class="f-xs gray-500 mb-1">{{ t('权限修改和成员增加不需要保存，修改后立即生效') }}</div>
            </template>
            <!-- 卡片权限修改 -->
            <div v-if="memberMode === 'card'" v-for="member in groupInfo.members" :key="member.userId" class="user-item">
              <el-avatar :size="40" shape="circle" class="flex0">
                <span class="f-bg">{{ member.userName.charAt(0) }}</span>
              </el-avatar>
              <div class="user-info">
                <div class="name">{{ member.userName }}</div>
                <el-popover :visible="(popoverVisibleId === member.userId)" placement="bottom-start" :popper-style="{ padding: '0' }" :hide-after="0" :width="200" >
                  <template #reference>
                    <div class="permission" @click.stop="() => {popoverVisibleId  === member.userId ? (popoverVisibleId = '') : popoverVisibleId = member.userId, popoverVisible = false}">
                      <span v-if="member.permission === 'readOnly'" class="f-xs">{{ t('只读') }}</span>
                      <span v-if="member.permission === 'readAndWrite'" class="f-xs">{{ t('可编辑') }}</span>
                      <span v-if="member.permission === 'admin'" class="f-xs">{{ t('管理员') }}</span>
                      <el-icon class="icon">
                        <ArrowDown />
                      </el-icon>
                    </div>
                  </template>
                  <template #default>
                    <div class="permission-list">
                      <div class="permission-item" :class="{ active: member.permission === 'readOnly' }"
                        @click="() => handleChangePermission(groupInfo!._id, member.userId, 'readOnly')">
                        <span>{{ t('只读') }}</span>
                        <el-icon v-if="member.permission === 'readOnly'">
                          <Check />
                        </el-icon>
                      </div>
                      <div class="permission-item" :class="{ active: member.permission === 'readAndWrite' }"
                        @click="() => handleChangePermission(groupInfo!._id, member.userId, 'readAndWrite')">
                        <span>{{ t('可编辑') }}</span>
                        <el-icon v-if="member.permission === 'readAndWrite'">
                          <Check />
                        </el-icon>
                      </div>
                      <div class="permission-item" :class="{ active: member.permission === 'admin' }"
                        @click="() => handleChangePermission(groupInfo!._id, member.userId, 'admin')">
                        <span>{{ t('管理员') }}</span>
                        <el-icon v-if="member.permission === 'admin'">
                          <Check />
                        </el-icon>
                      </div>
                    </div>
                  </template>
                </el-popover>
              </div>
            </div>
            <!-- 列表形式权限修改 -->
            <div v-if="memberMode === 'list'">
              <el-table :data="groupInfo.members" border max-height="400px" >
                <el-table-column prop="userName" :label="t('成员名称')" width="180" sortable/>
                <el-table-column prop="permission" :label="t('权限')" width="180" sortable>
                  <template #default="{ row }">
                    <el-popover :visible="(popoverVisibleId === row.userId)" placement="bottom-start" :popper-style="{ padding: '0' }" :hide-after="0" :width="200" >
                      <template #reference>
                        <div class="permission d-flex a-center" @click.stop="() => {popoverVisibleId  === row.userId ? (popoverVisibleId = '') : popoverVisibleId = row.userId, popoverVisible = false}">
                          <span v-if="row.permission === 'readOnly'" class="f-xs cursor-pointer">{{ t('只读') }}</span>
                          <span v-if="row.permission === 'readAndWrite'" class="f-xs cursor-pointer">{{ t('可编辑') }}</span>
                          <span v-if="row.permission === 'admin'" class="f-xs cursor-pointer">{{ t('管理员') }}</span>
                          <el-icon class="ml-1 cursor-pointer">
                            <ArrowDown />
                          </el-icon>
                        </div>
                      </template>
                      <template #default>
                        <div class="permission-list">
                          <div class="permission-item" :class="{ active: row.permission === 'readOnly' }"
                            @click="() => handleChangePermission(groupInfo!._id, row.userId, 'readOnly')">
                            <span>{{ t('只读') }}</span>
                            <el-icon v-if="row.permission === 'readOnly'">
                              <Check />
                            </el-icon>
                          </div>
                          <div class="permission-item" :class="{ active: row.permission === 'readAndWrite' }"
                            @click="() => handleChangePermission(groupInfo!._id, row.userId, 'readAndWrite')">
                            <span>{{ t('可编辑') }}</span>
                            <el-icon v-if="row.permission === 'readAndWrite'">
                              <Check />
                            </el-icon>
                          </div>
                          <div class="permission-item" :class="{ active: row.permission === 'admin' }"
                            @click="() => handleChangePermission(groupInfo!._id, row.userId, 'admin')">
                            <span>{{ t('管理员') }}</span>
                            <el-icon v-if="row.permission === 'admin'">
                              <Check />
                            </el-icon>
                          </div>
                        </div>
                      </template>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column prop="expireAt" :label="t('操作')" width="70" align="center">
                  <template #default="{ row }">
                    <el-button v-if="row.userId === runtimeStore.userInfo.id" link type="primary" @click="() => handleRemoveMember(groupInfo!._id, row.userId)">{{ t('退出') }}</el-button>
                    <el-button v-else link type="primary" @click="() => handleRemoveMember(groupInfo!._id, row.userId)">{{ t('删除') }}</el-button>
                  </template>
                </el-table-column>
            </el-table>
            </div>
            <el-popover
              :visible="popoverVisible"
              placement="right"
              :width="300"
            >
              <template #reference>
                <div class="add-item" :title="t('添加新用户')" @click.stop="popoverVisible = true, popoverVisibleId = ''">
                  <el-icon color="var(--text-gray-500)">
                    <Plus />
                  </el-icon>
                </div>
              </template>
              <template #default>
                <div @click.stop="">
                  <RemoteSelector 
                    v-if="popoverVisible"
                    v-model="remoteQueryName" 
                    :remote-methods="getRemoteUserByName" 
                    :loading="loading2" 
                    embedded
                    auto-focus
                    :placeholder="t('输入用户名查找用户')"
                  >
                    <RemoteSelectorItem v-for="(item, index) in remoteMembers" :key="index">
                      <div class="d-flex a-center j-between w-100 h-100" @click="handleAddUser(item)">
                        <span>{{ item.userName }}</span>
                      </div>
                    </RemoteSelectorItem>
                    <div v-if="remoteMembers.length === 0" class="d-flex a-center j-center w-100 h-40px gray-500">{{ t('暂无数据') }}</div>
                  </RemoteSelector>
                </div>
              </template>
            </el-popover>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              :title="isEdited ? '' : t('修改数据后可以保存')" :disabled="!isEdited" 
              class="w-40"
              @click="handleSaveGroupInfo">{{ t('保存修改【添加、更新成员不需要保存，直接生效】') }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" class="w-40" @click="() => handleDeleteGroup(groupInfo!._id)">{{ t('删除团队') }}</el-button>
          </el-form-item>

        </el-form>
      </div>
    </div>
    <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="getGroupList"></AddProjectDialog>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { Plus, User, Search, ArrowDown, Check, Delete } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue';
import AddProjectDialog from '../dialog/addGroup/AddGroup.vue'
import { request } from '@/api/api';
import { ApidocGroupItem, ApidocGroupUser, PermissionUserBaseInfo, CommonResponse } from '@src/types';
import { nanoid } from 'nanoid/non-secure';
import { cloneDeep } from "lodash-es";
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm';
import RemoteSelector from '@/components/common/remoteSelect/ClRemoteSelect.vue';
import RemoteSelectorItem from '@/components/common/remoteSelect/ClRemoteSelectItem.vue';
import { useWindowEvent } from '@/hooks/useWindowEvent';
import dayjs from 'dayjs'
import { useRuntime } from '@/store/runtime/runtimeStore';




import { message } from '@/helper'
const { t } = useI18n()

const searchText = ref('')
const selectedGroupId = ref('')
const groupList = ref<ApidocGroupItem[]>([]);
const loading = ref(false);
const loading2 = ref(false);
const dialogVisible = ref(false);
const popoverVisible = ref(false)
const popoverVisibleId = ref('')
const groupInfo = ref<ApidocGroupItem | null>(null)
const originGroupInfo = ref<ApidocGroupItem | null>(null)
const remoteQueryName = ref('');
const memberMode = ref<'list' | 'card'>('list')
const remoteMembers = ref<PermissionUserBaseInfo[]>([]);
const runtimeStore = useRuntime();
const isEdited = computed(() => {
  if (!groupInfo.value || !originGroupInfo.value) return false;
  const isSameGroupName = groupInfo.value.groupName === originGroupInfo.value.groupName;
  const isSameDescription = groupInfo.value.description === originGroupInfo.value.description;
  const isSameInvitedState = groupInfo.value.isAllowInvite === originGroupInfo.value.isAllowInvite;
  if (!isSameGroupName || !isSameDescription || !isSameInvitedState) return true;
  return false;
})
//选择组
const handleSelectGroup = (groupId: string) => {
  const groupItem = groupList.value.find(item => item._id === groupId)!;
  groupInfo.value = cloneDeep(groupItem);
  originGroupInfo.value = cloneDeep(groupItem);
}
//根据名称查询用户列表
const getRemoteUserByName = (query: string) => {
  if (!query.trim()) return;
  loading2.value = true;
  const params = {
    name: query,
  };
  request.get('/api/security/userListByName', { params }).then((res) => {
    remoteMembers.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading2.value = false;
  });
}
//新增用户
const handleAddUser = (item: PermissionUserBaseInfo) => {
  remoteMembers.value = [];
  remoteQueryName.value = '';
  const hasUser = groupInfo.value?.members.find((val) => val.userId === item.userId);
  if (hasUser) {
    message.warning(t('用户已存在、请勿重复添加'));
    return;
  }
  const userInfo: ApidocGroupUser = {
    ...item,
    permission: 'readAndWrite',
  }
  groupInfo.value!.members.push(userInfo);
  popoverVisible.value = false;
  const params = {
    groupId: groupInfo.value!._id,
    userId: item.userId,
    userName: item.userName,
    permission: 'readAndWrite',
  
  }
  request.post<CommonResponse<void>, CommonResponse<void>>('/api/group/member/add', params).then(() => {
    changeGroupInfo();
    getGroupList();
  }).catch(err => {
    console.error(err)
  })
}
//删除用户
const handleRemoveMember = (groupId: string, userId: string) => {
  const removeTip = userId === runtimeStore.userInfo.id ? t('确认要退出当前团队吗') : t('确定要移除该用户吗？') 
  ClConfirm({
    content: removeTip,
    title: t('提示'),
    confirmButtonText: userId === runtimeStore.userInfo.id ? t('确定/GroupManagerLeaveGroup') : t('确定/GroupManagerRemoveMember'),
    cancelButtonText: t('取消') ,
    type: 'warning',
  }).then(() => {
    const params = {
      groupId,
      userId,
    }
    request.delete<CommonResponse<void>, CommonResponse<void>>('/api/group/member/remove', { data: params }).then(() => {
      const delIndex = groupInfo.value?.members.findIndex(item => item.userId === userId);
      if (delIndex !== undefined) {
        groupInfo.value?.members.splice(delIndex, 1);
      }
      message.success(t('移除成功'));
    }).catch(err => {
      console.error(err)
    })
  }).catch(() => {
  });
}
//获取团队列表
const getGroupList = () => {
  loading.value = true
  request.get<CommonResponse<ApidocGroupItem[]>, CommonResponse<ApidocGroupItem[]>>('/api/group/list').then(res => {
    groupList.value = res.data;
    selectedGroupId.value = res.data[0]?._id || '';
    groupInfo.value = cloneDeep(res.data[0]);
    originGroupInfo.value = cloneDeep(res.data[0])
  }).catch(err => {
    console.error(err)
  }).finally(() => {
    loading.value = false
  })
}
//更新修改信息
const changeGroupInfo = () => {
  const editGroup = groupList.value.find(item => item._id === groupInfo.value?._id);
  if (editGroup) {
    editGroup.groupName = groupInfo.value!.groupName;
    editGroup.description = groupInfo.value!.description;
  }
  groupInfo.value!.updatedAt = dayjs().format('YYYY-MM-DD HH:mm');
  if (!groupInfo.value?.updator) {
    groupInfo.value!.updator = {
      userId: nanoid(),
      userName: runtimeStore.userInfo.loginName,
      _id: nanoid(),
    }
  } else {
    groupInfo.value!.updator.userName = runtimeStore.userInfo.loginName;
  }
}
//保存修改
const handleSaveGroupInfo = () => {
  if (!groupInfo.value) return;
  const { _id, groupName, description, isAllowInvite } = groupInfo.value;
  request.put<CommonResponse<ApidocGroupItem>, CommonResponse<ApidocGroupItem>>('/api/group/update', {
    _id,
    groupName,
    description,
    isAllowInvite
  }).then(() => {
    message.success(t('保存成功'))
    changeGroupInfo()
    originGroupInfo.value = cloneDeep(groupInfo.value);
  }).catch(err => {
    console.error(err)
  })
}
//更改用户权限
const handleChangePermission = (groupId: string, userId: string, permission: "admin" | "readOnly" | "readAndWrite") => {
  const params = {
    groupId,
    userId,
    permission
  }
  request.put<CommonResponse<ApidocGroupItem>, CommonResponse<ApidocGroupItem>>('/api/group/member/permission', params).then(() => {
    message.success(t('修改成功'));
    changeGroupInfo()
    getGroupList();
    groupInfo.value?.members.forEach(member => {
      if (member.userId === userId){
        member.permission = permission
      }
    })
  }).catch(err => {
    console.error(err)
  })
}
// 删除团队
const handleDeleteGroup = (groupId: string) => {
  ClConfirm({
    content: t('确定要删除该团队吗？'),
    title: t('提示'),
    confirmButtonText: t('确定/GroupManagerDeleteGroup'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    request.delete<CommonResponse<void>, CommonResponse<void>>('/api/group/remove', { data: { ids: [groupId] } }).then(() => {
      message.success(t('删除成功'));
      getGroupList();
    }).catch(err => {
      console.error(err)
    })
  }).catch(() => {
  });
}
useWindowEvent('click', () => {
  popoverVisibleId.value = '';
  popoverVisible.value = false;
})
onMounted(() => {
  getGroupList()
})

</script>

<style lang='scss' scoped>
.project-group {
  height: calc(100vh - 150px);
}

.empty-state-card {
  background: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 175px);

  .illustration-wrapper {
    margin-bottom: 1.5rem;
  }

  .prompt-title {
    color: var(--color-header-bg-start);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .prompt-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
}


.side-menu-container {
  width: 250px;
  height: calc(100vh - 150px);
  border: 1px solid var(--gray-300);
  padding: 10px 0;
  .menu-title {
    padding: 0 10px 10px;
    display: flex;
    align-items: center;
  }
  .el-menu-item {
    .del-icon {
      position: absolute;
      right: 0px;
      top: 10px;
      font-size: 14px;
      cursor: pointer;
      color: var(--gray-600);
      display: none;
      &:hover {
        color: var(--gray-900);
      }
    }
  }
  .group-title {
    padding: 0 15px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    height: 40px;
    .create-icon {
      margin-left: auto;
      cursor: pointer;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      &:hover {
        background-color: var(--gray-200);
      }
    }
  }
  .el-menu-item {
    height: 35px;
    line-height: 35px;
    &:hover {
      background-color: var(--gray-200);
    }
    &.is-active {
      background-color: var(--color-active-highlight);
      color: var(--gray-800);
    }
  }
}
.group-content {
  flex: 1;
  height: calc(100vh - 150px);
  overflow-y: auto;
  border-top: 1px solid var(--gray-300);
  border-right: 1px solid var(--gray-300);
  border-bottom: 1px solid var(--gray-300);
  padding: 10px 20px;
  .user-item {
    display: flex;
    align-items: center;
    padding: 5px 20px;
    width: 150px;
    margin-right: 5px;
    border-radius: var(--border-radius-base);
    transition: all 0.3s;
    .user-info {
      margin-left: 10px;
      .permission {
        &:hover {
          color: var(--gray-600);
        }
        color: var(--gray-500);
        line-height: normal;
        height: 25px;
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }
  }
  .add-item {
    display: flex;
    align-items: center;
    margin-left: 20px;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
    margin-right: 15px;
    border-radius: 50%;
    border: 1px dashed var(--gray-500);
    cursor: pointer;
    &:hover {
      background-color: var(--gray-100);
    }
  }
}
.permission-list {
  padding: 5px 0;
  .permission-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    cursor: pointer;
    &.active {
      color: var(--theme-color);
    }
    &:hover {
      background-color: var(--gray-200);
    }
  }
}
.user-list {
  min-height: 35px;
  max-height: 200px;
}
</style>

