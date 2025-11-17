<template>
  <div class="component-demo">
    <h3 class="component-title">Dropdown 组件</h3>
    <div class="component-description">
      <p>展示和管理数据的高级表格组件</p>
    </div>
    <div class="component-showcase">
      <div class="dropdown">
        <button class="dropdown-toggle">下拉菜单 <span class="caret">▼</span></button>
        <div class="dropdown-menu">
          <div class="dropdown-item">选项 1</div>
          <div class="dropdown-item">选项 2</div>
          <div class="dropdown-item">选项 3</div>
          <div class="dropdown-item">选项 4</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dropdown 组件实现
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
    position: relative;

    .dropdown {
      position: relative;
      display: inline-block;

      .dropdown-toggle {
        padding: 8px 16px;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        background-color: var(--el-bg-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .caret {
          font-size: 12px;
        }

        &:hover {
          border-color: var(--el-border-color-hover);
        }
      }

      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 5px;
        min-width: 120px;
        background-color: var(--el-bg-color);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
        box-shadow: var(--shadow-md);
        z-index: 10;

        .dropdown-item {
          padding: 8px 16px;
          font-size: 14px;
          color: var(--el-text-color-regular);
          cursor: pointer;

          &:hover {
            background-color: var(--el-fill-color-light);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
}
</style>
