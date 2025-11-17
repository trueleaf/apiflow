<template>
  <div class="component-demo">
    <h3 class="component-title">对话框组件</h3>
    <div class="component-description">
      <p>模态对话框，用于确认操作或展示重要信息</p>
    </div>
    <div class="component-showcase">
      <button class="demo-button" @click="showDialog = true">打开对话框</button>
      
      <div v-if="showDialog" class="dialog-overlay">
        <div class="dialog">
          <div class="dialog-header">
            <h4>对话框标题</h4>
            <button class="close-button" @click="showDialog = false">×</button>
          </div>
          <div class="dialog-body">
            <p>这是一个模态对话框示例，用于展示重要信息或确认用户操作。</p>
          </div>
          <div class="dialog-footer">
            <button class="cancel-button" @click="showDialog = false">取消</button>
            <button class="confirm-button" @click="showDialog = false">确认</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDialog = ref(false)
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
    .demo-button {
      padding: 8px 16px;
      background-color: var(--el-color-primary);
      color: var(--el-color-white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background-color: var(--el-color-primary-dark-2);
      }
    }
  }

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-black-50);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .dialog {
      width: 400px;
      background-color: var(--el-bg-color);
      border-radius: 6px;
      box-shadow: var(--shadow-md);
      overflow: hidden;

      .dialog-header {
        padding: 15px 20px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--el-color-info);
          cursor: pointer;
          line-height: 1;

          &:hover {
            color: var(--el-text-color-primary);
          }
        }
      }

      .dialog-body {
        padding: 20px;

        p {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }
      }

      .dialog-footer {
        padding: 10px 20px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;

        button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }

        .cancel-button {
          background-color: var(--el-bg-color);
          border: 1px solid var(--el-border-color);
          color: var(--el-text-color-regular);

          &:hover {
            border-color: var(--el-border-color-hover);
            color: var(--el-text-color-primary);
          }
        }

        .confirm-button {
          background-color: var(--el-color-primary);
          color: var(--el-color-white);
          border: none;

          &:hover {
            background-color: var(--el-color-primary-dark-2);
          }
        }
      }
    }
  }
}
</style>
