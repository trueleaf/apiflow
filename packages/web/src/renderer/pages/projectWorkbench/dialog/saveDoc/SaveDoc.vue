<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('保存接口')" width="40%" :before-close="handleClose">
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
      <el-button @click="handleClose">{{ t('取消') }}</el-button>
      <el-button :loading="loading" :title="!formInfo.name ? t('请输入接口名称') : ''" :disabled="!formInfo.name" type="primary"
        @click="handleSaveDoc">{{ t('保存') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, Ref, onMounted, nextTick } from 'vue'
import { ApidocBanner, HttpNode } from '@src/types';
import type { TreeNodeOptions } from 'element-plus/es/components/tree/src/tree.type';
import { router } from '@/router';
import { request } from '@/api/api'
;
import { eventEmitter } from '@/helper';
import SLoading from '@/components/common/loading/ClLoading.vue'
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'
import { useApidoc } from '@/store/share/apidocStore';
import { useApidocBanner } from '@/store/share/bannerStore';
import { useApidocTas } from '@/store/share/tabsStore';
import { apiNodesCache } from '@/cache/index';
import { nanoid } from 'nanoid';
import { useRuntime } from '@/store/runtime/runtimeStore';

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
const { t } = useI18n()
const emits = defineEmits(['update:modelValue', 'success']);
const formInfo: Ref<FormInfo> = ref({
  name: t('未命名的接口'),
  pid: ''
})

const rules = ref({
  name: [{ required: true, message: '接口名称必填', trigger: 'blur' }],
});
const apidocStore = useApidoc();
const apidocTabsStore = useApidocTas()
const apidocBannerStore = useApidocBanner();
const runtimeStore = useRuntime();
/*
|--------------------------------------------------------------------------
| 挂载树
|--------------------------------------------------------------------------
*/
const projectId = router.currentRoute.value.query.id as string;
const loading = ref(false); //保存按钮loading状态
const loading2 = ref(false);
const navTreeData = ref<ApidocBanner[]>([]);
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
//目标树
const docTree: Ref<TreeNodeOptions['store'] | null> = ref(null);
const currentMountedNode: Ref<HttpNode | null> = ref(null);
//节点选中状态改变时候
const handleCheckChange = (data: HttpNode, { checkedKeys }: { checkedKeys: HttpNode[] }) => {
  docTree.value?.setCheckedKeys([]);
  if (checkedKeys.length > 0) {
    docTree.value?.setCheckedKeys([data._id]);
  }
  currentMountedNode.value = data;
}
onMounted(async () => {
  if (isStandalone.value) {
    navTreeData.value = await apiNodesCache.getDocTree(projectId);
    return
  }
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
  eventEmitter.emit('tabs/cancelSaveTab')
}
const handleSaveDoc = async () => {
  const docInfo = JSON.parse(JSON.stringify(apidocStore.apidoc))
  docInfo.info.name = formInfo.value.name;
  docInfo.info.creator = runtimeStore.userInfo.realName
  docInfo.pid = currentMountedNode.value?._id;
  docInfo.projectId = projectId;
  docInfo.sort = Date.now();

  const saveDocCb = (docId: string) => {
    apidocBannerStore.getDocBanner({ projectId });
    apidocStore.changeApidocId(docId);
    apidocStore.changeApidocName(formInfo.value.name);
    apidocTabsStore.changeTabInfoById({
      id: apidocStore.savedDocId,
      field: 'label',
      value: formInfo.value.name,
    })
    apidocTabsStore.changeTabInfoById({
      id: apidocStore.savedDocId,
      field: '_id',
      value: docId,
    })
    nextTick(() => {
      apidocTabsStore.changeTabInfoById({
        id: docId,
        field: 'saved',
        value: true,
      })
      eventEmitter.emit('tabs/saveTabSuccess')
    })
    emits('update:modelValue', false)
  }

  const params = {
    docInfo
  }
  loading.value = true;
  if (isStandalone.value) {
    docInfo._id = nanoid(); //local_开头会被识别为未保存文档
    await apiNodesCache.addNode(docInfo);
    saveDocCb(docInfo._id);
    return
  }
  request.post('/api/project/save_doc', params).then((res) => {
    saveDocCb(res.data)
  }).catch((err) => {
    console.error(err);
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
    height: 30px;

    &:hover {
      .more {
        display: block;
      }
    }

    &>img {
      width: 16px;
      height: 16px;
    }

    .file-icon {
      font-size: 14px;
      margin-right: 5px;
    }

    .folder-icon {
      color: var(--yellow);
      flex: 0 0 auto;
      width: 16px;
      height: 16px;
      margin-right: 5px;
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
    height: 30px;
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
