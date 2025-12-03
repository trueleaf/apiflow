<template>
  <div class="cookie-view" :class="{ vertical: layout === 'vertical' }">
    <div class="cookie-actions mb-2">
      <div v-if="cookies.length > 0 && layout === 'horizontal'" class="action-btn" @click="dialogVisible = true" :title="t('查看本次接口返回的Cookie详情')">
        <Cookie :size="16" />
        <span>{{ t('响应Cookie') }}</span>
      </div>
      <div class="action-btn" @click="handleJumpToCookies" :title="t('打开全局Cookie管理页面')">
        <Settings :size="16" />
        <span>{{ t('Cookie管理') }}</span>
      </div>
    </div>
    <el-table 
      :data="cookies" 
      border 
      size="small"
    >
      <template v-if="layout === 'vertical'">
        <el-table-column align="center" prop="name" label="Name"></el-table-column>
        <el-table-column align="center" prop="value" width="500" label="Value">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="domain" label="Domain">
          <template #default="scope">
            <span v-if="!scope.row.domain || scope.row.domain === responseInfo.requestData.host">
              {{ !scope.row.domain ? responseInfo.requestData.host : '' }}
            </span>
            <div v-else class="orange">
              <div>{{ scope.row.domain }}</div>
              <div>{{ t('已忽略，非本域名') }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="path" label="Path">
          <template #default="scope">
            <span v-if="scope.row.path">{{ scope.row.path }}</span>
            <span v-else>/</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="expires" label="Expires">
          <template #default="scope">
            <span v-if="scope.row.expires">{{ scope.row.expires }}</span>
            <span v-else>Session</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="httpOnly" label="HttpOnly">
          <template #default="scope">
            <span v-if="scope.row.httpOnly === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="secure" label="Secure">
          <template #default="scope">
            <span v-if="scope.row.secure === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sameSite" label="SameSite">
          <template #default="scope">
            <span v-if="scope.row.sameSite">{{ scope.row.sameSite }}</span>
            <span v-else>Lax</span>
          </template>
        </el-table-column>
      </template>
      <template v-else>
        <el-table-column align="center" prop="name" label="Name"></el-table-column>
        <el-table-column align="center" prop="value" label="Value">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="`【${currentSelectNav?.label}】节点的 ${$t('cookie值')}`" width="80%"
      :close-on-click-modal="false">
      <el-table :data="cookies"  border height="65vh" size="small">
        <el-table-column align="center" prop="name" label="Name"></el-table-column>
        <el-table-column align="center" prop="value" width='500' label="Value">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="domain" label="Domain">
          <template #default="scope">
            <span v-if="!scope.row.domain || scope.row.domain === responseInfo.requestData.host">
              {{ !scope.row.domain ? responseInfo.requestData.host : '' }}
            </span>
            <div v-else class="orange">
              <div>{{ scope.row.domain }}</div>
              <div>{{ $t('已忽略，非本域名') }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="path" label="Path">
          <template #default="scope">
            <span v-if="scope.row.path">{{ scope.row.path }}</span>
            <span v-else>/</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="expires" label="Expires">
          <template #default="scope">
            <span v-if="scope.row.expires">{{ scope.row.expires }}</span>
            <span v-else>Session</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="httpOnly" label="HttpOnly">
          <template #default="scope">
            <span v-if="scope.row.httpOnly === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="secure" label="Secure">
          <template #default="scope">
            <span v-if="scope.row.secure === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sameSite" label="SameSite">
          <template #default="scope">
            <span v-if="scope.row.sameSite">{{ scope.row.sameSite }}</span>
            <span v-else>Lax</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore';
import { useApidocResponse } from '@/store/httpNode/responseStore';
import { computed, ref, } from 'vue';
import { Cookie, Settings } from 'lucide-vue-next';
import { parse } from 'set-cookie-parser';
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router'

const route = useRoute()
const apidocResponseStore = useApidocResponse();
const projectWorkbenchStore = useProjectWorkbench();
const { responseInfo } = useApidocResponse();
const cookies = computed(() => parse(apidocResponseStore.responseInfo.headers['set-cookie'] || []));
const projectNavStore = useProjectNav();
const currentSelectNav = computed(() => {
  const projectId = route.query.id as string;
  const navs = projectNavStore.navs[projectId];
  const currentSelectNav = navs?.find((nav) => nav.selected) || null;
  return currentSelectNav;
});
const layout = computed(() => projectWorkbenchStore.layout);
const { t } = useI18n()

const dialogVisible = ref(false);
const handleJumpToCookies = () => {
  projectNavStore.addNav({
    _id: 'cookies',
    projectId: projectWorkbenchStore.projectId,
    tabType: 'cookies',
    label: t('Cookies'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  })
}
</script>

<style lang='scss' scoped>
.cookie-view {
  width: 100%;
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-response-tabs-header-height) - var(--apiflow-response-summary-height) - var(--apiflow-doc-nav-height) - 10px);
  overflow-y: auto;
  .value-wrap {
    max-height: 140px;
    overflow-y: auto;
  }

  &.vertical {
    height: calc(var(--apiflow-response-height) - var(--apiflow-response-tabs-header-height) - 10px);
  }
}
.cookie-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--el-color-primary);
  font-size: 14px;
  user-select: none;
}
</style>
