<template>
  <SDialog :model-value="modelValue" top="10vh" width="50%" :title="t('生成链接')" @close="handleClose">
    <div class="link-wrap">
      <SConfig :label="t('链接名称')" :has-check="false" required>
        <el-input v-model="formInfo.shareName" :size="config.renderConfig.layout.size" :placeholder="t('请输入链接名称 eg:xxx团队')"
          class="w-100" maxlength="100" clearable>
        </el-input>
      </SConfig>
      <SConfig :label="t('密码设置')" :has-check="false" :description="t('密码可不填写')">
        <el-input v-model="formInfo.password" :size="config.renderConfig.layout.size" :placeholder="t('请输入密码')" class="w-100"
          maxlength="100" type="password" show-password clearable>
        </el-input>
      </SConfig>
      <SConfig :label="`${t('过期时间')}(${formatTooltip(formInfo.maxAge)})`" :has-check="false" :description="t('不填默认一个月后过期，最大日期为一年')">
        <el-radio-group v-model="formInfo.maxAge" :disabled="isCustomDate">
          <el-radio :value="86400000">{{ t('1天后') }}</el-radio>
          <el-radio :value="86400000 * 7">{{ t('1周后') }}</el-radio>
          <el-radio :value="86400000 * 30">{{ t('1个月后') }}</el-radio>
          <el-radio :value="86400000 * 90">{{ t('1个季度后') }}</el-radio>
          <el-radio :value="86400000 * 365 * 5">{{ t('不过期') }}</el-radio>
        </el-radio-group>
        <el-checkbox v-model="isCustomDate" class="ml-5" :value="true">{{ t('自定义') }}</el-checkbox>
        <div v-if="isCustomDate">
          <el-date-picker
            v-model="customExpireDate"
            type="datetime"
            :placeholder="t('请选择过期时间')"
            :size="config.renderConfig.layout.size"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            @change="handleCustomDateChange"
          />
        </div>
      </SConfig>
      <SConfig ref="configShare" :label="t('选择分享')" :description="t('开启后可以自由选择需要分享的文档')">
        <template #default="scope">
          <div v-if="scope.isEnabled" class="doc-nav">
            <div>
              <span>{{ t('总数') }}：</span>
              <span>{{ allCheckedNodes.length }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>{{ t('文件夹数量') }}：</span>
              <span>{{ allCheckedNodes.filter(node => node.isFolder).length }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>{{ t('文档数量') }}：</span>
              <span>{{ allCheckedNodes.filter(node => !node.isFolder).length }}</span>
            </div>
            <hr>
            <el-tree ref="docTree" :data="navTreeData" node-key="_id" show-checkbox :expand-on-click-node="true"
              @check-change="handleCheckChange">
              <template #default="prop">
                <div class="custom-tree-node" tabindex="0">
                  <!-- file渲染 -->
                  <template v-if="!prop.data.isFolder">
                    <template v-for="(req) in projectInfo.rules.requestMethods">
                      <span v-if="prop.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name"
                        class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
                    </template>
                    <div class="node-label-wrap">
                      <SEmphasize class="node-top" :title="prop.data.name" :value="prop.data.name"></SEmphasize>
                    </div>
                  </template>
                  <!-- 文件夹渲染 -->
                  <template v-if="prop.data.isFolder">
                    <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                    <div class="node-label-wrap">
                      <SEmphasize class="node-top" :title="prop.data.name" :value="prop.data.name"></SEmphasize>
                    </div>
                  </template>
                </div>
              </template>
            </el-tree>
          </div>
        </template>
      </SConfig>
      <div v-if="shareLink" class="d-flex">
        <pre class="link w-70 pre">{{ shareLink }}</pre>
        <el-button-group class="flex0 w-200px">
          <el-button v-copy="shareLink" :size="config.renderConfig.layout.size">{{ t('复制') }}</el-button>
        </el-button-group>
      </div>
    </div>
    <template #footer>
      <el-button :size="config.renderConfig.layout.size" :loading="loading" type="primary"
        @click="handleGenerateLink">{{ t('生成链接') }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t('取消') }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { ApidocBanner } from '@src/types/global';
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SEmphasize from '@/components/common/emphasize/g-emphasize.vue'
import SConfig from '@/components/common/config/g-config.vue'
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import { request } from '@/api/api'
import { config } from '@/../config/config'
import { router } from '@/router'
import { useApidocBanner } from '@/store/apidoc/banner';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { t } from 'i18next'
import dayjs from 'dayjs'

//=========================================================================//
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue', 'success'])
//=========================================================================//
const apidocBannerStore = useApidocBanner()
const apidocBaseInfoStore = useApidocBaseInfo()
//生成链接额外配置信息
const formInfo = ref({
  shareName: '', //链接名称
  password: '',
  maxAge: 86400000 * 30,
})
//自定义过期时间
const isCustomDate = ref(false);
//自定义过期日期
const customExpireDate = ref('');
//当前选中需要分享的节点信息
const allCheckedNodes: Ref<ApidocBanner[]> = ref([]);
//树形数据
const navTreeData = computed(() => apidocBannerStore.banner)

//=====================================生成链接====================================//
const projectInfo = computed(() => {
  return {
    _id: apidocBaseInfoStore._id,
    layout: apidocBaseInfoStore.layout,
    paramsTemplate: apidocBaseInfoStore.paramsTemplate,
    webProxy: apidocBaseInfoStore.webProxy,
    commonHeaders: apidocBaseInfoStore.commonHeaders,
    rules: apidocBaseInfoStore.rules,
    mindParams: apidocBaseInfoStore.mindParams,
    hosts: apidocBaseInfoStore.hosts,
    globalCookies: apidocBaseInfoStore.globalCookies,
  }
}); //项目基本信息
const configShare: Ref<{ isEnabled: boolean } | null> = ref(null); //配置组件实例
const projectId = router.currentRoute.value.query.id as string; //项目id
const loading = ref(false); //生成项目分享加载
const shareLink = ref(''); //项目分享地址
//关闭页面
const handleClose = () => {
  emits('update:modelValue', false);
}
//生成项目分享
const handleGenerateLink = () => {
  const enableCustomExport = configShare.value?.isEnabled;
  const customExportIsEmpty = allCheckedNodes.value.length === 0;
  const { maxAge, password, shareName } = formInfo.value; //默认一个月过期
  if (enableCustomExport && customExportIsEmpty) { //允许自定义分享并且数据为空
    ElMessage.warning(t('请至少选择一个文档分享'));
    return;
  }
  if (!shareName) { //必须填写分享备注
    ElMessage.warning(t('请输入链接名称'));
    return;
  }
  loading.value = true;
  const selectedIds = allCheckedNodes.value.map((val) => val._id);
  const params = {
    shareName,
    projectId,
    maxAge,
    password,
    selectedDocs: selectedIds,
  };
  request.post('/api/project/export/online', params).then(() => {
    handleClose();
    emits('success');
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}

//=====================================其他操作====================================//
const docTree: Ref<TreeNodeOptions['store'] | null> = ref(null);
//节点选中状态改变时候
const handleCheckChange = () => {
  const checkedNodes = docTree.value?.getCheckedNodes() || [];
  const halfCheckedNodes = docTree.value?.getHalfCheckedNodes() || [];
  allCheckedNodes.value = checkedNodes.concat(halfCheckedNodes) as ApidocBanner[];
}
//格式化展示
const formatTooltip = (val: number) => {
  const days = Math.max(0, Math.floor(val / 86400000));
  const hours = Math.max(0, Math.floor((val % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((val % 3600000) / 60000));
  
  return `${days}${t('天')}${hours}${t('小时')}${minutes}${t('分钟')}`;
}

//=====================================自定义日期相关方法====================================//
//禁用日期（不能选择过去的日期，但可以选择今天）
const disabledDate = (time: Date) => {
  const today = dayjs().startOf('day');
  const selectedDate = dayjs(time).startOf('day');
  // 如果选择的日期在今天之前，则禁用
  return selectedDate.isBefore(today);
}


//处理自定义日期变化
const handleCustomDateChange = (value: string) => {
  if (value) {
    const expireTime = new Date(value).getTime();
    const now = Date.now();
    formInfo.value.maxAge = expireTime - now;
  }
}
</script>

<style lang='scss' scoped>
.link-wrap {
  width: 100%;
  max-height: 65vh;
  overflow-y: auto;

  .link {
    height: 28px;
    white-space: nowrap;
    overflow-y: auto;
    user-select: auto;

    &::-webkit-scrollbar {
      height: 0px;
    }
  }

  .link-icon {
    width: 120px;
    height: 120px;
  }
}

.doc-nav {
  :deep(.el-tree-node__content) {
    height: 30px;
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    min-height: 30px;
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
      color: #ffc107;
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
        color: #adb5bd;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .rename-ipt {
      flex: 0 0 75%;
      height: 22px;
      border: 1px solid #409EFF;
      font-size: 1em;
      margin-left: -1px;
      &.error {
        border: 2px solid #f56c6c;
      }
    }
    .more {
      display: none;
      flex: 0 0 auto;
      margin-left: auto;
      padding: 5px 10px;
    }
    &.active-node {
      background-color: #a6d2ff;
    }
    &.select-node {
      background-color: #a6d2ff;
    }
    &.cut-node {
      color: #adb5bd;
      .file-icon {
        color: #adb5bd !important;
      }
      .folder-icon {
        color: #dee2e6 !important;
      }
    }
  }
}

</style>
