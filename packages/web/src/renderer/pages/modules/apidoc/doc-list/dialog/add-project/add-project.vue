<template>
  <Dialog :model-value="modelValue" top="10vh" :title="t('新增项目')" @close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px" @submit.prevent="() => {}">
      <el-form-item :label="`${t('项目名称')}：`" prop="projectName">
        <el-input v-model="formInfo.projectName" v-focus-select="isFocus" :size="config.renderConfig.layout.size" :placeholder="t('请输入项目名称')" @keydown.enter="handleAddProject"></el-input>
      </el-form-item>
      <el-form-item v-if="!isStandalone" :label="`${t('选择成员或组')}：`">
        <RemoteSelector v-model="remoteQueryName" :remote-methods="getRemoteUserOrGroupByName" :loading="loading" :placeholder="t('输入【用户名】| 【完整手机号】 | 【组名称】')">
          <RemoteSelectorItem v-for="(item, index) in remoteUserOrGroupList" :key="index">
            <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
              <span>{{ item.name }}</span>
              <el-tag v-if="item.type === 'user'">用户</el-tag>
              <el-tag v-if="item.type === 'group'" type="success">组</el-tag>
            </div>
          </RemoteSelectorItem>
          <div v-if="remoteUserOrGroupList.length === 0" class="d-flex a-center j-center w-100 h-40px gray-500">{{ t('暂无数据') }}</div>
        </RemoteSelector>
      </el-form-item>
    </el-form>
    <!-- 成员信息 -->
    <el-table v-if="!isStandalone" :data="selectMemberData"  border max-height="50vh">
      <el-table-column prop="name" :label="t('名称')" align="center"></el-table-column>
      <el-table-column prop="type" :label="t('类型')" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.type === 'user'">用户</el-tag>
          <el-tag v-if="row.type === 'group'" type="success">组</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('角色(权限)')" align="center">
        <template #default="scope">
          <el-select v-if="scope.row.type === 'user'" v-model="scope.row.permission" :size="config.renderConfig.layout.size">
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
          <el-button link type="primary" text @click="handleDeleteMember(scope.$index)">{{ t("删除") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :loading="loading2" type="primary" @click="handleAddProject">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { config } from '@src/config/config';
import type { ApidocProjectMemberInfo } from '@src/types/global'
import { ElMessage, FormInstance } from 'element-plus';
import { useTranslation } from 'i18next-vue'
import { nextTick, ref } from 'vue';
import RemoteSelector from '@/components/common/remote-select/g-remote-select.vue';
import RemoteSelectorItem from '@/components/common/remote-select/g-remote-select-item.vue';
import Dialog from '@/components/common/dialog/g-dialog.vue';
import { standaloneCache } from '@/cache/standalone';
import { generateEmptyProject } from '@/helper/standaloneUtils';
import { nanoid } from 'nanoid';




defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isFocus: {
    type: Boolean,
    default: true,
  },
})
const form = ref<FormInstance>()
const emits = defineEmits(['update:modelValue', 'success'])
const { t } = useTranslation()

const formInfo = ref({
  projectName: '', //-------------------------项目名称
  remark: '', //------------------------------项目备注
})
const rules = ref({
  projectName: [{ required: true, trigger: 'blur', message: t('请填写项目名称') }],
})
const isStandalone = ref(__STANDALONE__)
const remoteUserOrGroupList = ref<ApidocProjectMemberInfo[]>([]) //------远程用户和组列表
const selectMemberData = ref<ApidocProjectMemberInfo[]>([]) //-----已选中的用户
const remoteQueryName = ref('') //-------------------------用户名称
const loading = ref(false) //------------------------------成员数据加载状态
const loading2 = ref(false) //-----------------------------新增项目
/*
|--------------------------------------------------------------------------
| 
|--------------------------------------------------------------------------
*/
//根据名称查询用户列表
const getRemoteUserOrGroupByName = (query: string) => {
  if (!query.trim()) return;
  loading.value = true;
  const params = {
    name: query,
  };
  request.get('/api/security/userOrGroupListByName', { params }).then((res) => {
    remoteUserOrGroupList.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
const handleAddProject = () => {
  form.value?.validate(async (valid) => {
    if(isStandalone.value && valid){
      const projectId = nanoid();
      const project = generateEmptyProject(projectId);
      project.projectName = formInfo.value.projectName;
      await standaloneCache.addProject(project);
      handleClose();
      emits('success', {
        projectId,
        projectName: project.projectName,
      });
      return;
    }
    if (valid) {
      loading2.value = true;
      const params = {
        ...formInfo.value,
        users: selectMemberData.value.filter(v => v.type === 'user').map((val) => ({
          userId: val.id,
          userName: val.name,
          permission: val.permission,
        })),
        groups: selectMemberData.value.filter(v => v.type === 'group').map(
          (val) => ({
            groupId: val.id,
            groupName: val.name,
          })
        ),
      };
      request.post('/api/project/add_project', params).then((res) => {
        handleClose();
        emits('success', {
          projectId: res.data,
          projectName: formInfo.value.projectName,
        });
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
const handleSelectUser = (item: ApidocProjectMemberInfo) => {
  remoteUserOrGroupList.value = [];
  remoteQueryName.value = '';
  const matchedMember = selectMemberData.value.find((val) => val.id === item.id);
  if (matchedMember) {
    ElMessage.warning(t('请勿重复添加'));
    return;
  }
  const memberInfo: ApidocProjectMemberInfo = {
    ...item,
    permission: 'readAndWrite',
  }
  if (item.type === 'group') {
    delete memberInfo.permission;
  }
  selectMemberData.value.push(memberInfo);
}
//删除成员
const handleDeleteMember = (index: number) => {
  selectMemberData.value.splice(index, 1);
}
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}

</script>
