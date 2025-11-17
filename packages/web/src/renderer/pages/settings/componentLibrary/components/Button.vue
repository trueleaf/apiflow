<template>
  <div class="component-demo">
    <h3 class="component-title">按钮组件</h3>
    <div class="component-description">
      <p>提供多种样式、状态和尺寸的按钮组件</p>
    </div>
    <div class="component-showcase">
      <button class="demo-button primary">主要按钮</button>
      <button class="demo-button secondary">次要按钮</button>
      <button class="demo-button text">文本按钮</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 按钮组件实现
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
    gap: 10px;

    .demo-button {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;

      &.primary {
        background-color: var(--el-color-primary);
        color: var(--el-color-white);
        border: none;

        &:hover {
          background-color: var(--el-color-primary-dark-2);
        }
      }

      &.secondary {
        background-color: var(--el-bg-color);
        color: var(--el-text-color-regular);
        border: 1px solid var(--el-border-color);

        &:hover {
          border-color: var(--el-color-primary);
          color: var(--el-color-primary);
        }
      }

      &.text {
        background-color: transparent;
        color: var(--el-color-primary);
        border: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
