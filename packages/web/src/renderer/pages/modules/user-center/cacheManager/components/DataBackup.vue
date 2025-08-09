<template>
  <div class="data-backup">
    <div class="toolbar">
      <el-button type="primary">导出</el-button>
    </div>

    <div class="progress-wrap" aria-label="导出进度">
      <div class="progress-header">
        <span>导出进度</span>
        <span class="progress-percent">0%</span>
      </div>
      <el-progress :percentage="0" :stroke-width="8" />
    </div>
  </div>
</template>

<script setup lang="ts">


</script>

<style lang="scss" scoped>
.data-backup {
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.progress-wrap {
  width: 100%;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #4b5563;
  font-size: 13px;
}
</style>
