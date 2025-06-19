<template>
  <SDialog :model-value="modelValue" top="10vh" width="50%" title="生成链接" @close="handleClose">
    <div class="link-wrap">
      <SConfig label="链接名称" :has-check="false" required>
        <el-input v-model="formInfo.shareName" :size="config.renderConfig.layout.size" placeholder="请输入链接名称 eg:xxx团队"
          class="w-100" maxlength="100" clearable>
        </el-input>
      </SConfig>
      <SConfig label="密码设置" :has-check="false" description="密码可不填写">
        <el-input v-model="formInfo.password" :size="config.renderConfig.layout.size" placeholder="请输入密码" class="w-100"
          maxlength="100" type="password" show-password clearable>
        </el-input>
      </SConfig>
      <SConfig :label="`过期时间(${formatTooltip(formInfo.maxAge)})`" :has-check="false" description="不填默认一个月后过期，最大日期为一年">
        <el-radio-group v-model="formInfo.maxAge" :disabled="customMaxAge">
          <el-radio :value="86400000">1天后</el-radio>
          <el-radio :value="86400000 * 7">1周后</el-radio>
          <el-radio :value="86400000 * 30">1个月后</el-radio>
          <el-radio :value="86400000 * 90">1个季度后</el-radio>
          <el-radio :value="86400000 * 365 * 5">不过期</el-radio>
        </el-radio-group>
        <el-checkbox v-model="customMaxAge" class="ml-5" :value="true">自定义</el-checkbox>
        <el-slider v-if="customMaxAge" v-model="formInfo.maxAge" :min="86400000" :step="86400000"
          :max="86400000 * 365 * 5" :format-tooltip="formatTooltip"></el-slider>
      </SConfig>
      <SConfig ref="configShare" label="选择分享" description="开启后可以自由选择需要分享的文档">
        <template #default="scope">
          <div v-if="scope.isEnabled" class="doc-nav">
            <div>
              <span>总数：</span>
              <span>{{ allCheckedNodes.length }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>文件夹数量：</span>
              <span>{{ allCheckedNodes.filter(node => node.isFolder).length }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>文档数量：</span>
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
          <el-button v-copy="shareLink" :size="config.renderConfig.layout.size">复制</el-button>
        </el-button-group>
      </div>
    </div>
    <template #footer>
      <el-button :size="config.renderConfig.layout.size" :loading="loading" type="primary"
        @click="handleGenerateLink">生成链接</el-button>
      <el-button type="warning" @click="handleClose">取消</el-button>
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
const customMaxAge = ref(false);
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
    mode: apidocBaseInfoStore.mode,
    variables: apidocBaseInfoStore.variables,
    tempVariables: apidocBaseInfoStore.tempVariables,
    commonHeaders: apidocBaseInfoStore.commonHeaders,
    rules: apidocBaseInfoStore.rules,
    mindParams: apidocBaseInfoStore.mindParams,
    hosts: apidocBaseInfoStore.hosts,
    globalCookies: apidocBaseInfoStore.globalCookies,
  }
}); //项目基本信息
const configShare: Ref<{ isEnabled: boolean } | null> = ref(null); //配置组件实例
const projectId = router.currentRoute.value.query.id as string; //项目id
const loading = ref(false); //生成在线链接加载
const shareLink = ref(''); //在线链接地址
//关闭页面
const handleClose = () => {
  emits('update:modelValue', false);
}
//生成在线链接
const handleGenerateLink = () => {
  const enableCustomExport = configShare.value?.isEnabled;
  const customExportIsEmpty = allCheckedNodes.value.length === 0;
  const { maxAge, password, shareName } = formInfo.value; //默认一个月过期
  if (enableCustomExport && customExportIsEmpty) { //允许自定义分享并且数据为空
    ElMessage.warning('请至少选择一个文档分享');
    return;
  }
  if (!shareName) { //必须填写分享备注
    ElMessage.warning('请输入链接名称');
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
const formatTooltip = (val: number) => `${val / 86400000}天后`

</script>

<style lang='scss' scoped>
.link-wrap {
  width: 100%;
  max-height: 65vh;
  overflow-y: auto;

  .link {
    height: size(28);
    white-space: nowrap;
    overflow-y: auto;
    user-select: auto;

    &::-webkit-scrollbar {
      height: 0px;
    }
  }

  .link-icon {
    width: size(120);
    height: size(120);
  }
}

.doc-nav {
  .el-tree-node__content {
    height: size(30);
  }

  .custom-tree-node {
    @include custom-tree-node;
  }
}
</style>
