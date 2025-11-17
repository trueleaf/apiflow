<template>
  <div class="header-view" :class="{ vertical: layout === 'vertical' }">
    <div class='mb-2 d-flex a-center theme-color cursor-pointer' @click="dialogVisible = true">
      <el-icon>
        <FullScreen />
      </el-icon>
      <span class="ml-1">{{ t('展开显示返回头') }}</span>
    </div>
    <el-table :data="headers"  border>
      <el-table-column align="center" prop="key" :label="t('名称')"></el-table-column>
      <el-table-column align="center" prop="value" :label="t('值')">
        <template #default="scope">
          <div v-if="scope.row.key === 'set-cookie'">
            <div v-for="(cookie, idx) in scope.row.value.split('\n')" :key="idx" class="value-wrap">{{ cookie }}</div>
          </div>
          <div v-else>
            <div
              class="value-wrap token-value"
              :class="{ 'collapsed': isCollapsed(scope.row), 'expandable': isExpandable(scope.row) }"
              @click="handleToggleExpand(scope.row)"
              :style="isExpandable(scope.row) ? 'cursor:pointer;' : ''"
            >
              <template v-if="isExpandable(scope.row) && isCollapsed(scope.row)">
                {{ getCollapsedValue(scope.row.value) }}
                <span class="expand-tip">{{ t('点击展开') }}</span>
              </template>
              <template v-else>
                {{ scope.row.value }}
              </template>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="t('全部返回头信息')" width="80%" :close-on-click-modal="false">
      <el-table :data="headers"  border height="65vh" size="small">
        <el-table-column align="center" prop="key" :label="t('名称')" width="150px"></el-table-column>
        <el-table-column align="center" prop="value" :label="t('值')">
          <template #default="scope">
            <div v-if="scope.row.key === 'set-cookie'">
              <div v-for="(cookie, idx) in scope.row.value.split('\n')" :key="idx" class="value-wrap">{{ cookie }}</div>
            </div>
            <div v-else>
              <div
                class="value-wrap token-value"
                :class="{ 'collapsed': isCollapsed(scope.row), 'expandable': isExpandable(scope.row) }"
                @click="handleToggleExpand(scope.row)"
                :style="isExpandable(scope.row) ? 'cursor:pointer;' : ''"
              >
                <template v-if="isExpandable(scope.row) && isCollapsed(scope.row)">
                  {{ getCollapsedValue(scope.row.value) }}
                  <span class="expand-tip">{{ t('点击展开') }}</span>
                </template>
                <template v-else>
                  {{ scope.row.value }}
                </template>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore';
import { useApidocResponse } from '@/store/apidoc/responseStore';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import { FullScreen } from '@element-plus/icons-vue';
import { config } from '@src/config/config';

const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const headers = computed(() => {
  const result: { key: string, value: string }[] = [];
  Object.keys(apidocResponseStore.responseInfo.headers).forEach(key => {
    if (key === 'set-cookie') {
      apidocResponseStore.responseInfo.headers['set-cookie']?.forEach(item => {
        result.push({
          key,
          value: item,
        });
      });
    } else {
      result.push({
        key,
        value: apidocResponseStore.responseInfo.headers[key] as string,
      });
    }
  })
  return result
});
const layout = computed(() => apidocBaseInfoStore.layout);
const { t } = useI18n()

const dialogVisible = ref(false);
const expandedRows = ref<Record<string, boolean>>({});

function isExpandable(row: { key: string, value: string }) {
  return row.value.length > config.httpNodeConfig.maxHeaderValueDisplayLength;
}
function isCollapsed(row: { key: string, value: string }) {
  return isExpandable(row) && !expandedRows.value[row.key];
}
function handleToggleExpand(row: { key: string, value: string }) {
  if (isExpandable(row)) {
    expandedRows.value[row.key] = !expandedRows.value[row.key];
  }
}
function getCollapsedValue(val: string) {
  const lines = val.split('\n');
  if (lines.length > 5) {
    return lines.slice(0, 5).join('\n') + '...';
  }
  if (val.length > 300) {
    return val.slice(0, 300) + '...';
  }
  return val;
}
</script>

<style lang='scss' scoped>
.header-view {
  width: 100%;
  height: calc(100vh - 370px);
  overflow-y: auto;

  .value-wrap {
    max-height: 140px;
    overflow-y: auto;
  }

  &.vertical {
    height: 100%;
  }
}
.token-value.collapsed {
  max-height: 7em;
  overflow: hidden;
  white-space: pre-line;
  position: relative;
}
.token-value.expandable {
  transition: max-height 0.2s;
}
.expand-tip {
  color: var(--primary-color);
  font-size: 12px;
  margin-left: 8px;
}
</style>
