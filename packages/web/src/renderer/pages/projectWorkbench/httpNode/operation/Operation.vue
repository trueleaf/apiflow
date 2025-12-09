<template>
  <div class="api-operation">
    <!-- 请求地址，发送请求 -->
    <div class="op-wrap">
      <div class="request-method">
        <el-select v-model="requestMethod" :size="config.renderConfig.layout.size" value-key="name" data-testid="method-select">
          <el-option v-for="(item, index) in requestMethodEnum" :key="index" :value="item.value" :label="item.name">
          </el-option>
        </el-select>
      </div>
      <ClRichInput
        ref="urlRichInputRef"
        v-model="requestPath"
        class="url-rich-input"
        data-testid="url-input"
        :placeholder="t('path参数') + ' eg: http://test.com/{id}'"
        :trim-on-paste="true"
        :min-height="30"
        disable-history
        @update:modelValue="handleChangeUrl"
        @blur="handleFormatUrl"
      >
        <template #variable="{ label }">
          <div v-if="getVariableValue(label)" class="variable-popover">
            <div class="variable-name">{{ t('变量名称') }}：{{ label }}</div>
            <div class="variable-value">{{ t('变量值') }}：{{ getVariableValue(label) }}</div>
          </div>
          <div v-else class="variable-popover">
            <div class="variable-warning">{{ t('变量未定义', { name: label }) }}</div>
            <el-button size="small" type="primary" link @click="handleGoToVariableManage">
              {{ t('前往变量管理') }}
            </el-button>
          </div>
        </template>
      </ClRichInput>
      <el-button 
        v-if="requestState === 'waiting' || requestState === 'finish'" 
        type="success" 
        data-testid="operation-send-btn"
        @click="handleSendRequest"
      >
        {{ t("发送请求") }}
      </el-button>
      <el-button v-if="requestState === 'sending' || requestState === 'response'" type="danger" data-testid="operation-cancel-btn" @click="handleStopRequest">{{ t("取消请求") }}</el-button>
      <el-button :loading="loading2" type="primary" data-testid="operation-save-btn" @click="handleSaveHttpNode">{{ t("保存接口") }}</el-button>
      <el-button :loading="loading3" type="primary" :icon="Refresh" data-testid="operation-refresh-btn" @click="handleFreshApidoc">{{ t("刷新") }}</el-button>
    </div>
    <div class="pre-url-wrap">
      <span class="label">{{ t("请求地址") }}：</span>
      <span class="url">{{ encodedFullUrl }}</span>
      <el-tooltip :content="urlValidation.errorMessage" :show-after="500" :effect="Effect.LIGHT" placement="top">
        <el-icon v-show="!urlValidation.isValid && httpNodeRequestStore.fullUrl" size="14" color="var(--orange)" class="tip">>
          <Warning />
        </el-icon>
      </el-tooltip>
    </div>
  </div>
  <SSaveDocDialog v-if="saveDocDialogVisible" v-model="saveDocDialogVisible"></SSaveDocDialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Refresh, Warning } from '@element-plus/icons-vue'
import { Effect } from 'element-plus'
import { config } from '@src/config/config'
import { validateUrl, type UrlValidationResult } from '@/helper'
import { router } from '@/router/index'
import SSaveDocDialog from '@/pages/projectWorkbench/dialog/saveDoc/SaveDoc.vue'
import ClRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue'
import { handleFormatUrl, handleChangeUrl } from './composables/url'
import getMethodPart from './composables/method'
import getOperationPart from './composables/operation'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { useHttpNodeResponse } from '@/store/httpNode/httpNodeResponseStore'
import { useHttpNodeRequest } from '@/store/httpNode/httpNodeRequestStore'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'

