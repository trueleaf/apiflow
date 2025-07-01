<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('保存接口')" width="40%" @close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="100px" class="save-doc"
      @submit.prevent="handleSaveDoc">
      <el-form-item :label="t('接口名称')" prop="name">
        <el-input v-model="formInfo.name" name="name" :placeholder="t('请输入接口名称')" class="w-100" maxlength="100"
          show-word-limit clearable></el-input>
      </el-form-item>
      <div class="pt-1"></div>
      <SFieldset :title="t('选择需要挂载的节点')">
        <div class="gray-500 f-sm mb-1">{{ t('若不选择，则会挂载在根节点') }}</div>
        <SLoading :loading="loading2">
          <el-tree ref="docTree" :data="navTreeData" node-key="_id" show-checkbox :expand-on-click-node="true"
            :check-strictly="true" @check="handleCheckChange">
            <template #default="scope">
              <div class="custom-tree-node" tabindex="0">
                <!-- 文件夹渲染 -->
                <img :src="folderUrl" width="16px" height="16px" />
                <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
              </div>
            </template>
          </el-tree>
        </SLoading>
      </SFieldset>
    </el-form>
    <template #footer>
      <el-button :loading="loading" :title="!formInfo.name ? t('请输入接口名称') : ''" :disabled="!formInfo.name" type="primary"
        @click="handleSaveDoc">{{ t('保存') }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t('取消') }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { ref, Ref, onMounted, nextTick } from 'vue'
import { ApidocDetail } from '@src/types/global';
import type { TreeNodeOptions } from 'element-plus/es/components/tree/src/tree.type';
import { router } from '@/router';
import { request } from '@/api/api'
import { event } from '@/helper';
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SLoading from '@/components/common/loading/g-loading.vue'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import { useApidoc } from '@/store/apidoc/apidoc';
import { usePermissionStore } from '@/store/permission';
import { useApidocBanner } from '@/store/apidoc/banner';
import { useApidocTas } from '@/store/apidoc/tabs';

type FormInfo = {
  name: string, //接口名称
  pid: string, //需要挂载的目录
}
const folderUrl = new URL('@/assets/imgs/apidoc/folder.png', import.meta.url).href;
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue', 'success']);
const formInfo: Ref<FormInfo> = ref({
  name: '',
  pid: ''
})
const rules = ref({
  name: [{ required: true, message: '接口名称必填', trigger: 'blur' }],
});
const apidocStore = useApidoc();
const apidocTabsStore = useApidocTas()
const apidocBannerStore = useApidocBanner();
const permissionStore = usePermissionStore();
/*
|--------------------------------------------------------------------------
| 挂载树
|--------------------------------------------------------------------------
*/
const projectId = router.currentRoute.value.query.id as string;
const loading = ref(false); //保存按钮loading状态
const loading2 = ref(false);
const navTreeData = ref([]);
//目标树
const docTree: Ref<TreeNodeOptions['store'] | null> = ref(null);
const currentMountedNode: Ref<ApidocDetail | null> = ref(null);
//节点选中状态改变时候
const handleCheckChange = (data: ApidocDetail, { checkedKeys }: { checkedKeys: ApidocDetail[] }) => {
  docTree.value?.setCheckedKeys([]);
  if (checkedKeys.length > 0) {
    docTree.value?.setCheckedKeys([data._id]);
  }
  currentMountedNode.value = data;
}
onMounted(() => {
  loading2.value = true;
  const params = {
    projectId,
  };
  request.get('/api/project/doc_tree_folder_node', { params }).then((res) => {
    navTreeData.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading2.value = false;
  });
})
const handleClose = () => {
  emits('update:modelValue', false)
  event.emit('tabs/cancelSaveTab')
}
const handleSaveDoc = () => {
  const docInfo = JSON.parse(JSON.stringify(apidocStore.apidoc))
  docInfo.info.name = formInfo.value.name;
  docInfo.info.creator = permissionStore.userInfo.realName
  docInfo.pid = currentMountedNode.value?._id;
  docInfo.projectId = projectId;
  docInfo.sort = Date.now();
  const params = {
    docInfo
  }
  loading.value = true;
  request.post('/api/project/save_doc', params).then((res) => {
    apidocBannerStore.getDocBanner({ projectId });
    apidocStore.changeApidocId(res.data);
    apidocStore.changeApidocName(formInfo.value.name);
    apidocTabsStore.changeTabInfoById({
      id: apidocStore.savedDocId,
      field: 'label',
      value: formInfo.value.name,
    })
    apidocTabsStore.changeTabInfoById({
      id: apidocStore.savedDocId,
      field: '_id',
      value: res.data,
    })
    nextTick(() => {
      apidocTabsStore.changeTabInfoById({
        id: res.data,
        field: 'saved',
        value: true,
      })
      event.emit('tabs/saveTabSuccess')
    })
    emits('update:modelValue', false)
  }).catch((err) => {
    console.error(err);
    event.emit('tabs/saveTabError')
  }).finally(() => {
    loading.value = false;
  });
}
</script>

<style lang='scss' scoped>
.save-doc {
  max-height: 70vh;
  margin: 0 auto;

  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    height: size(30);

    &:hover {
      .more {
        display: block;
      }
    }

    &>img {
      width: size(16);
      height: size(16);
    }

    .file-icon {
      font-size: fz(14);
      margin-right: size(5);
    }

    .folder-icon {
      color: var(--yellow);
      flex: 0 0 auto;
      width: size(16);
      height: size(16);
      margin-right: size(5);
    }

    .node-label-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;

      .node-top {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .node-bottom {
        color: var(--gray-500);
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  :deep(.el-tree-node__content) {
    height: size(30);
    display: flex;
    align-items: center;
  }

  :deep(.el-tree-node__content > .el-tree-node__expand-icon) {
    transition: none; //去除所有动画
    padding-top: 0;
    padding-bottom: 0;
    margin-top: -1px;
  }
}
</style>
