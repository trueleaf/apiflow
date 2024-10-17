<template>
  <div class="d-flex a-center mb-3">
    <span class="flex0">{{ t("添加用户") }}：</span>
    <RemoteSelector v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading2"
      :placeholder="t('输入用户名或昵称查找用户')" class="w-300px">
      <RemoteSelectorItem v-for="(item, index) in remoteMembers" :key="index">
        <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
          <span>{{ item.loginName }}</span>
          <span>{{ item.realName }}</span>
        </div>
      </RemoteSelectorItem>
    </RemoteSelector>
  </div>
  <!-- 表格展示 -->
  <Loading :loading="loading">
    <el-table :data="selectedUserData" stripe border max-height="300px">
      <el-table-column prop="loginName" :label="t('用户名')" align="center"></el-table-column>
      <el-table-column prop="realName" :label="t('昵称')" align="center"></el-table-column>
      <el-table-column label="角色(权限)" align="center">
        <template #default="scope">
          <el-select v-model="scope.row.permission" :size="config.renderConfig.layout.size"
            @change="handleChangePermission(scope.row)">
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
        </template>
      </el-table-column>
      <el-table-column :label="t('操作')" align="center" width="200px">
        <template #default="scope">
          <el-button v-if="selfLoginName === scope.row.loginName" type="primary" text
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
import type { ApidocProjectInfo, Response, ApidocProjectMemberInfo, ApidocProjectPermission } from '@src/types/global'
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePermissionStore } from '@/store/permission';
import { config } from '@src/config/config';
import { axios } from '@/api/api';
import Loading from '@/components/common/loading/g-loading.vue'
import RemoteSelector from '@/components/common/remote-select/g-remote-select.vue';
import RemoteSelectorItem from '@/components/common/remote-select/g-remote-select-item.vue';

type PermissionUserInfo = ApidocProjectMemberInfo & { _permission: ApidocProjectPermission };
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
const remoteMembers = ref<ApidocProjectMemberInfo[]>([]);
const selectedUserData = ref<ApidocProjectInfo['members']>([]);
const remoteQueryName = ref('');
const loading = ref(false);
const loading2 = ref(false);
const selfLoginName = computed(() => userInfo.loginName);
/*
|--------------------------------------------------------------------------
| 初始化
|--------------------------------------------------------------------------
|
*/
//获取项目成员信息
const getApidocProjectMemberInfo = () => {
  loading.value = true;
  axios.get<Response<ApidocProjectMemberInfo[]>, Response<ApidocProjectMemberInfo[]>>('/api/project/project_members', { params: { _id: props.id } }).then((res) => {
    selectedUserData.value = res.data.map((v) => ({
      ...v,
      _permission: v.permission,
    })) || [];
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
};
//根据名称查询用户列表
const getRemoteUserByName = (query: string) => {
  loading2.value = true;
  const params = {
    name: query,
  };
  axios.get('/api/security/userListByName', { params }).then((res) => {
    remoteMembers.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading2.value = false;
  });
};

/*
|--------------------------------------------------------------------------
| 成员增删改查
|--------------------------------------------------------------------------
*/
//添加成员
const handleSelectUser = (item: ApidocProjectMemberInfo) => {
  remoteMembers.value = [];
  remoteQueryName.value = '';
  const hasUser = selectedUserData.value.find((val) => val.userId === item.userId);
  if (hasUser) {
    ElMessage.warning(t('用户已经存在，请勿重复添加'));
    return;
  }
  const params = {
    loginName: item.loginName,
    realName: item.realName,
    permission: 'readAndWrite',
    userId: item.userId,
    projectId: props.id,
  };
  axios.post('/api/project/add_user', params).then(() => {
    item.permission = 'readAndWrite';
    selectedUserData.value.push(item);
  }).catch((err) => {
    console.error(err);
  });
};
//删除成员
const handleDeleteMember = (row: PermissionUserInfo, index: number) => {
  ElMessageBox.confirm(t('确认删除当前成员吗?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      userId: row.userId,
      projectId: props.id,
    };
    axios.delete('/api/project/delete_user', { data: params }).then(() => {
      selectedUserData.value.splice(index, 1);
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
const handleLeaveGroup = (row: PermissionUserInfo, index: number) => {
  const hasAdmin = selectedUserData.value.find((info) => {
    if (info.userId !== userInfo.id && info.permission === 'admin') {
      return true
    }
    return false;
  });
  if (!hasAdmin) {
    ElMessage.error(t('团队至少保留一个管理员'));
    return;
  }
  ElMessageBox.confirm(t('确认离开当前团队吗?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      userId: row.userId,
      projectId: props.id,
    };
    axios.delete('/api/project/delete_user', { data: params }).then(() => {
      selectedUserData.value.splice(index, 1);
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
const handleChangePermission = (row: PermissionUserInfo) => {
  const oldPermission = row._permission
  const hasAdmin = selectedUserData.value.find((info) => {
    if (info.permission === 'admin') {
      return true
    }
    return false;
  });
  if (!hasAdmin) {
    ElMessage.error(t('团队至少保留一个管理员'));
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
        userId: row.userId,
        projectId: props.id,
        permission: row.permission,
      };
      axios.put('/api/project/change_permission', params).then(() => {
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
      userId: row.userId,
      projectId: props.id,
      permission: row.permission,
    };
    axios.put('/api/project/change_permission', params).then(() => {
      row._permission = row.permission;
    }).catch((err) => {
      row.permission = oldPermission;
      console.error(err);
    });
  }
}
onMounted(() => {
  getApidocProjectMemberInfo();
})
</script>