const projectNavStore = useProjectNav()
const variableStore = useVariable()
const httpNodeStore = useHttpNode()
const httpNodeResponseStore = useHttpNodeResponse()
const httpNodeRequestStore = useHttpNodeRequest()
const httpRedoUndoStore = useHttpRedoUndo()
const projectId = router.currentRoute.value.query.id as string;
const { t } = useI18n()
const urlRichInputRef = ref<InstanceType<typeof ClRichInput> | null>(null)
const currentSelectNav = computed(() => {
  const navs = projectNavStore.navs[projectId];
  return navs?.find((nav) => nav.selected) || null;
})
/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const getVariableValue = (label: string) => {
  return variableStore.objectVariable[label]
}
const handleGoToVariableManage = () => {
  urlRichInputRef.value?.hideVariablePopover()
  projectNavStore.addNav({
    _id: 'variable',
    projectId,
    tabType: 'variable',
    label: t('变量'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  })
}
/*
|--------------------------------------------------------------------------
| URL校验
|--------------------------------------------------------------------------
*/
const urlValidation = reactive<UrlValidationResult>({
  isValid: true,
  errorMessage: '',
})
/*
|--------------------------------------------------------------------------
| host相关
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| 请求方法
|--------------------------------------------------------------------------
*/
const methodPart = getMethodPart();
const { requestMethod, requestMethodEnum } = methodPart;
/*
|--------------------------------------------------------------------------
| 发送请求、保存接口、刷新接口
|--------------------------------------------------------------------------
*/
const { requestState } = storeToRefs(httpNodeResponseStore)
const { saveHttpNodeLoading: loading2 } = storeToRefs(httpNodeStore)
const saveDocDialogVisible = computed({
  get() {
    return httpNodeStore.saveDocDialogVisible;
  },
  set(val) {
    httpNodeStore.changeSaveDocDialogVisible(val)
    httpNodeStore.changeSavedDocId(currentSelectNav.value?._id || '');
  }
});
const operationPart = getOperationPart();
const encodedFullUrl = computed(() => encodeURI(httpNodeRequestStore.fullUrl || ''));

const handleSaveHttpNode = () => {
  if (currentSelectNav.value?._id.includes('local_')) {
    saveDocDialogVisible.value = true;
  } else {
    httpNodeStore.saveHttpNode();
  }
}
const { loading3, handleSendRequest, handleStopRequest, handleFreshApidoc } = operationPart;
//请求url、完整url
const requestPath = computed<string>({
  get() {
    return httpNodeStore.httpNodeInfo.item.url.path;
  },
  set(path) {
    if (!currentSelectNav.value) return;
    const oldValue = httpNodeStore.httpNodeInfo.item.url.path;
    if (oldValue !== path) {
      // 记录URL路径变化操作
      httpRedoUndoStore.recordOperation({
        nodeId: currentSelectNav.value._id,
        type: "pathOperation",
        operationName: "修改URL路径",
        affectedModuleName: "path",
        oldValue,
        newValue: path,
        timestamp: Date.now()
      });
    }
    httpNodeStore.changeHttpNodeUrl(path);
  },
});
/*
|--------------------------------------------------------------------------
| 监听fullUrl变化并校验
|--------------------------------------------------------------------------
*/
watch(
  () => httpNodeRequestStore.fullUrl,
  (newUrl) => {
    const result = validateUrl(newUrl);
    urlValidation.isValid = result.isValid;
    urlValidation.errorMessage = result.errorMessage;
  },
  {
    immediate: true,
  }
);
</script>

<style lang='scss' scoped>
.api-operation {
  position: sticky;
  top: 0;
  padding: 0 20px;
  box-shadow: 0 3px 2px var(--gray-400);
  background: var(--white);
  z-index: var(--zIndex-request-info-wrap);
  height: var(--apiflow-apidoc-operation-height);
  display: flex;
  flex-direction: column;
  justify-content: center;
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
    width: 100%;
    .request-method {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-right: -1px;

      :deep(.el-select) {
        width: 100px;
      }

      :deep(.el-input__wrapper) {
        border-radius: 4px 0 0 4px;
      }
    }

    .url-rich-input {
      flex: 1;
      border: 1px solid var(--el-border-color);
      :deep(.cl-rich-input__editor) {
        // padding: 5px 0;
      }
      :deep(.cl-rich-input__editor .ProseMirror p) {
        font-size: 13px;
        height: 28px;
        line-height: 28px;
      }
      &:focus-within {
        border-color: var(--el-color-primary);
      }
    }

    .variable-token {
      color: var(--el-color-warning);
      cursor: pointer;
      &.undefined {
        color: var(--el-color-danger);
        text-decoration: underline dashed;
      }
    }
    .variable-popover {
      max-width: 400px;
      .variable-name {
        font-weight: 500;
        color: var(--gray-800);
        margin-bottom: 6px;
        word-break: break-all;
      }
      .variable-value {
        font-family: monospace;
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
        padding: 4px 8px;
        background: var(--gray-200);
        border-radius: 4px;
        color: var(--gray-800);
      }
      .variable-warning {
        color: var(--el-color-danger);
        margin-bottom: 8px;
      }
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
    border: 1px solid var(--code-preview-border);
    border-radius: 4px;
    background-color: var(--code-preview-bg);
    white-space: pre-wrap;
    color: var(--code-preview-text);
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
