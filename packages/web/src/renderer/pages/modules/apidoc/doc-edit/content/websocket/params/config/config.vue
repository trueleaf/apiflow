<template>
  <div class="ws-config">
    <el-form :model="config" label-position="top" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              <div class="form-label">
                <span>自动重连</span>
                <el-tooltip content="连接断开时是否自动重连" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-switch 
              v-model="config.autoReconnect"
              @change="handleAutoReconnectChange"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useWebSocket } from '@/store/websocket/websocket';

const websocketStore = useWebSocket();
const { websocket } = storeToRefs(websocketStore);
const config = computed(() => websocket.value.config);

const handleAutoReconnectChange = (value: boolean | string | number) => {
  const boolValue = Boolean(value);
  websocketStore.changeWebSocketAutoReconnect(boolValue);
};

</script>

<style lang="scss" scoped>
.ws-config {
  padding: 16px 0;

  .form-label {
    display: flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      color: var(--gray-500);
      cursor: help;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--gray-700);
  }
}
</style>
