<template>
  <SLoading :loading="loading" class="common-header">
    <SFieldset title="说明">
      <p>{{ t('1. 公共请求头针对目录内所有接口生效') }}</p>
      <p>{{ t('2. 针对嵌套目录，子目录优先级高于父目录') }}</p>
      <p>{{ t('3. 接口本身请求头优先级高于公共请求头') }}</p>
    </SFieldset>
    <SFieldset title="公共请求头">
      <SParamsTree :drag="false" show-checkbox :data="headerData" :mind-params="mindHeaderParams"></SParamsTree>
      <div class="d-flex a-center j-center mt-5">
        <el-button type="success" :loading="loading2" @click="handleEditCommonHeader">确认修改</el-button>
        <el-button type="primary" :loading="loading" @click="getCommonHeaderInfo">刷新</el-button>
      </div>
    </SFieldset>
  </SLoading>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { onMounted, ref, Ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css';
import { router } from '@/router'
import { ApidocProperty, Response } from '@src/types/global';
import { request } from '@/api/api';
import { apidocGenerateProperty } from '@/helper';
import mindHeaders from '../apidoc/params/headers/mind-headers';
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import SLoading from '@/components/common/loading/g-loading.vue'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';



type CommonHeaderResponse = {
  _id: string,
  commonHeaders: ApidocProperty[]
}

const headerData = ref<ApidocProperty[]>([]);
const projectId = router.currentRoute.value.query.id as string;
const apidocTabsStore = useApidocTas();
const apidocBaseInfoStore = useApidocBaseInfo();
const currentSelectTab = computed(() => { //当前选中的doc
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
})

//获取公共请求头信息
const loading = ref(false);
const getCommonHeaderInfo = () => {
  loading.value = true;
  if (currentSelectTab.value?._id === projectId) { //代表添加全局公共请求头
    const params = {
      projectId,
    }
    request.get<Response<ApidocProperty[]>, Response<ApidocProperty[]>>('/api/project/global_common_headers', { params }).then((res) => {
      headerData.value = res.data || [];
      if (!headerData.value.length) {
        headerData.value.push(apidocGenerateProperty())
      }
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      loading.value = false;
    });
  } else {
    const params = {
      projectId,
      id: currentSelectTab.value?._id
    }
    request.get<Response<CommonHeaderResponse>, Response<CommonHeaderResponse>>('/api/project/common_header_by_id', { params }).then((res) => {
      headerData.value = res.data.commonHeaders || [];
      if (!headerData.value.length) {
        headerData.value.push(apidocGenerateProperty())
      }
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      loading.value = false;
    });
  }
}
//修改公共请求头
const loading2 = ref(false);
const handleEditCommonHeader = () => {
  loading2.value = true;
  if (currentSelectTab.value?._id === projectId) { //代表添加全局公共请求头
    const params = {
      projectId,
      commonHeaders: headerData.value.map(v => ({
        _id: v._id,
        key: v.key,
        value: v.value,
        description: v.description,
        select: v.select,
      })),
    }
    request.put('/api/project/replace_global_common_headers', params).then(() => {
      ElMessage.success('修改成功');
      // apidocBaseInfoStore.getCommonHeaders();
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      loading2.value = false;
    });
  } else {
    const params = {
      projectId,
      id: currentSelectTab.value?._id,
      commonHeaders: headerData.value.map(v => ({
        _id: v._id,
        key: v.key,
        value: v.value,
        description: v.description,
        select: v.select,
      })),
    }
    request.put('/api/project/common_header', params).then(() => {
      ElMessage.success('修改成功');
      apidocBaseInfoStore.getCommonHeaders();
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      loading2.value = false;
    });
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

const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);
</script>

<style lang='scss' scoped>
.common-header {
  padding: size(20);
}
</style>
