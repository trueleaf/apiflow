<template>
  <div class="ws-headers">
    <div v-if="!hideDefaultHeader">
      <span class="cursor-pointer no-select" @click="hideDefaultHeader = true">
        <span>{{ t("点击隐藏") }}</span>
      </span>
      <SParamsTree :drag="false" show-checkbox :data="defaultHeaders" no-add></SParamsTree>
      <el-divider border-style="dashed" class="header-divider" />
    </div>
    <div v-else class="d-flex a-center mb-2 mt-2">
      <span class="cursor-pointer no-select" @click="hideDefaultHeader = false">
        <span>{{ defaultHeaders.length }}{{ t("个隐藏") }}</span>
      </span>
      <el-icon :size="16" class="view-icon ml-1" @click="hideDefaultHeader = false">
        <View />
      </el-icon>
      <span
        class="mode-toggle-icon ml-2"
        role="button"
        tabindex="0"
        :title="isMultiline ? t('返回表格') : t('多行编辑')"
        :class="{ active: isMultiline }"
        @click="toggleMode"
      >
        <el-icon class="toggle-icon">
          <Switch />
        </el-icon>
      </span>
    </div>
    <SParamsTree
      ref="paramsTreeRef"
      :drag="false"
      show-checkbox
      :data="websocket.item.headers"
      no-add
      :edit-mode="isMultiline ? 'multiline' : 'table'"
      @change="handleChange"
    ></SParamsTree>
    <template v-if="commonHeaders.length > 0">
      <el-divider content-position="left">{{ t('公共请求头') }}</el-divider>
      <el-table :data="commonHeaders" border size="small">
        <el-table-column :label="t('是否发送')" align="center" width="80px">
          <template #default="scope">
            <el-checkbox v-model="scope.row.select" @change="handleChangeCommonHeaderIsSend($event, scope.row)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="key" :label="t('键')" align="center"></el-table-column>
        <el-table-column prop="type" :label="t('类型')" align="center" width="100px"></el-table-column>
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
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { router } from '@/router'
import { View, Switch } from '@element-plus/icons-vue'
import { ApidocProperty } from '@src/types';
import { generateEmptyProperty } from '@/helper';
import { cloneDeep } from "lodash-es";
import { useI18n } from 'vue-i18n'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { useWebSocket } from '@/store/websocket/websocketStore';
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore';
import { useApidocTas } from '@/store/httpNode/httpTabsStore';
import { useApidocBaseInfo } from '@/store/apidocProject/baseInfoStore';
import { commonHeaderCache } from '@/cache/project/commonHeadersCache';
import { storeToRefs } from 'pinia';
import { CheckboxValueType } from 'element-plus';

const emits = defineEmits(['changeCommonHeaderSendStatus'])
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const redoUndoStore = useWsRedoUndo()
const apidocBaseInfoStore = useApidocBaseInfo()
const { commonHeaders: cHeaders, globalCommonHeaders } = storeToRefs(apidocBaseInfoStore)
const { websocket, defaultHeaders } = storeToRefs(websocketStore)
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => { //当前选中的doc
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
})
const { t } = useI18n()

type ParamsTreeInstance = InstanceType<typeof SParamsTree> & {
  onMultilineApplied?: (handler: () => void) => void
  onMultilineCancelled?: (handler: () => void) => void
}
const paramsTreeRef = ref<ParamsTreeInstance | null>(null)
const isMultiline = ref(false)

const toggleMode = () => {
  isMultiline.value = !isMultiline.value
}
const handleMultilineApplied = () => {
  isMultiline.value = false
}
const handleMultilineCancelled = () => {
  isMultiline.value = false
}
watch(paramsTreeRef, (instance) => {
  if (!instance?.onMultilineApplied) return
  instance.onMultilineApplied(handleMultilineApplied)
  if (!instance?.onMultilineCancelled) return
  instance.onMultilineCancelled(handleMultilineCancelled)
})

const hideDefaultHeader = ref(true);
const commonHeaders = ref<(Pick<ApidocProperty, "_id" | 'key' | 'value' | 'description' | 'select' & { path?: string[] }>)[]>([]);
// 请求头记录函数
const recordHeadersOperation = (oldValue: ApidocProperty<'string'>[], newValue: ApidocProperty<'string'>[]) => {
  if (!currentSelectTab.value) return;
  redoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "headersOperation",
    operationName: "修改请求头",
    affectedModuleName: "headers",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
};
const handleChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(websocket.value.item.headers);
  websocket.value.item.headers = newData as ApidocProperty<'string'>[];
  if (websocket.value.item.headers.length === 0) {
    websocket.value.item.headers.push(generateEmptyProperty());
  }
  recordHeadersOperation(oldValue, newData as ApidocProperty<'string'>[]);
};

const handleChangeCommonHeaderIsSend = (isSend: CheckboxValueType, header: Pick<ApidocProperty, "_id" | 'key' | 'value' | 'description' | 'select'>) => {
  if (isSend) {
    commonHeaderCache.deleteIgnoredCommonHeader({
      projectId,
      tabId: currentSelectTab.value?._id ?? '',
      ignoreHeaderId: header._id
    })
  } else {
    commonHeaderCache.setIgnoredCommonHeader({
      projectId,
      tabId: currentSelectTab.value?._id ?? '',
      ignoreHeaderId: header._id
    })
  }
  emits('changeCommonHeaderSendStatus')
}

watch([currentSelectTab, cHeaders, globalCommonHeaders], () => {
  if (currentSelectTab.value?.tabType !== 'websocket') {
    return
  }
  const defaultCommonHeader = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab.value?._id || "");
  commonHeaders.value = defaultCommonHeader.map(v => {
    const ignoreHeaderIds = commonHeaderCache.getIgnoredCommonHeaderByTabId(projectId, currentSelectTab.value?._id ?? "");
    const isSelect = ignoreHeaderIds?.find(headerId => headerId === v._id) ? false : true
    const property: ApidocProperty<'string'> & { path?: string[] } = generateEmptyProperty();
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

</script>

<style lang='scss' scoped>
.ws-headers {
  .header-divider {
    margin: 12px 0;
  }
  .value-wrap {
    max-height: 140px;
    overflow-y: auto;
  }
  .folder-icon {
    color: var(--yellow);
  }
}
.view-icon {
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: var(--theme-color);
  }
}
.mode-toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-1);
  transition: border-color 0.2s, color 0.2s;

  &.active {
    border-color: var(--theme-color);
    color: var(--theme-color);
  }

  &:hover {
    border-color: var(--theme-color);
    color: var(--theme-color);
  }

  .toggle-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
