<template>
  <div class="doc-export">
    <SFieldset :title="t('导出类型')">
      <div class="download-wrap">
        <div class="item" :class="{active: selectedType === 'html'}" @click="selectedType = 'html'">
          <svg class="svg-icon" aria-hidden="true">
            <use xlink:href="#iconhtml"></use>
          </svg>
          <div class="mt-1">HTML</div>
        </div>
        <!-- <div class="item" :class="{active: selectedType === 'pdf'}" @click="selectedType = 'pdf'">
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#iconpdfwenjian"></use>
                    </svg>
                    <div class="mt-1">PDF</div>
                </div> -->
        <div class="item" :class="{active: selectedType === 'word'}" @click="selectedType = 'word'">
          <svg class="svg-icon" aria-hidden="true">
            <use xlink:href="#iconWORD"></use>
          </svg>
          <div class="mt-1">WORD</div>
        </div>
        <div class="item" :class="{active: selectedType === 'moyu'}" @click="selectedType = 'moyu'">
          <img src="@/assets/imgs/logo.png" alt="moyu" class="img">
          <div class="mt-1">{{ t('JSON文档') }}</div>
        </div>
        <div class="item" :class="{active: selectedType === 'otherProject'}" @click="selectedType = 'otherProject'">
          <svg class="svg-icon" aria-hidden="true">
            <use xlink:href="#icondaochu1"></use>
          </svg>
          <div class="mt-1">{{ t("导出到其他项目") }}</div>
        </div>
      </div>
    </SFieldset>
    <SFieldset v-if="selectedType !== 'otherProject'" :title="t('额外配置')">
      <SConfig ref="config" label="选择导出" :description="t('开启后可以自由选择需要导出的文档')" @change="handleConfigChange">
        <template #default="prop">
          <div v-if="prop.isEnabled" class="doc-nav">
            <div>
              <span>{{ t("总数") }}：</span>
              <span>{{ allCheckedNodes.length }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>{{ t("文件夹数量") }}：</span>
              <span>{{ allCheckedNodes.filter(node => node.isFolder).length }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>{{ t("文档数量") }}：</span>
              <span>{{ allCheckedNodes.filter(node => !node.isFolder).length }}</span>
            </div>
            <el-divider></el-divider>
            <el-tree
              ref="docTree"
              :data="bannerData"
              node-key="_id"
              show-checkbox
              :expand-on-click-node="true"
              @check-change="handleCheckChange"
            >
              <template #default="scope">
                <div
                  class="custom-tree-node"
                  tabindex="0"
                >
                  <!-- file渲染 -->
                  <template v-if="!scope.data.isFolder">
                    <template v-for="(req) in projectInfo.rules.requestMethods">
                      <span v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
                    </template>
                    <div class="node-label-wrap">
                      <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></SEmphasize>
                    </div>
                  </template>
                  <!-- 文件夹渲染 -->
                  <template v-if="scope.data.isFolder">
                    <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                    <div class="node-label-wrap">
                      <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></SEmphasize>
                    </div>
                  </template>
                </div>
              </template>
            </el-tree>
          </div>
        </template>
      </SConfig>
      <div class="d-flex j-center mt-2">
        <el-button :loading="loading" type="primary" @click="handleExport">{{ t("确定导出") }}</el-button>
      </div>
    </SFieldset>
    <!-- todo -->
    <SFork v-else></SFork>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css';
import { ref, Ref, computed } from 'vue'
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import { ApidocBanner } from '@src/types/global';
import { request } from '@/api/api'
import { t } from 'i18next'
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocBanner } from '@/store/apidoc/banner';
import { useVariable } from '@/store/apidoc/variables';
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import SConfig from '@/components/common/config/g-config.vue'
import SEmphasize from '@/components/common/emphasize/g-emphasize.vue'
import { useRoute } from 'vue-router';
import SFork from './fork/fork.vue'

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocBannerStore = useApidocBanner();
const variableStore = useVariable();
const route = useRoute()
//可导出数据类型
const selectedType: Ref<'html' | 'pdf' | 'word' | 'moyu' | 'otherProject'> = ref('html')
//项目基本信息
const projectInfo = computed(() => {
  return {
    _id: apidocBaseInfoStore._id,
    layout: apidocBaseInfoStore.layout,
    paramsTemplate: apidocBaseInfoStore.paramsTemplate,
    webProxy: apidocBaseInfoStore.webProxy,
    mode: apidocBaseInfoStore.mode,
    variables: variableStore.variables,
    tempVariables: [], // tempVariables 在当前实现中为空数组
    commonHeaders: apidocBaseInfoStore.commonHeaders,
    rules: apidocBaseInfoStore.rules,
    mindParams: apidocBaseInfoStore.mindParams,
    hosts: apidocBaseInfoStore.hosts,
    globalCookies: apidocBaseInfoStore.globalCookies,
  }
});
//菜单数据
const bannerData = computed(() => apidocBannerStore.banner)
//当前选中节点
const allCheckedNodes: Ref<ApidocBanner[]> = ref([]);
//节点选中
const docTree: Ref<TreeNodeOptions['store'] | null> = ref(null);
const handleCheckChange = () => {
  const checkedNodes = docTree.value?.getCheckedNodes() || [];
  const halfCheckedNodes = docTree.value?.getHalfCheckedNodes() || [];
  allCheckedNodes.value = checkedNodes.concat(halfCheckedNodes) as ApidocBanner[];
}

//=====================================导出操作====================================//
//数据加载状态
const loading = ref(false);
const config: Ref<{ isEnabled: boolean } | null> = ref(null)
//导出为html
const handleExportAsHTML = () => {
  const selectedIds = allCheckedNodes.value.map((val) => val._id);
  loading.value = true;
  const params = {
    projectId: route.query.id as string,
    selectedNodes: selectedIds,
  };
  request.request({
    method: 'post',
    url: '/api/project/export/html',
    responseType: 'blob',
    data: params,
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//导出为moyu文档
const handleExportAsMoyu = () => {
  const selectedIds = allCheckedNodes.value.map((val) => val._id);
  loading.value = true;
  const params = {
    projectId: route.query.id as string,
    selectedNodes: selectedIds,
  };
  request.request({
    method: 'post',
    url: '/api/project/export/moyu',
    responseType: 'blob',
    data: params,
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//导出为pdf文档
const handleExportAsPdf = () => {
  const selectedIds = allCheckedNodes.value.map((val) => val._id);
  loading.value = true;
  const params = {
    projectId: route.query.id as string,
    selectedNodes: selectedIds,
  };
  request.request({
    method: 'post',
    url: '/api/project/export/pdf',
    responseType: 'blob',
    data: params,
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//导出为word
const handleExportAsWord = () => {
  const selectedIds = allCheckedNodes.value.map((val) => val._id);
  loading.value = true;
  const params = {
    projectId: route.query.id as string,
    selectedNodes: selectedIds,
  };
  request.request({
    method: 'post',
    url: '/api/project/export/word',
    responseType: 'blob',
    data: params,
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
const handleExport = () => {
  const enableCustomExport = config.value?.isEnabled;
  const customExportIsEmpty = allCheckedNodes.value.length === 0;
  if (enableCustomExport && customExportIsEmpty) { //允许自定义导出并且数据为空
    ElMessage.warning(t('请至少选择一个文档导出'));
    return;
  }
  if (selectedType.value === 'html') {
    handleExportAsHTML();
  } else if (selectedType.value === 'moyu') {
    handleExportAsMoyu();
  } else if (selectedType.value === 'pdf') {
    handleExportAsPdf();
  } else if (selectedType.value === 'word') {
    handleExportAsWord();
  } else { //默认兜底导出html
    handleExportAsHTML();
  }
}
const handleConfigChange = (isEnabled: boolean) => {
  if (!isEnabled) {
    allCheckedNodes.value = [];
  }
}
</script>

<style lang='scss' scoped>
.doc-export {
    overflow-y: auto;
    height: calc(100vh - 100px);
    width: 70%;
    min-width: 768px;
    margin: 0 auto;
    .download-wrap {
        display: flex;
        .item {
            width: 130px;
            height: 100px;
            padding: 10px;
            margin-right: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border: 1px solid transparent;
            &.active {
                border: 1px solid var(--gray-400);
                box-shadow: var(--box-shadow-sm);
            }
            &:hover {
                border: 1px solid var(--gray-400);
            }
            .svg-icon {
                width: 70px;
                height: 70px;
            }
            .img {
                width: 60px;
                height: 60px;
            }
        }
    }
    .doc-nav {
        .custom-tree-node {
           display: flex;
            align-items: center;
            width: 100%;
            overflow: hidden;
            height: 30px;
            &:hover {
                .more {
                    display: block;
                }
            }
            .file-icon {
                font-size: 14px;
                margin-right: 5px;
            }
            .folder-icon {
                color: var(--yellow);
                flex: 0 0 auto;
                width: 16px;
                height: 16px;
                margin-right: 5px;
            }
            .node-label-wrap {
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow: hidden;
                .node-top {
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .node-bottom {
                    color: var(--gray-500);
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
        :deep(.el-tree-node__content) {
            height: 30px;
            display: flex;
            align-items: center;
        }
        :deep(.el-tree-node__content>.el-tree-node__expand-icon) {
            transition: none; //去除所有动画
            padding-top: 0;
            padding-bottom: 0;
            margin-top: -1px;
        }
    }
}
</style>
