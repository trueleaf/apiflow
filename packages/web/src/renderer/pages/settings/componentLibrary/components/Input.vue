<template>
  <div class="component-demo">
    <h3 class="component-title">{{ t('输入框组件') }}</h3>
    <div class="component-description">
      <p>{{ t('用于创建交互式表单的组件集合') }}</p>
    </div>
    <div class="component-showcase">
      <div class="input-group">
        <label for="demo-input">{{ t('标准输入框') }}</label>
        <input id="demo-input" type="text" :placeholder="t('请输入内容')">
      </div>
      <div class="input-group">
        <label for="demo-textarea">{{ t('文本域') }}</label>
        <textarea id="demo-textarea" :placeholder="t('请输入多行内容')"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.component-demo {
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background-color: var(--el-bg-color);

  .component-title {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .component-description {
    margin-bottom: 20px;

    p {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.5;
    }
  }

  .component-showcase {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }

      input, textarea {
        padding: 8px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.3s;

        &:focus {
          border-color: var(--el-color-primary);
        }
      }

      textarea {
        min-height: 80px;
        resize: vertical;
      }
    }
  }
}
</style>
