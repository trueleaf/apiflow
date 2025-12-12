<template>
  <el-dialog :model-value="modelValue" width="35vw" top="10vh" :title="t('新增项目')" :before-close="handleClose" data-testid="add-project-dialog" @opened="handleDialogOpened">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px" data-testid="add-project-form" @submit.prevent="() => {}">
      <el-form-item :label="`${t('项目名称')}：`" prop="projectName">
        <el-input ref="projectNameInput" v-model="formInfo.projectName" :size="config.renderConfig.layout.size" :placeholder="t('请输入项目名称')" data-testid="add-project-name-input" @keydown.enter="handleAddProject"></el-input>
      </el-form-item>
      <el-form-item v-if="!isStandalone" :label="`${t('选择成员或组')}：`">
        <RemoteSelector v-model="remoteQueryName" :remote-methods="getRemoteUserOrGroupByName" :loading="loading" :placeholder="t('输入【用户名】| 【完整手机号】 | 【组名称】')" data-testid="add-project-member-select">
          <RemoteSelectorItem v-for="(item, index) in remoteUserOrGroupList" :key="index">
            <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
              <span>{{ item.name }}</span>
              <el-tag v-if="item.type === 'user'">{{ t('用户') }}</el-tag>
              <el-tag v-if="item.type === 'group'" type="success">{{ t('组') }}</el-tag>
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
          <el-tag v-if="row.type === 'user'">{{ t('用户') }}</el-tag>
          <el-tag v-if="row.type === 'group'" type="success">{{ t('组') }}</el-tag>
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
      <el-button data-testid="add-project-cancel-btn" @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading2" type="primary" data-testid="add-project-confirm-btn" @click="handleAddProject">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { config } from '@src/config/config';
import type { ApidocProjectMemberInfo } from '@src/types'
import { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref } from 'vue';
import RemoteSelector from '@/components/common/remoteSelect/ClRemoteSelect.vue';
import RemoteSelectorItem from '@/components/common/remoteSelect/ClRemoteSelectItem.vue';
import { useProjectManagerStore } from '@/store/projectManager/projectManagerStore';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { message } from '@/helper'

const props = defineProps({
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
const projectNameInput = ref()
const emits = defineEmits(['update:modelValue', 'success'])
const { t } = useI18n()

const runtimeStore = useRuntime();
const projectManagerStore = useProjectManagerStore();

const formInfo = ref({
  projectName: '', //-------------------------项目名称
  remark: '', //------------------------------项目备注
})
//对话框打开后聚焦输入框
const handleDialogOpened = () => {
  if (props.isFocus) {
    nextTick(() => {
      const inputEl = projectNameInput.value?.$el?.querySelector('input') || projectNameInput.value?.$el;
      if (inputEl && inputEl.tagName === 'INPUT') {
        inputEl.focus();
      }
    });
  }
};
const rules = ref({
  projectName: [
    { required: true, trigger: 'blur', message: t('请填写项目名称') },
    { 
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value || !value.trim()) {
          callback(new Error(t('项目名称不能为空或仅包含空格')));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
})
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const remoteUserOrGroupList = ref<ApidocProjectMemberInfo[]>([]) //------远程用户和组列表
const selectMemberData = ref<ApidocProjectMemberInfo[]>([]) //-----已选中的用户
const remoteQueryName = ref('') //-------------------------用户名称
const loading = ref(false) //------------------------------成员数据加载状态
const loading2 = ref(false) //-----------------------------新增项目
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
    if (valid) {
      loading2.value = true;
      try {
        const members = isStandalone.value ? undefined : {
          users: selectMemberData.value.filter(v => v.type === 'user').map((val) => ({
            userId: val.id,
            userName: val.name,
            permission: val.permission || 'readAndWrite',
          })),
          groups: selectMemberData.value.filter(v => v.type === 'group').map((val) => ({
            groupId: val.id,
            groupName: val.name,
          })),
        };
        const result = await projectManagerStore.addProject(formInfo.value.projectName, members);
        if (result) {
          emits('success', result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        loading2.value = false;
      }
    } else {
      nextTick(() => {
        const input: HTMLInputElement = document.querySelector('.el-form-item.is-error input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
      
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
    message.warning(t('请勿重复添加'));
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
