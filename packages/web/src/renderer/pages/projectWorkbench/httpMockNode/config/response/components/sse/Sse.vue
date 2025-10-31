<template>
  <div class="sse-config-wrapper">
    <!-- 发送节奏配置 -->
    <div class="form-row">
      <div class="form-item flex-item">
        <label class="form-label">{{ t('发送间隔') }}({{ t('单位：毫秒') }})</label>
        <el-input-number
          v-model="response.sseConfig.interval"
          :min="100"
          :step="100"
          size="small"
          controls-position="right"
        />
      </div>
      <div class="form-item flex-item">
        <label class="form-label">{{ t('最大事件数量') }}({{ t('达到数量后结束推送') }})</label>
        <el-input-number
          v-model="response.sseConfig.maxNum"
          :min="1"
          :step="1"
          size="small"
          controls-position="right"
        />
      </div>
    </div>

    <!-- 事件数据、事件ID、事件名称、重试间隔 -->
    <div class="form-row">
      <!-- 事件数据 -->
      <div class="form-item flex-item">
        <div class="label-with-switch">
          <label class="form-label">{{ t('事件数据') }}</label>
        </div>
        <div class="form-control-wrapper">
          <el-radio-group v-model="response.sseConfig.event.data.mode" size="small">
            <el-radio-button label="json">JSON</el-radio-button>
            <el-radio-button label="string">Text</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 事件ID -->
      <div class="form-item flex-item">
        <div class="label-with-switch">
          <label class="form-label">{{ t('事件ID') }}</label>
          <el-switch v-model="response.sseConfig.event.id.enable" size="small" />
        </div>
        <div class="form-control-wrapper" v-if="response.sseConfig.event.id.enable">
          <el-radio-group v-model="response.sseConfig.event.id.valueMode" size="small">
            <el-radio-button label="increment">{{ t('自增') }}</el-radio-button>
            <el-radio-button label="timestamp">{{ t('时间戳') }}</el-radio-button>
            <el-radio-button label="random">{{ t('随机') }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 事件名称 -->
      <div class="form-item flex-item">
        <div class="label-with-switch">
          <label class="form-label">{{ t('事件名称') }}</label>
          <el-switch v-model="response.sseConfig.event.event.enable" size="small" />
        </div>
        <div class="form-control-wrapper" v-if="response.sseConfig.event.event.enable">
          <el-input
            v-model="response.sseConfig.event.event.value"
            size="small"
            :placeholder="t('例如：message')"
            style="width: 220px;"
          />
        </div>
      </div>

      <!-- 重试间隔（retry） -->
      <div class="form-item flex-item">
        <div class="label-with-switch">
          <label class="form-label">{{ t('重试间隔') }}({{ t('单位：毫秒') }})</label>
          <el-switch v-model="response.sseConfig.event.retry.enable" size="small" />
        </div>
        <div class="form-control-wrapper" v-if="response.sseConfig.event.retry.enable">
          <el-input-number
            v-model="response.sseConfig.event.retry.value"
            :min="0"
            :step="100"
            size="small"
            controls-position="right"
          />
        </div>
      </div>
    </div>

    <!-- 事件数据编辑器 -->
    <div class="sse-editor-wrapper">
      <SJsonEditor
        v-model="response.sseConfig.event.data.value"
        :config="{ fontSize: 13, language: response.sseConfig.event.data.mode === 'json' ? 'json' : 'plaintext' }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SJsonEditor from '@/components/common/jsonEditor/GJsonEditor.vue'
import type { MockHttpNode } from '@src/types'

type ResponseItem = MockHttpNode['response'][0]

type Props = {
  response: ResponseItem
}

defineProps<Props>()
const { t } = useI18n()
</script>

<style scoped>
.sse-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

/* 表单行 */
.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-shrink: 0;
}

/* 表单项 */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-item {
  flex: 0 0 auto;
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.form-label ~ * {
  margin-left: 12px;
}

.label-with-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  min-height: 32px;
}

.form-control-wrapper {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.sse-editor-wrapper {
  height: 200px;
  min-height: 100px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}
</style>
