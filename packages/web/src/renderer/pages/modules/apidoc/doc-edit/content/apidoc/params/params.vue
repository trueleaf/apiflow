<template>
  <div class="api-params" :class="{ vertical: layout === 'vertical' }">
    <div class="view-type" :class="{ vertical: layout === 'vertical' }">
      <!-- <div class="cursor-pointer" :class="{ active: mode === 'edit' }" @click="toggleMode('edit')">{{ t("编辑") }}</div>
      <el-divider direction="vertical"></el-divider>
      <div class="cursor-pointer mr-5" :class="{ active: mode === 'view' }" @click="toggleMode('view')">{{ t("预览") }}
      </div> -->
      <el-dropdown trigger="click">
        <div class="gray-700 cursor-pointer mr-3 hover-theme-color">
          <span class="mr-1 f-sm iconfont iconbuju"></span>
          <span>{{ t("布局") }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleChangeLayout('horizontal')">
              <span :class="{ 'theme-color': layout === 'horizontal' }">{{ t("左右布局") }}</span>
            </el-dropdown-item>
            <el-dropdown-item @click="handleChangeLayout('vertical')">
              <span :class="{ 'theme-color': layout === 'vertical' }">{{ t("上下布局") }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="gray-700 cursor-pointer mr-3 hover-theme-color" @click="handleOpenVariable">
        <span class="mr-1 f-sm iconfont iconvariable"></span>
        <span>{{ t("变量") }}</span>
      </div>
      <!-- <div class="d-flex a-center gray-700 cursor-pointer mr-3 hover-theme-color">
        <el-popover :visible="generateCodeVisible" width="300px" placement="bottom">
          <template #reference>
            <span @click.stop="generateCodeVisible = true">
              <i class="iconfont iconshengchengdaima"></i>
              <span>生成代码</span>
            </span>
          </template>
          <SHook v-if="generateCodeVisible" @close="generateCodeVisible = false"></SHook>
        </el-popover>
      </div> -->
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane name="SParams">
        <template #label>
          <el-badge :is-dot="hasQueryOrPathsParams">Params</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SRequestBody">
        <template #label>
          <el-badge :is-dot="hasBodyParams">Body</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SRequestHeaders">
        <template #label>
          <el-badge :is-dot="hasHeaders">{{ t("请求头") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SResponseParams">
        <template #label>
          <el-badge :is-dot="!!responseNum">{{ t("返回参数") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SPreRequest">
        <template #label>
          <el-badge :is-dot="hasPreRequest">{{ t("前置脚本") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SAfterRequest">
        <template #label>
          <el-badge :is-dot="hasAfterRequest">{{ t("后置脚本") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane :label="t('备注信息')" name="SRemarks"></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <component :is="getComponent()" class="workbench" @changeCommonHeaderSendStatus="freshHasHeaders"></component>
    </keep-alive>
  </div>
</template>
<script lang="ts" setup>
import { DebouncedFunc } from 'lodash'
import type { HttpNode, ApidocProperty } from '@src/types'
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache.ts'
import { userState } from '@/cache/userState/userState.ts'
import { debounce, checkPropertyIsEqual } from '@/helper/index'
import { useI18n } from 'vue-i18n'
import SParams from './params/params.vue';
import SRequestBody from './body/body.vue';
import SRequestHeaders from './headers/headers.vue';
import SResponseParams from './response/response.vue';
import SPreRequestParams from './pre-request/pre-request.vue';
import SAfterRequestParams from './after-request/after-request.vue';
import SRemark from './remarks/remarks.vue';
// import SHook from './hook/hook.vue'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useRoute } from 'vue-router'
import { useApidocTas } from '@/store/apidoc/tabs'
type ActiceName = 'SParams' | 'SRequestBody' | 'SResponseParams' | 'SRequestHeaders' | 'SRemarks' | 'SPreRequest' | 'SAfterRequest'
const apidocBaseInfoStore = useApidocBaseInfo()
const apidocStore = useApidoc()
const apidocTabsStore = useApidocTas()
const activeName = ref<ActiceName>('SParams');
const { t } = useI18n()
const generateCodeVisible = ref(false);
import { router } from '@/router'
const debounceFn = ref(null as (null | DebouncedFunc<(apidoc: HttpNode) => void>))
const route = useRoute()
const projectId = router.currentRoute.value.query.id as string;
// const mode = computed(() => apidocBaseInfoStore.mode)
const hasQueryOrPathsParams = computed(() => {
  const { queryParams, paths } = apidocStore.apidoc.item;
  const hasQueryParams = queryParams.filter(p => p.select).some((data) => data.key);
  const hasPathsParams = paths.some((data) => data.key);
  return hasQueryParams || hasPathsParams;
})
const hasBodyParams = computed(() => {
  const { contentType } = apidocStore.apidoc.item;
  const isBinary = apidocStore.apidoc.item.requestBody.mode === 'binary';
  if (isBinary) {
    return true
  }
  return !!contentType;
})
const hasPreRequest = computed(() => {
  const preRequest = apidocStore.apidoc.preRequest?.raw;
  return !!preRequest;
})
const hasAfterRequest = computed(() => {
  const afterRequest = apidocStore.apidoc.afterRequest?.raw;
  return !!afterRequest;
})
const responseNum = computed(() => {
  const resParams = apidocStore.apidoc.item.responseParams;
  let resNum = 0;
  resParams.forEach(response => {
    const resValue = response.value;
    const { dataType } = resValue;
    if (dataType === 'application/json') {
      if (resValue.strJson.length > 0) {
        resNum += 1;
      }
    } else if (dataType === 'text/javascript' || dataType === 'text/plain' || dataType === 'text/html' || dataType === 'application/xml') {
      if (resValue.text.length > 0) {
        resNum += 1;
      }
    } else {
      console.warn(`${t('未实现的返回类型')}${dataType}`);
    }
  });
  return resNum;
})
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
})
const hasHeaders = ref(false);
const freshHasHeaders = () => {
  const { headers } = apidocStore.apidoc.item;
  const commonHeaders = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab.value?._id || "");
  const cpCommonHeaders = JSON.parse(JSON.stringify(commonHeaders)) as (typeof commonHeaders);
  cpCommonHeaders.forEach(header => {
    const ignoreHeaderIds = httpNodeCache.getWsIgnoredCommonHeaderByTabId(projectId, currentSelectTab.value?._id ?? "");
    const isSelect = ignoreHeaderIds?.find(headerId => headerId === header._id) ? false : true;
    header.select = isSelect;
  })
  const allHeaders = headers.concat(cpCommonHeaders.map(v => ({ ...v })) as ApidocProperty<'string'>[]);
  const hasHeader = allHeaders.filter(header => header.select).some((data) => data.key);
  // console.log('fresh', hasHeader, allHeaders, )
  hasHeaders.value = hasHeader;
}
watchEffect(freshHasHeaders, {
});
const layout = computed(() => apidocBaseInfoStore.layout)
const apidoc = computed(() => apidocStore.apidoc)
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const getComponent = () => {
  if (activeName.value === 'SParams') {
    return SParams;
  } else if (activeName.value === 'SAfterRequest') {
    return SAfterRequestParams;
  } else if (activeName.value === 'SPreRequest') {
    return SPreRequestParams
  } else if (activeName.value === 'SRemarks') {
    return SRemark
  } else if (activeName.value === 'SRequestBody') {
    return SRequestBody
  } else if (activeName.value === 'SRequestHeaders') {
    return SRequestHeaders
  } else if (activeName.value === 'SResponseParams') {
    return SResponseParams
  }
}
//初始化tab缓存
const initTabCache = () => {
  if (currentSelectTab) {
    const cachedTab = userState.getHttpNodeActiveParamsTab(currentSelectTab.value?._id || "");
    const allowedTabs: ActiceName[] = [
      'SParams',
      'SRequestBody',
      'SResponseParams',
      'SRequestHeaders',
      'SRemarks',
      'SPreRequest',
      'SAfterRequest'
    ];
    if (cachedTab && allowedTabs.includes(cachedTab as ActiceName)) {
      activeName.value = cachedTab as ActiceName;
    } else {
      activeName.value = 'SParams';
    }
  }
}
//切换布局
const handleChangeLayout = (layout: 'vertical' | 'horizontal') => {
  apidocBaseInfoStore.changeLayout(layout);
}
//=========================================================================//
//检查请求方法是否发生改变
const checkMethodIsEqual = (apidoc: HttpNode, originApidoc: HttpNode) => {
  return apidoc.item.method.toLowerCase() === originApidoc.item.method.toLowerCase();
}
//检查preRequest是否发送改变
const checkPreRequest = (apidoc: HttpNode, originApidoc: HttpNode) => {
  return apidoc.preRequest.raw === originApidoc.preRequest.raw;
}
//检查请求url是否发生改变
const checkUrlIsEqual = (apidoc: HttpNode, originApidoc: HttpNode) => {
  const apidocPath = apidoc.item.url.path;
  const originPath = originApidoc.item.url.path;
  return apidocPath === originPath;
}
//判断apidoc是否发生改变
const checkApidocIsEqual = (apidoc: HttpNode, originApidoc: HttpNode) => {
  const cpApidoc: HttpNode = JSON.parse(JSON.stringify(apidoc));
  const cpOriginApidoc: HttpNode = JSON.parse(JSON.stringify(originApidoc));
  const preRequestIsEqual = checkPreRequest(cpApidoc, cpOriginApidoc);
  const methodIsEqual = checkMethodIsEqual(cpApidoc, cpOriginApidoc);
  const urlIsEqual = checkUrlIsEqual(cpApidoc, cpOriginApidoc);
  const headerIsEqual = checkPropertyIsEqual(cpApidoc.item.headers, cpOriginApidoc.item.headers);
  const pathsIsEqual = checkPropertyIsEqual(cpApidoc.item.paths, cpOriginApidoc.item.paths);
  const queryParamsIsEqual = checkPropertyIsEqual(cpApidoc.item.queryParams, cpOriginApidoc.item.queryParams);
  const descriptionIsEqual = cpApidoc.info.description === cpOriginApidoc.info.description;
  //=====================================Request====================================//
  if (!methodIsEqual || !urlIsEqual || !headerIsEqual || !pathsIsEqual || !queryParamsIsEqual || !preRequestIsEqual || !descriptionIsEqual) {
    return false;
  }
  if (cpApidoc.item.requestBody.mode !== cpOriginApidoc.item.requestBody.mode) { //body模式不同
    return false;
  }
  if (cpApidoc.item.requestBody.mode === 'json') {
    const jsonBodyIsEqual = cpApidoc.item.requestBody.rawJson === cpOriginApidoc.item.requestBody.rawJson
    if (!jsonBodyIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'formdata') {
    const formDataIsEqual = checkPropertyIsEqual(cpApidoc.item.requestBody.formdata, cpOriginApidoc.item.requestBody.formdata);
    if (!formDataIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'urlencoded') {
    const urlencodedIsEqual = checkPropertyIsEqual(cpApidoc.item.requestBody.urlencoded, cpOriginApidoc.item.requestBody.urlencoded);
    if (!urlencodedIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'raw') {
    const rawDataIsEqual = cpApidoc.item.requestBody.raw.data === cpOriginApidoc.item.requestBody.raw.data
    const rawTypeIsEqual = cpApidoc.item.requestBody.raw.dataType === cpOriginApidoc.item.requestBody.raw.dataType
    if (!rawTypeIsEqual) {
      return false;
    }
    if (!rawDataIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'binary') {
    const binaryDataIsEqual = cpApidoc.item.requestBody.binary.mode === cpOriginApidoc.item.requestBody.binary.mode
    const binaryPathIsEqual = cpApidoc.item.requestBody.binary.binaryValue.path === cpOriginApidoc.item.requestBody.binary.binaryValue.path;
    const binaryVarIsEqual = cpApidoc.item.requestBody.binary.varValue === cpOriginApidoc.item.requestBody.binary.varValue;
    if (!binaryDataIsEqual) {
      return false;
    }
    if (!binaryPathIsEqual) {
      return false;
    }
    if (!binaryVarIsEqual) {
      return false;
    }
  }
  //=====================================Response====================================//
  if (cpApidoc.item.responseParams.length !== cpOriginApidoc.item.responseParams.length) { //返回参数长度不相等
    return false;
  }
  for (let i = 0; i < cpApidoc.item.responseParams.length; i += 1) {
    const item = cpApidoc.item.responseParams[i];
    const originItem = cpOriginApidoc.item.responseParams[i];
    if (item.value.strJson !== originItem.value.strJson) {
      return false;
    }
    if (item.statusCode !== originItem.statusCode) { //状态码不相同
      return false;
    }
    if (item.title !== originItem.title) { //描述不相同
      return false;
    }
    if (item.value.dataType !== originItem.value.dataType) { //数据类型不相同
      return false;
    }
    if (item.value.file.url !== originItem.value.file.url || item.value.file.raw !== originItem.value.file.raw) { //文件类型url不相同
      return false;
    }
    if (item.value.text !== originItem.value.text) { //文件类型url不相同
      return false;
    }
  }
  return true;
}
//=========================================================================//
// //切换工作模式
// const toggleMode = (mode: 'edit' | 'view') => {
//   apidocBaseInfoStore.changeMode(mode);
// }
//打开变量维护页面
const handleOpenVariable = () => {
  apidocTabsStore.addTab({
    _id: 'variable',
    projectId: route.query.id as string,
    tabType: 'variable',
    label: t('变量维护'),
    head: {
      icon: 'iconvariable',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  })
}
//打开联想参数
// const handleOpenMindParams = () => {
//   apidocTabsStore.addTab({
//     _id: 'mindParams',
//     projectId: route.query.id as string,
//     tabType: 'mindParams',
//     label: t('联想参数'),
//     head: {
//       icon: 'iconmindParams',
//       color: ''
//     },
//     saved: true,
//     fixed: true,
//     selected: true,
//   })
// }
//关闭生成代码popover
const handleCloseHook = () => {
  generateCodeVisible.value = false;
}
/*
|--------------------------------------------------------------------------
| 监听定义
|--------------------------------------------------------------------------
*/
watch(() => activeName.value, (val: string) => {
  if (currentSelectTab.value) {
    userState.setHttpNodeActiveParamsTab(currentSelectTab.value._id, val);
  }
})
watch(() => currentSelectTab.value, () => {
  initTabCache();
})
watch(() => apidoc.value, (apidoc: HttpNode) => {
  if (debounceFn) {
    debounceFn.value?.(apidoc);
  }
}, {
  deep: true,
})
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  debounceFn.value = debounce((apidoc: HttpNode) => {
    const isEqual = checkApidocIsEqual(apidoc, apidocStore.originApidoc);
    if (!isEqual) {
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'saved',
        value: false,
      })
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'fixed',
        value: true,
      })
    } else {
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'saved',
        value: true,
      })
    }
    //缓存接口信息
    httpNodeCache.setApidoc(apidoc);
  }, 200, {
    leading: true
  });
  initTabCache();
  document.documentElement.addEventListener('click', handleCloseHook)
})
onUnmounted(() => {
  document.documentElement.removeEventListener('click', handleCloseHook)
})
</script>
<style lang='scss' scoped>
.api-params {
  padding: 0 0 10px;
  height: calc(100vh - var(--apiflow-apidoc-operation-height) - var(--apiflow-doc-nav-height));
  overflow-y: auto;
  position: relative;
  &.vertical {
    height: auto;
  }
  .el-tabs,
  .workbench {
    padding-right: 20px;
    padding-left: 20px;
  }
  .el-tabs__item {
    user-select: none;
  }
  .el-badge__content {
    transition: none;
    top: 10px;
    &.is-fixed.is-dot {
      top: 10px;
      right: 3px;
    }
  }
  .view-type {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: sticky;
    top: 3px;
    color: var(--gray-500);
    padding: 0 20px;
    height: 30px;
    display: flex;
    align-items: center;
    background: var(--white);
    z-index: var(--zIndex-request-info-wrap);
    &.vertical {
      z-index: 1;
    }
    .active {
      color: var(--theme-color);
    }
  }
  .el-tabs__item {
    height: 30px;
    line-height: 30px;
  }
  .el-dropdown {
    line-height: initial;
  }
}
</style>




