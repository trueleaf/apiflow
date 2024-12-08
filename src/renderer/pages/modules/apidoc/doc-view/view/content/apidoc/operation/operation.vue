/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:10
    模块名称：操作区域
    备注：
*/
<template>
  <div class="api-operation">
    <!-- 环境、host、接口前缀 -->
    <div class="d-flex a-center">
      <el-radio-group v-model="host" @change="handleChangeHost">
        <el-popover placement="top-start" :show-after="500" trigger="hover" width="auto" :content="mockServer" class="mr-2">
          <template #reference>
            <el-radio :value="mockServer" border>{{ t("Mock服务器") }}</el-radio>
          </template>
        </el-popover>
        <el-popover v-for="(item, index) in hostEnum" :key="index" :show-after="500" placement="top-start" trigger="hover" width="auto" :content="item.url">
          <template #reference>
            <el-radio :value="item.url" border>{{ item.name }}</el-radio>
          </template>
        </el-popover>
      </el-radio-group>
      <div v-if="!config.isElectron" class="proxy-wrap">
        <span>{{ t("代理") }}&nbsp;&nbsp;</span>
        <el-switch v-model="isProxy"></el-switch>
      </div>
    </div>
    <!-- 请求地址，发送请求 -->
    <div class="op-wrap">
      <el-input
        v-model="requestPath"
        :placeholder="t('输入请求url')"
        :size="config.renderConfig.layout.size"
        @input="handleChangeUrl"
        @blur="handleFormatUrl"
        @keyup.enter.stop="handleFormatUrl"
      >
        <template #prepend>
          <div class="request-method">
            <el-select v-model="requestMethod" value-key="name" :size="config.renderConfig.layout.size">
              <el-option
                v-for="(item, index) in requestMethodEnum"
                :key="index"
                :value="item.value"
                :label="item.name"
                :title="disabledTip(item)"
                :disabled="!item.enabled"
              >
              </el-option>
            </el-select>
          </div>
        </template>
      </el-input>
      <el-button
        v-if="!loading"
        :loading="loading"
        :title="config.isElectron ? '' : t('由于浏览器限制，非electron环境无法模拟发送请求')"
        type="success"
        @click="handleSendRequest"
      >
        {{ t("发送请求") }}
      </el-button>
      <el-button v-if="loading" type="danger" @click="handleStopRequest">{{ t("取消请求") }}</el-button>
      <el-button v-if="!isView" :loading="loading2" type="primary" @click="handleSaveApidoc">{{ t("保存接口") }}</el-button>
      <el-button :loading="loading3" type="primary" :icon="Refresh" @click="handleFreshApidoc">{{ t("刷新") }}</el-button>
    </div>
    <pre class="pre-url pre">
      <span class="label">{{ t("请求地址") }}：</span><span>{{ fullUrl }}</span>
    </pre>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import type { Config } from '@src/types/config'
import { config } from '@/../config/config'
import { useStore } from '@/pages/modules/apidoc/doc-view/store/index'
import { apidocCache } from '@/cache/apidoc'
import router from '@/pages/modules/apidoc/doc-view/router/index'
import getHostPart from './composables/host'
import { handleFormatUrl, handleChangeUrl } from './composables/url'
import getMethodPart from './composables/method'
import getOperationPart from './composables/operation'

const config: Ref<Config> = ref(globalConfig);
const store = useStore();
//当前工作区状态
const isView = computed(() => store.state['apidoc/baseInfo'].mode === 'view')
/*
|--------------------------------------------------------------------------
| web代理相关
|--------------------------------------------------------------------------
|
*/
const projectId = router.currentRoute.value.query.id as string;
onMounted(() => {
  const localProxyState = apidocCache.getApidocProxyState(projectId);
  if (localProxyState !== null) {
    store.commit('apidoc/baseInfo/changeWebProxy', localProxyState);
  }
})
const isProxy = computed({
  get() {
    // const localProxyState = apidocCache.getApidocProxyState(projectId);
    return store.state['apidoc/baseInfo'].webProxy;
  },
  set(v: boolean) {
    apidocCache.setApidocProxyState(v, projectId);
    store.commit('apidoc/baseInfo/changeWebProxy', v);
  },
});
/*
|--------------------------------------------------------------------------
| host相关
|--------------------------------------------------------------------------
*/
const hostPart = getHostPart();
const { mockServer, host, hostEnum, handleChangeHost } = hostPart;
/*
|--------------------------------------------------------------------------
| 请求方法
|--------------------------------------------------------------------------
*/
const methodPart = getMethodPart();
const { requestMethod, disabledTip, requestMethodEnum } = methodPart;
/*
|--------------------------------------------------------------------------
| 发送请求、保存接口、刷新接口
|--------------------------------------------------------------------------
*/
const loading = computed(() => store.state['apidoc/response'].loading)
const operationPart = getOperationPart();
const loading2 = computed(() => store.state['apidoc/apidoc'].saveLoading)
const handleSaveApidoc = () => {
  store.dispatch('apidoc/apidoc/saveApidoc');
}
const { loading3, handleSendRequest, handleStopRequest, handleFreshApidoc } = operationPart;
//请求url、完整url
const requestPath = computed<string>({
  get() {
    return store.state['apidoc/apidoc'].apidoc.item.url.path;
  },
  set(path) {
    store.commit('apidoc/apidoc/changeApidocUrl', path)
  },
});
const paths = computed(() => store.state['apidoc/apidoc'].apidoc.item.paths)
const fullUrl = computed(() => {
  const { queryParams } = store.state['apidoc/apidoc'].apidoc.item;
  let queryString = '';
  queryParams.forEach((v) => {
    if (v.key && v.select) {
      queryString += `${v.key}=${v.value}&`
    }
  })
  queryString = queryString.replace(/&$/, '');
  if (queryString) {
    queryString = `?${queryString}`;
  }
  const pathMap: Record<string, string> = {};
  paths.value.forEach((v) => {
    if (v.key) {
      pathMap[v.key] = v.value;
    }
  })
  const validPath = requestPath.value.replace(/\{([^\\}]+)\}/g, ($1, $2) => pathMap[$2] || $2)
  return host.value + validPath + queryString
})
</script>

<style lang="scss" scoped>
.api-operation {
    position: sticky;
    top: 0;
    padding: size(10) size(20);
    box-shadow: 0 3px 2px $gray-400;
    background: $white;
    z-index: $zIndex-request-info-wrap;
    height: size(130);
    .proxy-wrap {
        margin-left: auto;
    }
    .el-radio {
        margin-right: size(5);
    }
    .op-wrap {
        display: flex;
        margin-top: size(10);
        .el-input__inner {
            font-size: fz(13);
        }
        .request-method {
            display: flex;
            align-items: center;
            .el-select {
                width: 100px;
            }
        }
        .el-input__suffix {
            display: flex;
            align-items: center;
        }
    }
    .pre-url {
        height: size(30);
        width: 100%;
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        &::-webkit-scrollbar {
            height: 0px;
        }
        .label {
            user-select: none;
        }
    }
}
</style>
