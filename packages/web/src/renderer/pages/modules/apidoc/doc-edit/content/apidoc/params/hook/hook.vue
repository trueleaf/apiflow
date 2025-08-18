<template>
  <SLoading :loading="loading">
    <div class="hook-popover">
      <div class="header">
        <el-button link type="primary" text @click="handleJumpToHook">管理</el-button>
        <el-button link type="primary" text @click="emits('close')">关闭</el-button>
      </div>
      <div v-for="(item, index) in codeList" :key="index" class="item" @click="handleSelectCode(item)">
        <div>{{ item.codeName }}</div>
        <div>{{ item.creator }}</div>
      </div>
      <div v-if="codeList.length === 0" class="d-flex a-center j-center gray-400 mt-2">暂无数据</div>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import {
  apidocFormatUrl,
  apidocFormatQueryParams,
  apidocFormatPathParams,
  apidocFormatJsonBodyParams,
  apidocFormatFormdataParams,
  apidocFormatUrlencodedParams,
  apidocFormatHeaderParams,
  apidocFormatResponseParams,
  copy,
} from '@/helper';
import { request } from '@/api/api';
import { router } from '@/router';
import type { ApidocCodeInfo, Response } from '@src/types'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css';
import { useTranslation } from 'i18next-vue';
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocTas } from '@/store/apidoc/tabs';
import SLoading from '@/components/common/loading/g-loading.vue'


type CodeInfo = Omit<ApidocCodeInfo, 'updatedAt'>;
const emits = defineEmits(['close']);
const projectId = router.currentRoute.value.query.id as string; //项目id
const { t } = useTranslation()

const loading = ref(false); //加载效果
const codeList: Ref<CodeInfo[]> = ref([]); //代码列表
const worker = new Worker('/sandbox/hook/worker.js');
const apidocStore = useApidoc();
const apidocTabsStore = useApidocTas()

//选择代码模板
const handleSelectCode = (codeInfo: CodeInfo) => {
  const apidoc = JSON.parse(JSON.stringify(apidocStore.apidoc))
  worker.postMessage({
    type: 'init',
    value: {
      raw: apidoc,
      url: apidocFormatUrl(apidoc),
      queryParams: apidocFormatQueryParams(apidoc),
      pathParams: apidocFormatPathParams(apidoc),
      jsonParams: apidocFormatJsonBodyParams(apidoc),
      formdataParams: apidocFormatFormdataParams(apidoc),
      urlencodedParams: apidocFormatUrlencodedParams(apidoc),
      headers: apidocFormatHeaderParams(apidoc),
      method: apidoc.item.method,
      response: apidocFormatResponseParams(apidoc),
    },
  });
  worker.postMessage({
    type: 'generate-code',
    value: codeInfo.code
  });
  worker.addEventListener('message', (e) => {
    if (typeof e.data !== 'object') {
      return;
    }
    if (e.data.type === 'success') {
      console.log(e.data.value)
      copy(e.data.value);
      ElMessage.success('代码已复制到剪切板！');
    }
  })
  emits('close');
}
//跳转到代码管理界面
const handleJumpToHook = () => {
  apidocTabsStore.addTab({
    _id: 'hook',
    projectId,
    tabType: 'hook',
    label: t('生成代码'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  });
}
onMounted(() => {
  loading.value = true;
  const params = {
    projectId,
  };
  request.get<Response<CodeInfo[]>, Response<CodeInfo[]>>('/api/apidoc/project/code_enum', { params }).then((res) => {
    codeList.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
})

</script>

<style lang='scss' scoped>
.hook-popover {
  position: relative;

  .header {
    display: flex;
    justify-content: flex-end;
    border-bottom: 1px dashed var(--gray-400);
    margin-top: -10px;
  }

  .item {
    padding: 5px 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      color: var(--white);
      background-color: var(--theme-color);
    }
  }
}
</style>
