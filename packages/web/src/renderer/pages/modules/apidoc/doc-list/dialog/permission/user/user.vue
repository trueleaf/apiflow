<template>
  <div class="d-flex a-center mb-3">
    <span class="flex0">{{ t("添加用户") }}：</span>
    <RemoteSelector v-model="remoteQueryName" :remote-methods="getRemoteUserOrGroupByName" :loading="loading2"
      :placeholder="t('输入【用户名】| 【完整手机号】 | 【组名称】')">
      <RemoteSelectorItem v-for="(item, index) in remoteUserOrGroupList" :key="index">
        <div class="d-flex a-center j-between w-100 h-100" @click="handleAddMember(item)">
          <span>{{ item.name }}</span>
          <el-tag v-if="item.type === 'user'">用户</el-tag>
          <el-tag v-if="item.type === 'group'" type="success">组</el-tag>
        </div>
      </RemoteSelectorItem>
      <div v-if="remoteUserOrGroupList.length === 0" class="d-flex a-center j-center w-100 h-40px gray-500">{{ t('暂无数据')
        }}</div>
    </RemoteSelector>
  </div>
  <!-- 表格展示 -->
  <Loading :loading="loading">
    <!-- 成员信息 -->
    <el-table :data="memberList"  border max-height="50vh">
      <el-table-column prop="name" :label="t('名称')" align="center"></el-table-column>
      <el-table-column prop="type" :label="t('类型')" sortable align="center">
        <template #default="{ row }">
          <el-tag v-if="row.type === 'user'">用户</el-tag>
          <el-tag v-if="row.type === 'group'" type="success">组</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('角色(权限)')" align="center">
        <template #default="scope">
          <el-select 
            v-if="scope.row.type === 'user'" 
            :size="config.renderConfig.layout.size"
            v-model="scope.row.permission"
            @change="handleChangePermission(scope.row)"
          
          >
            <el-option :label="t('只读')" value="readOnly">
              <span>{{ t("只读") }}</span>
              <span class="gray-500">({{ t("仅查看项目") }})</span>
            </el-option>
            <el-option :label="t('读写')" value="readAndWrite">
              <span>{{ t("读写") }}</span>
              <span class="gray-500">({{ t("新增和编辑文档") }})</span>
            </el-option>
            <el-option :label="t('管理员')" value="admin">
              <span>{{ t("管理员") }}</span>
              <span class="gray-500">({{ t("添加新成员") }})</span>
            </el-option>
          </el-select>
          <span v-else>/</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('操作')" align="center" width="200px">
        <template #default="scope">
          <el-button v-if="userInfo.id === scope.row.id" type="primary" text
            @click="handleLeaveGroup(scope.row, scope.$index)">{{ t("退出") }}</el-button>
          <el-button v-else type="primary" text @click="handleDeleteMember(scope.row, scope.$index)">{{ t("删除")
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </Loading>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import type { Response, ApidocProjectMemberInfo, ApidocProjectPermission, ApidocGroupUser } from '@src/types/global'
import {  onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePermissionStore } from '@/store/permission';
import { config } from '@src/config/config';
import { request } from '@/api/api';
import Loading from '@/components/common/loading/g-loading.vue'
import RemoteSelector from '@/components/common/remote-select/g-remote-select.vue';
import RemoteSelectorItem from '@/components/common/remote-select/g-remote-select-item.vue';
import { $t } from '@/i18n/i18n';

type MemberWithOldPermission = ApidocProjectMemberInfo & { _permission?: ApidocProjectPermission };
type MemberInfo = {
  groups: {
    groupId: string;
    groupName: string;
  }[];
  users: ApidocGroupUser[]
}
/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
|
*/
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['leave']);
const { userInfo } = usePermissionStore()
const remoteUserOrGroupList = ref<ApidocProjectMemberInfo[]>([]) //------远程用户和组列表
const memberList = ref<MemberWithOldPermission[]>([]);
const remoteQueryName = ref('');
const loading = ref(false);
const loading2 = ref(false);
/*
|--------------------------------------------------------------------------
| 初始化
|--------------------------------------------------------------------------
|
*/
//获取项目成员信息
const getApidocProjectUserInfo = () => {
  loading.value = true;
  request.get<Response<MemberInfo>, Response<MemberInfo>>('/api/project/project_members', { params: { _id: props.id } }).then((res) => {
    res.data.users.forEach((userInfo) => {
      memberList.value.push({
        name: userInfo.userName,
        type: 'user',
        permission: userInfo.permission,
        _permission: userInfo.permission,
        id: userInfo.userId,
      })
    })
    res.data.groups.forEach((groupInfo) => {
      memberList.value.push({
        name: groupInfo.groupName,
        type: 'group',
        id: groupInfo.groupId,
      })
    })
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
};
//根据用户名称或组查询用户列表
const getRemoteUserOrGroupByName = (query: string) => {
  if (!query.trim()) return;
  loading2.value = true;
  const params = {
    name: query,
  };
  request.get('/api/security/userOrGroupListByName', { params }).then((res) => {
    remoteUserOrGroupList.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading2.value = false;
  });
}

/*
|--------------------------------------------------------------------------
| 成员增删改查
|--------------------------------------------------------------------------
*/
//添加成员
const handleAddMember = (item: ApidocProjectMemberInfo) => {
  remoteUserOrGroupList.value = [];
  remoteQueryName.value = '';
  const hasMember = memberList.value.find((memberInfo) => memberInfo.id === item.id);
  if (hasMember) {
    ElMessage.warning(t('用户已经存在，请勿重复添加'));
    return;
  }
  const params = {
    name: item.name,
    permission: item.type === 'user' ? 'readAndWrite' : undefined,
    id: item.id,
    projectId: props.id,
    type: item.type,
  };
  request.post('/api/project/add_user', params).then(() => {
    const memberInfo: MemberWithOldPermission = {
      ...item,
      permission: 'readAndWrite',
      _permission: 'readAndWrite',
    }
    if (item.type === 'group') {
      delete memberInfo.permission;
    }
    memberList.value.push(memberInfo);
  }).catch((err) => {
    console.error(err);
  });
};
//删除成员
const handleDeleteMember = (row: MemberWithOldPermission, index: number) => {
  ElMessageBox.confirm(t('确认删除当前成员吗?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      id: row.id,
      projectId: props.id,
      memberType: row.type,
    };
    request.delete('/api/project/delete_user', { data: params }).then(() => {
      memberList.value.splice(index, 1);
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
};
//离开团队
const handleLeaveGroup = (row: MemberWithOldPermission, index: number) => {
  const hasAdmin = memberList.value.find((member) => {
    if (member.id !== userInfo.id && member.permission === 'admin') {
      return true
    }
    return false;
  });
  if (!hasAdmin) {
    ElMessage({
      message: $t('团队至少保留一个管理员'),
      grouping: true,
      type: 'error',
    })
    return;
  }
  ElMessageBox.confirm(t('确认离开当前团队吗?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      id: row.id,
      projectId: props.id,
    };
    request.delete('/api/project/delete_user', { data: params }).then(() => {
      memberList.value.splice(index, 1);
      emits('leave');
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
};
//改变成员权限
const handleChangePermission = (row: MemberWithOldPermission) => {
  const oldPermission = row._permission
  const hasAdmin = memberList.value.find((member) => {
    if (member.permission === 'admin') {
      return true
    }
    return false;
  });
  if (!hasAdmin) {
    ElMessage({
      message: $t('团队至少保留一个管理员'),
      grouping: true,
      type: 'error',
    })
    row.permission = oldPermission;
    return;
  }
  if (oldPermission === 'admin') {
    ElMessageBox.confirm(t('确认改变当前管理员权限吗?'), t('提示'), {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning',
    }).then(() => {
      const params = {
        id: row.id,
        projectId: props.id,
        permission: row.permission,
      };
      request.put('/api/project/change_permission', params).then(() => {
        row._permission = row.permission;
      }).catch((err) => {
        row.permission = oldPermission;
        console.error(err);
      });
    }).catch((err: Error | string) => {
      if (err === 'cancel' || err === 'close') {
        row.permission = oldPermission;
        return;
      }
      console.error(err);
    });
  } else {
    const params = {
      id: row.id,
      projectId: props.id,
      permission: row.permission,
    };
    request.put('/api/project/change_permission', params).then(() => {
      row._permission = row.permission;
    }).catch((err) => {
      row.permission = oldPermission;
      console.error(err);
    });
  }
}
onMounted(() => {
  getApidocProjectUserInfo();
})
</script>
