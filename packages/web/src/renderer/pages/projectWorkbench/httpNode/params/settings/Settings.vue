<template>
  <div class="request-settings">
    <div class="settings-content">
      <div class="settings-section">
        <h3 class="section-title">{{ t('请求设置说明') }}</h3>
        <p class="section-description">
          {{ t('此页面展示当前请求的相关设置信息。具体配置项可在全局设置中进行修改。') }}
        </p>
      </div>
      <div class="settings-section">
        <h4 class="subsection-title">{{ t('超时设置') }}</h4>
        <p class="setting-description">
          {{ t('请求超时时间：30秒（可在全局设置中修改）') }}
        </p>
      </div>
      <div class="settings-section">
        <h4 class="subsection-title">{{ t('重定向策略') }}</h4>
        <p class="setting-description">
          {{ t('自动跟随重定向：已启用（可在全局设置中修改）') }}
        </p>
      </div>
      <div class="settings-section">
        <h4 class="subsection-title">{{ t('SSL证书验证') }}</h4>
        <p class="setting-description">
          {{ t('SSL证书验证：已启用（可在全局设置中修改）') }}
        </p>
      </div>
      <div class="settings-section">
        <h4 class="subsection-title">{{ t('代理设置') }}</h4>
        <p class="setting-description">
          {{ t('HTTP代理：未配置（可在全局设置中配置）') }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
<style lang="scss" scoped>
.request-settings {
  padding: 20px 0;
  .settings-content {
    max-width: 800px;
    .settings-section {
      margin-bottom: 24px;
      &:last-child {
        margin-bottom: 0;
      }
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--gray-200);
      }
      .section-description {
        font-size: 14px;
        color: var(--gray-700);
        line-height: 1.6;
        margin-bottom: 0;
      }
      .subsection-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 8px;
      }
      .setting-description {
        font-size: 13px;
        color: var(--gray-600);
        line-height: 1.6;
        margin-bottom: 0;
        padding-left: 12px;
        border-left: 3px solid var(--gray-300);
      }
    }
  }
}
</style>
