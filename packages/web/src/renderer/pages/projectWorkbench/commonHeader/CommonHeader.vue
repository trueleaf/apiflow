<template>
  <SLoading :loading="loading" class="common-header">
    <SFieldset title="说明">
      <p>{{ t('1. 公共请求头针对目录内所有接口生效') }}</p>
      <p>{{ t('2. 针对嵌套目录，子目录优先级高于父目录') }}</p>
      <p>{{ t('3. 接口本身请求头优先级高于公共请求头') }}</p>
    </SFieldset>
    <SFieldset title="公共请求头">
      <SParamsTree :drag="false" show-checkbox :data="headerData"></SParamsTree>
      <div class="d-flex a-center j-center mt-5">
        <el-button type="success" :loading="loading2" @click="handleEditCommonHeader">确认修改</el-button>
        <el-button type="primary" :loading="loading" @click="getCommonHeaderInfo">刷新</el-button>
      </div>
    </SFieldset>
  </SLoading>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed, watch } from 'vue'
import 'element-plus/es/components/message/style/css';
import { router } from '@/router'
import { message } from '@/helper'
import { ApidocProperty, CommonResponse } from '@src/types';
import { request } from '@/api/api';
import { generateEmptyProperty } from '@/helper';
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'
import SLoading from '@/components/common/loading/ClLoading.vue'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { useApidocTas } from '@/store/apidoc/tabsStore';
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore';
import { useRuntime } from '@/store/runtime/runtimeStore';



type CommonHeaderResponse = {
  _id: string,
  commonHeaders: ApidocProperty[]
}

const headerData = ref<ApidocProperty<'string' | 'file'>[]>([]);
const projectId = router.currentRoute.value.query.id as string;
const apidocTabsStore = useApidocTas();
const apidocBaseInfoStore = useApidocBaseInfo();
const currentSelectTab = computed(() => { //当前选中的doc
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
})

//获取公共请求头信息
const { t } = useI18n()

const loading = ref(false);
const getCommonHeaderInfo = async () => {
  loading.value = true;
  const runtimeStore = useRuntime();
  const isOffline = runtimeStore.networkMode === 'offline';

  try {
    if (currentSelectTab.value?._id === projectId) {
      if (isOffline) {
        const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
        const commonHeaders = await commonHeaderCache.getCommonHeaders();
        headerData.value = (commonHeaders || []) as ApidocProperty<'string' | 'file'>[];
        if (!headerData.value.length) {
          headerData.value.push(generateEmptyProperty() as ApidocProperty<'string' | 'file'>)
        }
      } else {
        const params = {
          projectId,
        }
        const res = await request.get<CommonResponse<ApidocProperty[]>, CommonResponse<ApidocProperty[]>>('/api/project/global_common_headers', { params });
        headerData.value = (res.data || []) as ApidocProperty<'string' | 'file'>[];
        if (!headerData.value.length) {
          headerData.value.push(generateEmptyProperty() as ApidocProperty<'string' | 'file'>)
        }
      }
    } else {
      if (isOffline) {
        const { apiNodesCache } = await import('@/cache/standalone/apiNodesCache');
        const node = await apiNodesCache.getNodeById(currentSelectTab.value?._id || '');
        if (node && node.info.type === 'folder') {
          const folderNode = node as import('@src/types').FolderNode;
          headerData.value = (folderNode.commonHeaders || []) as ApidocProperty<'string' | 'file'>[];
          if (!headerData.value.length) {
            headerData.value.push(generateEmptyProperty() as ApidocProperty<'string' | 'file'>)
          }
        }
      } else {
        const params = {
          projectId,
          id: currentSelectTab.value?._id
        }
        const res = await request.get<CommonResponse<CommonHeaderResponse>, CommonResponse<CommonHeaderResponse>>('/api/project/common_header_by_id', { params });
        headerData.value = (res.data.commonHeaders || []) as ApidocProperty<'string' | 'file'>[];
        if (!headerData.value.length) {
          headerData.value.push(generateEmptyProperty() as ApidocProperty<'string' | 'file'>)
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
//修改公共请求头
const loading2 = ref(false);
const handleEditCommonHeader = async () => {
  loading2.value = true;
  const runtimeStore = useRuntime();
  const isOffline = runtimeStore.networkMode === 'offline';

  try {
    if (currentSelectTab.value?._id === projectId) {
      const commonHeadersData = headerData.value.map(v => ({
        _id: v._id,
        key: v.key,
        value: v.value,
        description: v.description,
        select: v.select,
      }));

      if (isOffline) {
        const { commonHeaderCache } = await import('@/cache/project/commonHeadersCache');
        await commonHeaderCache.setCommonHeaders(commonHeadersData.map(v => ({
          ...v,
          type: 'string' as const,
          required: false,
        })));
        message.success('修改成功');
        await apidocBaseInfoStore.getGlobalCommonHeaders();
      } else {
        const params = {
          projectId,
          commonHeaders: commonHeadersData,
        }
        await request.put('/api/project/replace_global_common_headers', params);
        message.success('修改成功');
        await apidocBaseInfoStore.getGlobalCommonHeaders();
      }
    } else {
      const commonHeadersData = headerData.value.map(v => ({
        _id: v._id,
        key: v.key,
        value: v.value,
        description: v.description,
        select: v.select,
      }));

      if (isOffline) {
        const { apiNodesCache } = await import('@/cache/standalone/apiNodesCache');
        await apiNodesCache.updateNodeById(currentSelectTab.value?._id || '', {
          commonHeaders: commonHeadersData.map(v => ({
            ...v,
            type: 'string' as const,
            required: false,
          })),
        } as Partial<import('@src/types').FolderNode>);
        message.success('修改成功');
        await apidocBaseInfoStore.getCommonHeaders();
      } else {
        const params = {
          projectId,
          id: currentSelectTab.value?._id,
          commonHeaders: commonHeadersData,
        }
        await request.put('/api/project/common_header', params);
        message.success('修改成功');
        await apidocBaseInfoStore.getCommonHeaders();
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading2.value = false;
  }
}
watch(currentSelectTab, (newVal) => {
  if (newVal?.tabType === 'commonHeader') {
    getCommonHeaderInfo();
  }
}, {
  deep: true,
})
onMounted(() => {
  getCommonHeaderInfo();
})


</script>

<style lang='scss' scoped>
.common-header {
  padding: 20px;
}
</style>
