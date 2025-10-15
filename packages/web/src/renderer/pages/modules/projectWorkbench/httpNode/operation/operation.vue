<template>
  <div class="api-operation">
    <!-- 环境、host、接口前缀 -->
    <div v-if="showPrefixHelper && hostEnum.length < 5" class="d-flex a-center">
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
      <el-input 
        v-model="requestPath" 
        :placeholder="t('path参数') + ' eg: http://test.com/{id}'" 
        autocomplete="off" 
        autocorrect="off" 
        spellcheck="false"
        @input="handleChangeUrl" 
        @blur="handleFormatUrl"
        @keyup.enter.stop="handleFormatUrl"
      >
        <template #prepend>
          <div class="request-method">
            <el-select v-model="requestMethod" :size="config.renderConfig.layout.size" value-key="name">
              <el-option v-for="(item, index) in requestMethodEnum" :key="index" :value="item.value" :label="item.name"
                :title="disabledTip(item)" :disabled="!item.isEnabled">
              </el-option>
            </el-select>
          </div>
        </template>
      </el-input>
      <el-button 
        v-if="requestState === 'waiting' || requestState === 'finish'" 
        :disabled="!isElectron()"
        :title="isElectron() ? '' : `${t('由于浏览器限制，非electron环境无法模拟发送请求')}`" 
        type="success" 
        @click="handleSendRequest"
      >
        {{ t("发送请求") }}
      </el-button>
      <el-button v-if="requestState === 'sending' || requestState === 'response'" type="danger" @click="handleStopRequest">{{ t("取消请求") }}</el-button>
      <el-button :loading="loading2" type="primary" @click="handleSaveApidoc">{{ t("保存接口") }}</el-button>
      <el-button :loading="loading3" type="primary" :icon="Refresh" @click="handleFreshApidoc">{{ t("刷新") }}</el-button>
    </div>
    <pre class="pre-url-wrap">
      <span class="label">{{ t("请求地址") }}：</span>
      <span class="url">{{ apidocRequestStore.fullUrl }}</span>
      <el-icon v-if='apidocRequestStore.fullUrl' size="14" color="#f60" class="tip">
        <Warning />
      </el-icon>
    </pre>
  </div>
  <SSaveDocDialog v-if="saveDocDialogVisible" v-model="saveDocDialogVisible"></SSaveDocDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Refresh } from '@element-plus/icons-vue'
import { config } from '@src/config/config'
import { router } from '@/router/index'
import SSaveDocDialog from '@/pages/modules/projectWorkbench/dialog/save-doc/save-doc.vue'
import getHostPart from './composables/host'
import { handleFormatUrl, handleChangeUrl } from './composables/url'
import getMethodPart from './composables/method'
import getOperationPart from './composables/operation'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocResponse } from '@/store/apidoc/response'
import { isElectron } from '@/utils/utils'
import { Warning } from '@element-plus/icons-vue'
import { useApidocRequest } from '@/store/apidoc/request'

const apidocTabsStore = useApidocTas()
const apidocStore = useApidoc()
const apidocResponseStore = useApidocResponse()
const apidocRequestStore = useApidocRequest()
const projectId = router.currentRoute.value.query.id as string;
const { t } = useI18n()

const showPrefixHelper = ref(false)
/*
|--------------------------------------------------------------------------
| host相关
|--------------------------------------------------------------------------
*/
const hostPart = getHostPart();
const { hostDialogVisible, host, hostEnum, handleChangeHost } = hostPart;
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
const requestState = computed(() => apidocResponseStore.requestState)
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
// const fullUrl = ref('');
// const getFullUrl = debounce(async () => {
//   fullUrl.value = await getUrl(toRaw(apidocStore.$state.apidoc));
// }, 500, {
//   leading: true,
// });
// watch([() => {
//   return apidocStore.apidoc.item;
// }, () => {
//   return apidocVaribleStore.objectVariable;
// }], () => {
//   getFullUrl()
// }, {
//   deep: true,
//   immediate: true
// })

</script>

<style lang='scss' scoped>
.api-operation {
  position: sticky;
  top: 0;
  padding: 10px 20px;
  box-shadow: 0 3px 2px var(--gray-400);
  background: var(--white);
  z-index: var(--zIndex-request-info-wrap);
  height: var(--apiflow-apidoc-operation-height);

  &.prefix {
    height: 130px;
  }

  .proxy-wrap {
    margin-left: auto;
  }

  .el-checkbox {
    margin-right: 10px;
  }

  .op-wrap {
    display: flex;
    margin-top: 10px;

    :deep(.el-input__inner) {
      font-size: 13px;
    }

    .request-method {
      display: flex;
      align-items: center;

      :deep(.el-select) {
        width: 100px;
      }
    }

    .el-input__suffix {
      display: flex;
      align-items: center;
    }
  }

  .pre-url-wrap {
    height: 30px;
    width: 100%;
    white-space: nowrap;
    display: flex;
    margin: 0;
    align-items: center;
    overflow: hidden;
    padding: 0 10px;
    border: 1px solid #d1d5da;
    border-radius: 4px;
    background-color: #f0f0f0;
    white-space: pre-wrap;
    color: #212529;
    font-size: 12px;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono,Courier New, monospace;
    &::-webkit-scrollbar {
      height: 0px;
    }
    .label {
      font-family: var(--font-family);
      user-select: none;
      flex: 0 0 auto;
    }
    .url {
      display: flex;
      align-items: center;
      height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-x: auto;
      &::-webkit-scrollbar {
        height: 0px;
      }
    }
    .tip {
      flex: 0 0 30px;
      height: 30px;
      display: flex;
      align-items: center;
      margin-left: 5px;
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
