<template>
  <div class="header-info">
    <div v-if="!hideDefaultHeader">
      <span class="cursor-pointer no-select" @click="hideDefaultHeader = true">
        <span>{{ t("点击隐藏") }}</span>
      </span>
      <SParamsTree :drag="false" show-checkbox :data="defaultHeaders" no-add></SParamsTree>
    </div>
    <div v-else class="cursor-pointer no-select d-flex a-center" @click="hideDefaultHeader = false">
      <span>{{ defaultHeaders.length }}{{ t("个隐藏") }}</span>
      <el-icon :size="16" class="ml-1">
        <View />
      </el-icon>
    </div>
    <SParamsTree :drag="false" show-checkbox :data="headerData" :mind-params="mindHeaderParams" no-add></SParamsTree>
    <template v-if="commonHeaders.length > 0">
      <el-divider content-position="left">{{ t('公共请求头') }}</el-divider>
      <el-table :data="commonHeaders"  border size="small">
        <el-table-column :label="t('是否发送')" align="center" width="80px">
          <template #default="scope">
            <el-checkbox v-model="scope.row.select" @change="handleChangeCommonHeaderIsSend($event, scope.row)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="key" :label="t('键')" align="center" ></el-table-column>
        <el-table-column prop="type" :label="t('类型')" align="center"  width="100px"></el-table-column>
        <el-table-column prop="value" :label="t('值')" align="center">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('来源')" align="center" width="250px">
          <template #default="scope">
            <template v-if="scope.row.path">
              <div v-for="(path, index) in scope.row.path" :key="path" class="w-100 d-flex a-center">
                <i class="iconfont folder-icon iconweibiaoti-_huabanfuben mr-1" :style="{textIndent: `${15 * index}px`}"></i>
                <span v-if="index !== scope.row.path.length - 1" :title="path" class="text-ellipsis">{{ path }}</span>
                <span 
                  v-else 
                  :title="path"
                  class="theme-color cursor-pointer text-ellipsis" 
                  @click="() => handleJumpToCommonHeaderConfigPage({ nodeId: scope.row.nodeId, name: path })"
                >
                  {{ path }}
                </span>
              </div>
            </template>
            <div v-else class="d-flex w-100 theme-color cursor-pointer" @click="() => handleJumpToCommonHeaderConfigPage()">{{ t('全局公共头') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('描述')" align="center">
          <template #default="scope">
            <div>{{ t(scope.row.description) }}</div>
          </template>
        </el-table-column>
      </el-table>
      <!-- <SParamsTree :drag="false" :readonly-keys="commonHeaderKeys" :data="commonHeaders"></SParamsTree> -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref, watch, } from 'vue'
import { router } from '@/router'
import { View } from '@element-plus/icons-vue'
import { ApidocProperty } from '@src/types/global';
import { apidocGenerateProperty } from '@/helper';
import mindHeaders from './mind-headers'
import { useTranslation } from 'i18next-vue'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { apidocCache } from '@/cache/apidoc';
import { storeToRefs } from 'pinia';
import { CheckboxValueType } from 'element-plus';

const emits = defineEmits(['changeCommonHeaderSendStatus'])
const apidocTabsStore = useApidocTas()
const apidocStore = useApidoc()
const apidocBaseInfoStore = useApidocBaseInfo()
const { commonHeaders: cHeaders, globalCommonHeaders } = storeToRefs(apidocBaseInfoStore)
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => { //当前选中的doc
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
})
const { t } = useTranslation()

const hideDefaultHeader = ref(true);
const headerData = computed(() => apidocStore.apidoc.item.headers)
const defaultHeaders = computed(() => apidocStore.defaultHeaders);
const commonHeaders = ref<(Pick<ApidocProperty, "_id" | 'key' | 'value' | 'description' | 'select' & { path?: string[] }>)[]>([]);
const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);
const handleChangeCommonHeaderIsSend = (isSend: CheckboxValueType, header: Pick<ApidocProperty, "_id" | 'key' | 'value' | 'description' | 'select'>) => {
  if (isSend) {
    apidocCache.removeIgnoredCommonHeader({
      projectId,
      tabId: currentSelectTab.value?._id ?? '',
      ignoreHeaderId: header._id
    })
  } else {
    apidocCache.setIgnoredCommonHeader({
      projectId,
      tabId: currentSelectTab.value?._id ?? '',
      ignoreHeaderId: header._id
    })
  }
  emits('changeCommonHeaderSendStatus')
}
watch([currentSelectTab, cHeaders, globalCommonHeaders], () => {
  if (currentSelectTab.value?.tabType !== 'doc') {
    return
  }
  const defaultCommonHeader = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab.value?._id || "");
  commonHeaders.value = defaultCommonHeader.map(v => {
    const ignoreHeaderIds = apidocCache.getIgnoredCommonHeaderByTabId(projectId, currentSelectTab.value?._id ?? "");
    const isSelect = ignoreHeaderIds?.find(headerId => headerId === v._id) ? false : true
    const property: ApidocProperty<'string'> & { path?: string[] } = apidocGenerateProperty();
    property._id = v._id;
    property.select = isSelect;
    property.key = v.key;
    property.value = v.value;
    property.description = v.description;
    property.path = v.path;
    property.nodeId = v.nodeId;
    return property;
  })
}, {
  deep: true,
  immediate: true
})
//跳转公共请求头
const handleJumpToCommonHeaderConfigPage = ({ nodeId, name }: { nodeId?: string, name?: string } = {}) => {
    apidocTabsStore.addTab({
    _id: nodeId || projectId,
    projectId: projectId,
    tabType: 'commonHeader',
    label: `【公共头】${name ? name : t('全局')}`,
    saved: true,
    fixed: true,
    selected: true,
    head: {
      icon: '',
      color: ''
    },
  })
}

// 公共请求头在单独接口里面可能会取消勾选，所以需要监听，最终发送请求时候以validCommonHeaders为准
// watch(commonHeaders, () => {
//   if (currentSelectTab.value?.tabType !== 'doc') {
//     return
//   }
//   const validCOmmonHeaders = commonHeaders.value.filter(header => header.select);
//   apidocBaseInfoStore.changeValidCommonHeaders(validCOmmonHeaders)
// }, {
//   deep: true,
//   immediate: true
// })
</script>

<style lang='scss' scoped>
.header-info {
  .value-wrap {
    max-height: 140px;
    overflow-y: auto;
  }
  .folder-icon {
    color: #ffc107;
  }
}
</style>
