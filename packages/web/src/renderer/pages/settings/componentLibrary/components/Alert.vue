<template>
  <div class="component-demo">
    <h3 class="component-title">Alert 提示组件</h3>
    <div class="component-description">
      <p>循环展示内容的轮播组件</p>
    </div>
    <div class="component-showcase">
      <div class="alert success">
        <div class="alert-icon">✓</div>
        <div class="alert-content">
          <div class="alert-title">成功提示</div>
          <div class="alert-message">操作已成功完成</div>
        </div>
      </div>
      
      <div class="alert info">
        <div class="alert-icon">i</div>
        <div class="alert-content">
          <div class="alert-title">信息提示</div>
          <div class="alert-message">这是一条信息提示</div>
        </div>
      </div>
      
      <div class="alert warning">
        <div class="alert-icon">!</div>
        <div class="alert-content">
          <div class="alert-title">警告提示</div>
          <div class="alert-message">请注意此操作的风险</div>
        </div>
      </div>
      
      <div class="alert error">
        <div class="alert-icon">×</div>
        <div class="alert-content">
          <div class="alert-title">错误提示</div>
          <div class="alert-message">操作失败，请重试</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Alert 提示组件实现
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

    .alert {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-radius: 4px;

      .alert-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 10px;
        font-weight: bold;
      }

      .alert-content {
        flex: 1;

        .alert-title {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .alert-message {
          font-size: 13px;
          line-height: 1.5;
        }
      }

      &.success {
        background-color: var(--bg-success-light);
        border: 1px solid var(--bg-success-lighter);

        .alert-icon {
          color: var(--border-success);
          background-color: var(--bg-success-10);
        }

        .alert-title {
          color: var(--border-success);
        }

        .alert-message {
          color: var(--el-color-success-light-3);
        }
      }

      &.info {
        background-color: var(--bg-info-light);
        border: 1px solid var(--bg-info-lighter);

        .alert-icon {
          color: var(--border-info);
          background-color: var(--bg-info-10);
        }

        .alert-title {
          color: var(--border-info);
        }

        .alert-message {
          color: var(--el-color-info-light-3);
        }
      }

      &.warning {
        background-color: var(--bg-warning-light);
        border: 1px solid var(--bg-warning-lighter);

        .alert-icon {
          color: var(--border-warning);
          background-color: var(--bg-warning-10);
        }

        .alert-title {
          color: var(--border-warning);
        }

        .alert-message {
          color: var(--el-color-warning-light-3);
        }
      }

      &.error {
        background-color: var(--bg-danger-light);
        border: 1px solid var(--bg-danger-lighter);

        .alert-icon {
          color: var(--border-danger);
          background-color: var(--bg-danger-10);
        }

        .alert-title {
          color: var(--border-danger);
        }

        .alert-message {
          color: var(--el-color-danger-light-3);
        }
      }
    }
  }
}
</style>
