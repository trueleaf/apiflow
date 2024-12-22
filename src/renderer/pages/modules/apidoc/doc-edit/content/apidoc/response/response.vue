<template>
  <SBaseInfo v-show="layout === 'horizontal'"></SBaseInfo>
  <SResInfo v-show="layout === 'horizontal'"></SResInfo>
  <SLoading :loading="!isResponse" :class="{ 'h-100': layout === 'vertical' }" class="w-100">
    <div v-show="remoteResponseType" class="remote-response-wrap px-3 w-100"
      :class="{ vertical: layout === 'vertical' }">
      <el-tabs v-model="activeName" class="h-100 w-100">
        <el-tab-pane :label="t('返回值')" name="SBody" class="w-100">
          <SBody class="h-100"></SBody>
        </el-tab-pane>
        <el-tab-pane :label="t('请求信息')" name="SRequest">
          <SRequest class="h-100"></SRequest>
        </el-tab-pane>
        <el-tab-pane name="Sheaders">
          <template #label>
            <span>{{ t("返回头") }}&nbsp;</span>
            <span v-if="headers.length > 0" class="orange">({{ headers.length }})</span>
          </template>
          <SHeaders></SHeaders>
        </el-tab-pane>
        <el-tab-pane name="SCookie">
          <template #label>
            <span>Cookie&nbsp;</span>
            <span v-if="cookies.length > 0" class="orange">({{ cookies.length }})</span>
          </template>
          <!-- fix: 文字隐藏组件获取dom宽度失败 -->
          <SCookie v-if="activeName === 'SCookie'"></SCookie>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-empty v-show="!remoteResponseType">
      <template #description>
        <div v-if="!loading">
          <div v-if="isElectron()">{{ t("点击发送按钮发送请求") }}</div>
          <div v-else>
            <div>
              <el-icon :size="18" class="orange mr-2">
                <Warning />
              </el-icon>
              <span>{{ t("因浏览器限制，完整HTTP功能请下载Electron") }}</span>
            </div>
            <div class="mb-2">{{ t("跨域、、请求头(user-agent,accept-encoding)等受限") }}</div>
            <div v-if="config.localization.download.enabled">
              <a :href="config.localization.download.url">{{ t("下载Electron") }}</a>
            </div>
          </div>
        </div>
        <div v-if="loading">
          <span>{{ t("总大小") }}：{{ formatBytes(process.total) }}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{ t("已传输") }}：{{ formatBytes(process.transferred) }}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{ t("进度") }}：{{ (process.percent * 100).toFixed(2) + "%" }}</span>
        </div>
      </template>
    </el-empty>
  </SLoading>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import { config } from '@/../config/config'
import { formatBytes } from '@/helper/index'
import SBaseInfo from './base-info/base-info.vue'
import SResInfo from './res-info/res-info.vue'
import SCookie from './cookie/cookie.vue'
import SHeaders from './headers/headers.vue'
import SBody from './body/body.vue'
import SRequest from './request/request.vue'
import { t } from 'i18next'
import { useApidocResponse } from '@/store/apidoc/response'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { isElectron } from '@/utils/utils'
import SLoading from '@/components/common/loading/g-loading.vue'


const activeName = ref('SBody');
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const cookies = computed(() => apidocResponseStore.cookies)
const headers = computed(() => {
  const result: { key: string, value: string }[] = [];
  Object.keys(apidocResponseStore.header).forEach(key => {
    result.push({
      key,
      value: apidocResponseStore.header[key] as string,
    });
  })
  return result
})
const layout = computed(() => apidocBaseInfoStore.layout)
const remoteResponseType = computed(() => apidocResponseStore.data.type)
const loading = computed(() => apidocResponseStore.loading) //数据是否完全返回
const isResponse = computed(() => apidocResponseStore.isResponse) //接口是否响应
const process = computed(() => apidocResponseStore.process)

</script>

<style  scoped>
.remote-response-wrap {
  height: calc(100vh - #{size(310)});

  .el-tabs__content {
    height: calc(100% - 55px);

    .el-tab-pane {
      height: 100%;
    }
  }

  &.vertical {
    height: 100%;
    margin-top: size(15);

    .el-tabs__content {
      height: calc(100% - 55px);
      overflow-y: auto;

      .el-tab-pane {
        height: 100%;
      }
    }
  }
}
</style>
