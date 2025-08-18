<template>
  <SLoading :loading="loading" class="config">
    <el-form ref="form" v-flex1="20" :model="copyApiRules" class="api-rule" label-width="220px">
      <!-- 基础配置 -->
      <SFieldset title="基础配置">
        <SConfig label="单个目录最大允许文档数量" :has-check="false" description="限制单个目录下文档个数，提高可阅读性">
          <el-input-number v-model="copyApiRules.fileInFolderLimit" :controls="false" size="default" :step="1"
            class="w-60" :min="1" :max="255"></el-input-number>
        </SConfig>
      </SFieldset>
      <!-- 请求方式 -->
      <SFieldset title="请求方式配置">
        <SCollapseCard v-for="(item, index) in copyApiRules.requestMethods" :key="index" :fold="true" class="w-100">
          <template #head>
            <span :style="{ color: item.iconColor }" class="w-130px">
              <span class="mr-2">{{ item.name }}</span>
              <span v-if="item.isEnabled" class="ml-auto green">(已启用)</span>
              <span v-else class="ml-auto gray-500">(已禁用)</span>
            </span>
          </template>
          <template #operation>
            <div>
              <span class="gray-800">支持传参方式：</span>
              <span v-for="(ct, i) in item.enabledContenTypes" :key="ct" class="gray-600">
                <span>{{ ct }}</span>
                <el-divider v-if="i !== item.enabledContenTypes.length - 1" direction="vertical"></el-divider>
              </span>
            </div>
          </template>
          <SConfig :has-check="false" label="是否启用" :description="`禁用后则无法录入${item.name}请求`">
            <el-radio-group v-model="item.isEnabled">
              <el-radio :value="true">启用</el-radio>
              <el-radio :value="false">禁用</el-radio>
            </el-radio-group>
          </SConfig>
          <SConfig :has-check="false" label="允许传参方式" description="">
            <el-checkbox-group v-model="item.enabledContenTypes">
              <el-checkbox v-for="(ct) in paramTypes" :key="ct" :value="ct"
                :disabled="item.name.toLowerCase() === 'get'">{{ ct
                }}</el-checkbox>
            </el-checkbox-group>
          </SConfig>
          <SConfig :has-check="false" label="图标颜色" description="">
            <div class="d-flex a-center">
              <el-color-picker v-model="item.iconColor" :size="config.renderConfig.layout.size"></el-color-picker>
              <div class="tabs ml-2">
                <span :style="{ color: item.iconColor }">{{ item.name }}</span>
                <span class="item-text">示例{{ item.name }}接口</span>
              </div>
            </div>
          </SConfig>
        </SCollapseCard>
      </SFieldset>
      <div class="w-100 d-flex j-center mt-2">
        <el-button type="success" :loading="loading" @click="saveConfig">保存配置</el-button>
      </div>
    </el-form>
  </SLoading>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from 'vue'
import { ApidocRequestParamTypes } from '@src/types'
import { request } from '@/api/api'
import { router } from '@/router/index'
import { event, apidocGenerateRequestParamTypes } from '@/helper'
import { ApidocProjectBaseInfoState, ApidocProjectRules } from '@src/types/apidoc/base-info'
import SLoading from '@/components/common/loading/g-loading.vue'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import SConfig from '@/components/common/config/g-config.vue'
import SCollapseCard from '@/components/common/collapse-card/g-collapse-card.vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { config } from '@src/config/config'

const copyApiRules: Ref<ApidocProjectRules> = ref({
  fileInFolderLimit: 8,
  requestMethods: [],
});
const paramTypes: Ref<ApidocRequestParamTypes> = ref(apidocGenerateRequestParamTypes());
const loading = ref(false); //加载效果
const projectId = router.currentRoute.value.query.id; //项目id
const apidocBaseInfoStore = useApidocBaseInfo()

//保存配置信息
const saveConfig = () => {
  loading.value = true;
  const params = {
    projectId,
    ...copyApiRules.value,
  };
  request.put('/api/apidoc/project/project_rules', params).then(() => {
    apidocBaseInfoStore.changeProjectRules(JSON.parse(JSON.stringify(copyApiRules.value)))
  }).catch((err) => {
    console.error(err)
  }).finally(() => {
    loading.value = false;
  });
}

event.on('apidoc/getBaseInfo', (data) => {
  copyApiRules.value = (JSON.parse(JSON.stringify(data)) as ApidocProjectBaseInfoState).rules;
})
onMounted(() => { //当组件还未创建时候，通过mounted生命周期确保获取到数据
  copyApiRules.value = JSON.parse(JSON.stringify(apidocBaseInfoStore.rules));
})

</script>

<style lang='scss' scoped>
.config {
  width: 90%;
  min-width: 768px;
  margin: 0 auto;
  border-radius: var(--border-radius-sm);
  height: calc(100vh - 100px);
  padding: 10px 0 10px 20px;

  .api-rule {
    .tabs {
      height: 40px;
      display: flex;
      align-items: center;
      position: relative;
      font-size: 12px;
      flex: 0 0 auto;
      width: 200px;
      cursor: default;
      padding: 0 10px;
      .item-text {
        margin-left: 5px;
        display: inline-block;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      background: rgb(222, 225, 230);
      &:hover {
        background: #e2e2e2;
      }
      .iconfont {
        font-size: 16px;
        display: flex;
        align-items: center;
      }
      &.active {
        background: #f0f3fa;
      }
    }

    .el-form-item {
      margin-bottom: 0;
    }

    .request-config {
      .el-form-item {
        border-bottom: 1px solid var(--gray-200);
      }
    }
  }
}
</style>
