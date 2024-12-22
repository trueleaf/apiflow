/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：返回基本信息
    备注：
*/
<template>
  <div class="d-flex a-center px-3 text-ellipsis">
    <div class="flex0">
      <span>{{ t("状态码") }}：</span>
      <template v-if="remoteResponse.statusCode">
        <span v-show="remoteResponse.statusCode >= 100 && remoteResponse.statusCode < 300" class="green">{{ remoteResponse.statusCode }}</span>
        <span v-show="remoteResponse.statusCode >= 300 && remoteResponse.statusCode < 400" class="orange">{{ remoteResponse.statusCode }}</span>
        <span v-show="remoteResponse.statusCode >= 400" class="red">{{ remoteResponse.statusCode }}</span>
      </template>
      <el-icon v-else :title="t('未请求数据')" :size="16" class="gray-500">
        <question-filled />
      </el-icon>
    </div>
    <el-divider direction="vertical"></el-divider>
    <div class="flex0">
      <span>{{ t("时长") }}：</span>
      <template v-if="remoteResponse.rt">
        <span v-show="remoteResponse.rt >= 0 && remoteResponse.rt < 2000" class="green">{{ formatedMs }}</span>
        <span v-show="remoteResponse.rt >= 2000 && remoteResponse.rt < 5000" class="orange">{{ formatedMs }}</span>
        <span v-show="remoteResponse.rt >= 5000" class="red">{{ formatedMs }}</span>
      </template>
      <el-icon v-else :title="t('未请求数据')" :size="16" class="gray-500">
        <question-filled />
      </el-icon>
    </div>
    <el-divider direction="vertical"></el-divider>
    <div class="flex0">
      <span>{{ t("大小") }}：</span>
      <template v-if="remoteResponse.size">
        <span v-show="remoteResponse.size >= 0 && remoteResponse.size < 10000" class="green">{{ formatedBytes }}</span>
        <span v-show="remoteResponse.size >= 10000 && remoteResponse.size < 15000" class="orange">{{ formatedBytes }}</span>
        <span v-show="remoteResponse.size >= 15000" class="red">{{ formatedBytes }}</span>
      </template>
      <el-icon v-else :title="t('未请求数据')" :size="16" class="gray-500">
        <question-filled />
      </el-icon>
    </div>
    <el-divider direction="vertical"></el-divider>
    <div class="flex0 d-flex a-center j-center">
      <span>{{ t("格式") }}：</span>
      <s-ellipsis-content v-if="remoteResponse.data.type" :value="remoteResponse.data.type" max-width="200px" class="orange"></s-ellipsis-content>
      <el-icon v-else :title="t('未请求数据')" :size="16" class="gray-500">
        <question-filled />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { formatBytes, formatMs } from '@/helper/index'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'

//远端返回值
const remoteResponse = computed(() => store.state['apidoc/response']);
//格式化返回值大小
const formatedBytes = computed(() => formatBytes(remoteResponse.value.size))
//格式化返回时间
const formatedMs = computed(() => formatMs(remoteResponse.value.rt))
</script>

<style  scoped>

</style>
