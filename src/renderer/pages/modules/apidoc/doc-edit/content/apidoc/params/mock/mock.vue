<template>
  <div class="mock-wrap">
    <SFieldset :title="t('Mock服务器基本信息')" class="w-100">
      <!-- 状态 -->
      <SLabelValue :label="t('状态：')" label-width="50px" class="mb-1" one-line>
        <span v-if="mockServerInfo.serverState === 'closing'" class="f-sm">
          <span class="dot"></span>
          <span>{{ t('关闭中') }}</span>
        </span>
        <span v-if="mockServerInfo.serverState === 'connecting'" class="f-sm">
          <span class="dot bg-orange"></span>
          <span>{{ t('连接中') }}</span>
        </span>
        <span v-if="mockServerInfo.serverState === 'connection'" class="f-sm">
          <span class="dot bg-green"></span>
          <span>{{ t('已连接') }}</span>
        </span>
        <span v-if="mockServerInfo.serverState === 'disconnection'" class="f-sm">
          <span class="dot bg-gray-500"></span>
          <span>{{ t('断开连接') }}</span>
        </span>
        <span v-if="mockServerInfo.serverState === 'error'" class="f-sm">
          <span class="dot bg-red"></span>
          <span>{{ t('异常') }}</span>
        </span>
      </SLabelValue>
      <!-- mock地址 -->
      <SLabelValue :label="t('Mock地址：')" label-width="90px" class="mb-1" one-line>
        <span class="text">{{ mockServer }}</span>
        <input v-model="customPath" type="text" class="edit-ipt" @blur="handleCompleteMockPath">
        <span v-copy="fullMockUrl" class="cursor-pointer f-sm theme-color ml-1 mr-2">{{ t('复制') }}</span>
        <span v-if="customPath !== ''" class="theme-color cursor-pointer f-sm" @click="handleResetMockUrl">{{ t('还原')
          }}</span>
      </SLabelValue>
      <SLabelValue :label="t('远端Mock地址：')" label-width="120px" class="mb-1" one-line>
        <template v-if="currentSelectTab && !currentSelectTab._id.startsWith('local')">
          <span>{{ remoteMockUrl }}</span>
          <span v-copy="remoteMockUrl" class="cursor-pointer f-sm theme-color ml-1 mr-2">{{ t('复制') }}</span>
        </template>
        <template v-else>
          <span class="f-sm gray-500">{{ t('保存接口后更新') }}</span>
        </template>
      </SLabelValue>
      <!-- mock端口 -->
      <SLabelValue :label="t('Mock端口：')" label-width="90px" class="mb-1" one-line>
        <span v-if="!isEditingPort">{{ mockPort }}</span>
        <el-input-number v-if="isEditingPort" v-model="_mockPort" size="small" class="w-20" :step="1" :min="1"
          :max="65536"></el-input-number>
        <span v-if="!isEditingPort" class="cursor-pointer f-sm theme-color mx-2" @click="handleChangePortEditState">{{
          t('修改')
          }}</span>
        <span v-if="isEditingPort" class="cursor-pointer f-sm theme-color mx-2" @click="handleChangePort">{{ t('确定')
          }}</span>
        <span v-if="isEditingPort" class="cursor-pointer f-sm theme-color"
          @click="_mockPort = mockPort; isEditingPort = false">{{ t('取消') }}</span>
      </SLabelValue>
      <!-- http返回状态码 -->
      <SLabelValue :label="t('HTTP返回状态码：')" label-width="130px" class="mb-1" one-line>
        <span v-if="!isEditingHttpStatusCode">{{ httpStatusCode }}</span>
        <el-input-number v-if="isEditingHttpStatusCode" v-model="_httpStatusCode" size="small" class="w-20" :step="1"
          :min="1" :max="599"></el-input-number>
        <span v-if="!isEditingHttpStatusCode" class="cursor-pointer f-sm theme-color mx-2"
          @click="handleChangeHttpStatusCodeState">{{ t('修改') }}</span>
        <span v-if="isEditingHttpStatusCode" class="cursor-pointer f-sm theme-color mx-2"
          @click="handleChangeHttpStatusCode">{{ t('确定') }}</span>
        <span v-if="isEditingHttpStatusCode" class="cursor-pointer f-sm theme-color"
          @click="_httpStatusCode = httpStatusCode; isEditingHttpStatusCode = false">{{ t('取消') }}</span>
      </SLabelValue>
      <!-- 延迟返回(毫秒) -->
      <SLabelValue :label="t('延迟返回(毫秒)：')" label-width="120px" class="mb-1" one-line>
        <span v-if="!isEditingResponseDelay">{{ responseDelay }}</span>
        <el-input-number v-if="isEditingResponseDelay" v-model="_responseDelay" size="small" class="w-20" :step="500"
          :min="0" :max="60000"></el-input-number>
        <span v-if="!isEditingResponseDelay" class="cursor-pointer f-sm theme-color mx-2"
          @click="handleChangeResponseDelayState">{{ t('修改') }}</span>
        <span v-if="isEditingResponseDelay" class="cursor-pointer f-sm theme-color mx-2"
          @click="handleChangeResponseDelay">{{
            t('确定') }}</span>
        <span v-if="isEditingResponseDelay" class="cursor-pointer f-sm theme-color"
          @click="_responseDelay = responseDelay; isEditingResponseDelay = false">{{ t('取消') }}</span>
      </SLabelValue>
      <el-tabs v-model="activeName">
        <el-tab-pane :label="t('返回结果')" name="response">
          <template #label>
            <el-badge :is-dot="hasCustomResponse">{{ t('返回结果') }}</el-badge>
          </template>
          <mock-response></mock-response>
        </el-tab-pane>
        <el-tab-pane name="header">
          <template #label>
            <el-badge :is-dot="hasCustomHeaders">{{ t('自定义返回头') }}</el-badge>
          </template>
          <mock-headers></mock-headers>
        </el-tab-pane>
      </el-tabs>
    </SFieldset>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { event } from '@/helper/index'
