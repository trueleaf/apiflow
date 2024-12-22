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
import { t } from 'i18next'
import SLoading from '@/components/common/loading/g-loading.vue'


const emits = defineEmits(['change']);
const clientMenu = ref<string[]>([]);
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

<style  scoped>
.client-menus {
  .custom-tree-node {
    @include custom-tree-node;
  }

  .tree {
    min-height: size(200);
    flex: 0 0 size(400);
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
        background: $theme-color;
        color: #fff;
      }
    }
  }
}
</style>
