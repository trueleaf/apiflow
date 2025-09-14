<template>
  <SLoading :loading="loading" class="client-menus">
    <el-tree ref="tree" :data="clientMenu" show-checkbox node-key="_id" :draggable="false" :empty-text="t('暂无数据')"
      :expand-on-click-node="false" :highlight-current="true" @check-change="handleSelectClientMenu">
      <template #default="{ data }">
        <div class="custom-tree-node">
          <span>{{ data.name }}</span>
        </div>
      </template>
    </el-tree>
  </SLoading>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { forEachForest } from '@/helper';
import { TreeInstance } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import SLoading from '@/components/common/loading/g-loading.vue'


const emits = defineEmits(['change']);
const clientMenu = ref<string[]>([]);
const { t } = useI18n()

const loading = ref(false);
const tree = ref<TreeInstance>()
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//获取树形菜单结构
const getClientMenu = () => {
  loading.value = true;
  request.get('/api/security/client_menu_tree').then((res) => {
    forEachForest(res.data, (val) => {
      val.id = val._id;
    })
    clientMenu.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//选择前端菜单
const handleSelectClientMenu = () => {
  const checkKeys = tree.value?.getCheckedKeys() || [];
  const halfCheckKeys = tree.value?.getHalfCheckedKeys() || [];
  emits('change', checkKeys.concat(halfCheckKeys));
}
onMounted(() => {
  getClientMenu();
})
defineExpose({
  tree
})
</script>

<style lang='scss' scoped>
.client-menus {
  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    min-height: 30px;
  }
  .custom-tree-node:hover .more {
    display: block;
  }
  .custom-tree-node .file-icon {
    font-size: 14px;
    margin-right: 5px;
  }
  .custom-tree-node .folder-icon {
    color: var(--yellow);
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin-right: 5px;
  }
  .custom-tree-node .node-label-wrap {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }
  .custom-tree-node .node-label-wrap .node-top {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .custom-tree-node .node-label-wrap .node-bottom {
    color: var(--gray-500);
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .custom-tree-node .rename-ipt {
    flex: 0 0 75%;
    height: 22px;
    border: 1px solid var(--theme-color);
    font-size: 1em;
    margin-left: -1px;
  }
  .custom-tree-node .rename-ipt.error {
    border: 2px solid var(--red);
  }
  .custom-tree-node .more {
    display: none;
    flex: 0 0 auto;
    margin-left: auto;
    padding: 5px 10px;
  }
  .custom-tree-node.active-node {
    background-color: #a6d2ff;
  }
  .custom-tree-node.select-node {
    background-color: #a6d2ff;
  }
  .custom-tree-node.cut-node {
    color: var(--gray-500);
  }
  .custom-tree-node.cut-node .file-icon {
    color: var(--gray-500)!important;
  }
  .custom-tree-node.cut-node .folder-icon {
    color: var(--gray-300)!important;
  }

  .tree {
    min-height: 200px;
    flex: 0 0 400px;
    display: flex;
    flex-direction: column;

    .el-tree-node__content {
      height: 35px;
    }

    .el-checkbox {
      margin-bottom: 0;
    }

    .custom-tree-node {
      display: flex;
      align-items: center;
      height: 30px;
      width: 100%;

      .node-name {
        display: inline-block;
        max-width: 180px;
      }

      .bg-active {
        background: var(--theme-color);
        color: #fff;
      }
    }
  }
}
</style>