import { router } from '@/router';
import SLabelValue from '@/components/common/label-value/g-label-value.vue'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import mockResponse from './components/mock-response/mock-response.vue'
import mockHeaders from './components/mock-headers/mock-headers.vue'
import { t } from 'i18next'
import { config } from '@src/config/config'
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocMock } from '@/store/apidoc/mock';


const apidocMockStroe = useApidocMock()
const apidocTabsStore = useApidocTas()
const apidocStore = useApidoc()
const mockServerInfo = computed(() => {
  return {
    ...apidocMockStroe
  }
});

/*
|--------------------------------------------------------------------------
| 请求url
|--------------------------------------------------------------------------
*/
const ipAddress = window.electronAPI?.ip ?? '127.0.0.1'
const mockServer = computed(() => `http://${ipAddress}:${apidocMockStroe.mockServerPort}`);
const currentSelectTab = computed(() => {
  const projectId = router.currentRoute.value.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
})
const remoteMockUrl = computed(() => {
  const remoteUrl = config.renderConfig.httpRequest.url
  return `${remoteUrl}/mock/remote/${currentSelectTab.value?._id}`
})
const customPath = computed({
  get() {
    return apidocStore.apidoc.mockInfo.path;
  },
  set(val) {
    apidocStore.changeMockPath(val)
  }
}); //自定义请求路径
const fullMockUrl = computed(() => `${mockServer.value}${customPath.value}`); //完整请求url
const apidocInfo = computed(() => apidocStore.apidoc); //当前api文档信息
const handleCompleteMockPath = () => {
  if (!customPath.value.startsWith('/')) {
    customPath.value = `/${customPath.value}`
  }
}
//重置mock地址
const handleResetMockUrl = () => {
  customPath.value = '/';
}
watch(customPath, (newVal) => {
  const matchedMockInfo = apidocMockStroe.urlMap.find(v => v.id === apidocInfo.value._id);
  apidocMockStroe.changeCustomMockUrlById({
    id: matchedMockInfo?.id || '',
    url: newVal,
  })
})
/*
|--------------------------------------------------------------------------
| 端口号
|--------------------------------------------------------------------------
*/
const mockPort = computed(() => mockServerInfo.value.mockServerPort)
const _mockPort = ref(mockPort.value);
const isEditingPort = ref(false);
//改变端口编辑状态
const handleChangePortEditState = () => {
  isEditingPort.value = true;
}
//改变端口
const handleChangePort = () => {
  apidocMockStroe.changeMockServerPort(_mockPort.value);
  if (mockServerInfo.value.serverState === 'connection') {
    event.emit('apidoc/mock/restartMockServer')
  }
  isEditingPort.value = false;
}
/*
|--------------------------------------------------------------------------
| HTTP状态码
|--------------------------------------------------------------------------
*/
const httpStatusCode = computed(() => apidocStore.apidoc.mockInfo.httpStatusCode);
const _httpStatusCode = ref(200);
const isEditingHttpStatusCode = ref(false);
//改变状态
const handleChangeHttpStatusCodeState = () => {
  _httpStatusCode.value = httpStatusCode.value
  isEditingHttpStatusCode.value = true
}
//改变http状态码
const handleChangeHttpStatusCode = () => {
  apidocStore.changeMockHttpStatusCode(_httpStatusCode.value)
  isEditingHttpStatusCode.value = false;
}
/*
|--------------------------------------------------------------------------
| 返回延迟
|--------------------------------------------------------------------------
*/
const responseDelay = computed(() => apidocStore.apidoc.mockInfo.responseDelay);
const _responseDelay = ref();
const isEditingResponseDelay = ref(false);
//改变状态
const handleChangeResponseDelayState = () => {
  _responseDelay.value = responseDelay.value
  isEditingResponseDelay.value = true
}
//改变返回时长
const handleChangeResponseDelay = () => {
  apidocStore.changeMockResponseDelay(_responseDelay.value)
  isEditingResponseDelay.value = false;
}
/*
|--------------------------------------------------------------------------
| 返回头和返回参数
|--------------------------------------------------------------------------
*/
const activeName = ref('response');
//是否存在返回参数
const hasCustomResponse = computed(() => {
  const { mockInfo } = apidocStore.apidoc;
  if (mockInfo.responseType === 'json' && mockInfo.json.trim() !== '') {
    return true;
  }
  if (mockInfo.responseType === 'text' && mockInfo.text.trim() !== '') {
    return true;
  }
  if (mockInfo.responseType === 'image') {
    return true;
  }
  if (mockInfo.responseType === 'file') {
    return true;
  }
  if (mockInfo.responseType === 'customJson' && mockInfo.customResponseScript.trim() !== '') {
    return true;
  }
  return false;
})
//是否存在headers
const hasCustomHeaders = computed(() => {
  const { responseHeaders } = apidocStore.apidoc.mockInfo;
  const hasHeaders = responseHeaders.filter(p => p.select).some((data) => data.key);
  return !!hasHeaders;
})

</script>

<style lang="scss" scoped>
.mock-wrap {
  font-size: fz(15);
  height: calc(100vh - #{size(310)});
  overflow-y: auto;
  margin-left: size(20);
  margin-right: size(20);

  .dot {
    display: inline-block;
    width: size(10);
    height: size(10);
    border-radius: 50%;
    margin-right: size(5);
  }

  .text {
    display: inline-block;
    height: size(30);
    line-height: size(30);
  }

  .edit-ipt {
    padding: 0 size(3);
    height: size(22);
    line-height: size(22);
    border: none;
    border-bottom: 1px solid $gray-500;
    font-size: fz(15);
    width: size(300);
  }

  .el-tabs {
    padding: 0;
  }
}
</style>
