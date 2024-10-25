<template>
  <div class="api-operation">
    <!-- 环境、host、接口前缀 -->
    <div v-if="showPrefixHelper && hostEnum.length < 5" class="d-flex a-center">
      <el-popover placement="top-start" :show-after="500" trigger="hover" width="auto" :content="mockServer"
        class="mr-2">
        <template #reference>
          <el-checkbox v-model="host" :label="mockServer" size="small" border :true-value="mockServer" false-label=""
            @change="handleChangeHost">{{ t("Mock服务器") }}</el-checkbox>
        </template>
      </el-popover>
      <el-popover v-for="(item, index) in hostEnum" :key="index" :show-after="500" placement="top-start" trigger="hover"
        width="auto" :content="item.url">
        <template #reference>
          <el-checkbox v-model="host" :true-value="item.url" false-label="" size="small" border
            @change="handleChangeHost">{{ item.name }}</el-checkbox>
        </template>
      </el-popover>
      <el-button type="primary" text @click="hostDialogVisible = true;">{{ t("接口前缀") }}</el-button>
    </div>
    <div v-else-if="showPrefixHelper" class="d-flex a-center">
      <el-select v-model="host" placeholder="环境切换" clearable filterable @change="handleChangeHost">
        <el-option :value="mockServer" label="Mock服务器">
          <div class="env-item">
            <div class="w-200">Mock服务器</div>
            <div class="gray-600">{{ mockServer }}</div>
          </div>
        </el-option>
        <el-option v-for="(item, index) in hostEnum" :key="index" :value="item.url" :label="item.name">
          <div class="env-item">
            <div class="w-200">{{ item.name }}</div>
            <div class="gray-600">{{ item.url }}</div>
          </div>
        </el-option>
      </el-select>
      <el-button type="primary" text @click="hostDialogVisible = true;">{{ t("接口前缀") }}</el-button>
    </div>
    <!-- 请求地址，发送请求 -->
    <div class="op-wrap">
      <el-input v-model="requestPath" :placeholder="t('输入请求url')" @input="handleChangeUrl" @blur="handleFormatUrl"
        @keyup.enter.stop="handleFormatUrl">
        <template #prepend>
          <div class="request-method">
            <el-select v-model="requestMethod" :size="config.renderConfig.layout.size" value-key="name">
              <el-option v-for="(item, index) in requestMethodEnum" :key="index" :value="item.value" :label="item.name"
                :title="disabledTip(item)" :disabled="!item.enabled">
              </el-option>
            </el-select>
          </div>
        </template>
      </el-input>
      <el-button v-if="!loading" :loading="loading" :disabled="!isElectron()"
        :title="isElectron() ? '' : `${t('由于浏览器限制，非electron环境无法模拟发送请求')}`" type="success"
        @click="handleSendRequest">
        {{ t("发送请求") }}
      </el-button>
      <el-button v-if="loading" type="danger" @click="handleStopRequest">{{ t("取消请求") }}</el-button>
      <el-button :loading="loading2" type="primary" @click="handleSaveApidoc">{{ t("保存接口") }}</el-button>
      <el-button :loading="loading3" type="primary" :icon="Refresh" @click="handleFreshApidoc">{{ t("刷新") }}</el-button>
    </div>
    <pre class="pre-url pre">
  <span class="label">{{ t("实际发送请求地址") }}：</span><span>{{ fullUrl.replace('localhost', '127.0.0.1') }}</span>
</pre>
  </div>
  <SCurdHostDialog v-if="hostDialogVisible" v-model="hostDialogVisible"></SCurdHostDialog>
  <SSaveDocDialog v-if="saveDocDialogVisible" v-model="saveDocDialogVisible"></SSaveDocDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { t } from 'i18next'
import { Refresh } from '@element-plus/icons-vue'
import { config } from '@/../config/config'
import { router } from '@/router/index'
import SSaveDocDialog from '@/pages/modules/apidoc/doc-edit/dialog/save-doc/save-doc.vue'
import SCurdHostDialog from '../dialog/curd-host/curd-host.vue'
import getHostPart from './composables/host'
import { handleFormatUrl, handleChangeUrl } from './composables/url'
import getMethodPart from './composables/method'
import getOperationPart from './composables/operation'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocResponse } from '@/store/apidoc/response'
import { isElectron } from '@src/utils/utils'

const apidocTabsStore = useApidocTas()
const apidocStore = useApidoc()
const apidocResponseStore = useApidocResponse()
const projectId = router.currentRoute.value.query.id as string;
const showPrefixHelper = ref(false)
/*
|--------------------------------------------------------------------------
| host相关
|--------------------------------------------------------------------------
*/
const hostPart = getHostPart();
const { mockServer, hostDialogVisible, host, hostEnum, handleChangeHost } = hostPart;
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
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  const currentTab = tabs?.find((tab) => tab.selected) || null;
  return currentTab;
});
const loading = computed(() => apidocResponseStore.loading)
const loading2 = computed(() => apidocStore.saveLoading)
const saveDocDialogVisible = computed({
  get() {
    return apidocStore.saveDocDialogVisible;
  },
  set(val) {
    apidocStore.changeSaveDocDialogVisible(val)
    apidocStore.changeSavedDocId(currentSelectTab.value?._id || '');
  }
});
const operationPart = getOperationPart();

const handleSaveApidoc = () => {
  if (currentSelectTab.value?._id.includes('local_')) {
    saveDocDialogVisible.value = true;
  } else {
    apidocStore.saveApidoc();
  }
}
const { loading3, handleSendRequest, handleStopRequest, handleFreshApidoc } = operationPart;
//请求url、完整url
const requestPath = computed<string>({
  get() {
    return apidocStore.apidoc.item.url.path;
  },
  set(path) {
    apidocStore.changeApidocUrl(path);
  },
});
const paths = computed(() => apidocStore.apidoc.item.paths)
const fullUrl = computed(() => {
  const { queryParams } = apidocStore.apidoc.item;
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
  const validPath = requestPath.value.replace(/\{([^\\}]+)\}/g, (_, $2) => pathMap[$2] || $2)
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
  height: size(100);
  &.prefix {
    height: size(130);
  }
  .proxy-wrap {
    margin-left: auto;
  }

  .el-checkbox {
    margin-right: size(10);
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

.env-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 500px;
}
</style>
