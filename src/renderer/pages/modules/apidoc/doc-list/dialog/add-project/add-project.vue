<template>
  <Dialog :model-value="modelValue" top="10vh" :title="t('新增项目')" @close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
      <el-form-item :label="`${t('项目名称')}：`" prop="projectName">
        <el-input v-model="formInfo.projectName" v-focus-select :size="config.renderConfig.layout.size" :placeholder="t('请输入项目名称')" @keydown.enter="handleAddProject"></el-input>
      </el-form-item>
      <el-form-item :label="`${t('选择成员')}：`">
        <RemoteSelector v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading" :placeholder="t('输入用户名或昵称查找用户')">
          <RemoteSelectorItem v-for="(item, index) in remoteMembers" :key="index">
            <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
              <span>{{ item.loginName }}</span>
              <span>{{ item.realName }}</span>
            </div>
          </RemoteSelectorItem>
        </RemoteSelector>
      </el-form-item>
    </el-form>
    <!-- 成员信息 -->
    <el-table :data="selectUserData" stripe border max-height="200px">
      <el-table-column prop="loginName" :label="t('用户名')" align="center"></el-table-column>
      <el-table-column prop="realName" :label="t('昵称')" align="center"></el-table-column>
      <el-table-column :label="t('角色(权限)')" align="center">
        <template #default="scope">
          <el-select v-model="scope.row.permission" :size="config.renderConfig.layout.size">
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
          <el-button link type="primary" text @click="handleDeleteMember(scope.$index)">{{ t("删除") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleAddProject">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { config } from '@src/config/config';
import type { PermissionUserBaseInfo, ApidocProjectMemberInfo } from '@src/types/global'
import { ElMessage, FormInstance } from 'element-plus';
import { t } from 'i18next'
import { nextTick, ref } from 'vue';
import RemoteSelector from '@/components/common/remote-select/g-remote-select.vue';
import RemoteSelectorItem from '@/components/common/remote-select/g-remote-select-item.vue';
import Dialog from '@/components/common/dialog/g-dialog.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const form = ref<FormInstance>()
const emits = defineEmits(['update:modelValue', 'success'])
const formInfo = ref({
  projectName: '', //-------------------------项目名称
  remark: '', //------------------------------项目备注
})
const rules = ref({
  projectName: [{ required: true, trigger: 'blur', message: t('请填写项目名称') }],
})
const remoteMembers = ref<PermissionUserBaseInfo[]>([]) //------远程用户列表
const selectUserData = ref<ApidocProjectMemberInfo[]>([]) //-----已选中的用户
const remoteQueryName = ref('') //-------------------------用户名称
const loading = ref(false) //------------------------------成员数据加载状态
const loading2 = ref(false) //-----------------------------新增项目
/*
|--------------------------------------------------------------------------
| 
|--------------------------------------------------------------------------
*/
//根据名称查询用户列表
const getRemoteUserByName = (query: string) => {
  loading.value = true;
  const params = {
    name: query,
  };
  request.get('/api/security/userListByName', { params }).then((res) => {
    remoteMembers.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
const handleAddProject = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading2.value = true;
      const params = {
        ...formInfo.value,
        members: selectUserData.value.map((val) => ({
          userId: val.userId,
          permission: val.permission,
          loginName: val.loginName,
          realName: val.realName,
        })),
      };
      request.post('/api/project/add_project', params).then((res) => {
        handleClose();
        emits('success', res.data);
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading2.value = false;
      });
    } else {
      nextTick(() => {
        const input: HTMLInputElement = document.querySelector('.el-form-item.is-error input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
      ElMessage.warning('请完善必填信息');
      loading.value = false;
    }
  });
}
//选取用户
const handleSelectUser = (item: PermissionUserBaseInfo) => {
  remoteMembers.value = [];
  remoteQueryName.value = '';
  const hasUser = selectUserData.value.find((val) => val.userId === item.userId);
  if (hasUser) {
    ElMessage.warning(t('请勿重复添加'));
    return;
  }
  const userInfo: ApidocProjectMemberInfo = {
    ...item,
    permission: 'readAndWrite',
  }
  selectUserData.value.push(userInfo);
}
//删除成员
const handleDeleteMember = (index: number) => {
  selectUserData.value.splice(index, 1);
}
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}

</script>
