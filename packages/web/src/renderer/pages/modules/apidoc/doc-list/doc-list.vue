<template>
  <div class="doc-list">
    <el-tabs :model-value="activeName" @update:model-value="handleChangeActiveTab">
      <el-tab-pane name="projectList">
        <template #label>
          <span class="d-flex a-center">
            <el-icon :size="16" class="mr-1">
              <Tickets />
            </el-icon>
            <span>{{ t("项目列表") }}</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="groupList">
        <template #label>
          <span class="d-flex a-center">
            <el-icon :size="16" class="mr-1">
              <School />
            </el-icon>
            <span>{{ t("团队管理") }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <component :is="activeComponent"></component>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { Tickets, School } from '@element-plus/icons-vue'
import tabA from './tab-a/tab-a.vue'
import tabB from './tab-b/tab-b.vue'
import { t } from 'i18next'
import { TabPaneName } from 'element-plus'
import { apidocCache } from '@/cache/apidoc'

const { getActiveApidocTab, setActiveApidocTab } = apidocCache
const activeName = ref('projectList'); //当前激活选项卡
const activeComponent = computed(() => {
  if (activeName.value === 'projectList') {
    return tabA
  } else if (activeName.value === 'groupList'){
    return tabB
  }
})
const handleChangeActiveTab = (tabName: TabPaneName) => {
  setActiveApidocTab(tabName as string)
  activeName.value = tabName as string;
}
onMounted(() => {
  activeName.value = getActiveApidocTab()
})
</script>

<style lang='scss' scoped>
.doc-list {
  width: 70%;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  @media only screen and (max-width: 720px) {
    width: 100%;
    padding: 0 20px;
  }
}
</style>
