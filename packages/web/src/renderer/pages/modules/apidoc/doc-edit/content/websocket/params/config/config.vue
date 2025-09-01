<template>
  <div class="ws-config">
    <el-form :model="config" label-position="top" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="子协议">
            <el-input 
              v-model="config.protocols" 
              placeholder="多个协议用逗号分隔" 
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="连接超时(秒)">
            <el-input-number 
              v-model="config.timeout" 
              :min="1" 
              :max="300" 
              placeholder="30"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

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
            <el-switch v-model="config.autoReconnect"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大重连次数">
            <el-input-number 
              v-model="config.maxReconnectAttempts" 
              :min="0" 
              :max="100" 
              :disabled="!config.autoReconnect"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="重连间隔(秒)">
            <el-input-number 
              v-model="config.reconnectInterval" 
              :min="1" 
              :max="300" 
              :disabled="!config.autoReconnect"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="心跳间隔(秒)">
            <el-input-number 
              v-model="config.pingInterval" 
              :min="0" 
              :max="300" 
              placeholder="0表示关闭心跳"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="心跳超时(秒)">
            <el-input-number 
              v-model="config.pongTimeout" 
              :min="1" 
              :max="60" 
              :disabled="!config.pingInterval"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              <div class="form-label">
                <span>记录二进制消息</span>
                <el-tooltip content="是否记录二进制类型的消息" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-switch v-model="config.logBinaryMessages"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="自定义配置">
        <el-input 
          v-model="config.customConfig" 
          type="textarea" 
          :rows="4" 
          placeholder="JSON格式的自定义配置"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

interface Config {
  protocols: string
  timeout: number
  autoReconnect: boolean
  maxReconnectAttempts: number
  reconnectInterval: number
  pingInterval: number
  pongTimeout: number
  logBinaryMessages: boolean
  customConfig: string
}

const config = ref<Config>({
  protocols: '',
  timeout: 30,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 5,
  pingInterval: 30,
  pongTimeout: 10,
  logBinaryMessages: true,
  customConfig: ''
})
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
