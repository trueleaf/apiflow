<template>
  <div class="clean-card">
    <div class="card-header">
      <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-body">
      <p class="card-content">
        这是一个简单的卡片组件示例。卡片组件通常用于展示相关信息的容器，
        具有清晰的边界和层次结构。可以包含标题、内容、图片、按钮等元素。
      </p>
      <div class="card-actions">
        <button class="card-btn primary">主要操作</button>
        <button class="card-btn secondary">次要操作</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的卡片组件，用于展示
</script>

<style lang="scss" scoped>
.clean-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-gray-300);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--color-card-shadow);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px var(--shadow-lg);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-gray-200);
    background: var(--bg-gray-50);

    .card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-gray-900);
    }
  }

  .card-body {
    padding: 20px;

    .card-content {
      margin: 0 0 16px 0;
      line-height: 1.6;
      color: var(--text-gray-600);
      font-size: 14px;
    }

    .card-actions {
      display: flex;
      gap: 8px;

      .card-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;

        &.primary {
          background: var(--blue-400);
          color: var(--text-white);

          &:hover {
            background: var(--blue-700);
          }
        }

        &.secondary {
          background: var(--bg-gray-200);
          color: var(--text-gray-600);
          border: 1px solid var(--border-gray-500);

          &:hover {
            background: var(--bg-gray-300);
            color: var(--text-gray-900);
          }
        }
      }
    }
  }
}
</style>