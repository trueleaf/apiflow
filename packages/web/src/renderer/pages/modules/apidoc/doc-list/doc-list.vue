<template>
  <div class="doc-list">
    <div class="doc-list__header">
      <div class="doc-list__tabs">
        <el-tabs :model-value="activeName" @update:model-value="handleChangeActiveTab">
          <el-tab-pane name="projectList">
            <template #label>
              <span class="d-flex a-center">
                <el-icon :size="16" class="mr-1">
                  <Tickets />
                </el-icon>
                <span>{{ t('项目列表') }}</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane v-if="!isStandalone" name="groupList">
            <template #label>
              <span class="d-flex a-center">
                <el-icon :size="16" class="mr-1">
                  <School />
                </el-icon>
                <span>{{ t('团队管理') }}</span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <component :is="activeComponent"></component>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { Tickets, School, List } from '@element-plus/icons-vue'
import tabA from './tab-a/tab-a.vue'
import tabB from './tab-b/tab-b.vue'
import { useI18n } from 'vue-i18n'
import { TabPaneName } from 'element-plus'
import { httpNodeCache } from '@/cache/http/httpNodeCache.ts'
import { useRuntime } from '@/store/runtime/runtime'
import { useRouter } from 'vue-router'

const router = useRouter()
const { getActiveApidocTab, setActiveApidocTab } = httpNodeCache
const { t } = useI18n()

const activeName = ref('projectList'); //当前被选中的tab
const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
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
const handleOpenOverview = () => {
  router.push({ path: '/v1/apidoc/doc-list/overview' })
}
onMounted(() => {
  activeName.value = getActiveApidocTab()
})
</script>

<style lang='scss' scoped>
.doc-list {
  width: 70%;
  margin-left: auto;
  margin-right: auto;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__tabs {
    flex: 1;
  }

  &__overview-btn {
    white-space: nowrap;
  }

  @media only screen and (max-width: 720px) {
    width: 100%;
    padding: 0 20px;

    &__header {
      flex-direction: column;
      align-items: stretch;
    }

    &__overview-btn {
      align-self: flex-end;
    }
  }
}
</style>
